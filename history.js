import alfy from "alfy";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Script filter copies Safari History DB file to this location,
// to get around permission issue
const CLIPBOARD_HISTORY_DB_PATH = "/tmp/alfred-clipboard-history.db";
const DB_CACHE_KEY_PREFIX = "db_cache_key";

const db = await open({
  filename: CLIPBOARD_HISTORY_DB_PATH,
  driver: sqlite3.cached.Database,
});

export async function queryAsync() {
  const dbCacheKey = `${DB_CACHE_KEY_PREFIX}`;
  const cachedData = alfy.cache.get(dbCacheKey);
  if (cachedData != null) {
    return cachedData;
  }

  const sqlQuery = `
    SELECT
      item as content,
      ts as id
    FROM
      clipboard
    WHERE
      dataType=0
    ORDER BY
      ts DESC
  `;

  const data = await db.all(sqlQuery);
  alfy.cache.set(dbCacheKey, data, { maxAge: 10000 });

  return data;
}
