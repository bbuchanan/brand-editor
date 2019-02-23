import React, { useReducer, useMemo, useEffect, useState } from "react";
import IFloor from "../Interfaces/Floor";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import RowDataProps from "../Interfaces/RowDataProps";
import axiosFirebase from "../axios-firebase";
import CrudAction from "../Interfaces/CrudAction";

const floorGrid = () => {
  const floorReducer = (state: IFloor[], action: CrudAction<IFloor>) => {
    switch (action.type) {
      case "ADD":
        return state.concat(action.payload);

      case "SET":
        return action.payload;

      case "UPDATE":
        return state.map(x => (x.Id === action.payload.key ? action.payload.newValues : x));

      case "DELETE":
        return state.filter(floor => floor.Id !== action.key);
    }
  };

  const initialState: IFloor[] = [];
  const [floorList, dispatch] = useReducer(floorReducer, initialState);
  const [floorName, setFloorName] = useState("");
  const [floorNumber, setFloorNumber] = useState(0);

  // load the floor list
  useEffect(() => {
    axiosFirebase.get("floors.json").then(res => {
      const floors: IFloor[] = [];
      for (const key in res.data) {
        floors.push({ Id: key, ...res.data[key] });
      }

      dispatch({ type: "SET", payload: floors });
    });
  }, []);

  const onUpdateFloor = (props: RowDataProps<IFloor>, value: any) => {
    props.rowData[props.field] = value;
    if (!isValidFloor(props.rowData)) return;

    axiosFirebase
      .patch(`floors/${props.rowData["Id"]}.json`, props.rowData)
      .then(res => {
        dispatch({
          type: "UPDATE",
          payload: { key: props.rowData["Id"], newValues: props.rowData }
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onEditorValueChange = (props: RowDataProps<IFloor>, value: any) => {
    props.rowData[props.field] = value;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], newValues: props.rowData }
    });
  };

  const isValidFloor = (floor: IFloor): boolean => {
    return floor.FloorName.length >= 0 && floor.FloorNumber > 0;
  };

  const inputTextValidator = (props: RowDataProps<IFloor>): boolean => {
    const value = props.rowData[props.field];
    if (value) return true;
    else return false;
  };

  const inputTextEditor = (props: RowDataProps<IFloor>): React.ReactElement => {
    return (
      <InputText
        type="text"
        value={props.rowData[props.field]}
        onBlur={(e: React.FormEvent<HTMLInputElement>) => onUpdateFloor(props, e.currentTarget.value)}
        onChange={(e: React.FormEvent<HTMLInputElement>) => onEditorValueChange(props, e.currentTarget.value)}
      />
    );
  };

  const newFloorHandler = () => {
    axiosFirebase
      .post("floors.json", { FloorName: floorName, FloorNumber: floorNumber } as IFloor)
      .then(res => {
        const floor: IFloor = { Id: res.data.name, FloorName: floorName, FloorNumber: floorNumber };
        dispatch({ type: "ADD", payload: floor });
        setFloorName("");
        setFloorNumber(floor.FloorNumber + 1);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      {useMemo(
        () => (
          <DataTable value={floorList}>
            <Column
              field="FloorName"
              header="Floor Name"
              editor={inputTextEditor}
              editorValidator={inputTextValidator}
            />
            <Column
              field="FloorNumber"
              header="Floor #"
              editor={inputTextEditor}
              editorValidator={inputTextValidator}
            />
          </DataTable>
        ),
        [floorList]
      )}
      <InputText
        placeholder="Floor Name"
        value={floorName}
        onChange={(e: React.FormEvent<HTMLInputElement>) => setFloorName(e.currentTarget.value)}
      />
      <InputText
        placeholder="Floor Number"
        value={floorNumber}
        keyfilter="pint"
        onChange={(e: React.FormEvent<HTMLInputElement>) => setFloorNumber(parseInt(e.currentTarget.value))}
      />
      <Button label="Add Floor" icon="pi pi-check" onClick={newFloorHandler} />
    </>
  );
};

export default floorGrid;
