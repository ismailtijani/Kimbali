import express, { Application, NextFunction, Response, Request } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSetup from "../database/mongodb";
import errorHandler from "../middleware/errorHandler";
import userRouter from "../routes/users";
import transactionRouter from "../routes/transactions";

dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    mongoSetup();
  }

  private config(): void {
    // Enable security middlewares
    this.app.use(
      cors({
        origin:
          process.env.NODE_ENV !== "development"
            ? process.env.PROD_URL
            : "http://localhost:3000",
        methods: "GET,POST,PUT,DELETE,PATCH",
        credentials: true,
      })
    );
    this.app.use(helmet());
    this.app.use(compression());

    // express body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // routes
    // set home route
    this.app.get("/", (req, res) => {
      res.status(200).json({ message: "Welcome to CashApp API" });
    });

    // Other routes
    userRouter(this.app);
    transactionRouter(this.app);

    // set up global error handling here
    this.app.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        errorHandler.handleError(error, res);
      }
    );
  }
}

export const PORT = process.env.PORT || 3000;
export const mongoUrl =
  process.env.NODE_ENV === "development"
    ? `mongodb://127.0.0.1:27017/Loan-App`
    : (process.env.MONGODB_URL as string);

export default new App().app;
