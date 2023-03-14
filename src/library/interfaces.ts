import { HydratedDocument, Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: object[]
}

export interface IUserMethods{
  generateAuthToken():string;
}

export interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials(email: string, password:string):HydratedDocument<IUser, IUserMethods>
}
export interface AppErrorArgs {
  name?: string;
  message: string;
  statusCode: responseStatusCodes;
  isOperational?: boolean;
}

export enum responseStatusCodes {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE = 422,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}