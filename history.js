import alfy from "alfy";
import _ from "lodash";
import fzy from "fzy.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
const { sortBy } = _;

// Script filter copies Alfred's Clipboard History DB file to this location
const CLIPBOARD_HISTORY_DB_PATH = "/tmp/alfred-clipboard-history.db";
const DB_CACHE_KEY_PREFIX = "db_cache_key";

const db = await open({
  filename: CLIPBOARD_HISTORY_DB_PATH,
  driver: sqlite3.cached.Database,
});

async function queryHistoryDbAsync() {
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

export async function queryAsync(query, limit) {
  const historyItems = await queryHistoryDbAsync();
  if (query === "") {
    return historyItems.slice(0, limit);
  }

  const results = historyItems.filter((item) =>
    fzy.hasMatch(query, item.content)
  );
  return sortBy(results, (item) => -fzy.score(query, item.content));
}
