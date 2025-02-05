
export const populateSneakersTable = async (request, h) => {
    try {
      console.log('Resetting sneakers table...');
      await resetSneakersTable();

      console.log('Fetching sneaker data...');
      //const sneakers = await fetchSneakersData();

      console.log('Inserting data into the database...');
      //await insertSneakersData(sneakers);
      return h.response({ message: 'Sneakers table populated successfully.' }).code(200);
    } catch (error) {
      console.error('Error populating sneakers table:', error);
      return h.response({ error: 'Failed to populate sneakers table.' }).code(500);
    }
};
const resetSneakersTable = async () => {

}