require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to Cloud...'))
    .catch(err => console.log(err));

const teamMembers = [
    // --- SALES TEAM ---
    {
        name: 'Huzefa',
        email: 'huzefa@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Sales Team Member'
    },
    {
        name: 'Mohammad Tabrez',
        email: 'tabrez@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        isDepartmentHead: true,
        isSalesManager: true,
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Head of Sales'
    },

    // --- SUPPORT TEAM (TECH) ---
    {
        name: 'Sarath Kumar',
        email: 'sarath@viva.com',
        password: '123456',
        role: 'tech',
        department: 'tech',
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Support Team Member'
    },
    {
        name: 'Tharun',
        email: 'tharun@viva.com',
        password: '123456',
        role: 'tech',
        department: 'tech',
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Support Team Member'
    },
    {
        name: 'Suman',
        email: 'suman@viva.com',
        password: '123456',
        role: 'tech',
        department: 'tech',
        isManager: true,
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Tech Lead'
    },
    {
        name: 'Subramaniyan',
        email: 'subramaniyan@viva.com',
        password: '123456',
        role: 'tech',
        department: 'tech',
        isManager: true,
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Tech Lead'
    },

    // --- FINANCE TEAM ---
    {
        name: 'Gopinath',
        email: 'gopinath@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        isDepartmentHead: true,
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Finance Head'
    },
    {
        name: 'Shailaja',
        email: 'shailaja@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        isManager: true,
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Finance Manager'
    },
    {
        name: 'Kalaivani',
        email: 'kalaivani@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        permissions: ['UPDATE', 'DELETE', 'VIEW'],
        title: 'Collection'
    },
    {
        name: 'Shiva Ganesh',
        email: 'shivaganesh@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        isManager: true,
        permissions: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
        title: 'Billing Manager'
    },
    {
        name: 'Priya',
        email: 'priya@viva.com',
        password: '123456',
        role: 'finance',
        department: 'finance',
        permissions: ['UPDATE', 'DELETE', 'VIEW'],
        title: 'Finance Team Member'
    }
];

const seedTeams = async () => {
    try {
        for (const m of teamMembers) {
            let user = await User.findOne({ email: m.email });
            if (user) {
                console.log(`Updating ${m.name} (${m.email})...`);
                user.role = m.role;
                user.department = m.department;
                user.isDepartmentHead = m.isDepartmentHead || false;
                user.isManager = m.isManager || false;
                user.isSalesManager = m.isSalesManager || false;
                user.permissions = m.permissions;
                user.title = m.title;
                await user.save();
            } else {
                console.log(`Creating ${m.name} (${m.email})...`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(m.password, salt);
                user = new User({ ...m, password: hashedPassword });
                await user.save();
            }
        }
        console.log('\n✅ Team Roles & Permissions Updated Successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTeams();
