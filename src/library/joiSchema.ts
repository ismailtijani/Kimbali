import Joi from "joi";
import { IUser, ILogin } from "../library/interfaces";

const joiSchema = {
  signup: Joi.object<IUser>({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20).required(),
  }),
  login: Joi.object<ILogin>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20).required(),
  }),
};

export default joiSchema;
