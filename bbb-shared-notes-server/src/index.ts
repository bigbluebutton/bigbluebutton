import { loadConfiguration } from "./config";
import startRedis from "./redis/subscriber";
import { startPostgres } from "./database/bbb-postgres";
import { startExpressApp } from "./express";


loadConfiguration();
startRedis();
startPostgres();
startExpressApp();
