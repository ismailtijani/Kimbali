import mongoose, { isValidObjectId } from "mongoose";

const ObjectId = mongoose.Types.ObjectId;
export default function validObjectId(id: string) {
  if (isValidObjectId(id)) {
    if (String(new ObjectId(id)) === id) {
      return true;
    }
    return false;
  }
  return false;
}
