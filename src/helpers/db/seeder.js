import bcrypt from 'bcryptjs';
import Admin from '../../models/adminModel.js';

export const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash('AdminPass1!', 10);
  await Admin.create({ username: 'admin@test1.com', password: hashedPassword });
  return { success: true, message: 'Admin user table created successfully. Seeder ran.' };
};