import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  initializeDatabase,
  saveToDatabase,
  logActivity,
  hashPassword
} from "./src/server_db";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize file-based database schema on startup
const db = initializeDatabase();

// --- PUBLIC READ ENDPOINTS ---
app.get("/api/public/books", (req, res) => {
  const store = initializeDatabase();
  // books
  res.json(store.materials.filter(m => m.type === "pdf" && m.is_published));
});

app.get("/api/public/cases", (req, res) => {
  const store = initializeDatabase();
  res.json(store.case_notes.filter(c => c.status === "published"));
});

app.get("/api/public/internships", (req, res) => {
  const store = initializeDatabase();
  res.json(store.internships.filter(i => i.status === "published"));
});

app.get("/api/public/news", (req, res) => {
  const store = initializeDatabase();
  res.json(store.news_notifications.filter(n => n.status === "published"));
});

// --- STUDENT AUTHENTICATION ENDPOINTS ---
app.post("/api/student/auth/login", (req, res) => {
  const { email, password } = req.body;
  const store = initializeDatabase();

  const rawEmail = (email || "").toString().trim().toLowerCase();
  const user = store.users.find((u) => u.email.toLowerCase() === rawEmail);
  const roleName = user ? store.roles.find((r) => r.id === user.role_id)?.name : "";

  if (user && roleName === "Student" && user.password_hash === hashPassword(password)) {
    logActivity(user.email, "Student Login", "Student authenticated successfully via email.");
    res.json({
      success: true,
      token: "student_" + Date.now(),
      user: { name: user.name, email: user.email }
    });
  } else {
    logActivity(rawEmail || "unknown", "Failed Student Login", "Invalid student email or password.");
    res.status(401).json({ error: "Invalid email or password" });
  }
});

app.post("/api/student/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  const store = initializeDatabase();
  const normalizedEmail = (email || "").toString().trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const studentRole = store.roles.find((role) => role.name === "Student");
  if (!studentRole) {
    return res.status(500).json({ error: "Student role is not available." });
  }

  const newUser = {
    id: "u_" + Date.now(),
    username: normalizedEmail,
    password_hash: hashPassword(password),
    role_id: studentRole.id,
    name: name || normalizedEmail.split("@")[0],
    email: normalizedEmail
  };

  store.users.push(newUser);
  saveToDatabase(store);
  logActivity(normalizedEmail, "Student Registered", "Student account created through email registration.");
  res.json({ success: true, user: { name: newUser.name, email: newUser.email } });
});

// --- CMS SECURE AUTHENTICATION ENDPOINTS ---
app.post("/api/cms/auth/login", (req, res) => {
  const { username, password } = req.body;
  const store = initializeDatabase();
  
  const rawUser = (username || "").toString().trim();
  const normalizedUsername = rawUser.startsWith("@") ? rawUser : "@" + rawUser;

  const user = store.users.find(u => 
    u.username.toLowerCase() === normalizedUsername.toLowerCase() || 
    u.username.toLowerCase() === rawUser.toLowerCase()
  );

  if (user && user.password_hash === hashPassword(password)) {
    logActivity(user.username, "Admin Login", "Administrator authenticated successfully.");
    res.json({
      success: true,
      token: "session_" + Date.now(),
      user: { name: user.name, username: user.username, email: user.email }
    });
  } else {
    logActivity(rawUser || "unknown", "Failed Login Attempt", `Invalid login credentials provided for username: ${rawUser}`);
    res.status(401).json({ error: "Invalid username or password" });
  }
});

app.post("/api/cms/auth/change-password", (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  const store = initializeDatabase();
  const idx = store.users.findIndex(u => u.username === username);
  if (idx > -1 && store.users[idx].password_hash === hashPassword(currentPassword)) {
    store.users[idx].password_hash = hashPassword(newPassword);
    saveToDatabase(store);
    logActivity(username, "Password Changed", "Administrator updated security key phrase.");
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid current security key phrase" });
  }
});

app.get("/api/cms/stats", (req, res) => {
  const store = initializeDatabase();
  res.json({
    totalSubjects: store.subjects.length,
    totalMaterials: store.materials.length,
    totalCaseNotes: store.case_notes.length,
    totalInternshipPosts: store.internships.length,
    totalNewsNotifications: store.news_notifications.length,
    recentActivities: store.activity_logs.slice(0, 15),
    latestUploadedMaterials: store.materials.slice(-5).reverse(),
    latestMedia: store.media_library.slice(-5).reverse()
  });
});

