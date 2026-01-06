const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect("mongodb://127.0.0.1:27017/merncrud")
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
