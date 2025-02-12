import UserProfile from '../models/userProfile.js';
import ResellerRequest from '../models/resellerRequestModel.js';

export const applyReseller = async (request, h) => {
  try {
    const user_id = request.auth.credentials.id;
    const { id_document } = request.payload;

    const requestExists = await ResellerRequest.findOne({ where: { user_id, status: 'pending' } });

    if (requestExists) {
      return h.response({ message: 'Reseller request already pending' }).code(400);
    }

    await ResellerRequest.create({ user_id, id_document });

    return h.response({ message: 'Reseller request submitted' }).code(201);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};
export const updateUserProfile = async (request, h) => {
    try {
        const user_id = request.auth.credentials.id;
        const { mobile_number, billing_address } = request.payload;

        await UserProfile.update({ mobile_number, billing_address }, { where: { user_id } });

        return h.response({ message: 'Profile updated' }).code(200);
    } catch (error) {
        return h.response({ message: error.message }).code(500);
    }
};