const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectDb } = require("./lib/db");
const { certificatesRouter } = require("./routes/certificates");
const { authRouter } = require("./routes/auth");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/certificates", certificatesRouter);

const port = Number(process.env.PORT ?? 5000);

async function start() {
  await connectDb();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

