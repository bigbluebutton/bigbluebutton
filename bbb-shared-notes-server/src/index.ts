import startRedis from "./redis/subscriber";
import { startExpressApp } from "./express";

startRedis();
startExpressApp();
