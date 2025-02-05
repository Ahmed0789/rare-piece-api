import { sequelize } from '../../config/database.js';

export const resetSneakersTable = async () => {
  try {
    await sequelize.query(`DROP TABLE IF EXISTS sneakers`);
    await sequelize.query(`
        CREATE TABLE sneakers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          brand VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          release_date DATE,
          price DECIMAL(10, 2)
        )
      `);
  } catch (error) {
    console.error('Error occurred whilst resetting sneakers table:', error);
  }
}
export const insertSneakersData = async (sneakers) => {
  const query = `INSERT INTO sneakers (name, brand, model, release_date, price) VALUES ?`;
  const values = sneakers.map(({ name, brand, model, release_date, price }) => [
    name, brand, model, release_date, price,
  ]);
  await sequelize.query(query, [values]);
}