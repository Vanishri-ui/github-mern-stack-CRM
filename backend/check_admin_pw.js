const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const admin = await User.findOne({ email: 'admin@viva.com' });
        if (admin) {
            console.log('Admin Found:', admin.email);
            console.log('Role:', admin.role);

            // Test passwords
            const isMatchAdmin123 = await bcrypt.compare('admin123', admin.password);
            const isMatch123456 = await bcrypt.compare('123456', admin.password);

            console.log('Is password "admin123"?', isMatchAdmin123);
            console.log('Is password "123456"?', isMatch123456);
        } else {
            console.log('No user found with email admin@viva.com');
        }

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
