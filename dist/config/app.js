"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoUrl = exports.PORT = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const mongodb_1 = __importDefault(require("../database/mongodb"));
const errorHandler_1 = __importDefault(require("../middleware/errorHandler"));
const users_1 = __importDefault(require("../routes/users"));
const transactions_1 = __importDefault(require("../routes/transactions"));
dotenv_1.default.config();
class App {
  constructor() {
    this.app = (0, express_1.default)();
    this.config();
    (0, mongodb_1.default)();
  }
  config() {
    // Enable security middlewares
    this.app.use(
      (0, cors_1.default)({
        origin:
          process.env.NODE_ENV !== "development" ? process.env.PROD_URL : "http://localhost:3000",
        methods: "GET,POST,PUT,DELETE,PATCH",
        credentials: true,
      })
    );
    this.app.use((0, helmet_1.default)());
    this.app.use((0, compression_1.default)());
    // express body parser
    this.app.use(express_1.default.json());
    this.app.use(express_1.default.urlencoded({ extended: true }));
    // routes
    // set home route
    this.app.get("/", (req, res) => {
      res.status(200).json({ message: "Welcome to Kimbali API" });
    });
    // Other routes
    (0, users_1.default)(this.app);
    (0, transactions_1.default)(this.app);
    // set up global error handling here
    this.app.use((error, req, res, next) => {
      errorHandler_1.default.handleError(error, res);
    });
  }
}
exports.PORT = process.env.PORT || 3000;
exports.mongoUrl =
  process.env.NODE_ENV === "development"
    ? `mongodb://127.0.0.1:27017/Kimbali-Api`
    : process.env.MONGODB_URL;
exports.default = new App().app;
