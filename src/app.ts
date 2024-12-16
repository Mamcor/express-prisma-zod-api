import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

import ErrorHandler from "./middlewares/ErrorHandler";
import { HttpException } from "./utils/HttpExceptions";
import { AppRoutes } from "./routes/AppRoutes";

require("dotenv").config();

const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Handling not existing routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpException(404, "Route not found"));
});

//Routes
app.use("/api", AppRoutes);
//Error handling
app.use(ErrorHandler);

//Initialize the server
app.listen(3000, () => {
  console.log(`[server]: server is running at 
  http://localhost:3000/api`);
});
