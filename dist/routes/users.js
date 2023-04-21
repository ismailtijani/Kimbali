"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("../controller/users"));
const validator_1 = __importDefault(require("../middleware/validator"));
const joiSchema_1 = __importDefault(require("../library/joiSchema"));
const auth_1 = __importDefault(require("../middleware/auth"));
const multer_1 = __importDefault(require("../middleware/multer"));
class UserRoutes {
  constructor() {
    this.router = (0, express_1.Router)();
    this.registeredRoutes();
  }
  registeredRoutes() {
    this.router.post(
      "/signup",
      (0, validator_1.default)(joiSchema_1.default.signup, "body"),
      users_1.default.signup
    );
    this.router.post(
      "/login",
      (0, validator_1.default)(joiSchema_1.default.login, "body"),
      users_1.default.login
    );
    //Every routes below will require authentication
    this.router.use(auth_1.default);
    this.router.get("/profile", users_1.default.readProfile);
    this.router.patch("/update_profile", users_1.default.updateProfile);
    this.router.post(
      "/profile/avatar",
      multer_1.default.single("avatar"),
      users_1.default.uploadAvatar
    );
    this.router.get("/profile/view_avatar", users_1.default.viewAvatar);
    this.router.delete("/profile/delete_avatar", users_1.default.deleteAvatar);
    this.router.post("/logout", users_1.default.logout);
    this.router.post(
      "/forget_password",
      (0, validator_1.default)(joiSchema_1.default.forgetPassword, "body"),
      users_1.default.forgetPassword
    );
    this.router.post(
      "/reset_password/:token",
      (0, validator_1.default)(joiSchema_1.default.resetPassword, "body"),
      users_1.default.resetPassword
    );
    this.router.delete("/delete", users_1.default.deleteProfile);
  }
}
// Register User routes in App
const userRouter = (app) => {
  app.use("/user", new UserRoutes().router);
};
exports.default = userRouter;
