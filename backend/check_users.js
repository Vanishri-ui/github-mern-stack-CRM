const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/mern_crm')
    .then(async () => {
        console.log('MongoDB Connected');

        const users = await User.find({}, 'name email role department');
        console.log('--- ALL USERS ---');
        console.table(users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            dept: u.department
        })));

        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('\n[INFO] Admin exists:', admin.email);
        } else {
            console.log('\n[WARNING] NO ADMIN USER FOUND!');
        }

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
