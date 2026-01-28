const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0';

const seedExecution = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'execution@viva.com';
        let user = await User.findOne({ email });

        if (user) {
            console.log('Execution user already exists.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            user = new User({
                name: 'Execution Team',
                email: email,
                password: hashedPassword,
                role: 'execution',
                department: 'execution'
            });
            await user.save();
            console.log('Created: execution@viva.com');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedExecution();
