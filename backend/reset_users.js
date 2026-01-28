const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect("mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm?appName=Cluster0")
    .then(async () => {
        console.log("Connected to DB");
        await User.deleteMany({});
        console.log("ALL USERS DELETED. Database is clean.");
        process.exit();
    })
    .catch(err => console.error(err));
