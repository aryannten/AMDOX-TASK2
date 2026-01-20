const express = require("express");
const { initFirebaseAdmin } = require("../lib/firebaseAdmin");
const { requireAuth } = require("../middleware/auth");

const authRouter = express.Router();

// Set admin custom claim for the authenticated user
// This endpoint allows a newly registered user to become an admin
authRouter.post("/set-admin-claim", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const app = initFirebaseAdmin();
    
    // Set the admin custom claim
    await app.auth().setCustomUserClaims(uid, { admin: true });
    
    return res.json({ 
      success: true, 
      message: "Admin claim set successfully. Please sign out and sign in again for changes to take effect." 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to set admin claim" });
  }
});

module.exports = { authRouter };
