import { Application, Router } from "express";
import userController from "../controller/users";
import validator from "../middleware/validator";
import joiSchema from "../library/joiSchema";
import auth from "../middleware/auth";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }

  protected registeredRoutes() {
    this.router.post(
      "/signup",
      validator(joiSchema.signup, "body"),
      userController.signup
    );
    this.router.post(
      "/login",
      validator(joiSchema.login, "body"),
      userController.login
    );
    //Using a single line of code for the authetication middleware"
    this.router.use(auth);
    // this.router.get("/profile", userController.readProfile);
    // this.router.patch("/update", userController.updateProfile);
    // this.router.post("/logout", userController.Logout);
    // this.router.post("/logoutall", userController.LogoutAll);
    // this.router.delete("/delete", userController.deleteProfile);
  }
}

// Register User routes in App
const userRouter = (app: Application) => {
  app.use("/user", new UserRoutes().router);
};

export default userRouter;
