const mongoose = require('mongoose');
require('dotenv').config();
const Sale = require('./models/Sale');
const User = require('./models/User');

async function seedCloudSales() {
    try {
        console.log("Connecting to Cloud DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        // Clean up old demo sales if any
        await Sale.deleteMany({ customerName: { $regex: /Demo Customer/ } });

        // Get an existing user to assign as sales person
        const am = await User.findOne({ role: 'sales' }) || await User.findOne({ role: 'admin' });
        if (!am) {
            console.error("No sales person found to assign sales to.");
            process.exit(1);
        }

        const salesData = [
            {
                customerName: 'Demo Customer A',
                productName: 'Cloud Voice Pro',
                amount: 1500,
                mrc: 150,
                agentName: am.name,
                salesPerson: am._id,
                orderType: 'New Sale',
                status: 'Paid',
                date: new Date()
            },
            {
                customerName: 'Demo Customer B',
                productName: 'Upgrade Pack 10',
                amount: 500,
                mrc: 50,
                agentName: am.name,
                salesPerson: am._id,
                orderType: 'Upgrade',
                status: 'Paid',
                date: new Date()
            },
            {
                customerName: 'Demo Customer C',
                productName: 'Cloud Voice Starter',
                amount: 800,
                mrc: 80,
                agentName: am.name,
                salesPerson: am._id,
                orderType: 'New Sale',
                status: 'Billed',
                date: new Date()
            }
        ];

        for (const sale of salesData) {
            const newSale = new Sale(sale);
            await newSale.save();
            console.log(`Created ${sale.orderType}: ${sale.customerName} - $${sale.amount}`);
        }

        console.log("\n✅ Cloud Demo Sales Seeded Successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    }
}

seedCloudSales();
