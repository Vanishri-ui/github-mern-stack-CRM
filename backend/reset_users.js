const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/mern_crm')
    .then(async () => {
        console.log("Connected to DB");
        await User.deleteMany({});
        console.log("ALL USERS DELETED. Database is clean.");
        process.exit();
    })
    .catch(err => console.error(err));
