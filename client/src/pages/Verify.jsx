import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function Verify() {
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSearch(e) {
    e.preventDefault();
    setError("");
    setCertificate(null);
    setLoading(true);
    try {
      const data = await apiFetch(`/api/certificates/${encodeURIComponent(certificateId)}`);
      setCertificate(data.certificate);
    } catch (err) {
      setError(err.message || "Not found");
    } finally {
      setLoading(false);
    }
  }

  async function onDownload() {
    setError("");
    try {
      const blob = await apiFetch(
        `/api/certificates/${encodeURIComponent(certificateId)}/pdf`,
        { headers: { Accept: "application/pdf" } }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Download failed");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
      <h2 style={{ fontSize: "2.5em", marginBottom: "30px", textAlign: "center" }}>
        Verify Certificate
      </h2>
      <form onSubmit={onSearch} style={{ display: "flex", gap: 12, marginTop: 24, maxWidth: 600, margin: "24px auto" }}>
        <input
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Enter Certificate ID"
          required
          style={{ 
            flex: 1, 
            padding: "12px 16px",
            fontSize: "1em",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "rgba(255, 255, 255, 0.87)",
            outline: "none"
          }}
          onFocus={(e) => e.target.style.borderColor = "#646cff"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
        />
        <button 
          disabled={loading} 
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#444" : "#646cff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "500",
            fontSize: "1em",
            transition: "all 0.2s"
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? (
        <div style={{ 
          marginTop: 20, 
          padding: "12px 16px",
          backgroundColor: "rgba(220, 20, 60, 0.2)",
          border: "1px solid rgba(220, 20, 60, 0.5)",
          borderRadius: "8px",
          color: "#ff6b6b",
          textAlign: "center",
          maxWidth: 600,
          margin: "20px auto"
        }}>
          {error}
        </div>
      ) : null}

      {certificate ? (
        <div style={{ 
          marginTop: 32, 
          padding: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          backgroundColor: "rgba(26, 26, 26, 0.5)",
          maxWidth: 600,
          margin: "32px auto"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "1.8em", color: "#646cff" }}>
            Certificate Details
          </h3>
          <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
            <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <strong style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", marginBottom: "4px" }}>
                Certificate ID:
              </strong>
              <span style={{ fontSize: "1.1em" }}>{certificate.certificateId}</span>
            </div>
            <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <strong style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", marginBottom: "4px" }}>
                Student Name:
              </strong>
              <span style={{ fontSize: "1.1em" }}>{certificate.studentName}</span>
            </div>
            <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <strong style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", marginBottom: "4px" }}>
                Domain:
              </strong>
              <span style={{ fontSize: "1.1em" }}>{certificate.domain}</span>
            </div>
            {certificate.internshipStart && certificate.internshipEnd && (
              <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <strong style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", marginBottom: "4px" }}>
                  Internship Period:
                </strong>
                <span style={{ fontSize: "1.1em" }}>
                  {new Date(certificate.internshipStart).toLocaleDateString()} - {new Date(certificate.internshipEnd).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onDownload}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1em",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#535bf2";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#646cff";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Download PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}

