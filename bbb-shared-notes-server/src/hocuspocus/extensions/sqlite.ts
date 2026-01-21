import { Server } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";
import { config } from "../../config";

const sqliteDB = new SQLite({
  database: config.sqlite.database,
})

export default sqliteDB;
