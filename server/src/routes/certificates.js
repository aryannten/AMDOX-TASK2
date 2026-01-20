const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const { z } = require("zod");
const { PDFDocument, StandardFonts } = require("pdf-lib");

const { Certificate } = require("../models/Certificate");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const rowSchema = z.object({
  certificateId: z.string().min(1),
  studentName: z.string().min(1),
  domain: z.string().min(1),
  internshipStart: z.coerce.date(),
  internshipEnd: z.coerce.date(),
  issueDate: z.coerce.date(),
});

function normalizeHeader(h) {
  return String(h ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[-_]/g, "")
    .toLowerCase();
}

function mapRow(raw) {
  // Accept either exact recommended headers OR common variants.
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const nk = normalizeHeader(k);
    if (nk === "certificateid") out.certificateId = v;
    if (nk === "studentname" || nk === "name") out.studentName = v;
    if (nk === "domain" || nk === "internshipdomain") out.domain = v;
    if (nk === "internshipstart" || nk === "startdate") out.internshipStart = v;
    if (nk === "internshipend" || nk === "enddate") out.internshipEnd = v;
    if (nk === "issuedate" || nk === "dateofissue") out.issueDate = v;
  }
  return out;
}

const certificatesRouter = express.Router();

// Public verification lookup (can be made protected if you want)
certificatesRouter.get("/:certificateId", async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId }).lean();
  if (!cert) return res.status(404).json({ error: "Certificate not found" });
  return res.json({ certificate: cert });
});

// Download a simple PDF (stub template; can be replaced with a proper design)
certificatesRouter.get("/:certificateId/pdf", async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId }).lean();
  if (!cert) return res.status(404).json({ error: "Certificate not found" });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // landscape A4-ish
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const lines = [
    "Certificate of Internship",
    `Certificate ID: ${cert.certificateId}`,
    `Student: ${cert.studentName}`,
    `Domain: ${cert.domain}`,
    `Internship: ${new Date(cert.internshipStart).toDateString()} - ${new Date(
      cert.internshipEnd
    ).toDateString()}`,
    `Issued: ${new Date(cert.issueDate).toDateString()}`,
  ];

  let y = 520;
  for (const [idx, line] of lines.entries()) {
    page.drawText(line, { x: 70, y, size: idx === 0 ? 28 : 16, font });
    y -= idx === 0 ? 50 : 26;
  }

  const bytes = await pdfDoc.save();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${cert.certificateId}.pdf"`
  );
  return res.send(Buffer.from(bytes));
});

// Admin: import excel
certificatesRouter.post(
  "/import",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Missing file" });

    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return res.status(400).json({ error: "Excel has no sheets" });

    const ws = wb.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const inserted = [];
    const updated = [];
    const failed = [];

    for (let i = 0; i < rawRows.length; i++) {
      try {
        const mapped = mapRow(rawRows[i]);
        const parsed = rowSchema.parse(mapped);

        const doc = await Certificate.findOneAndUpdate(
          { certificateId: parsed.certificateId },
          { $set: parsed },
          { upsert: true, new: true }
        );

        // naive classification: if createdAt == updatedAt treat as inserted (best-effort)
        if (String(doc.createdAt) === String(doc.updatedAt)) inserted.push(parsed.certificateId);
        else updated.push(parsed.certificateId);
      } catch (err) {
        failed.push({ row: i + 1, error: err?.message ?? "Invalid row" });
      }
    }

    return res.json({
      total: rawRows.length,
      inserted: inserted.length,
      updated: updated.length,
      failed,
    });
  }
);

module.exports = { certificatesRouter };

