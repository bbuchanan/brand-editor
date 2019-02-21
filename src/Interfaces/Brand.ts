import Keyed from "./Keyed";

export default interface IBrand extends Keyed {
  Id: string;
  BrandName: string;
  CategoryId: string;
  Category: string;
  FloorId: string;
  Floor: string;
}
