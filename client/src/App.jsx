import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(26, 26, 26, 0.8)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          display: "flex", 
          gap: "24px",
          alignItems: "center"
        }}>
          <Link 
            to="/" 
            style={{
              fontWeight: "600",
              fontSize: "1.1em",
              color: "#646cff",
              textDecoration: "none"
            }}
          >
            Home
          </Link>
          <Link 
            to="/verify"
            style={{
              color: "rgba(255, 255, 255, 0.87)",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "#646cff"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.87)"}
          >
            Verify
          </Link>
          <Link 
            to="/admin"
            style={{
              color: "rgba(255, 255, 255, 0.87)",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "#646cff"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.87)"}
          >
            Admin
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
