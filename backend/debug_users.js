const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect("mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0")
    .then(async () => {
        console.log("Connected to DB");
        const users = await User.find({});
        console.log("--- EXISTING USERS ---");
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | Dept: ${u.department} | Name: ${u.name}`);
        });
        console.log("----------------------");
        process.exit();
    })
    .catch(err => console.error(err));
