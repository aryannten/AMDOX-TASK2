const { initFirebaseAdmin } = require("../lib/firebaseAdmin");

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Missing Bearer token" });

    const app = initFirebaseAdmin();
    const decoded = await app.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.admin === true) return next();
  return res.status(403).json({ error: "Admin access required" });
}

module.exports = { requireAuth, requireAdmin };

