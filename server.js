const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");

const path = require("path");
const app = express();

app.use(express.json());
app.use(cors());
const jwt = require("jsonwebtoken")
const dbPath = path.join(__dirname, "aeclibrary.db");
let db = null;
const initializationOfDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error" ${e.message}`);
    process.exit(1);
  }
};
initializationOfDBAndServer();
app.listen(5000, () => {
  console.log("Server running at the port 5000");
});