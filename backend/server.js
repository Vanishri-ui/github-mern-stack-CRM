const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("./models/User");
const Document = require("./models/Document");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cors());

// ======= ADMIN BYPASS - Top Priority Route =======
app.post("/api/auth/admin-bypass", async (req, res) => {
  console.log(">>> ADMIN BYPASS HIT <<<");
  const secretKey = req.body.secretKey ? req.body.secretKey.trim() : "";
  const masterPassword = req.body.masterPassword ? req.body.masterPassword.trim() : "";

  const SYSTEM_SECRET = "viva-master-key-2025";
  const MASTER_PASSWORD = "vivaadmin2025";

  if (secretKey !== SYSTEM_SECRET || masterPassword !== MASTER_PASSWORD) {
    return res.status(401).json({ msg: "Access Denied. Invalid credentials." });
  }

  try {
    let user = await User.findOne({ role: "admin" });
    if (!user) {
      user = await User.findOne({ email: "admin@viva.com" });
    }
    if (!user) {
      return res.status(404).json({ msg: "Admin account not found. Run: node backend/seed_users.js" });
    }

    const jwt = require("jsonwebtoken");
    const payload = { user: { id: user.id, role: user.role, department: user.department } };
    jwt.sign(payload, "secrettoken", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, department: user.department } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// ======= END ADMIN BYPASS =======

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/merncrud")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --- AUTH ROUTES ---

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password, role, department });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        department: user.department,
        isSalesManager: user.isSalesManager,
        isDepartmentHead: user.isDepartmentHead,
        isManager: user.isManager
      }
    };
    jwt.sign(payload, "secrettoken", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          department: user.department,
          isSalesManager: user.isSalesManager,
          isDepartmentHead: user.isDepartmentHead,
          isManager: user.isManager
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        department: user.department,
        isSalesManager: user.isSalesManager,
        isDepartmentHead: user.isDepartmentHead,
        isManager: user.isManager
      }
    };
    jwt.sign(payload, "secrettoken", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          department: user.department,
          isSalesManager: user.isSalesManager,
          isDepartmentHead: user.isDepartmentHead,
          isManager: user.isManager
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Bypass Admin Login
console.log(">>> Registering /api/auth/admin-bypass route...");
app.get("/api/auth/admin-bypass", (req, res) => {
  res.json({ msg: "Admin bypass route is registered!" });
});
app.post("/api/auth/admin-bypass", async (req, res) => {
  const secretKey = req.body.secretKey ? req.body.secretKey.trim() : "";
  const SYSTEM_SECRET = "viva-master-key-2025";

  console.log("--- DEBUG ADMIN BYPASS ---");
  console.log("Received Body:", req.body);
  console.log("Received Key:", secretKey);
  console.log("Expected Key:", SYSTEM_SECRET);
  console.log("Match:", secretKey === SYSTEM_SECRET);
  console.log("--------------------------");

  try {
    if (secretKey !== SYSTEM_SECRET) {
      return res.status(401).json({ msg: `Invalid Key. Recv: '${secretKey}' vs Exp: '${SYSTEM_SECRET}'` });
    }

    // Find the Admin user
    let user = await User.findOne({ role: "admin" });

    // If no admin user exists, create a temporary one (failsafe)
    if (!user) {
      // Try to find by email
      user = await User.findOne({ email: "admin@viva.com" });
    }

    if (!user) {
      return res.status(404).json({ msg: "Admin account not found. Please seed the database." });
    }

    // Generate Token
    const payload = { user: { id: user.id, role: user.role, department: user.department } };
    jwt.sign(payload, "secrettoken", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, department: user.department } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- DOCUMENT ROUTES ---

// Upload Document (Protected)
app.post("/api/documents/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const { title, department } = req.body;
    const newDoc = new Document({
      title,
      filename: req.file.filename,
      uploadedBy: req.user.id,
      department: department || req.user.department // Default to user's dept if not specified (or enforce logic)
    });
    const doc = await newDoc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get Documents (RBAC)
app.get("/api/documents", auth, async (req, res) => {
  try {
    let query = {};
    // If not admin, only show department docs
    if (req.user.role !== 'admin') {
      query = { department: req.user.department };
    }

    const docs = await Document.find(query).populate("uploadedBy", "name");
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get All Users (Admin only mostly, or for UI)
app.get("/api/users", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// --- SALES ROUTES (CRM) ---

const Sale = require("./models/Sale");

// Create Sale (Salesperson only usually, but Admin can too)
app.post("/api/sales", auth, async (req, res) => {
  try {
    const { customerName, productName, amount, agentName, date, serviceLines } = req.body; // Added serviceLines
    const newSale = new Sale({
      customerName,
      productName,
      amount,
      agentName, // Optional: Account Manager Name
      date: date || Date.now(),
      status: req.body.status || 'Pending Execution',
      serviceLines, // Save field
      salesPerson: req.user.id
    });
    const savedSale = await newSale.save();
    res.json(savedSale);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update Sale (Edit)
app.put("/api/sales/:id", auth, async (req, res) => {
  try {
    const { customerName, productName, amount, agentName, date, status, serviceLines } = req.body; // Added serviceLines
    let sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ msg: "Sale not found" });

    // Check permissions: Admin OR Sales Manager OR Owner
    if (req.user.role !== 'admin' && !req.user.isSalesManager && sale.salesPerson.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    sale = await Sale.findByIdAndUpdate(req.params.id,
      { $set: { customerName, productName, amount, agentName, date, status, serviceLines } },
      { new: true }
    );
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get Sales (RBAC)
app.get("/api/sales", auth, async (req, res) => {
  try {
    let query = {};
    // If NOT admin AND NOT Department Head AND NOT Sales Manager, only see OWN sales
    if (req.user.role !== 'admin' && !req.user.isDepartmentHead && !req.user.isSalesManager) {
      query = { salesPerson: req.user.id };
    }

    // Populate salesperson name for Admin view
    const sales = await Sale.find(query).populate("salesPerson", "name department").sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Delete Sale (Admin or Owner)
app.delete("/api/sales/:id", auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ msg: "Sale not found" });

    // Check permissions: Admin OR Sales Manager OR Owner
    if (req.user.role !== 'admin' && !req.user.isSalesManager && sale.salesPerson.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ msg: "Sale removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- TICKET ROUTES (SUPPORT) ---

const Ticket = require("./models/Ticket");

// Raise Ticket (Anyone)
app.post("/api/tickets", auth, async (req, res) => {
  try {
    const { title, description, priority, linkedSale, productName, serviceLines } = req.body;

    // Validate linkedSale: Must be valid ObjectId or null. Empty string throws CastError.
    const saleLink = (linkedSale && linkedSale.length === 24) ? linkedSale : null;

    const newTicket = new Ticket({
      title,
      description,
      priority,
      raisedBy: req.user.id,
      linkedSale: saleLink,   // Save sanitized link
      productName,  // Save snapshot
      serviceLines  // Save snapshot
    });
    const savedTicket = await newTicket.save();
    res.json(savedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get Tickets (RBAC)
app.get("/api/tickets", auth, async (req, res) => {
  try {
    let query = {};
    // Tech Support & Admin see ALL tickets. Others see only THEIR own.
    if (req.user.department !== 'tech' && req.user.role !== 'admin') {
      query = { raisedBy: req.user.id };
    }

    // Sort by: Open first, then Date
    const tickets = await Ticket.find(query).populate("raisedBy", "name department").sort({ status: 1, date: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Resolve Ticket (Tech/Admin only)
app.put("/api/tickets/:id", auth, async (req, res) => {
  try {
    // Check permission
    if (req.user.department !== 'tech' && req.user.role !== 'admin') {
      return res.status(401).json({ msg: "Not authorized to resolve tickets" });
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- LEAVE ROUTES (HR) ---

const Leave = require("./models/Leave");

// Apply for Leave (All Employees)
app.post("/api/leaves", auth, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const newLeave = new Leave({
      startDate,
      endDate,
      reason,
      user: req.user.id
    });
    const savedLeave = await newLeave.save();
    res.json(savedLeave);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- INVOICE ROUTES (FINANCE) ---
const Invoice = require('./models/Invoice');
// Sale is already imported above

// Create Invoice
app.post("/api/invoices", auth, async (req, res) => {
  try {
    const { saleId, items, totalAmount, dueDate } = req.body;

    // Generate Invoice Number (Simple timestamp based or sequential)
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Fetch Sale to get customer name
    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ msg: "Sale not found" });

    const newInvoice = new Invoice({
      sale: saleId,
      invoiceNumber,
      customerName: sale.customerName,
      items,
      totalAmount,
      dueDate
    });

    await newInvoice.save();
    res.json(newInvoice);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get All Invoices
app.get("/api/invoices", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update Invoice Status (Mark Paid)
app.put("/api/invoices/:id", auth, async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const updateFields = { status };
    if (status === 'Paid') {
      updateFields.paymentDate = Date.now();
      updateFields.paymentMethod = paymentMethod || 'Bank Transfer';
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get Leaves (RBAC)
app.get("/api/leaves", auth, async (req, res) => {
  try {
    let query = {};
    // Admin & HR see ALL. Others see only THEIR own.
    // Assuming 'role' can be 'admin' or department 'hr' implies admin privileges for leaves
    if (req.user.role !== 'admin' && req.user.department !== 'hr') {
      query = { user: req.user.id };
    }

    // Sort: Pending first, then Date
    const leaves = await Leave.find(query).populate("user", "name department").sort({ status: 1, appliedAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update Leave Status (Admin/HR Only)
app.put("/api/leaves/:id", auth, async (req, res) => {
  try {
    // Check permission
    if (req.user.role !== 'admin' && req.user.department !== 'hr') {
      return res.status(401).json({ msg: "Not authorized to manage leaves" });
    }

    const { status } = req.body; // Expecting { status: 'Approved' | 'Rejected' }
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));