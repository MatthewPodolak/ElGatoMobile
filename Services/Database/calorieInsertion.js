import * as SQLite from 'expo-sqlite';

export const calorieInsertion = async (calories) => {
    const db = await SQLite.openDatabaseAsync('ElGatoDbLite');

    try{
        const { fat, carbs, protein, kcal } = JSON.parse(calories);

        const res = await db.runAsync(
            'UPDATE User SET calories = ?, protein = ?, fat = ?, carbs = ?',
            [kcal, protein, fat, carbs]
        );
    
        if (res.changes === 0) {
            await db.runAsync(
                'INSERT INTO User (calories, protein, fat, carbs) VALUES (?, ?, ?, ?)',
                [kcal, protein, fat, carbs]
            );
        }

    }catch (error) {
        throw new Error(error.message);
    }
};
  
