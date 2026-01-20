import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { apiFetch } from "../lib/api";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserEmail(u?.email ?? null));
    
    // Check for Google redirect result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log("Google sign-in successful:", result.user.email);
          setStatus("Setting admin permissions...");
          
          try {
            const token = await result.user.getIdToken(true);
            const res = await apiFetch("/api/auth/set-admin-claim", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setStatus("Signed in successfully with Google!");
            setTimeout(() => setStatus(""), 2000);
          } catch (claimError) {
            console.log("Admin claim setting:", claimError);
            setStatus("Signed in with Google! (Admin permissions may need verification)");
            setTimeout(() => setStatus(""), 2000);
          }
        }
      })
      .catch((error) => {
        console.error("Redirect result error:", error);
        if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/popup-blocked") {
          setStatus(`Error: ${error.message || "Google sign-in failed"}`);
        }
      });
    
    return () => unsub();
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setStatus("");
    try {
      setStatus("Logging in...");
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("Logged in successfully!");
      // Clear status after 2 seconds
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Login failed";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please register first.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setStatus(`Error: ${errorMessage}`);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setStatus("");
    if (password.length < 6) {
      setStatus("Password must be at least 6 characters");
      return;
    }
    if (!email || !email.includes("@")) {
      setStatus("Please enter a valid email address");
      return;
    }
    try {
      setStatus("Creating account...");
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user.uid);
      setStatus("Account created! Setting admin permissions...");
      
      // Get ID token and call backend to set admin claim
      const token = await userCredential.user.getIdToken();
      console.log("Got ID token, calling backend...");
      const res = await apiFetch("/api/auth/set-admin-claim", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setStatus(res.message || "Registration successful! Please sign out and sign in again.");
      
      // Sign out so user can sign in again with new claims
      setTimeout(async () => {
        await signOut(auth);
        setStatus("Please sign in again to activate admin access.");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      // Better error messages
      let errorMessage = "Registration failed";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/Password authentication is not enabled in Firebase. Please enable it in Firebase Console.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setStatus(`Error: ${errorMessage}`);
    }
  }

  async function onGoogleSignIn() {
    setStatus("");
    try {
      setStatus("Redirecting to Google sign-in...");
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup to avoid popup blockers
      await signInWithRedirect(auth, provider);
      // User will be redirected to Google, then back to this page
      // The redirect result is handled in useEffect
    } catch (err) {
      console.error("Google sign-in error:", err);
      setStatus(`Error: ${err.message || "Google sign-in failed"}`);
    }
  }

  async function onLogout() {
    setStatus("");
    await signOut(auth);
    setStatus("Logged out.");
  }

  async function onUpload(e) {
    e.preventDefault();
    setStatus("");
    if (!file) {
      setStatus("Please choose an Excel file first.");
      return;
    }
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiFetch("/api/certificates/import", {
        method: "POST",
        body: form,
      });
      setStatus(`Import done. Inserted: ${res.inserted}, Updated: ${res.updated}, Failed: ${res.failed.length}`);
    } catch (err) {
      setStatus(err.message || "Import failed");
    }
  }

  const inputStyle = {
    padding: "12px 16px",
    fontSize: "1em",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "rgba(255, 255, 255, 0.87)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#646cff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "1em",
    transition: "all 0.2s"
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
      <h2 style={{ fontSize: "2.5em", marginBottom: "30px", textAlign: "center" }}>Admin</h2>

      {userEmail ? (
        <>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "16px 20px",
            backgroundColor: "rgba(26, 26, 26, 0.5)",
            borderRadius: "8px",
            marginBottom: "30px"
          }}>
            <div>
              Signed in as <strong style={{ color: "#646cff" }}>{userEmail}</strong>
            </div>
            <button 
              onClick={onLogout}
              style={{
                ...buttonStyle,
                backgroundColor: "rgba(220, 20, 60, 0.8)"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(220, 20, 60, 1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(220, 20, 60, 0.8)"}
            >
              Logout
            </button>
          </div>

          <div style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "24px",
            backgroundColor: "rgba(26, 26, 26, 0.5)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Import Certificates</h3>
            <form onSubmit={onUpload} style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "block" }}>
                Upload Excel (.xlsx):
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  style={{ 
                    display: "block", 
                    marginTop: 8,
                    padding: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "rgba(255, 255, 255, 0.87)",
                    cursor: "pointer"
                  }}
                />
              </label>
              <button 
                type="submit"
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#535bf2";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#646cff";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Import Certificates
              </button>
            </form>
          </div>
        </>
      ) : (
        <div style={{ 
          maxWidth: 500, 
          margin: "0 auto",
          padding: "24px",
          backgroundColor: "rgba(26, 26, 26, 0.5)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: !isRegistering ? "#646cff" : "rgba(255, 255, 255, 0.05)",
                color: !isRegistering ? "white" : "rgba(255, 255, 255, 0.7)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: isRegistering ? "#646cff" : "rgba(255, 255, 255, 0.05)",
                color: isRegistering ? "white" : "rgba(255, 255, 255, 0.7)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              Register New Admin
            </button>
          </div>
          <form onSubmit={isRegistering ? onRegister : onLogin} style={{ display: "grid", gap: 12 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              type="email"
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#646cff"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              type="password"
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#646cff"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
            />
            <button 
              type="submit"
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#535bf2";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#646cff";
                e.target.style.transform = "translateY(0)";
              }}
            >
              {isRegistering ? "Register" : "Login"}
            </button>
            {isRegistering && (
              <small style={{ color: "rgba(255, 255, 255, 0.6)", textAlign: "center", display: "block", marginTop: "8px" }}>
                After registration, you'll be signed out. Sign in again to activate admin access.
              </small>
            )}
          </form>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            marginTop: "20px",
            marginBottom: "20px"
          }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}></div>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9em" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}></div>
          </div>

          <button
            type="button"
            onClick={onGoogleSignIn}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "white",
              color: "#333",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {status ? (
        <div style={{ 
          marginTop: 20, 
          padding: "12px 16px",
          backgroundColor: status.includes("failed") || status.includes("error") 
            ? "rgba(220, 20, 60, 0.2)" 
            : "rgba(46, 213, 115, 0.2)",
          border: `1px solid ${status.includes("failed") || status.includes("error") 
            ? "rgba(220, 20, 60, 0.5)" 
            : "rgba(46, 213, 115, 0.5)"}`,
          borderRadius: "8px",
          color: status.includes("failed") || status.includes("error") ? "#ff6b6b" : "#51cf66",
          textAlign: "center",
          maxWidth: 600,
          margin: "20px auto"
        }}>
          {status}
        </div>
      ) : null}
    </div>
  );
}

