import React, { useReducer, useMemo, useEffect, useState } from "react";
import IPopupText from "../Interfaces/PopupText";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import RowDataProps from "../Interfaces/RowDataProps";
import axiosFirebase from "../axios-firebase";
import CrudAction from "../Interfaces/CrudAction";

const popupGrid = () => {
  const popupTextReducer = (state: IPopupText[], action: CrudAction<IPopupText>) => {
    switch (action.type) {
      case "ADD":
        return state.concat(action.payload);

      case "SET":
        return action.payload;

      case "UPDATE":
        return state.map(x => (x.Id === action.payload.key ? action.payload.newValues : x));

      case "DELETE":
        return state.filter(category => category.Id !== action.key);
    }
  };

  const initialState: IPopupText[] = [];
  const [popupTextList, dispatch] = useReducer(popupTextReducer, initialState);
  const [sectionName, setSectionName] = useState("");
  const [sectionContent, setSectionContent] = useState("");

  // load the popup list
  useEffect(() => {
    axiosFirebase.get("popuptext.json").then(res => {
      const popups: IPopupText[] = [];
      for (const key in res.data) {
        popups.push({ Id: key, ...res.data[key] });
      }

      dispatch({ type: "SET", payload: popups });
    });
  }, []);

  const onUpdatePopup = (props: RowDataProps<IPopupText>, value: any) => {
    props.rowData[props.field] = value;
    if (!isValidPopup(props.rowData)) return;

    axiosFirebase
      .patch(`popuptext/${props.rowData["Id"]}.json`, props.rowData)
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

  const onEditorValueChange = (props: RowDataProps<IPopupText>, value: any) => {
    props.rowData[props.field] = value;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], newValues: props.rowData }
    });
  };

  const isValidPopup = (popup: IPopupText): boolean => {
    if (popup.Content.length === 0 || popup.Section.length === 0) {
      return false;
    }

    return true;
  };

  const inputTextValidator = (props: RowDataProps<IPopupText>): boolean => {
    const value = props.rowData[props.field];
    if (value) return true;
    else return false;
  };

  const inputTextEditor = (props: RowDataProps<IPopupText>): React.ReactElement => {
    return (
      <InputText
        type="text"
        value={props.rowData[props.field]}
        onBlur={(e: React.FormEvent<HTMLInputElement>) => onUpdatePopup(props, e.currentTarget.value)}
        onChange={(e: React.FormEvent<HTMLInputElement>) => onEditorValueChange(props, e.currentTarget.value)}
      />
    );
  };

  const contentEditor = (props: RowDataProps<IPopupText>): React.ReactElement => {
    return (
      <>
        <Editor
          style={{ minHeight: 200 }}
          value={props.rowData[props.field]}
          onTextChange={e => setSectionContent(e.htmlValue === null ? "" : e.htmlValue)}
        />
        <Button
          style={{ maxWidth: 50, marginLeft: 10 }}
          title="Save"
          onClick={e => onUpdatePopup(props, sectionContent)}
          icon="pi pi-check"
        />
        <Button
          style={{ marginLeft: 10, maxWidth: 50 }}
          onClick={e => console.log(e)}
          title="Cancel"
          icon="pi pi-times"
        />
      </>
    );
  };

  const newPopupHandler = () => {
    axiosFirebase
      .post("popuptext.json", { Section: sectionName, Content: "" })
      .then(res => {
        const popup: IPopupText = { Id: res.data.name, Section: sectionName, Content: "" };
        dispatch({ type: "ADD", payload: popup });
        setSectionName("");
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      {useMemo(
        () => (
          <DataTable value={popupTextList}>
            <Column field="Section" header="Section" editor={inputTextEditor} editorValidator={inputTextValidator} />
            <Column field="Content" header="Content" editor={contentEditor} />
          </DataTable>
        ),
        [popupTextList, sectionName, sectionContent]
      )}
      <InputText
        placeholder="Section Name"
        value={sectionName}
        onChange={(e: React.FormEvent<HTMLInputElement>) => setSectionName(e.currentTarget.value)}
      />
      <Button label="Add Popup" icon="pi pi-check" onClick={newPopupHandler} />
    </>
  );
};

export default popupGrid;
