const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Check if ENV var exists, otherwise default (MUST MATCH SERVER.JS)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_crm';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected to:', MONGO_URI);

        const email = 'admin@viva.com';
        const password = '123456'; // MATCHING USER REALITY

        let user = await User.findOne({ email });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            console.log('Updating Admin password to 123456...');
            user.password = hashedPassword;
            await user.save();
            console.log('Success.');
        } else {
            console.log('Admin not found, creating...');
            user = new User({
                name: 'Admin User',
                email,
                password: hashedPassword,
                role: 'admin',
                department: 'admin'
            });
            await user.save();
            console.log('Success.');
        }
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