// --- CMS SUBJECTS CRUD ---
app.get("/api/cms/subjects", (req, res) => {
  const store = initializeDatabase();
  res.json(store.subjects);
});

app.post("/api/cms/subjects", (req, res) => {
  const { code, name, semester } = req.body;
  const store = initializeDatabase();
  const newSub = {
    id: "s_" + Date.now(),
    code,
    name,
    semester: parseInt(semester) || 1
  };
  store.subjects.push(newSub);
  
  // Create default folders for materials automatically
  store.subject_sections.push({ id: `sec-${code}-notes`, subject_id: newSub.id, name: "notes" });
  store.subject_sections.push({ id: `sec-${code}-pyqs`, subject_id: newSub.id, name: "pyqs" });
  store.subject_sections.push({ id: `sec-${code}-videos`, subject_id: newSub.id, name: "videos" });
  
  saveToDatabase(store);
  logActivity("admin", "Created Subject", `Created subject [${code}] ${name}`);
  res.json(newSub);
});

app.put("/api/cms/subjects/:id", (req, res) => {
  const store = initializeDatabase();
  const idx = store.subjects.findIndex(s => s.id === req.params.id);
  if (idx > -1) {
    store.subjects[idx] = { ...store.subjects[idx], ...req.body };
    saveToDatabase(store);
    logActivity("admin", "Updated Subject", `Modified subject: ${store.subjects[idx].name}`);
    res.json(store.subjects[idx]);
  } else {
    res.status(404).json({ error: "Subject not found" });
  }
});

