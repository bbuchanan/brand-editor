import Keyed from "./Keyed";

export default interface ICategory extends Keyed {
  Id: string;
  Subcategory: string;
  CategoryId?: string;
  Category?: string;
}
