const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/merncrud')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Hierarchy Data
const users = [
    // --- FINANCE ---
    {
        name: 'Gopinath',
        email: 'gopinath@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        isDepartmentHead: true,  // Head of Billing & Finance
        isManager: true
    },
    {
        name: 'Shailaja',
        email: 'shailaja@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        isDepartmentHead: false,
        isManager: true          // Manager under Gopinath
    },

    // --- SALES ---
    {
        name: 'Mohammad Tabrez',
        email: 'tabrez@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        isDepartmentHead: true,  // Head of Sales
        isSalesManager: true     // Legacy flag
    },

    // --- SUPPORT ---
    {
        name: 'Subramaniyan',
        email: 'subramaniyan@viva.com',
        password: '123456',
        role: 'tech',
        department: 'tech',
        isDepartmentHead: false,
        isManager: true  // PROMOTED TO MANAGER
    },
    {
        name: 'Suman',
        email: 'suman@viva.com',
        password: '123456',
        role: 'tech',
        department: 'tech',
        isDepartmentHead: false,
        isManager: true  // PROMOTED TO MANAGER
    }
];

const seedHierarchy = async () => {
    try {
        for (const u of users) {
            let user = await User.findOne({ email: u.email });
            if (user) {
                console.log(`Updating ${u.name}...`);
                user.isDepartmentHead = u.isDepartmentHead;
                user.isManager = u.isManager;
                if (u.isSalesManager) user.isSalesManager = true;
                await user.save();
            } else {
                console.log(`Creating ${u.name}...`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                user = new User({ ...u, password: hashedPassword });
                await user.save();
            }
        }
        console.log('\n✅ Hierarchy seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedHierarchy();
