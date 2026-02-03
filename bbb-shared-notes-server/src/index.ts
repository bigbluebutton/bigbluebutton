import { loadConfiguration } from "./config";
import startRedis from "./redis/subscriber";
import { startExpressApp } from "./express";


loadConfiguration();
startRedis();
startExpressApp();
