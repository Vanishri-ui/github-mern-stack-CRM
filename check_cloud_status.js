const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function checkCloudData() {
    try {
        console.log("Connecting to URI:", process.env.MONGO_URI.replace(/:([^:@]{1,})@/, ':****@'));
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to Cloud Database.");

        const User = mongoose.model('User', new mongoose.Schema({ name: String, role: String }));
        const Sale = mongoose.model('Sale', new mongoose.Schema({ customerName: String, status: String, orderType: String }));

        const userCount = await User.countDocuments();
        const saleCount = await Sale.countDocuments();
        const upgrades = await Sale.countDocuments({ orderType: 'Upgrade' });

        console.log("\n--- Cloud Database Stats ---");
        console.log("Total Users:", userCount);
        console.log("Total Sales Records:", saleCount);
        console.log("Upgrade Records:", upgrades);

        if (saleCount > 0) {
            const latestSales = await Sale.find().sort({ _id: -1 }).limit(3);
            console.log("\n--- Latest Sales in Cloud ---");
            latestSales.forEach(s => {
                console.log(`- Customer: ${s.customerName}, Status: ${s.status}, Type: ${s.orderType}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error fetching cloud data:", err.message);
        process.exit(1);
    }
}

checkCloudData();
