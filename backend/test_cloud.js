const mongoose = require('mongoose');
const URI = "mongodb+srv://admin:managementadmin@cluster0.qyyfzgw.mongodb.net/mern_crm";

console.log("Testing connection to Cloud MongoDB...");
mongoose.connect(URI)
    .then(() => {
        console.log("✅ SUCCESS: Connected to Cloud MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ FAILED: Could not connect to Cloud MongoDB.");
        console.error(err.message);
        process.exit(1);
    });
