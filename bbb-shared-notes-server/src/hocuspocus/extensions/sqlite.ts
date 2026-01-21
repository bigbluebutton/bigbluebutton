import { Server } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";

const sqliteDB = new SQLite({
  database: "db.sqlite",
})

export default sqliteDB;
