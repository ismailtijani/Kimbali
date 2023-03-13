import mongoose, { isValidObjectId } from "mongoose";

const ObjectId = mongoose.Types.ObjectId;
export default function validObjectId(id: any) {
  if (isValidObjectId(id)) {
    if (String(new ObjectId(id)) === id) {
      return true;
    }
    return false;
  }
  return false;
}
