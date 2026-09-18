import express from "express";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static frontend build output
app.use(express.static(path.join(__dirname, "dist")));

// Explicit static handlers for Google AdSense and Search crawlers
app.get("/ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(path.join(__dirname, "public", "ads.txt"));
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(path.join(__dirname, "public", "robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.sendFile(path.join(__dirname, "public", "sitemap.xml"));
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PDFMarts API Engine",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Tools endpoint
app.get("/api/v1/tools", (req, res) => {
  res.json({
    count: 25,
    categories: ["Edit PDF", "Convert PDF", "Organize PDF", "Security", "Image Tools", "OCR"],
    endpoints: [
      { path: "POST /api/v1/convert", desc: "Convert any file (DOCX, TXT, HTML, Images) to PDF" },
      { path: "POST /api/v1/word-to-pdf", desc: "Convert DOCX/DOC files to PDF" },
      { path: "POST /api/v1/image-to-pdf", desc: "Convert JPG/PNG images to PDF" },
      { path: "POST /api/v1/compress", desc: "Compress PDF file" },
      { path: "POST /api/v1/merge", desc: "Merge multiple PDF files into one" },
    ],
  });
});

// Convert endpoint
app.post("/api/v1/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please provide a file field in multipart/form-data." });
    }

    const { originalname, buffer, mimetype } = req.file;
    const isDocx = /\.(docx|doc)$/i.test(originalname) || mimetype.includes("word");
    const isImage = mimetype.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(originalname);

    let pdfBuffer;

    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || "";

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const maxW = pageWidth - margin * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(originalname.replace(/\.[^/.]+$/, ""), margin, 45);
      doc.setDrawColor(220, 220, 225);
      doc.line(margin, 55, pageWidth - margin, 55);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);

      const lines = text.split("\n");
      let currentY = 80;
      const lineHeight = 16;

      for (const rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) {
          currentY += 8;
          continue;
        }
        const wrapped = doc.splitTextToSize(trimmed, maxW);
        for (const subLine of wrapped) {
          if (currentY > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(subLine, margin, currentY);
          currentY += lineHeight;
        }
      }

      pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    } else if (isImage) {
      const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.addImage(base64Image, "JPEG", 40, 40, pageWidth - 80, pageHeight - 80);
      pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    } else {
      const text = buffer.toString("utf-8").replace(/<[^>]+>/g, " ");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const maxW = pageWidth - margin * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(originalname, margin, 45);
      doc.line(margin, 55, pageWidth - margin, 55);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const lines = text.split("\n");
      let currentY = 75;
      for (const rawLine of lines) {
        const wrapped = doc.splitTextToSize(rawLine, maxW);
        for (const subLine of wrapped) {
          if (currentY > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(subLine, margin, currentY);
          currentY += 14;
        }
      }

      pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    }

    const outputName = originalname.replace(/\.[^/.]+$/, "") + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="pdfmarts_${outputName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("API convert error:", err);
    res.status(500).json({ error: "Conversion failed", details: err.message });
  }
});

// SPA Fallback
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API Endpoint Not Found" });
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 PDFMarts Full-Stack Server running at http://localhost:${PORT}`);
});
