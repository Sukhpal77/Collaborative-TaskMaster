const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const excludeId  = req.user._id; 
        const filter = excludeId ? { _id: { $ne: excludeId } } : {}; 

        const users = await User.find(filter);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};