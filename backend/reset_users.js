const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect("mongodb://127.0.0.1:27017/merncrud")
    .then(async () => {
        console.log("Connected to DB");
        await User.deleteMany({});
        console.log("ALL USERS DELETED. Database is clean.");
        process.exit();
    })
    .catch(err => console.error(err));
