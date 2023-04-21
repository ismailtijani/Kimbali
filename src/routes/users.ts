import { Application, Router } from "express";
import userController from "../controller/users";
import validator from "../middleware/validator";
import joiSchema from "../library/joiSchema";
import auth from "../middleware/auth";
import upload from "../middleware/multer";
class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    this.router.post("/signup", validator(joiSchema.signup, "body"), userController.signup);
    this.router.post("/login", validator(joiSchema.login, "body"), userController.login);
    //Every routes below will require authentication
    this.router.use(auth);
    this.router.get("/profile", userController.readProfile);
    this.router.patch("/update_profile", userController.updateProfile);
    this.router.post("/profile/avatar", upload.single("avatar"), userController.uploadAvatar);
    this.router.get("/profile/view_avatar", userController.viewAvatar);
    this.router.delete("/profile/delete_avatar", userController.deleteAvatar);
    this.router.post("/logout", userController.logout);
    this.router.post(
      "/forget_password",
      validator(joiSchema.forgetPassword, "body"),
      userController.forgetPassword
    );
    this.router.post(
      "/reset_password/:token",
      validator(joiSchema.resetPassword, "body"),
      userController.resetPassword
    );
    this.router.delete("/delete", userController.deleteProfile);
  }
}

// Register User routes in App
const userRouter = (app: Application) => {
  app.use("/user", new UserRoutes().router);
};

export default userRouter;
