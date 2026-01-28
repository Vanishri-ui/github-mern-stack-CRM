const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0";

const usersToUpdate = [
    {
        name: "Gopinath",
        email: "gopinath@viva.com",
        password: "gopi2026",
        role: "finance",
        department: "finance",
        title: "Finance Head (R, C, U, D)",
        isManager: true,
        isDepartmentHead: true,
        permissions: ["READ", "CREATE", "UPDATE", "DELETE"]
    },
    {
        name: "Mohammad Tabrez",
        email: "tabrez@viva.com",
        password: "tabrez2026",
        role: "sales",
        department: "sales",
        title: "Head of Sales (R, C, U, D)",
        isManager: true,
        isDepartmentHead: true,
        isSalesManager: true,
        permissions: ["READ", "CREATE", "UPDATE", "DELETE"]
    },
    {
        name: "Shiva Ganesh",
        email: "shiva@viva.com",
        password: "vivaadmin2025",
        role: "finance",
        department: "finance",
        title: "Manager (R, C, U, D)",
        isManager: true,
        permissions: ["READ", "CREATE", "UPDATE", "DELETE"]
    },
    {
        name: "Sailaja",
        email: "sailaja@viva.com",
        password: "vivaadmin2025",
        role: "finance",
        department: "finance",
        title: "Accounts Manager (R, C, U, D)",
        isManager: true,
        permissions: ["READ", "CREATE", "UPDATE", "DELETE"]
    },
    {
        name: "Kalaivani",
        email: "kalaivani@viva.com",
        password: "vivaadmin2025",
        role: "finance",
        department: "finance",
        title: "Collection Team Lead (R, U, D)",
        isManager: true,
        permissions: ["READ", "UPDATE", "DELETE"]
    },
    {
        name: "Huzefa",
        email: "huzefa@viva.com",
        password: "vivaadmin2025",
        role: "sales",
        department: "sales",
        title: "Sales Specialist (C, U, D)",
        permissions: ["CREATE", "UPDATE", "DELETE"]
    },
    {
        name: "Suman",
        email: "suman@viva.com",
        password: "suman2026",
        role: "tech",
        department: "tech",
        title: "Support Manager (R, C, U, D)",
        isManager: true,
        isDepartmentHead: true,
        permissions: ["READ", "CREATE", "UPDATE", "DELETE"]
    },
    {
        name: "Sarath",
        email: "sarath@viva.com",
        password: "vivaadmin2025",
        role: "tech",
        department: "tech",
        title: "Team Member (R, U)",
        permissions: ["READ", "UPDATE"]
    },
    {
        name: "Tharun",
        email: "tharun@viva.com",
        password: "vivaadmin2025",
        role: "tech",
        department: "tech",
        title: "Team Member (R, U)",
        permissions: ["READ", "UPDATE"]
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        for (const userData of usersToUpdate) {
            let user = await User.findOne({ email: userData.email });
            if (user) {
                console.log(`Updating ${userData.name}...`);
                Object.assign(user, userData);
                if (userData.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(userData.password, salt);
                }
                await user.save();
            } else {
                console.log(`Creating ${userData.name}...`);
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
                user = new User(userData);
                await user.save();
            }
        }

        console.log("Users seeded successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
