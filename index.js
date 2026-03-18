const http = require("http");
const fs = require("fs");
const Database = require("better-sqlite3");

// Environment variables (all optional):
// - DB_PATH: absolute or relative path to the SQLite file on the local filesystem.
//            Defaults to "local.db" in the current directory.
// - PORT:    HTTP port to listen on (default 3000).

function getLocalDbPath() {
  return process.env.DB_PATH || "local.db";
}

function initializeNewDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL
    );

    INSERT INTO messages (message) VALUES ('Hello, World!');
  `);
}

function openDatabase() {
  const dbPath = getLocalDbPath();
  const dbAlreadyExists = fs.existsSync(dbPath);

  const db = new Database(dbPath);

  if (!dbAlreadyExists) {
    initializeNewDatabase(db);
  }

  return db;
}

const server = http.createServer(async (req, res) => {
  const db = openDatabase();
  const result = db.prepare("SELECT message FROM messages").get();

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(result.message);
  db.close();
});

const port = parseInt(process.env.PORT, 10) || 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Using SQLite database at: ${getLocalDbPath()}`);

  // Ensure the database file exists and run initialization once on startup if needed.
  try {
    const db = openDatabase();
    db.close();
  } catch (err) {
    console.error("Failed to initialize database on startup:", err);
  }
});
