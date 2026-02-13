const mongoose = require('mongoose');
require('dotenv').config();

async function checkCloudData() {
    try {
        console.log("Connecting to Cloud URI...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ SUCCESS: Connected to MongoDB Atlas Cloud.");

        // Define schemas just for checking
        const UserSchema = new mongoose.Schema({ name: String, role: String });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const SaleSchema = new mongoose.Schema({ customerName: String, status: String, orderType: String });
        const Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);

        const userCount = await User.countDocuments();
        const saleCount = await Sale.countDocuments();
        const upgrades = await Sale.countDocuments({ orderType: 'Upgrade' });

        console.log("\n--- Cloud Database Stats ---");
        console.log("Total Users in Cloud:", userCount);
        console.log("Total Sales Records in Cloud:", saleCount);
        console.log("Upgrade Records in Cloud:", upgrades);

        if (saleCount > 0) {
            const latestSales = await Sale.find().sort({ _id: -1 }).limit(3);
            console.log("\n--- Latest Sales (Most Recent 3) ---");
            latestSales.forEach(s => {
                console.log(`- Customer: ${s.customerName.padEnd(20)} | Status: ${s.status.padEnd(10)} | Type: ${s.orderType}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ FAILED: Could not fetch cloud data.");
        console.error(err.message);
        process.exit(1);
    }
}

checkCloudData();
