import UserModel from '../models/userModel.js';

export const login = async (request, h) => {
  const { username, password } = request.payload;

  const user = await UserModel.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return h.response({ message: 'Invalid credentials' }).code(401);
  }

  request.cookieAuth.set({ id: user._id });
  return h.response({ message: 'Logged in successfully' });
};

export const logout = async (request, h) => {
  request.cookieAuth.clear();
  return h.response({ message: 'Logged out successfully' });
};