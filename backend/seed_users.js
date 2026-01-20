const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0';

const users = [
    { name: 'Admin User', email: 'admin@viva.com', password: '123456', role: 'admin', department: 'admin' },
    { name: 'Sales User', email: 'sales@viva.com', password: '123456', role: 'sales', department: 'sales' },
    { name: 'Ops User', email: 'ops@viva.com', password: '123456', role: 'ops', department: 'ops' },
    { name: 'Finance User', email: 'finance@viva.com', password: '123456', role: 'finance', department: 'finance' },
    { name: 'Tech Support', email: 'tech@viva.com', password: '123456', role: 'tech', department: 'tech' }
];

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected (Cloud)...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedUsers = async () => {
    await connectDB();

    console.log('Clearing old users...');
    await User.deleteMany({});

    console.log('Creating new users...');
    for (const user of users) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await new User(user).save();
        console.log(`Created: ${user.email} (${user.role})`);
    }

    console.log('ALL USERS SEEDED SUCCESSFULLY.');
    process.exit();
};

seedUsers();