app.delete("/api/cms/subjects/:id", (req, res) => {
  const store = initializeDatabase();
  const sub = store.subjects.find(s => s.id === req.params.id);
  if (sub) {
    store.subjects = store.subjects.filter(s => s.id !== req.params.id);
    store.subject_sections = store.subject_sections.filter(sec => sec.subject_id !== req.params.id);
    saveToDatabase(store);
    logActivity("admin", "Deleted Subject", `Permanently deleted subject: ${sub.name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Subject not found" });
  }
});

// --- CMS TOPICS / DISCIPLINE SECTIONS ---
app.get("/api/cms/topics", (req, res) => {
  const store = initializeDatabase();
  res.json(store.subject_sections);
});

app.post("/api/cms/topics", (req, res) => {
  const { subject_id, name } = req.body;
  const store = initializeDatabase();
  const newTopic = { id: "topic_" + Date.now(), subject_id, name };
  store.subject_sections.push(newTopic);
  saveToDatabase(store);
  logActivity("admin", "Created Topic", `Added section/topic: ${name}`);
  res.json(newTopic);
});

app.delete("/api/cms/topics/:id", (req, res) => {
  const store = initializeDatabase();
  store.subject_sections = store.subject_sections.filter(t => t.id !== req.params.id);
  saveToDatabase(store);
  logActivity("admin", "Deleted Topic", `Deleted section/topic id: ${req.params.id}`);
  res.json({ success: true });
});

// --- CMS MATERIALS CRUD ---
app.get("/api/cms/materials", (req, res) => {
  const store = initializeDatabase();
  res.json(store.materials);
});

app.post("/api/cms/materials", (req, res) => {
  const { section_id, title, type, url, file_size, is_published } = req.body;
  const store = initializeDatabase();
  const newMat = {
    id: "mat_" + Date.now(),
    section_id,
    title,
    type: type || "pdf",
    url: url || "https://example.com/file",
    file_size: file_size || "1.0 MB",
    is_published: is_published !== false
  };
  store.materials.push(newMat);
  saveToDatabase(store);
  logActivity("admin", "Uploaded Study Material", `Published material: ${title}`);
  res.json(newMat);
});

app.put("/api/cms/materials/:id", (req, res) => {
  const store = initializeDatabase();
  const idx = store.materials.findIndex(m => m.id === req.params.id);
  if (idx > -1) {
    store.materials[idx] = { ...store.materials[idx], ...req.body };
    saveToDatabase(store);
    logActivity("admin", "Updated Material", `Modified library resource: ${store.materials[idx].title}`);
    res.json(store.materials[idx]);
  } else {
    res.status(404).json({ error: "Material not found" });
  }
});

app.delete("/api/cms/materials/:id", (req, res) => {
  const store = initializeDatabase();
  const mat = store.materials.find(m => m.id === req.params.id);
  if (mat) {
    store.materials = store.materials.filter(m => m.id !== req.params.id);
    saveToDatabase(store);
    logActivity("admin", "Deleted study material", `Deleted academic resource: ${mat.title}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Material not found" });
  }
});

// --- CMS CASES DATABASE CRUD ---
app.get("/api/cms/cases", (req, res) => {
  const store = initializeDatabase();
  res.json(store.case_notes);
});

app.post("/api/cms/cases", (req, res) => {
  const store = initializeDatabase();
  const newCase = {
    id: "case_" + Date.now(),
    name: req.body.name,
    citation: req.body.citation || "N/A",
    court: req.body.court || "Supreme Court of India",
    subject: req.body.subject || "Constitutional Law",
    bench: req.body.bench || "N/A",
    date: req.body.date || "N/A",
    facts: req.body.facts || "N/A",
    issues: req.body.issues || "N/A",
    ratio: req.body.ratio || "N/A",
    takeaways: req.body.takeaways || "N/A",
    status: req.body.status || "published"
  };
  store.case_notes.push(newCase);
  saveToDatabase(store);
  logActivity("admin", "Created Case Note", `Created landmark case brief: ${newCase.name}`);
  res.json(newCase);
});

app.put("/api/cms/cases/:id", (req, res) => {
  const store = initializeDatabase();
  const idx = store.case_notes.findIndex(c => c.id === req.params.id);
  if (idx > -1) {
    store.case_notes[idx] = { ...store.case_notes[idx], ...req.body };
    saveToDatabase(store);
    logActivity("admin", "Modified Case Note", `Updated litigation brief: ${store.case_notes[idx].name}`);
    res.json(store.case_notes[idx]);
  } else {
    res.status(404).json({ error: "Case not found" });
  }
});

app.delete("/api/cms/cases/:id", (req, res) => {
  const store = initializeDatabase();
  const c = store.case_notes.find(cs => cs.id === req.params.id);
  if (c) {
    store.case_notes = store.case_notes.filter(cs => cs.id !== req.params.id);
    saveToDatabase(store);
    logActivity("admin", "Deleted Case Brief", `Deleted litigation reference: ${c.name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Case not found" });
  }
});

// --- CMS INTERNSHIPS CRUD ---
app.get("/api/cms/internships", (req, res) => {
  const store = initializeDatabase();
  res.json(store.internships);
});

app.post("/api/cms/internships", (req, res) => {
  const store = initializeDatabase();
  const newPost = {
    id: "opp_" + Date.now(),
    org: req.body.org,
    role: req.body.role,
    loc: req.body.loc || "New Delhi",
    deadline: req.body.deadline || "Immediate",
    desc: req.body.desc || "",
    cat: req.body.cat || "Law Firms",
    status: req.body.status || "published",
    is_featured: req.body.is_featured === true
  };
  store.internships.push(newPost);
  saveToDatabase(store);
  logActivity("admin", "Listed Internship Opportunity", `Listed internship opening for ${newPost.role} at ${newPost.org}`);
  res.json(newPost);
});

app.put("/api/cms/internships/:id", (req, res) => {
  const store = initializeDatabase();
  const idx = store.internships.findIndex(i => i.id === req.params.id);
  if (idx > -1) {
    store.internships[idx] = { ...store.internships[idx], ...req.body };
    saveToDatabase(store);
    logActivity("admin", "Updated Internship", `Modified opening: ${store.internships[idx].role} at ${store.internships[idx].org}`);
    res.json(store.internships[idx]);
  } else {
    res.status(404).json({ error: "Internship post not found" });
  }
});

app.delete("/api/cms/internships/:id", (req, res) => {
  const store = initializeDatabase();
  const item = store.internships.find(i => i.id === req.params.id);
  if (item) {
    store.internships = store.internships.filter(i => i.id !== req.params.id);
    saveToDatabase(store);
    logActivity("admin", "Removed Internship Listing", `Deleted opening representing ${item.role} at ${item.org}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Opening not found" });
  }
});

// --- CMS LEGAL NEWS CRUD ---
app.get("/api/cms/news", (req, res) => {
  const store = initializeDatabase();
  res.json(store.news_notifications);
});

app.post("/api/cms/news", (req, res) => {
  const store = initializeDatabase();
  const newNews = {
    id: "news_" + Date.now(),
    title: req.body.title,
    date: req.body.date || new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }),
    desc: req.body.desc || "",
    cat: req.body.cat || "Supreme Court Updates",
    status: req.body.status || "published",
    is_pinned: req.body.is_pinned === true,
    image_url: req.body.image_url,
    attachments: req.body.attachments || []
  };
  store.news_notifications.push(newNews);
  saveToDatabase(store);
  logActivity("admin", "Released Legal News Bulletin", `Created notification heading: ${newNews.title}`);
  res.json(newNews);
});

