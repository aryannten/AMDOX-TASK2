const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    studentName: { type: String, required: true },
    domain: { type: String, required: true },
    internshipStart: { type: Date, required: true },
    internshipEnd: { type: Date, required: true },
    issueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Certificate =
  mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

module.exports = { Certificate };

