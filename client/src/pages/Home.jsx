import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ 
      maxWidth: 900, 
      margin: "60px auto", 
      padding: "40px 20px",
      textAlign: "center"
    }}>
      <h1 style={{ 
        fontSize: "3.5em", 
        marginBottom: "20px",
        fontWeight: "bold",
        background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>
        Certificate Verification System
      </h1>
      <p style={{ 
        fontSize: "1.2em", 
        color: "rgba(255, 255, 255, 0.7)",
        marginBottom: "40px"
      }}>
        Verify certificates by Certificate ID and download a PDF.
      </p>
      <div style={{ 
        display: "flex", 
        gap: 16, 
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        <Link 
          to="/verify"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#646cff",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            transition: "all 0.3s ease",
            border: "none",
            fontSize: "1.1em"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#535bf2";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(100, 108, 255, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#646cff";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Verify Certificate
        </Link>
        <Link 
          to="/admin"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "transparent",
            color: "#646cff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            border: "2px solid #646cff",
            transition: "all 0.3s ease",
            fontSize: "1.1em"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#646cff";
            e.target.style.color = "white";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#646cff";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Admin
        </Link>
      </div>
    </div>
  );
}

