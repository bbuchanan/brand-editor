import React, { useReducer, useMemo, useEffect, useState } from "react";
import ISubcategory from "../Interfaces/Subcategory";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import RowDataProps from "../Interfaces/RowDataProps";
import axiosFirebase from "../axios-firebase";
import ICategory from "../Interfaces/Category";
import { Dropdown } from "primereact/dropdown";

import "./table.css";

type SubcategoryAction =
  | { type: "ADD"; payload: ISubcategory }
  | { type: "SET"; payload: ISubcategory[] }
  | { type: "UPDATE"; payload: { key: string; subcategory: ISubcategory } }
  | { type: "DELETE"; key: string };

const subcategoryGrid = () => {
  const subcategoryReducer = (state: ISubcategory[], action: SubcategoryAction): ISubcategory[] => {
    switch (action.type) {
      case "ADD":
        return state.concat(action.payload);

      case "SET":
        return action.payload;

      case "UPDATE":
        return state.map(x => (x.Id === action.payload.key ? action.payload.subcategory : x));

      case "DELETE":
        return state.filter(subcategory => subcategory.Id !== action.key);
    }
  };

  const initialState: ISubcategory[] = [];
  const [subcategoryList, dispatch] = useReducer(subcategoryReducer, initialState);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categoryList, setCategoryList] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory>({} as ICategory);

  // load the subcategory list
  useEffect(() => {
    axiosFirebase.get("subcategories.json").then(res => {
      const subcategories: ISubcategory[] = [];
      for (const key in res.data) {
        subcategories.push({ Id: key, ...res.data[key] });
      }

      dispatch({ type: "SET", payload: subcategories });
    });
    axiosFirebase.get("categories.json").then(res => {
      const categories: ICategory[] = [];
      for (const key in res.data) {
        categories.push({ Id: key, Category: res.data[key].Category });
      }

      setCategoryList(categories);
    });
  }, []);

  const onUpdateSubCategory = (props: RowDataProps<ISubcategory>, value: any) => {
    props.rowData[props.field] = value;
    if (!isValidSubcategory(props.rowData)) return;

    updateSubcategory(props);
  };

  const updateSubcategory = (props: RowDataProps<ISubcategory>) => {
    axiosFirebase
      .patch(`subcategories/${props.rowData["Id"]}.json`, props.rowData)
      .then(res => {
        dispatch({
          type: "UPDATE",
          payload: { key: props.rowData["Id"], subcategory: props.rowData }
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onEditorValueChange = (props: RowDataProps<ISubcategory>, value: any) => {
    props.rowData[props.field] = value;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], subcategory: props.rowData }
    });
  };

  const isValidSubcategory = (subcategory: ISubcategory): boolean => {
    if (subcategory.Subcategory.length === 0 || subcategory.Category === null || subcategory.Category!.length === 0) {
      return false;
    }

    return true;
  };

  const inputTextValidator = (props: RowDataProps<ISubcategory>): boolean => {
    const value = props.rowData[props.field];
    if (value) return true;
    else return false;
  };

  const inputTextEditor = (props: RowDataProps<ISubcategory>): React.ReactElement => {
    return (
      <InputText
        type="text"
        value={props.rowData[props.field]}
        onBlur={(e: React.FormEvent<HTMLInputElement>) => onUpdateSubCategory(props, e.currentTarget.value)}
        onChange={(e: React.FormEvent<HTMLInputElement>) => onEditorValueChange(props, e.currentTarget.value)}
      />
    );
  };

  const newSubCategoryHandler = () => {
    if (!isValidSubcategory) {
      return;
    }

    axiosFirebase
      .post("subcategories.json", {
        Category: selectedCategory.Category,
        CategoryId: selectedCategory.Id,
        Subcategory: subcategoryName
      })
      .then(res => {
        const subcat: ISubcategory = {
          Id: res.data.name,
          Category: selectedCategory.Category,
          CategoryId: selectedCategory.Id,
          Subcategory: subcategoryName
        };
        dispatch({ type: "ADD", payload: subcat });
        setSubcategoryName("");
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onDropdownValueChange = (props: RowDataProps<ISubcategory>, value: any) => {
    const category: ICategory = categoryList.find((n: ICategory) => n.Id === value)!;

    props.rowData["CategoryId"] = category.Id;
    props.rowData["Category"] = category.Category;

    if (isValidSubcategory(props.rowData)) {
      updateSubcategory(props);
    }
  };

  const categoryEditor = (props: RowDataProps<ISubcategory>): React.ReactElement => {
    const category: ICategory = categoryList.find((n: ICategory) => n.Category === props.rowData[props.field])!;
    return (
      <Dropdown
        options={categoryList.map((x: ICategory) => {
          return { label: x.Category, value: x.Id };
        })}
        onChange={e => onDropdownValueChange(props, e.value)}
        style={{ width: "100%" }}
        placeholder="Select a category"
        value={category.Id}
      />
    );
  };

  return (
    <>
      {useMemo(
        () => (
          <DataTable value={subcategoryList}>
            <Column
              field="Subcategory"
              header="Subcategory Name"
              editor={inputTextEditor}
              editorValidator={inputTextValidator}
            />
            <Column field="Category" header="Category" editor={categoryEditor} />
          </DataTable>
        ),
        [subcategoryList]
      )}
      <h2 style={{ margin: 10, textAlign: "left" }}>Add a Subcategory</h2>
      <div className="table-row">
        <div className="table-column">
          <InputText
            placeholder="Subcategory Name"
            value={subcategoryName}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setSubcategoryName(e.currentTarget.value)}
          />
        </div>
        <div className="table-column">
          <Dropdown
            options={categoryList.map((x: ICategory) => {
              return { label: x.Category, value: x.Id };
            })}
            value={selectedCategory.Id}
            placeholder="Select a Category"
            onChange={e => setSelectedCategory(categoryList.find(x => x.Id === e.value)!)}
          />
        </div>
        <div className="table-column-end">
          <Button
            style={{ maxWidth: 180 }}
            label="Add Subcategory"
            icon="pi pi-check"
            onClick={newSubCategoryHandler}
          />
        </div>
      </div>
    </>
  );
};

export default subcategoryGrid;
