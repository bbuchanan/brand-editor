import Keyed from "./Keyed";

export default interface IBrand extends Keyed {
  Id: string;
  BrandName: string;
  SubcategoryId: string;
  Subcategory: string;
  FloorId: string;
  FloorName: string;
}
