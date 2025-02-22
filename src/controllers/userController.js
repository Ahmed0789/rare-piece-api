import UserProfile from '../models/userProfile.js';
import ResellerRequest from '../models/resellerRequestModel.js';

export const applyReseller = async (request, h) => {
  try {
    const user_id = request.auth.credentials.userId;

    const { firstname, lastname, dob, gender, billing_added, id_type, id_document, mobile_number } = request.payload;

    const requestExists = await ResellerRequest.findOne({ where: { user_id, status: 'pending' } });

    if (requestExists) {
      return h.response({ message: 'Reseller request already pending' }).code(400);
    }

    if (firstname && billing_added && id_document) {
      await ResellerRequest.create({ user_id, id_document });
    } else {
      return h.response({ message: 'Invalid, Provide required details and attach an ID document.' }).code(400);
    }

    const existingUser = await User.findOne({ where: { user_id } });
    const existingUserProfile = await UserProfile.findOne({ where: { user_id } });
    
    if (existingUser && existingUserProfile) {
      existingUser.update({ firstname: firstname, lastname: lastname });
      existingUserProfile.update({ dob: dob, gender: gender, billing_address: billing_added, mobile_number: mobile_number });
    } else {
      return h.response({ message: 'User has not registered.' }).code(422);
    }

    return h.response({ message: 'Reseller request submitted' }).code(201);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};
export const checkVerificationStatus = async (request, h) => {
  try {
    const user_id = request.auth.credentials.id;

    const requestExists = await ResellerRequest.findOne({ where: { user_id, status: 'pending' } });

    if (!requestExists) {
      return h.response({ message: 'Reseller request doesn\'t exist' }).code(404);
    }

    return h.response({ message: 'Reseller request submitted' }).code(302);
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