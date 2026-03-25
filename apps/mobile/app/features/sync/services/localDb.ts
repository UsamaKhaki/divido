/**
 * localDb — SQLite service for offline caching of groups and expenses.
 *
 * Provides a local read/write layer so the app can display cached data
 * when the device has no network connection.
 */

import * as SQLite from 'expo-sqlite'

const DB_NAME = 'divido.db'

let _db: SQLite.SQLiteDatabase | null = null

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME)
  }
  return _db
}

export const localDb = {
  /** Create tables if they do not already exist. Call once on app init. */
  init: async (): Promise<void> => {
    const db = await getDb()
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS groups (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL,
        created_by  INTEGER NOT NULL,
        updated_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id           INTEGER PRIMARY KEY,
        group_id     INTEGER NOT NULL,
        title        TEXT NOT NULL,
        total_amount REAL NOT NULL,
        category     TEXT,
        paid_by      INTEGER NOT NULL,
        updated_at   TEXT NOT NULL
      );
    `)
  },

  // ─── Groups ───────────────────────────────────────────────────────────────

  upsertGroups: async (
    rows: Array<{ id: number; name: string; created_by: number; updated_at: string }>,
  ): Promise<void> => {
    const db = await getDb()
    await db.withTransactionAsync(async () => {
      for (const g of rows) {
        await db.runAsync(
          `INSERT INTO groups (id, name, created_by, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at`,
          [g.id, g.name, g.created_by, g.updated_at],
        )
      }
    })
  },

  getGroups: async (): Promise<
    Array<{ id: number; name: string; created_by: number; updated_at: string }>
  > => {
    const db = await getDb()
    return db.getAllAsync<{
      id: number
      name: string
      created_by: number
      updated_at: string
    }>('SELECT * FROM groups ORDER BY updated_at DESC')
  },

  // ─── Expenses ─────────────────────────────────────────────────────────────

  upsertExpenses: async (
    rows: Array<{
      id: number
      group_id: number
      title: string
      total_amount: number
      category: string | null
      paid_by: number
      updated_at: string
    }>,
  ): Promise<void> => {
    const db = await getDb()
    await db.withTransactionAsync(async () => {
      for (const e of rows) {
        await db.runAsync(
          `INSERT INTO expenses (id, group_id, title, total_amount, category, paid_by, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title=excluded.title,
             total_amount=excluded.total_amount,
             category=excluded.category,
             updated_at=excluded.updated_at`,
          [e.id, e.group_id, e.title, e.total_amount, e.category ?? null, e.paid_by, e.updated_at],
        )
      }
    })
  },

  getExpensesByGroup: async (
    groupId: number,
  ): Promise<
    Array<{
      id: number
      group_id: number
      title: string
      total_amount: number
      category: string | null
      paid_by: number
      updated_at: string
    }>
  > => {
    const db = await getDb()
    return db.getAllAsync('SELECT * FROM expenses WHERE group_id = ? ORDER BY updated_at DESC', [
      groupId,
    ])
  },
}
