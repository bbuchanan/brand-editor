// standard add, set, update, delete for CRUD based reducers.
type CrudAction<T> =
  | { type: "ADD"; payload: T }
  | { type: "SET"; payload: T[] }
  | { type: "UPDATE"; payload: { key: string; newValues: T } }
  | { type: "DELETE"; key: string };

export default CrudAction;
