const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/mern_crm';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const email = 'admin@viva.com';
        const password = 'admin123'; // KNOWN PASSWORD

        // Check if exists
        let user = await User.findOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            console.log('Admin found. Updating password...');
            user.password = hashedPassword;
            user.role = 'admin';
            user.department = 'admin';
            await user.save();
            console.log('Admin password updated to: admin123');
        } else {
            console.log('Admin NOT found. Creating new admin...');
            user = new User({
                name: 'Admin User',
                email,
                password: hashedPassword,
                role: 'admin',
                department: 'admin'
            });
            await user.save();
            console.log('New Admin created with password: admin123');
        }

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
