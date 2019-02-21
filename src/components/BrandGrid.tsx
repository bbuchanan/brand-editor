import React, { useState, useReducer, useMemo } from "react";
import IBrand from "../Interfaces/Brand";
import ICategory from "../Interfaces/Category";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import RowDataProps from "../Interfaces/RowDataProps";
import GridUtils from "../utils/GridUtils";

type BrandAction =
  | { type: "ADD"; payload: IBrand }
  | { type: "SET"; payload: IBrand[] }
  | { type: "UPDATE"; payload: { key: string; brand: IBrand } }
  | { type: "DELETE"; key: string };

// component begins
const brandGrid = () => {
  const g = new GridUtils<IBrand>();
  const initialState: IBrand[] = [
    {
      Id: "1",
      BrandName: "Artis",
      Category: "Beauty",
      CategoryId: "1",
      Floor: "FIRST FLOOR",
      FloorId: "1"
    },
    {
      Id: "2",
      BrandName: "Chanel",
      Category: "Fragrance",
      CategoryId: "3",
      Floor: "FIFTH FLOOR",
      FloorId: "5"
    },
    {
      Id: "3",
      BrandName: "Acqua Di Parma",
      Category: "Clothes",
      CategoryId: "2",
      Floor: "THIRD FLOOR",
      FloorId: "3"
    }
  ];

  const [categories, setCategories] = useState<Array<ICategory> | any>([
    { Id: 1, Category: "Beauty" },
    { Id: 2, Category: "Clothes" },
    { Id: 3, Category: "Fragrance" },
    { Id: 4, Category: "Bridal" },
    { Id: 5, Category: "Accessories" }
  ]);

  const brandReducer = (state: IBrand[], action: BrandAction) => {
    switch (action.type) {
      case "ADD":
        state.push(action.payload);
        return state;

      case "SET":
        state.concat(action.payload);
        return state;

      case "UPDATE":
        return state.map(x =>
          x.Id === action.payload.key ? action.payload.brand : x
        );

      default:
        return state;
    }
  };

  const [brandList, dispatch] = useReducer(brandReducer, initialState);

  const onEditorValueChange = (props: RowDataProps<IBrand>, value: any) => {
    props.rowData[props.field] = value;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], brand: props.rowData }
    });
  };

  const onDropdownValueChange = (props: RowDataProps<IBrand>, value: any) => {
    const category: ICategory = categories.find(
      (n: ICategory) => n.Id === value
    );

    props.rowData["CategoryId"] = category.Id;
    props.rowData["Category"] = category.Category;
    dispatch({
      type: "UPDATE",
      payload: { key: props.rowData["Id"], brand: props.rowData }
    });
  };

  const categoryEditor = (props: RowDataProps<IBrand>): React.ReactElement => {
    const category: ICategory = categories.find(
      (n: ICategory) => n.Category === props.rowData[props.field]
    );
    return (
      <Dropdown
        options={categories.map((x: ICategory) => {
          return { label: x.Category, value: x.Id };
        })}
        onChange={e => onDropdownValueChange(props, e.value)}
        style={{ width: "100%" }}
        placeholder="Select a category"
        value={category.Id}
      />
    );
  };

  const inputTextEditor = (props: RowDataProps<IBrand>): React.ReactElement => {
    return (
      <InputText
        type="text"
        value={props.rowData[props.field]}
        onChange={(e: React.FormEvent<HTMLInputElement>) =>
          onEditorValueChange(props, e.currentTarget.value)
        }
      />
    );
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
            <Column
              field="Category"
              header="Category"
              editor={categoryEditor}
            />
            <Column field="Floor" header="Floor" />
          </DataTable>
        ),
        [brandList]
      )}
    </>
  );
};

export default brandGrid;
