// import { Server } from "@hocuspocus/server";
// import { Database } from "@hocuspocus/extension-database";
// import sqlite3 from "sqlite3";

// TODO: data-base link with Postgres

// const databaseExtension = new Database({
//   // Return a Promise to retrieve data …
//   fetch: async ({ documentName }) => {
//     return new Promise((resolve, reject) => {
//       this.db?.get(
//         `
//         SELECT data FROM "documents" WHERE name = $name ORDER BY rowid DESC
//       `,
//         {
//           $name: documentName,
//         },
//         (error, row) => {
//           if (error) {
//             reject(error);
//           }

//           resolve(row?.data);
//         }
//       );
//     });
//   },
//   // … and a Promise to store data:
//   store: async ({ documentName, state }) => {
//     this.db?.run(
//       `
//       INSERT INTO "documents" ("name", "data") VALUES ($name, $data)
//         ON CONFLICT(name) DO UPDATE SET data = $data
//     `,
//       {
//         $name: documentName,
//         $data: state,
//       }
//     );
//   },
// });
