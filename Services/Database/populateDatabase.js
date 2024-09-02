import * as SQLite from 'expo-sqlite';

export const populateDb = async () => {
    const db = await SQLite.openDatabaseAsync('ElGatoDbLite');

    await db.runAsync(`CREATE TABLE IF NOT EXISTS User (
                    calories NUMERIC,
                    protein NUMERIC,
                    fat NUMERIC,
                    carbs NUMERIC
                )`);

    await db.runAsync(`
                    CREATE TABLE IF NOT EXISTS DailyDiet (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        calories NUMERIC,
                        protein NUMERIC,
                        fat NUMERIC,
                        carbs NUMERIC,
                        entryDate TEXT
                    )
                `);
};
  