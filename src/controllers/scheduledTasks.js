import User from '../models/userModel.js';
import UserProfile from '../models/userProfile.js';

export const markUsersAsRemoved = async (request, h) => {
    const cutoffDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

    const usersToRemove = await User.find({
        disabled: true,
        disableReason: 'user_request',
        disabledAt: { $lte: cutoffDate },
        removed: false
    });

    for (const user of usersToRemove) {
        user.removed = true;
        await user.save();
    }

    return h.response({ message: `${usersToRemove.length} users marked as removed.` });
};

export const deleteRemovedUsers = async (request, h) => {
    const usersToDelete = await User.find({ removed: true });

    for (const user of usersToDelete) {
        await UserProfile.deleteOne({ user_id: user._id });
        await User.deleteOne({ _id: user._id });
    }

    return h.response({ message: `${usersToDelete.length} users permanently deleted.` });
};