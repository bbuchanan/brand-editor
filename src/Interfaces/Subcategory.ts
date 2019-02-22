import Keyed from "./Keyed";

export default interface ISubcategory extends Keyed {
  Id: string;
  Subcategory: string;
  CategoryId?: string;
  Category?: string;
}
