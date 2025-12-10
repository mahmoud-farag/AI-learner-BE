import { User } from '../models/index.js';
import { customErrors, generateToken, matchPassword } from '../utils/index.js';

const { BadRequestError, InternalServerError, NotFoundError } = customErrors;

const authService = {};

authService.login = async (email, username, password) => {

    const query = { $or: [] };

    if (email) query.$or.push({ email });

    if (username) query.$or.push({ username });

    const user = await User.findOne(query).select('+password').lean();

    if (!user) 
        throw new BadRequestError('User Not found');

    if ((email && email !== user.email) || (username && username !== user.username))
        throw new BadRequestError('Wrong Credentials');

    const isPasswordMatching = await matchPassword(password, user.password);

    if (!isPasswordMatching) 
        throw new BadRequestError('Wrong Credentials');

    const token = generateToken({ userId: user._id });

    delete user.password;

    return { user, token };
};

authService.register = async (userData) => {

    const { username, email, password, profileImage } = userData;

    const newUser = await User.create({ username, email, password, profileImage });
    
    const userId = newUser._id;

    const token = generateToken({ userId: userId });

    return {
        user: { username: newUser.username, _id: userId },
        token,
    };
};

authService.getUserProfile = async (userId) => {

    const user = await User.findOne({ _id: userId }).lean();

    if (!user) 
        throw new NotFoundError('User not found');

    return user;
};

authService.changePassword = async (userId, currentPassword, newPassword) => {

    const user = await User.findById(userId).select('+password');

    if (!user) 
        throw new NotFoundError('User not found');

    if (!user.password) 
        throw new InternalServerError('Password not exist in the db');

    const isPasswordMatching = await matchPassword(currentPassword, user.password);

    if (!isPasswordMatching) 
        throw new BadRequestError('Wrong password');

    user.password = newPassword;

    await user.save();

    return true;
};

export default authService;
