const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Sales Team Data
const salesTeam = [
    {
        name: 'Mohammad Tabrez',
        email: 'tabrez@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        isSalesManager: true  // BOSS
    },
    {
        name: 'Sales Person 1',
        email: 'sales1@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        isSalesManager: false
    },
    {
        name: 'Sales Person 2',
        email: 'sales2@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        isSalesManager: false
    },
    {
        name: 'Sales Person 3',
        email: 'sales3@viva.com',
        password: '123456',
        role: 'sales',
        department: 'sales',
        isSalesManager: false
    }
];

const seedSalesTeam = async () => {
    try {
        for (const member of salesTeam) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: member.email });
            if (existingUser) {
                console.log(`User ${member.email} already exists. Updating isSalesManager...`);
                existingUser.isSalesManager = member.isSalesManager;
                await existingUser.save();
            } else {
                // Hash password and create user
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(member.password, salt);

                const newUser = new User({
                    ...member,
                    password: hashedPassword
                });
                await newUser.save();
                console.log(`Created user: ${member.name} (${member.email})${member.isSalesManager ? ' [SALES MANAGER]' : ''}`);
            }
        }

        console.log('\n✅ Sales team seeded successfully!');
        console.log('\nSales Manager Login:');
        console.log('  Email: tabrez@viva.com');
        console.log('  Password: 123456');
        console.log('\nOther Sales Members:');
        console.log('  sales1@viva.com, sales2@viva.com, sales3@viva.com');
        console.log('  Password: 123456');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding sales team:', err);
        process.exit(1);
    }
};

seedSalesTeam();
