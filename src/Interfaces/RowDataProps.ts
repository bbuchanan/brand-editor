import { DataTableProps } from "primereact/datatable";
import Keyed from "./Keyed";
export default interface RowDataProps<T extends Keyed> extends DataTableProps {
  rowData: T;
  field: string;
}
