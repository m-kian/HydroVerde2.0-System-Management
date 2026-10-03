import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('hydroverde.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          salt TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

const hashPassword = (salt, password) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);

export async function registerUser({ name, email, password }) {
  const db = await getDb();
  const cleanEmail = email.trim().toLowerCase();
  const existing = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [cleanEmail]);
  if (existing) throw new Error('An account with this email already exists.');

  const salt = Crypto.randomUUID();
  const passwordHash = await hashPassword(salt, password);
  const result = await db.runAsync(
    'INSERT INTO users (name, email, salt, password_hash) VALUES (?, ?, ?, ?)',
    [name.trim(), cleanEmail, salt, passwordHash]
  );
  return { id: result.lastInsertRowId, name: name.trim(), email: cleanEmail };
}

export async function loginUser({ email, password }) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!row) throw new Error('Email or password is incorrect.');
  const attempt = await hashPassword(row.salt, password);
  if (attempt !== row.password_hash) throw new Error('Email or password is incorrect.');
  return { id: row.id, name: row.name, email: row.email };
}

export async function getUserById(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT id, name, email FROM users WHERE id = ?', [id]);
}