app.put("/api/cms/news/:id", (req, res) => {
  const store = initializeDatabase();
  const idx = store.news_notifications.findIndex(n => n.id === req.params.id);
  if (idx > -1) {
    store.news_notifications[idx] = { ...store.news_notifications[idx], ...req.body };
    saveToDatabase(store);
    logActivity("admin", "Updated News Bulletin", `Modified notice heading: ${store.news_notifications[idx].title}`);
    res.json(store.news_notifications[idx]);
  } else {
    res.status(404).json({ error: "News item not found" });
  }
});

app.delete("/api/cms/news/:id", (req, res) => {
  const store = initializeDatabase();
  const item = store.news_notifications.find(n => n.id === req.params.id);
  if (item) {
    store.news_notifications = store.news_notifications.filter(n => n.id !== req.params.id);
    saveToDatabase(store);
    logActivity("admin", "Deleted News Bulletin", `Deleted notice titled: ${item.title}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Notice bulletin not found" });
  }
});

// --- CMS MEDIA LIBRARY ---
app.get("/api/cms/media", (req, res) => {
  const store = initializeDatabase();
  res.json(store.media_library);
});

app.post("/api/cms/media", (req, res) => {
  const { name, size, type, url, folder } = req.body;
  const store = initializeDatabase();
  const newMedia = {
    id: "media_" + Date.now(),
    name: name || "untitled_resource",
    size: size || "120 KB",
    type: type || "image/png",
    url: url || "",
    folder: folder || "General",
    uploaded_at: new Date().toISOString().split("T")[0],
    usage_count: 0
  };
  store.media_library.push(newMedia);
  saveToDatabase(store);
  logActivity("admin", "Uploaded Media Resource", `Added media file to Library: ${newMedia.name}`);
  res.json(newMedia);
});

app.delete("/api/cms/media/:id", (req, res) => {
  const store = initializeDatabase();
  const found = store.media_library.find(m => m.id === req.params.id);
  if (found) {
    store.media_library = store.media_library.filter(m => m.id !== req.params.id);
    saveToDatabase(store);
    logActivity("admin", "Removed Media File", `Removed media element: ${found.name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Media file not found" });
  }
});

// --- SEO SETTINGS ---
app.get("/api/cms/seo", (req, res) => {
  const store = initializeDatabase();
  res.json(store.seo_settings);
});

app.put("/api/cms/seo", (req, res) => {
  const store = initializeDatabase();
  store.seo_settings = { ...store.seo_settings, ...req.body };
  saveToDatabase(store);
  logActivity("admin", "Modified SEO settings", "Updated website meta metrics, details and sitemap parameters.");
  res.json(store.seo_settings);
});

// --- ACTIVITY AUDIT LOGS ---
app.get("/api/cms/logs", (req, res) => {
  const store = initializeDatabase();
  res.json(store.activity_logs);
});

// --- DATA BACKUP & RESTORE ---
app.get("/api/cms/backup", (req, res) => {
  const store = initializeDatabase();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=lex_backup_store.json");
  res.json(store);
});

app.post("/api/cms/restore", (req, res) => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "Backup dataset is required" });
    return;
  }
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed.users && parsed.subjects && parsed.case_notes) {
      saveToDatabase(parsed);
      logActivity("admin", "Database Restored", "Entire filesystem DB store restored successfully from backup.");
      res.json({ success: true, message: "Database restored successfully!" });
    } else {
      res.status(400).json({ error: "Invalid backup structural schema" });
    }
  } catch (e: any) {
    res.status(400).json({ error: "Failed to parse backup content: " + e.message });
  }
});

// 1. HEALTH ENDPOINT
app.get("/api/health", (req, res) => {
  res.json({ status: "alive" });
});

// 7. VITE OR STATIC FILES SERVING MIDDLEWARE
async function startServer() {
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
    console.log(`[LEX Briefly Backend] Server successfully listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
