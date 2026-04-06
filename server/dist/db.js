"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
let db = null;
async function getDb() {
    if (db)
        return db;
    db = await (0, sqlite_1.open)({
        filename: './database.sqlite',
        driver: sqlite3_1.default.Database
    });
    await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      context TEXT,
      answers TEXT,
      insights TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    return db;
}
