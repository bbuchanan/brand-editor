import React, { useReducer, useMemo, useEffect, useState } from "react";
import ICategory from "../Interfaces/Category";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import RowDataProps from "../Interfaces/RowDataProps";
import axiosFirebase from "../axios-firebase";

type CategoryAction =
  | { type: "ADD"; payload: ICategory }
  | { type: "SET"; payload: ICategory[] }
  | { type: "UPDATE"; payload: { key: string; category: ICategory } }
  | { type: "DELETE"; key: string };

const categoryGrid = () => {
  const categoryReducer = (state: ICategory[], action: CategoryAction) => {
    switch (action.type) {
      case "ADD":
        return state.concat(action.payload);

      case "SET":
        return action.payload;

      case "UPDATE":
        return state.map(x => (x.Id === action.payload.key ? action.payload.category : x));

      case "DELETE":
        return state.filter(category => category.Id !== action.key);
    }
  };

  const initialState: ICategory[] = [];
  const [categoryList, dispatch] = useReducer(categoryReducer, initialState);
  const [categoryName, setCategoryName] = useState("");

  // load the category list
  useEffect(() => {
    axiosFirebase.get("categories.json").then(res => {
      const categories: ICategory[] = [];
      for (const key in res.data) {
        categories.push({ Id: key, Category: res.data[key].Category });
      }

      dispatch({ type: "SET", payload: categories });
    });
  }, []);

  const onUpdateCategory = (props: RowDataProps<ICategory>, value: any) => {
    props.rowData[props.field] = value;
    if (!isValidCategory(props.rowData)) return;

    axiosFirebase
      .patch(`categories/${props.rowData["Id"]}.json`, { Category: value })
      .then(res => {
        dispatch({
          type: "UPDATE",
          payload: { key: props.rowData["Id"], category: props.rowData }
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onEditorValueChange = (props: RowDataProps<ICategory>, value: any) => {
    props.rowData[props.field] = value;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], category: props.rowData }
    });
  };

  const isValidCategory = (category: ICategory) => {
    return category.Category.length > 0;
  };

  const inputTextValidator = (props: RowDataProps<ICategory>): boolean => {
    const value = props.rowData[props.field];
    if (value) return true;
    else return false;
  };

  const inputTextEditor = (props: RowDataProps<ICategory>): React.ReactElement => {
    return (
      <InputText
        type="text"
        value={props.rowData[props.field]}
        onBlur={(e: React.FormEvent<HTMLInputElement>) => onUpdateCategory(props, e.currentTarget.value)}
        onChange={(e: React.FormEvent<HTMLInputElement>) => onEditorValueChange(props, e.currentTarget.value)}
      />
    );
  };

  const newCategoryHandler = () => {
    axiosFirebase
      .post("categories.json", { Category: categoryName })
      .then(res => {
        const category: ICategory = { Id: res.data.name, Category: categoryName };
        dispatch({ type: "ADD", payload: category });
        setCategoryName("");
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      {useMemo(
        () => (
          <DataTable value={categoryList}>
            <Column
              field="Category"
              header="Category Name"
              editor={inputTextEditor}
              editorValidator={inputTextValidator}
            />
          </DataTable>
        ),
        [categoryList]
      )}
      <InputText
        placeholder="Category Name"
        value={categoryName}
        onChange={(e: React.FormEvent<HTMLInputElement>) => setCategoryName(e.currentTarget.value)}
      />
      <Button label="Add Category" icon="pi pi-check" onClick={newCategoryHandler} />
    </>
  );
};

export default categoryGrid;
