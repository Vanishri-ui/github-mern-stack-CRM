const mongoose = require('mongoose');
const URI = "mongodb://admin:managementadmin@ac-lioj5rk-shard-00-00.qyyfzgw.mongodb.net:27017,ac-lioj5rk-shard-00-01.qyyfzgw.mongodb.net:27017,ac-lioj5rk-shard-00-02.qyyfzgw.mongodb.net:27017/mern_crm?ssl=true&authSource=admin";

console.log("Testing DIRECT connection to Cloud MongoDB Shards...");
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
