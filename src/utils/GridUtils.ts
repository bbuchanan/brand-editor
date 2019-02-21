import RowDataProps from "../Interfaces/RowDataProps";
import Keyed from "../Interfaces/Keyed";

export default class GridUtils<T extends Keyed> {
  public inputTextValidator = (props: RowDataProps<T>): boolean => {
    const value = props.rowData[props.field];
    if (value) return true;
    else return false;
  };
}
