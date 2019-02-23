import React, { useState, useReducer, useMemo, useEffect } from "react";
import IBrand from "../Interfaces/Brand";
import ISubcategory from "../Interfaces/Subcategory";
import IFloor from "../Interfaces/Floor";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import RowDataProps from "../Interfaces/RowDataProps";
import GridUtils from "../utils/GridUtils";
import CrudAction from "../Interfaces/CrudAction";
import axiosFirebase from "../axios-firebase";
import { Button } from "primereact/button";

// component begins
const brandGrid = () => {
  const g = new GridUtils<IBrand>();
  const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([]);
  const [selectedSubcategory, setSelectedSubCategory] = useState<ISubcategory>({} as ISubcategory);
  const [selectedFloor, setSelectedFloor] = useState<IFloor>({} as IFloor);
  const [floorList, setFloorList] = useState<IFloor[]>([]);
  const [brandName, setBrandName] = useState<string>("");

  const initialState: IBrand[] = [];

  const brandReducer = (state: IBrand[], action: CrudAction<IBrand>) => {
    switch (action.type) {
      case "ADD":
        return state.concat(action.payload);

      case "SET":
        return action.payload;

      case "UPDATE":
        return state.map(x => (x.Id === action.payload.key ? action.payload.newValues : x));

      default:
        return state;
    }
  };

  const [brandList, dispatch] = useReducer(brandReducer, initialState);

  useEffect(() => {
    axiosFirebase.get("brands.json").then(res => {
      const brands: IBrand[] = [];
      for (const key in res.data) {
        brands.push({ Id: key, ...res.data[key] });
      }

      dispatch({ type: "SET", payload: brands });
    });

    axiosFirebase.get("subcategories.json").then(res => {
      const subcategories: ISubcategory[] = [];
      for (const key in res.data) {
        subcategories.push({ Id: key, ...res.data[key] });
      }

      setSubcategoryList(subcategories);
    });

    axiosFirebase.get("floors.json").then(res => {
      const floors: IFloor[] = [];
      for (const key in res.data) {
        floors.push({ Id: key, ...res.data[key] });
      }

      setFloorList(floors);
    });
  }, []);

  const onEditorValueChange = (props: RowDataProps<IBrand>, value: any) => {
    props.rowData[props.field] = value;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], newValues: props.rowData }
    });
  };

  const onDropdownValueChange = (props: RowDataProps<IBrand>, value: any) => {
    const subcategory: ISubcategory = subcategoryList.find((n: ISubcategory) => n.Id === value)!;

    props.rowData["SubcategoryId"] = subcategory.Id;
    props.rowData["Subcategory"] = subcategory.Subcategory;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], newValues: props.rowData }
    });
  };

  const subcategoryEditor = (props: RowDataProps<IBrand>): React.ReactElement => {
    const subcategory: ISubcategory = subcategoryList.find(
      (n: ISubcategory) => n.Subcategory === props.rowData[props.field]
    )!;
    return (
      <Dropdown
        options={subcategoryList.map((x: ISubcategory) => {
          return { label: x.Subcategory, value: x.Id };
        })}
        onChange={e => onDropdownValueChange(props, e.value)}
        style={{ width: "100%" }}
        placeholder="Select a subcategory"
        value={subcategory.Id}
      />
    );
  };

  const inputTextEditor = (props: RowDataProps<IBrand>): React.ReactElement => {
    return (
      <InputText
        type="text"
        value={props.rowData[props.field]}
        onChange={(e: React.FormEvent<HTMLInputElement>) => onEditorValueChange(props, e.currentTarget.value)}
      />
    );
  };

  const isValidBrand = (): boolean => {
    return selectedSubcategory.Subcategory.length > 0 && brandName.length > 0 && selectedFloor.FloorName.length > 0;
  };

  const newBrandHandler = () => {
    if (!isValidBrand) {
      return;
    }

    axiosFirebase
      .post("brands.json", {
        Id: "",
        SubcategoryId: selectedSubcategory.Id,
        Subcategory: selectedSubcategory.Subcategory,
        BrandName: brandName,
        FloorId: selectedFloor.Id,
        FloorName: selectedFloor.FloorName
      } as IBrand)
      .then(res => {
        const newBrand: IBrand = {
          Id: res.data.name,
          SubcategoryId: selectedSubcategory.Id,
          Subcategory: selectedSubcategory.Subcategory,
          BrandName: brandName,
          FloorId: selectedFloor.Id,
          FloorName: selectedFloor.FloorName
        };
        dispatch({ type: "ADD", payload: newBrand });
        setBrandName("");
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      {useMemo(
        () => (
          <DataTable value={brandList}>
            <Column
              field="BrandName"
              header="Brand Name"
              editor={inputTextEditor}
              editorValidator={g.inputTextValidator}
            />
            <Column field="Subcategory" header="Subcategory" editor={subcategoryEditor} />
            <Column field="FloorName" header="Floor" />
          </DataTable>
        ),
        [brandList]
      )}

      <h2 style={{ margin: 10, textAlign: "left" }}>Add a Brand</h2>
      <div className="table-row">
        <div className="table-column">
          <InputText
            placeholder="Brand Name"
            value={brandName}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setBrandName(e.currentTarget.value)}
          />
        </div>
        <div className="table-column">
          <Dropdown
            options={subcategoryList.map((x: ISubcategory) => {
              return { label: x.Subcategory, value: x.Id };
            })}
            value={selectedSubcategory.Id}
            placeholder="Select a Subcategory"
            onChange={e => setSelectedSubCategory(subcategoryList.find(x => x.Id === e.value)!)}
          />
        </div>
        <div className="table-column">
          <Dropdown
            options={floorList.map((x: IFloor) => {
              return { label: x.FloorName, value: x.Id };
            })}
            value={selectedFloor.Id}
            placeholder="Select a Floor"
            onChange={e => setSelectedFloor(floorList.find(x => x.Id === e.value)!)}
          />
        </div>
        <div className="table-column-end">
          <Button style={{ maxWidth: 180 }} label="Add Brand" icon="pi pi-check" onClick={newBrandHandler} />
        </div>
      </div>
    </>
  );
};

export default brandGrid;
