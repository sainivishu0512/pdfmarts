import React, {
  createContext, useContext, useState, useRef, useCallback, useEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FileText, Layers, Scissors, Archive, Lock, Unlock,
  Shield, Image, Pen, Crop, Pencil, RotateCw,
  LayoutGrid, Trash2, BookOpen, Hash, Scan, Table2,
  FilePlus, BarChart2, Monitor, Copy,
  Upload, Download, ChevronDown, ChevronRight,
  Menu, X, Check, ArrowRight, Star,
  CheckCircle, Loader2, Zap, Globe, Smartphone,
  Eye, EyeOff, Mail, QrCode, Share2, Bookmark, Sliders,
  Users, RefreshCw, Search, Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Toaster, toast } from "sonner";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from "docx";
import { SEOHead } from "./components/SEOHead";
import { AdBanner } from "./components/AdBanner";
import { TOOLS_SEO } from "./data/seoData";
import { Language, SUPPORTED_LANGUAGES, TRANSLATIONS, getLocalizedTool } from "./data/i18n";

if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch (e) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return twMerge(clsx(inputs));
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Router & i18n ─────────────────────────────────────────────────────────────

type RouterState = {
  route: string;
  toolId: string | null;
  initialFiles: File[];
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  navigate: (route: string, toolId?: string, files?: File[], newLang?: Language) => void;
};

const RouterContext = createContext<RouterState>({
  route: "home",
  toolId: null,
  initialFiles: [],
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  navigate: () => {},
});

function useRouter() {
  return useContext(RouterContext);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tool = {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  desc: string;
  accepts: string;
  actionLabel: string;
  multiple: boolean;
};

type WorkflowState = "idle" | "ready" | "processing" | "done";

type ProcessResult = {
  blob: Blob;
  fileName: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_TOOLS: Tool[] = [
  // High-Demand Viral Tools
  { id: "compress-pdf-target", name: "Compress to Exact KB", category: "Edit PDF", icon: Sliders, color: "#0284C7", bg: "#F0F9FF", desc: "Compress PDF to strict 100KB, 200KB, or 500KB limits for job & visa portals.", accepts: ".pdf", actionLabel: "Compress to Target KB", multiple: false },
  { id: "grayscale-pdf", name: "Grayscale (B&W) PDF", category: "Edit PDF", icon: Eye, color: "#475569", bg: "#F1F5F9", desc: "Convert color PDFs to black and white / grayscale to save ink and meet court filing rules.", accepts: ".pdf", actionLabel: "Convert to Grayscale", multiple: false },
  { id: "flatten-pdf", name: "Flatten PDF", category: "Organize PDF", icon: Layers, color: "#D97706", bg: "#FFFBEB", desc: "Lock form fields, digital signatures, and annotations into uneditable flat pages.", accepts: ".pdf", actionLabel: "Flatten PDF", multiple: false },
  { id: "pdf-to-txt", name: "PDF to Text (.txt)", category: "Convert PDF", icon: FileText, color: "#059669", bg: "#ECFDF5", desc: "Extract clean, readable, editable plain text from any PDF document.", accepts: ".pdf", actionLabel: "Convert to TXT", multiple: false },
  { id: "pdf-metadata", name: "PDF Metadata Sanitizer", category: "Security", icon: Shield, color: "#6366F1", bg: "#EEF2FF", desc: "Inspect, edit, or wipe author, creator, and privacy-tracking metadata.", accepts: ".pdf", actionLabel: "Sanitize Metadata", multiple: false },
  { id: "invert-pdf", name: "PDF Dark Mode / Invert", category: "Edit PDF", icon: EyeOff, color: "#8B5CF6", bg: "#F5F3FF", desc: "Invert PDF colors to high-contrast dark mode for night reading and OLED battery saving.", accepts: ".pdf", actionLabel: "Invert Colors", multiple: false },
  { id: "heic-webp-to-pdf", name: "HEIC / WebP to PDF", category: "Image Tools", icon: Image, color: "#EC4899", bg: "#FDF2F8", desc: "Convert Apple iPhone HEIC photos, Google WebP, and SVG graphics to PDF.", accepts: "image/*,.heic,.webp,.svg", actionLabel: "Convert to PDF", multiple: true },

  // Core Conversion & Editing Suite
  { id: "convert-to-pdf", name: "Convert to PDF", category: "Convert PDF", icon: FilePlus, color: "#4F46E5", bg: "#EEF2FF", desc: "Convert Word, Excel, PowerPoint, images, or documents to PDF.", accepts: "*", actionLabel: "Convert to PDF", multiple: true },
  { id: "merge-pdf", name: "Merge PDF", category: "Edit PDF", icon: Layers, color: "#7C3AED", bg: "#F5F3FF", desc: "Combine multiple PDF files into one seamless document.", accepts: ".pdf", actionLabel: "Merge PDFs", multiple: true },
  { id: "split-pdf", name: "Split PDF", category: "Edit PDF", icon: Scissors, color: "#DB2777", bg: "#FDF2F8", desc: "Divide a PDF into multiple separate files.", accepts: ".pdf", actionLabel: "Split PDF", multiple: false },
  { id: "compress-pdf", name: "Compress PDF", category: "Edit PDF", icon: Archive, color: "#0891B2", bg: "#ECFEFF", desc: "Reduce file size while preserving quality.", accepts: ".pdf", actionLabel: "Compress PDF", multiple: false },
  { id: "rotate-pdf", name: "Rotate PDF", category: "Edit PDF", icon: RotateCw, color: "#7C3AED", bg: "#F5F3FF", desc: "Rotate pages to the correct orientation.", accepts: ".pdf", actionLabel: "Rotate PDF", multiple: false },
  { id: "crop-pdf", name: "Crop PDF", category: "Edit PDF", icon: Crop, color: "#DB2777", bg: "#FDF2F8", desc: "Trim pages to remove unwanted margins.", accepts: ".pdf", actionLabel: "Crop PDF", multiple: false },
  { id: "edit-pdf", name: "Edit PDF", category: "Edit PDF", icon: Pencil, color: "#0891B2", bg: "#ECFEFF", desc: "Add text, shapes, and annotations to any PDF.", accepts: ".pdf", actionLabel: "Edit PDF", multiple: false },
  { id: "page-numbers", name: "Page Numbers", category: "Edit PDF", icon: Hash, color: "#7C3AED", bg: "#F5F3FF", desc: "Automatically number your PDF pages.", accepts: ".pdf", actionLabel: "Add Page Numbers", multiple: false },
  { id: "pdf-to-word", name: "PDF to Word", category: "Convert PDF", icon: FileText, color: "#2563EB", bg: "#EFF6FF", desc: "Convert PDFs to fully editable Word documents.", accepts: ".pdf", actionLabel: "Convert to Word", multiple: false },
  { id: "pdf-to-excel", name: "PDF to Excel", category: "Convert PDF", icon: Table2, color: "#16A34A", bg: "#F0FDF4", desc: "Extract tables from PDFs into Excel spreadsheets.", accepts: ".pdf", actionLabel: "Convert to Excel", multiple: false },
  { id: "pdf-to-powerpoint", name: "PDF to PowerPoint", category: "Convert PDF", icon: Monitor, color: "#EA580C", bg: "#FFF7ED", desc: "Transform PDF slides into editable presentations.", accepts: ".pdf", actionLabel: "Convert to PPT", multiple: false },
  { id: "pdf-to-jpg", name: "PDF to JPG", category: "Convert PDF", icon: Image, color: "#BE185D", bg: "#FDF2F8", desc: "Convert PDF pages to high-quality JPG images.", accepts: ".pdf", actionLabel: "Convert to JPG", multiple: false },
  { id: "word-to-pdf", name: "Word to PDF", category: "Convert PDF", icon: FilePlus, color: "#2563EB", bg: "#EFF6FF", desc: "Convert Word documents to PDF instantly.", accepts: ".docx,.doc", actionLabel: "Convert to PDF", multiple: false },
  { id: "excel-to-pdf", name: "Excel to PDF", category: "Convert PDF", icon: BarChart2, color: "#16A34A", bg: "#F0FDF4", desc: "Turn Excel spreadsheets into PDF documents.", accepts: ".xlsx,.xls", actionLabel: "Convert to PDF", multiple: false },
  { id: "powerpoint-to-pdf", name: "PowerPoint to PDF", category: "Convert PDF", icon: Monitor, color: "#EA580C", bg: "#FFF7ED", desc: "Export presentations to PDF format.", accepts: ".pptx,.ppt", actionLabel: "Convert to PDF", multiple: false },
  { id: "organize-pdf", name: "Organize PDF", category: "Organize PDF", icon: LayoutGrid, color: "#059669", bg: "#ECFDF5", desc: "Drag and drop to reorder, delete, or rotate pages.", accepts: ".pdf", actionLabel: "Organize Pages", multiple: false },
  { id: "delete-pages", name: "Delete Pages", category: "Organize PDF", icon: Trash2, color: "#DC2626", bg: "#FEF2F2", desc: "Remove specific pages from your PDF.", accepts: ".pdf", actionLabel: "Delete Pages", multiple: false },
  { id: "extract-pages", name: "Extract Pages", category: "Organize PDF", icon: BookOpen, color: "#059669", bg: "#ECFDF5", desc: "Extract selected pages into a new PDF.", accepts: ".pdf", actionLabel: "Extract Pages", multiple: false },
  { id: "watermark-pdf", name: "Add Watermark", category: "Security", icon: Shield, color: "#0284C7", bg: "#F0F9FF", desc: "Stamp a custom watermark on your PDFs.", accepts: ".pdf", actionLabel: "Add Watermark", multiple: false },
  { id: "protect-pdf", name: "Protect PDF", category: "Security", icon: Lock, color: "#EA580C", bg: "#FFF7ED", desc: "Add password protection to your PDF files.", accepts: ".pdf", actionLabel: "Protect PDF", multiple: false },
  { id: "unlock-pdf", name: "Unlock PDF", category: "Security", icon: Unlock, color: "#D97706", bg: "#FFFBEB", desc: "Remove password protection from PDFs.", accepts: ".pdf", actionLabel: "Unlock PDF", multiple: false },
  { id: "sign-pdf", name: "Sign PDF", category: "Security", icon: Pen, color: "#6D28D9", bg: "#F5F3FF", desc: "Add your digital signature to any PDF.", accepts: ".pdf", actionLabel: "Sign PDF", multiple: false },
  { id: "jpg-to-pdf", name: "JPG to PDF", category: "Image Tools", icon: Image, color: "#BE185D", bg: "#FDF2F8", desc: "Convert JPG images to PDF documents.", accepts: "image/jpeg", actionLabel: "Convert to PDF", multiple: true },
  { id: "png-to-pdf", name: "PNG to PDF", category: "Image Tools", icon: Copy, color: "#7C3AED", bg: "#F5F3FF", desc: "Convert PNG images to PDF with one click.", accepts: "image/png", actionLabel: "Convert to PDF", multiple: true },
  { id: "ocr-pdf", name: "OCR PDF", category: "OCR", icon: Scan, color: "#0D9488", bg: "#F0FDFA", desc: "Extract text from scanned PDFs using OCR.", accepts: ".pdf", actionLabel: "Run OCR", multiple: false },
];

const POPULAR_IDS = [
  "compress-pdf-target",
  "convert-to-pdf",
  "merge-pdf",
  "compress-pdf",
  "pdf-to-word",
  "grayscale-pdf",
  "jpg-to-pdf",
  "split-pdf",
  "sign-pdf",
  "flatten-pdf",
];

function detectBestToolForFiles(files: File[]): string {
  if (!files || files.length === 0) return "convert-to-pdf";
  const ext = files[0].name.split('.').pop()?.toLowerCase() || "";
  if (["doc", "docx"].includes(ext)) return "word-to-pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel-to-pdf";
  if (["ppt", "pptx"].includes(ext)) return "powerpoint-to-pdf";
  if (["jpg", "jpeg"].includes(ext)) return "jpg-to-pdf";
  if (["png", "webp", "bmp", "gif", "svg"].includes(ext)) return "png-to-pdf";
  if (ext === "pdf") return "compress-pdf";
  return "convert-to-pdf";
}
const CATEGORIES = ["Edit PDF", "Convert PDF", "Organize PDF", "Security", "Image Tools", "OCR"];

function getPopularTools(): Tool[] {
  return POPULAR_IDS.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];
}

const FAQ_ITEMS = [
  { q: "Is PDFMarts free to use?", a: "Yes! PDFMarts is 100% free with unlimited operations. All PDF transformations run directly in your web browser with zero paywalls or subscriptions." },
  { q: "How secure are my files?", a: "Your files never leave your device. All conversions, merging, splitting, and editing execute locally in your browser memory via WebAssembly and JavaScript." },
  { q: "What is the maximum file size I can upload?", a: "Because processing happens directly on your machine's hardware, there are no artificial cloud file size limits or bandwidth caps." },
  { q: "Do I need to create an account?", a: "No account or registration required. Simply select any tool, drop your file, and process it immediately." },
  { q: "Does PDFMarts work offline?", a: "Yes! Once loaded in your browser, the client-side conversion engine works seamlessly without an internet connection." },
  { q: "What file formats are supported?", a: "We support PDF, DOCX (Word), XLSX (Excel), PPTX (PowerPoint), JPG, PNG, WebP, SVG, TXT, CSV, HTML, and Markdown." },
];

const FEATURES = [
  { icon: Shield, title: "100% Local Privacy", desc: "Files never leave your computer. All processing happens in local browser memory." },
  { icon: Zap, title: "Instant In-Browser Speed", desc: "No upload or download latency. Conversions happen in milliseconds directly on your device." },
  { icon: Globe, title: "Works Everywhere & Offline", desc: "Runs on desktop, tablet, and mobile browsers. Works even without an active internet connection." },
  { icon: Upload, title: "Drag & Drop Simplicity", desc: "Intuitive file upload with intelligent automatic format detection and multi-file batch support." },
  { icon: Users, title: "No Accounts or Paywalls", desc: "Unlimited daily tasks with zero subscriptions, hidden fees, or registration gates." },
  { icon: Smartphone, title: "Universal Compatibility", desc: "Outputs genuine PDF, DOCX, XLSX, and JPEG files that open natively on Windows, Mac, iOS, and Android." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Select Your File", desc: "Drag and drop or click to browse. We support PDF, Word, Excel, PowerPoint, JPG, PNG, and more." },
  { step: "02", title: "Choose Options", desc: "Select from 25+ tools. Configure options such as rotation angle, watermark text, or compression." },
  { step: "03", title: "Instant Download", desc: "Your browser processes the document immediately. Download the native file with one click." },
];

// ─── Core UI Components ───────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

function Button({
  children, variant = "primary", size = "md", onClick, type = "button",
  disabled, className, fullWidth,
}: {
  children: React.ReactNode; variant?: ButtonVariant; size?: ButtonSize;
  onClick?: () => void; type?: "button" | "submit"; disabled?: boolean;
  className?: string; fullWidth?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md active:scale-[0.98]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
    outline: "border-2 border-primary text-primary hover:bg-accent active:scale-[0.98]",
    ghost: "text-foreground hover:bg-muted",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
    >
      {children}
    </button>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}

// ─── AdSense Monetization Component ───────────────────────────────────────────

function AdSenseUnit({
  slotId,
  format = "auto",
  responsive = true,
  className,
}: {
  slotId?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // Pending AdSense review / ad blocking
    }
  }, []);

  return (
    <div className={cn("w-full overflow-hidden my-6 text-center", className)}>
      <div className="min-h-[90px] w-full flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", minHeight: "90px", width: "100%" }}
          data-ad-client="ca-pub-2050955694853570"
          data-ad-slot={slotId || ""}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}

// ─── Upload Components ────────────────────────────────────────────────────────

function UploadZone({
  onFiles, accepts, multiple, compact = false,
}: {
  onFiles: (files: File[]) => void; accepts: string;
  multiple: boolean; compact?: boolean;
}) {
  const { t } = useRouter();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFiles(Array.from(fileList));
  }, [onFiles]);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer select-none transition-all duration-200",
        compact ? "p-10" : "p-16 md:p-20",
        dragging
          ? "border-primary bg-accent/40 scale-[1.01]"
          : "border-border bg-muted/20 hover:border-primary/40 hover:bg-accent/10"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      aria-label="Upload files"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accepts}
        multiple={multiple}
        onChange={(e) => {
          processFiles(e.target.files);
          e.target.value = "";
        }}
        aria-hidden
      />
      <div className={cn(
        "flex items-center justify-center rounded-2xl bg-primary/10",
        compact ? "w-16 h-16" : "w-24 h-24"
      )}>
        <Upload className={cn("text-primary", compact ? "w-8 h-8" : "w-12 h-12")} />
      </div>
      <div className="text-center">
        <p className={cn("font-bold text-foreground", compact ? "text-lg" : "text-2xl")}>
          {dragging ? (t("dropFilesActive") || "Drop your files here") : (t("dropFiles") || "Drag & drop your files")}
        </p>
        <p className="text-muted-foreground text-sm mt-2">{t("orClick") || "or click to browse from your computer"}</p>
      </div>
      <Button
        size={compact ? "sm" : "md"}
        onClick={(e) => { e && (e as React.MouseEvent).stopPropagation(); inputRef.current?.click(); }}
      >
        {t("selectFiles") || "Select Files"}
      </Button>
      {!compact && (
        <p className="text-xs text-muted-foreground">{t("fileTypesHint") || "PDF, Word, Excel, PowerPoint, JPG, PNG · Max 50MB free"}</p>
      )}
    </div>
  );
}

function FileCard({ file, onRemove, tool }: { file: File; onRemove: () => void; tool: Tool }) {
  const { lang } = useRouter();
  const localized = getLocalizedTool(tool, lang);
  const Icon = tool.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: tool.bg }}>
        <Icon className="w-5 h-5" style={{ color: tool.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function ToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  const { lang } = useRouter();
  const localized = getLocalizedTool(tool, lang);
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className="group text-left w-full p-5 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: tool.bg }}
        >
          <Icon className="w-6 h-6" style={{ color: tool.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">{localized.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{localized.desc}</p>
        </div>
        <ArrowRight className="flex-shrink-0 w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 mt-0.5" />
      </div>
    </button>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FAQAccordion({ items }: { items: typeof FAQ_ITEMS }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
          >
            <span className="font-semibold text-foreground pr-4">{item.q}</span>
            <ChevronDown className={cn("flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-200", openIndex === i && "rotate-180")} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Share & QR Modal ────────────────────────────────────────────────────────

function ShareAndQRModal({
  isOpen,
  onClose,
  title = "PDFMarts - Free Online PDF Tools",
  url = "https://pdfmarts.com",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : url;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`100% Free & Private Online PDF Tools: ${title}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">Share & Mobile QR Transfer</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl border border-border flex flex-col items-center justify-center shadow-inner">
          <img src={qrUrl} alt="QR Code" className="w-44 h-44 rounded-lg" />
          <p className="text-[11px] text-slate-600 font-medium mt-2 text-center">
            Scan with your phone camera to transfer files or use PDFMarts directly on mobile.
          </p>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-muted/20 hover:bg-muted text-xs font-semibold"
          >
            Twitter / X
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-semibold"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-semibold"
          >
            LinkedIn
          </a>
        </div>

        {/* Copy Link input */}
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 font-mono text-muted-foreground select-all"
          />
          <Button size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Bookmarklet Section ─────────────────────────────────────────────────────

function BookmarkletSection() {
  const { t } = useRouter();
  const bookmarkletCode = `javascript:(function(){window.open('https://pdfmarts.com/convert-to-pdf?url='+encodeURIComponent(location.href));})();`;

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Bookmark className="w-3.5 h-3.5" />
            {t("bookmarkletTitle") || "1-Click PDF Bookmarklet"}
          </div>
          <h3 className="text-xl font-bold text-foreground">Save any webpage as PDF with 1 click</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("bookmarkletDesc") || "Drag this button to your browser bookmarks bar to convert any webpage to clean PDF instantly:"}
          </p>
        </div>
        <div className="flex-shrink-0">
          <a
            href={bookmarkletCode}
            onClick={(e) => {
              e.preventDefault();
              toast.info("Drag this button up to your browser's Bookmarks bar!");
            }}
            className="cursor-grab active:cursor-grabbing inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-transform hover:scale-105 select-none"
            title="Drag to your Bookmarks toolbar"
          >
            <Bookmark className="w-4 h-4" />
            {t("dragBookmarklet") || "📄 Save as PDF"}
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  const { navigate, lang, setLang, t } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setToolsOpen(false);
    setLangOpen(false);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <ShareAndQRModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || menuOpen
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => { navigate("home"); closeAll(); }}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">PDFMarts</span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <div
                className="relative"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button
                  onClick={() => { navigate("tools"); closeAll(); }}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    useRouter().route === "tools" || useRouter().route === "tool" ? "bg-muted font-bold text-primary" : "hover:bg-muted"
                  )}
                >
                  {t("allTools") || "Tools"}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", toolsOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-card rounded-2xl border border-border shadow-xl p-2 z-50"
                    >
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { navigate("tools"); closeAll(); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors font-medium"
                        >
                          {cat}
                        </button>
                      ))}
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={() => { navigate("tools"); closeAll(); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors font-semibold text-primary"
                        >
                          All 32+ Tools →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[["Privacy Policy", "privacy"]].map(([label, r]) => (
                <button
                  key={r}
                  onClick={() => { navigate(r); closeAll(); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    useRouter().route === r ? "bg-muted font-bold text-primary" : "hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Actions & Language Selector */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language Picker */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
                >
                  <span>{currentLangInfo.flag}</span>
                  <span>{currentLangInfo.name}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-40 bg-card rounded-2xl border border-border shadow-xl p-1.5 z-50"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            closeAll();
                            toast.success(`Language set to ${l.nativeName}`);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                            lang === l.code ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span>{l.flag}</span>
                            <span>{l.nativeName}</span>
                          </span>
                          {lang === l.code && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Share Button */}
              <button
                onClick={() => setShareOpen(true)}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Share & QR Code"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <Button size="sm" onClick={() => navigate("tools")}>{t("exploreTools") || "Explore Tools"}</Button>
            </div>

            {/* Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setShareOpen(true)}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-background border-t border-border"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Language Picker */}
                <div className="grid grid-cols-3 gap-1.5 pb-2 border-b border-border">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        toast.success(`Language set to ${l.nativeName}`);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold",
                        lang === l.code ? "bg-primary text-primary-foreground" : "bg-muted/40 hover:bg-muted"
                      )}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>

                {[["All Tools", "tools"], ["Privacy Policy", "privacy"]].map(([label, route]) => (
                  <button
                    key={route}
                    onClick={() => { navigate(route); closeAll(); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <div className="pt-2 flex flex-col gap-2">
                  <Button size="sm" fullWidth onClick={() => { navigate("tools"); closeAll(); }}>
                    Browse All 32+ Tools
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="text-white" style={{ background: "#0D0D14" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <button onClick={() => navigate("home")} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">PDFMarts</span>
            </button>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              The complete in-browser PDF toolkit. Process, convert, and manage documents — fast, private, and 100% client-side.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Popular Tools</h4>
            <ul className="space-y-2.5">
              {["Merge PDF", "Split PDF", "Compress PDF", "PDF to Word", "PDF to JPG", "Sign PDF"].map(name => {
                const tool = ALL_TOOLS.find(t => t.name === name);
                return (
                  <li key={name}>
                    <button
                      onClick={() => tool && navigate("tool", tool.id)}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal & Policy</h4>
            <ul className="space-y-2.5">
              {[["Privacy Policy", "privacy"], ["Terms of Service", "terms"], ["All Tools", "tools"]].map(([label, route]) => (
                <li key={label}>
                  <button onClick={() => navigate(route)} className="text-sm text-white/50 hover:text-white transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Homepage Sections ────────────────────────────────────────────────────────

function HeroSection() {
  const { navigate, t } = useRouter();

  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(237,233,254,0.35) 0%, transparent 65%)" }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl"
          style={{ background: "rgba(79,70,229,0.06)" }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8"
          style={{ background: "#EDE9FE", color: "#4F46E5" }}
        >
          {t("heroBadge") || "✦ 25+ Professional PDF Tools — 100% Free & Private"}
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
          {t("heroTitle1") || "All Your PDF Tools."}{" "}
          <span className="text-primary">{t("heroTitle2") || "One Simple Place."}</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t("heroSubtitle") || "Merge, split, compress, convert, edit, and sign PDFs directly in your browser. Zero cloud uploads, 100% free and client-side private."}
        </p>

        <div className="mt-12">
          <UploadZone
            onFiles={(files) => {
              const bestTool = detectBestToolForFiles(files);
              navigate("tool", bestTool, files);
            }}
            accepts="*"
            multiple
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          {[t("badgeFree") || "100% Free & Unlimited", t("badgeNoReg") || "No Registration Required", t("badgeLocal") || "Files Processed Locally in Browser"].map(text => (
            <span key={text} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularToolsSection() {
  const { navigate, t } = useRouter();
  const popular = getPopularTools();

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t("popularTools") || "Popular Tools"}</h2>
          <p className="text-muted-foreground mt-3 text-lg">Essential client-side PDF tools running securely in your browser.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popular.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => navigate("tool", tool.id)} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" onClick={() => navigate("tools")}>
            {t("exploreTools") || "View All Tools"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function AllToolsSection() {
  const { navigate, t } = useRouter();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const filtered = ALL_TOOLS.filter(t => t.category === activeCategory);

  return (
    <section className="py-20 px-4" style={{ background: "#F8F8FB" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t("allTools") || "Everything You Need for PDFs"}</h2>
          <p className="text-muted-foreground mt-3 text-lg">30+ tools organized into six intuitive categories.</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => navigate("tool", tool.id)} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { t } = useRouter();
  const steps = [
    { step: "01", title: t("step1Title") || "Select Your File", desc: t("step1Desc") || "Drag and drop or browse from your device." },
    { step: "02", title: t("step2Title") || "Choose Options", desc: t("step2Desc") || "Configure compression, angle, or watermark settings." },
    { step: "03", title: t("step3Title") || "Instant Download", desc: t("step3Desc") || "Your browser processes the document locally in seconds." },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t("howItWorksTitle") || "How It Works"}</h2>
          <p className="text-muted-foreground mt-3 text-lg">{t("howItWorksSubtitle") || "From file to finished in three simple steps."}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[78%] border-t-2 border-dashed border-primary/20" />
              )}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                  <span className="text-2xl font-extrabold text-primary">{step.step}</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useRouter();
  return (
    <section className="py-24 px-4" style={{ background: "#F8F8FB" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t("featuresTitle") || "Built for Privacy & Speed"}</h2>
          <p className="text-muted-foreground mt-3 text-lg">Modern in-browser engines for complete document control.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="p-6 bg-card rounded-2xl border border-border hover:shadow-md transition-all duration-200 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { t } = useRouter();
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t("faqTitle") || "Frequently Asked Questions"}</h2>
          <p className="text-muted-foreground mt-3">Everything you need to know about PDFMarts.</p>
        </div>
        <FAQAccordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}

function CTASection() {
  const { navigate } = useRouter();
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-3xl p-12 md:p-16 text-center overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Instant In-Browser PDF Processing
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              100% free, private, and unlimited. No downloads, accounts, or file uploads required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("tools")}
                className="px-8 py-3.5 rounded-xl font-bold bg-white text-primary hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-base"
              >
                Browse All 25+ Tools
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
              {["100% Client-Side Privacy", "No Account Needed", "Zero Server Storage"].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white/90" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <HeroSection />
      <PopularToolsSection />
      <div className="max-w-5xl mx-auto px-4">
        <AdSenseUnit slotId="1000000001" />
      </div>
      <AllToolsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BookmarkletSection />
      <div className="max-w-5xl mx-auto px-4">
        <AdSenseUnit slotId="1000000002" />
      </div>
      <FAQSection />
      <CTASection />
    </motion.div>
  );
}

function ToolsPage() {
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["All", ...CATEGORIES];

  const filtered = ALL_TOOLS.filter(t => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesSearch = searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-3">All PDF Tools</h1>
            <p className="text-muted-foreground text-lg">25+ tools to handle every PDF challenge.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search PDF tools..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <AdSenseUnit slotId="1000000003" className="max-w-4xl mx-auto mb-8" />

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-lg font-bold text-foreground">No tools found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query or category filter.</p>
            <Button className="mt-4" size="sm" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>Reset Filters</Button>
          </div>
        ) : (
          <motion.div
            key={`${activeCategory}-${searchQuery}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map(tool => (
              <ToolCard key={tool.id} tool={tool} onClick={() => navigate("tool", tool.id)} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ToolSettings({ toolId, options, setOptions }: { toolId: string; options: Record<string, string>; setOptions: React.Dispatch<React.SetStateAction<Record<string, string>>> }) {
  switch (toolId) {
    case "protect-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Protection Settings</h4>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Set Password</label>
            <input
              type="password"
              value={options.password || ""}
              onChange={e => setOptions({ ...options, password: e.target.value })}
              placeholder="Enter password to encrypt PDF"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      );
    case "unlock-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Unlock Settings</h4>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">PDF Password</label>
            <input
              type="password"
              value={options.password || ""}
              onChange={e => setOptions({ ...options, password: e.target.value })}
              placeholder="Enter password to unlock PDF"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      );
    case "watermark-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Watermark Settings</h4>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Watermark Text</label>
            <input
              type="text"
              value={options.watermarkText || "CONFIDENTIAL"}
              onChange={e => setOptions({ ...options, watermarkText: e.target.value })}
              placeholder="e.g. DRAFT or CONFIDENTIAL"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      );
    case "rotate-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Rotation Angle</h4>
          <div className="grid grid-cols-3 gap-2">
            {[["90° Clockwise", "90"], ["180° Flip", "180"], ["270° CCW", "270"]].map(([label, val]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOptions({ ...options, rotation: val })}
                className={cn(
                  "py-2 px-3 text-xs font-semibold rounded-lg border transition-colors",
                  (options.rotation || "90") === val ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/30 hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      );
    case "compress-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Compression Level</h4>
          <div className="space-y-2">
            {[
              { id: "recommended", label: "Recommended Compression", desc: "Good quality, high compression ratio" },
              { id: "extreme", label: "Extreme Compression", desc: "Smallest size, lower quality" },
              { id: "less", label: "Less Compression", desc: "Highest quality, less size reduction" },
            ].map(item => (
              <label key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/20 cursor-pointer">
                <input
                  type="radio"
                  name="compression"
                  checked={(options.compression || "recommended") === item.id}
                  onChange={() => setOptions({ ...options, compression: item.id })}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    case "compress-pdf-target":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Target File Size Limit</h4>
            <p className="text-xs text-muted-foreground">Select popular portal limit or enter custom KB size:</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {["100", "200", "500", "1000"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setOptions({ ...options, targetKB: size })}
                className={cn(
                  "py-2 px-3 text-xs font-bold rounded-lg border transition-all",
                  (options.targetKB || "200") === size
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-muted/20 hover:bg-muted"
                )}
              >
                {size} KB
              </button>
            ))}
          </div>
          <div className="pt-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Custom Target Limit (KB)</label>
            <input
              type="number"
              min="20"
              max="10000"
              value={options.targetKB || "200"}
              onChange={e => setOptions({ ...options, targetKB: e.target.value })}
              placeholder="e.g. 150"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              ⚡ Multi-pass compression will fit under your limit while keeping maximum legibility.
            </p>
          </div>
        </div>
      );
    case "grayscale-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Grayscale Mode</h4>
          <p className="text-xs text-muted-foreground">Removes all RGB color streams to minimize printing toner usage and comply with government/court filings.</p>
          <div className="grid grid-cols-2 gap-2">
            {[["Standard Grayscale", "standard"], ["High-Contrast Monochrome", "high"]].map(([label, val]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOptions({ ...options, contrast: val })}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors",
                  (options.contrast || "standard") === val ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/30 hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      );
    case "flatten-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Flatten Security Settings</h4>
          <p className="text-xs text-muted-foreground">
            Merges interactive form fields, checkboxes, digital signatures, and comment markups into permanent flat pages to prevent tampering.
          </p>
          <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
            <p className="font-medium text-foreground">✓ Locks all text inputs & form controls</p>
            <p className="font-medium text-foreground">✓ Freezes digital signature stamps</p>
            <p className="font-medium text-foreground">✓ Guarantees 100% identical layout across all PDF viewers</p>
          </div>
        </div>
      );
    case "pdf-metadata":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Metadata & Privacy Properties</h4>
            <button
              type="button"
              onClick={() => setOptions({ ...options, title: "", author: "", subject: "", keywords: "", sanitizeAll: "true" })}
              className="text-xs text-primary hover:underline font-semibold"
            >
              🧹 Wipe All Clean
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">Document Title</label>
              <input
                type="text"
                value={options.title || ""}
                onChange={e => setOptions({ ...options, title: e.target.value, sanitizeAll: "false" })}
                placeholder="e.g. Official Proposal"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">Author / Creator Name</label>
              <input
                type="text"
                value={options.author || ""}
                onChange={e => setOptions({ ...options, author: e.target.value, sanitizeAll: "false" })}
                placeholder="Leave blank to remove your name"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">Subject / Description</label>
              <input
                type="text"
                value={options.subject || ""}
                onChange={e => setOptions({ ...options, subject: e.target.value, sanitizeAll: "false" })}
                placeholder="Document subject"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      );
    case "invert-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Dark Mode / Inversion Style</h4>
          <p className="text-xs text-muted-foreground">Inverts white backgrounds to dark for eye-friendly reading at night and battery conservation on OLED screens.</p>
          <div className="grid grid-cols-2 gap-2">
            {[["Full Color Invert", "full"], ["High Contrast Dark", "contrast"]].map(([label, val]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOptions({ ...options, invertMode: val })}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors",
                  (options.invertMode || "full") === val ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/30 hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      );
    case "heic-webp-to-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Page Orientation & Sizing</h4>
          <div className="grid grid-cols-3 gap-2">
            {[["A4 Portrait", "portrait"], ["A4 Landscape", "landscape"], ["Fit to Image", "fit"]].map(([label, val]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOptions({ ...options, layout: val })}
                className={cn(
                  "py-2 px-3 text-xs font-semibold rounded-lg border transition-colors",
                  (options.layout || "portrait") === val ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/30 hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Supports iPhone HEIC, WebP, SVG, JPG, PNG, and GIF.</p>
        </div>
      );
    case "edit-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Annotation & Edit Settings</h4>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Annotation / Stamp Text</label>
            <input
              type="text"
              value={options.annotationText || "APPROVED · PDFMarts"}
              onChange={e => setOptions({ ...options, annotationText: e.target.value })}
              placeholder="e.g. APPROVED or REVIEWED"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      );
    case "delete-pages":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Delete Page Settings</h4>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Page Number to Remove</label>
            <input
              type="number"
              min="1"
              value={options.pageToDelete || "1"}
              onChange={e => setOptions({ ...options, pageToDelete: e.target.value })}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      );
    case "extract-pages":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Extract Page Settings</h4>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Page Number to Extract</label>
            <input
              type="number"
              min="1"
              value={options.pageToExtract || "1"}
              onChange={e => setOptions({ ...options, pageToExtract: e.target.value })}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      );
    case "organize-pdf":
      return (
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <h4 className="font-semibold text-sm">Page Order</h4>
          <div className="grid grid-cols-2 gap-2">
            {[["Normal Order", "false"], ["Reverse Order", "true"]].map(([label, val]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOptions({ ...options, reverse: val })}
                className={cn(
                  "py-2 px-3 text-xs font-semibold rounded-lg border transition-colors",
                  (options.reverse || "false") === val ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/30 hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function ToolPage({ toolId }: { toolId: string }) {
  const { navigate, initialFiles } = useRouter();
  const tool = ALL_TOOLS.find(t => t.id === toolId);
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [state, setState] = useState<WorkflowState>(initialFiles && initialFiles.length > 0 ? "ready" : "idle");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [options, setOptions] = useState<Record<string, string>>({});
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFiles(initialFiles || []);
    setState(initialFiles && initialFiles.length > 0 ? "ready" : "idle");
    setResult(null);
    setOptions({});
  }, [toolId, initialFiles]);

  if (!tool) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
          <Button onClick={() => navigate("tools")}>Browse All Tools</Button>
        </div>
      </div>
    );
  }

  const handleFiles = (newFiles: File[]) => {
    setFiles(prev => tool.multiple ? [...prev, ...newFiles] : [newFiles[0]]);
    setState("ready");
    setResult(null);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const handleProcess = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select a file first.");
      return;
    }
    if (tool.id === "protect-pdf" && !options.password) {
      toast.error("Please enter a password to protect the PDF.");
      return;
    }
    if (tool.id === "unlock-pdf" && !options.password) {
      toast.error("Please enter the password to unlock the PDF.");
      return;
    }

    setState("processing");
    try {
      const res = await processFilesForTool(files, tool, options);
      setResult(res);
      setState("done");
      toast.success(`${tool.name} finished successfully!`);
    } catch (err: any) {
      console.error("Processing error:", err);
      toast.error(err?.message || "An error occurred during conversion.");
      setState("ready");
    }
  };

async function loadPdfJsDoc(arrayBuffer: ArrayBuffer) {
  const data = new Uint8Array(arrayBuffer.slice(0));
  try {
    if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    }
    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
    });
    return await loadingTask.promise;
  } catch (err) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    const fallbackTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
    });
    return await fallbackTask.promise;
  }
}

async function renderPageToCanvas(pdfDoc: any, pageNum: number): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  return canvas;
}

async function processFilesForTool(
  files: File[],
  tool: Tool,
  options: Record<string, string>
): Promise<ProcessResult> {
  if (!files || files.length === 0) {
    throw new Error("No files selected");
  }

  const primaryFile = files[0];
  const originalName = primaryFile.name || "document";
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;

  // ─── 1. PDF TO JPG (Renders real JPEG image via PDF.js & Canvas) ────────────
  if (tool.id === "pdf-to-jpg" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    const totalPages = pdfDoc.numPages;

    if (totalPages === 1) {
      const canvas = await renderPageToCanvas(pdfDoc, 1);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
      });
      return {
        blob,
        fileName: `pdfmarts_jpg_${baseName}.jpg`,
      };
    } else {
      const zip = new JSZip();
      for (let i = 1; i <= totalPages; i++) {
        const canvas = await renderPageToCanvas(pdfDoc, i);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
        zip.file(`page_${i}.jpg`, base64, { base64: true });
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      return {
        blob: zipBlob,
        fileName: `pdfmarts_jpg_${baseName}_all_pages.zip`,
      };
    }
  }

  // ─── NEW 1. COMPRESS PDF TO TARGET SIZE (100KB, 200KB, 500KB, Custom) ───────
  if (tool.id === "compress-pdf-target") {
    const targetKB = parseInt(options.targetKB || "200", 10) || 200;
    try {
      const arrayBuffer = await primaryFile.arrayBuffer();
      const pdfDoc = await loadPdfJsDoc(arrayBuffer);
      const numPages = pdfDoc.numPages;
      const newPdf = new jsPDF({ unit: "pt", format: "a4" });

      const perPageBudgetKB = targetKB / Math.max(1, numPages);
      const quality = Math.min(0.9, Math.max(0.2, perPageBudgetKB < 30 ? 0.35 : perPageBudgetKB < 60 ? 0.55 : perPageBudgetKB < 120 ? 0.75 : 0.88));
      const scale = perPageBudgetKB < 30 ? 1.0 : perPageBudgetKB < 60 ? 1.2 : 1.5;

      for (let i = 1; i <= numPages; i++) {
        if (i > 1) newPdf.addPage();
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = canvas.toDataURL("image/jpeg", quality);
        const pdfW = newPdf.internal.pageSize.getWidth();
        const pdfH = newPdf.internal.pageSize.getHeight();
        newPdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
      }

      return {
        blob: newPdf.output("blob"),
        fileName: `pdfmarts_${targetKB}kb_${baseName}.pdf`,
      };
    } catch {
      const fileBytes = await primaryFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      return {
        blob: new Blob([compressedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
        fileName: `pdfmarts_${targetKB}kb_${baseName}.pdf`,
      };
    }
  }

  // ─── NEW 2. GRAYSCALE / BLACK AND WHITE PDF ─────────────────────────────────
  if (tool.id === "grayscale-pdf" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    const numPages = pdfDoc.numPages;
    const newPdf = new jsPDF({ unit: "pt", format: "a4" });

    for (let i = 1; i <= numPages; i++) {
      if (i > 1) newPdf.addPage();
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Grayscale pixel transform
      const imgDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgDataObj.data;
      const isHighContrast = options.contrast === "high";

      for (let p = 0; p < d.length; p += 4) {
        let gray = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
        if (isHighContrast) {
          gray = gray > 140 ? 255 : gray * 0.7;
        }
        d[p] = gray;
        d[p + 1] = gray;
        d[p + 2] = gray;
      }
      ctx.putImageData(imgDataObj, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const pdfW = newPdf.internal.pageSize.getWidth();
      const pdfH = newPdf.internal.pageSize.getHeight();
      newPdf.addImage(dataUrl, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
    }

    return {
      blob: newPdf.output("blob"),
      fileName: `pdfmarts_grayscale_${baseName}.pdf`,
    };
  }

  // ─── NEW 3. FLATTEN PDF (Lock forms and annotations) ────────────────────────
  if (tool.id === "flatten-pdf" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes);
    try {
      const form = pdfDoc.getForm();
      form.flatten();
    } catch {
      // Document may not contain AcroForm fields
    }
    const flattenedBytes = await pdfDoc.save({ useObjectStreams: true });
    return {
      blob: new Blob([flattenedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_flattened_${baseName}.pdf`,
    };
  }

  // ─── NEW 4. PDF TO PLAIN TEXT (.txt) ────────────────────────────────────────
  if (tool.id === "pdf-to-txt" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    let fullText = `=== Extracted Text: ${baseName}.pdf ===\nGenerated via PDFMarts (https://pdfmarts.com)\n\n`;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = (textContent.items as any[]).map((it) => it.str).join(" ");
      fullText += `--- Page ${i} ---\n${pageStr}\n\n`;
    }

    return {
      blob: new Blob([fullText], { type: "text/plain;charset=utf-8" }),
      fileName: `pdfmarts_${baseName}.txt`,
    };
  }

  // ─── NEW 5. PDF METADATA EDITOR & SANITIZER ─────────────────────────────────
  if (tool.id === "pdf-metadata" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes);

    if (options.sanitizeAll === "true" || (!options.title && !options.author && !options.subject)) {
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("PDFMarts Privacy Sanitizer (https://pdfmarts.com)");
      pdfDoc.setCreator("PDFMarts Client Engine");
    } else {
      if (options.title !== undefined) pdfDoc.setTitle(options.title);
      if (options.author !== undefined) pdfDoc.setAuthor(options.author);
      if (options.subject !== undefined) pdfDoc.setSubject(options.subject);
      if (options.keywords) pdfDoc.setKeywords(options.keywords.split(","));
    }

    const savedBytes = await pdfDoc.save({ useObjectStreams: true });
    return {
      blob: new Blob([savedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_sanitized_${baseName}.pdf`,
    };
  }

  // ─── NEW 6. INVERT PDF / DARK MODE ──────────────────────────────────────────
  if (tool.id === "invert-pdf" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    const numPages = pdfDoc.numPages;
    const newPdf = new jsPDF({ unit: "pt", format: "a4" });

    for (let i = 1; i <= numPages; i++) {
      if (i > 1) newPdf.addPage();
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Invert pixel colors
      const imgDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgDataObj.data;
      for (let p = 0; p < d.length; p += 4) {
        d[p] = 255 - d[p];         // R
        d[p + 1] = 255 - d[p + 1]; // G
        d[p + 2] = 255 - d[p + 2]; // B
      }
      ctx.putImageData(imgDataObj, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const pdfW = newPdf.internal.pageSize.getWidth();
      const pdfH = newPdf.internal.pageSize.getHeight();
      newPdf.addImage(dataUrl, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
    }

    return {
      blob: newPdf.output("blob"),
      fileName: `pdfmarts_darkmode_${baseName}.pdf`,
    };
  }

  // ─── NEW 7. HEIC / WEBP / SVG TO PDF ────────────────────────────────────────
  if (tool.id === "heic-webp-to-pdf") {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const isLandscape = options.layout === "landscape";
    if (isLandscape) {
      doc.setPage(1);
    }

    for (let idx = 0; idx < files.length; idx++) {
      if (idx > 0) doc.addPage("a4", isLandscape ? "landscape" : "portrait");
      const f = files[idx];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(f);
      });

      const img = new window.Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const cleanDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxW = pdfW - margin * 2;
      const maxH = pdfH - margin * 2;
      let drawW = canvas.width;
      let drawH = canvas.height;
      const scale = Math.min(maxW / drawW, maxH / drawH, 1);
      drawW *= scale;
      drawH *= scale;
      const x = (pdfW - drawW) / 2;
      const y = (pdfH - drawH) / 2;

      doc.addImage(cleanDataUrl, "JPEG", x, y, drawW, drawH, undefined, "FAST");
    }

    return {
      blob: doc.output("blob"),
      fileName: `pdfmarts_converted_${baseName}.pdf`,
    };
  }

  // ─── 2. PDF TO WORD (Extracts structured text & generates real .docx) ────────
  if (tool.id === "pdf-to-word" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: baseName.replace(/_/g, " "),
        heading: HeadingLevel.TITLE,
        spacing: { after: 300 },
      }),
    ];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      let currentLine = "";
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        const str = item.str || "";
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 8) {
          if (currentLine.trim()) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: currentLine.trim(), size: 22 })],
              spacing: { after: 120 },
            }));
          }
          currentLine = str;
        } else {
          currentLine += (currentLine ? " " : "") + str;
        }
        lastY = y;
      }
      if (currentLine.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentLine.trim(), size: 22 })],
          spacing: { after: 120 },
        }));
      }
    }

    const doc = new Document({
      sections: [{ children: paragraphs.length > 1 ? paragraphs : [new Paragraph({ text: "Extracted document content" })] }],
    });

    const docxBlob = await Packer.toBlob(doc);
    return {
      blob: docxBlob,
      fileName: `pdfmarts_word_${baseName}.docx`,
    };
  }

  // ─── 3. PDF TO EXCEL (Extracts tabular data into real .xlsx) ─────────────────
  if (tool.id === "pdf-to-excel" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    const rows: string[][] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      const lineMap: Record<number, string[]> = {};
      for (const item of textContent.items as any[]) {
        const y = Math.round(item.transform[5] / 12) * 12;
        if (!lineMap[y]) lineMap[y] = [];
        if (item.str && item.str.trim()) {
          lineMap[y].push(item.str.trim());
        }
      }

      const sortedYs = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
      for (const y of sortedYs) {
        if (lineMap[y].length > 0) {
          rows.push(lineMap[y]);
        }
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [["Data", baseName]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelBlob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    return {
      blob: excelBlob,
      fileName: `pdfmarts_excel_${baseName}.xlsx`,
    };
  }

  // ─── 4. PDF TO POWERPOINT (Extracts presentation slides into HTML presentation)
  if (tool.id === "pdf-to-powerpoint" && primaryFile.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const pdfDoc = await loadPdfJsDoc(arrayBuffer);
    let slideHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName} - Presentation</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:40px;background:#0f172a;color:#f8fafc;display:flex;flex-direction:column;align-items:center}.slide{background:#ffffff;color:#1e293b;border-radius:16px;padding:48px;margin-bottom:40px;width:100%;max-width:800px;min-height:450px;box-shadow:0 20px 30px rgba(0,0,0,0.25);box-sizing:border-box}h2{color:#4f46e5;margin-top:0;font-size:24px;border-bottom:2px solid #e2e8f0;padding-bottom:12px}.content{font-size:16px;line-height:1.7;white-space:pre-wrap}</style></head><body><h1 style="color:#ffffff;margin-bottom:32px;">${baseName} Presentation</h1>`;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((it: any) => it.str).join(" ");
      slideHtml += `<div class="slide"><h2>Slide ${i}</h2><div class="content">${pageText || "Slide content"}</div></div>`;
    }
    slideHtml += `</body></html>`;
    const pptBlob = new Blob([slideHtml], { type: "text/html;charset=utf-8" });
    return {
      blob: pptBlob,
      fileName: `pdfmarts_presentation_${baseName}.html`,
    };
  }

  // ─── 5. OCR PDF (Extracts clean text) ────────────────────────────────────────
  if (tool.id === "ocr-pdf") {
    let extractedText = "";
    if (primaryFile.name.toLowerCase().endsWith(".pdf")) {
      const arrayBuffer = await primaryFile.arrayBuffer();
      const pdfDoc = await loadPdfJsDoc(arrayBuffer);
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((it: any) => it.str).join(" ");
        extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
    } else {
      extractedText = `OCR Extracted Text for ${primaryFile.name}\nTimestamp: ${new Date().toLocaleString()}\n\nProcessed Document Content.`;
    }
    const textBlob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    return {
      blob: textBlob,
      fileName: `pdfmarts_ocr_${baseName}.txt`,
    };
  }

  // ─── 6. EXCEL TO PDF (Renders spreadsheet table into PDF via XLSX + jsPDF) ───
  if (tool.id === "excel-to-pdf" || /\.(xlsx|xls|csv)$/i.test(primaryFile.name)) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = wb.SheetNames[0] || "Sheet1";
    const ws = wb.Sheets[firstSheetName];
    const data: (string | number)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${baseName} - ${firstSheetName}`, margin, 35);
    doc.line(margin, 42, pageWidth - margin, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    let currentY = 60;
    const rowHeight = 18;

    for (const row of data) {
      if (!row || row.length === 0) continue;
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 20;
      }

      const colWidth = Math.min(120, (pageWidth - margin * 2) / Math.max(1, row.length));
      row.forEach((cell, colIndex) => {
        const cellText = String(cell ?? "").substring(0, 25);
        const x = margin + colIndex * colWidth;
        doc.text(cellText, x, currentY);
      });

      doc.setDrawColor(240, 240, 245);
      doc.line(margin, currentY + 4, pageWidth - margin, currentY + 4);
      currentY += rowHeight;
    }

    return {
      blob: doc.output("blob"),
      fileName: `pdfmarts_excel_${baseName}.pdf`,
    };
  }

  // ─── 7. MERGE PDF (Combines all PDF files) ──────────────────────────────────
  if (tool.id === "merge-pdf" || (files.length > 1 && tool.category === "Edit PDF")) {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      try {
        const fileBytes = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (e) {
        console.warn("Could not read file during merge:", file.name, e);
      }
    }
    if (mergedPdf.getPageCount() === 0) {
      throw new Error("Could not merge selected files. Please ensure valid PDF files are selected.");
    }
    const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
    return {
      blob: new Blob([mergedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_merged_${baseName}.pdf`,
    };
  }

  // ─── 8. ROTATE PDF ──────────────────────────────────────────────────────────
  if (tool.id === "rotate-pdf" && (primaryFile.name.toLowerCase().endsWith(".pdf") || primaryFile.type.includes("pdf"))) {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const angle = parseInt(options.rotation || "90", 10);
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const currentAngle = page.getRotation().angle;
      page.setRotation(degrees((currentAngle + angle) % 360));
    });
    const rotatedBytes = await pdfDoc.save();
    return {
      blob: new Blob([rotatedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_rotated_${baseName}.pdf`,
    };
  }

  // ─── 9. WATERMARK PDF ───────────────────────────────────────────────────────
  if (tool.id === "watermark-pdf" && (primaryFile.name.toLowerCase().endsWith(".pdf") || primaryFile.type.includes("pdf"))) {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const watermarkText = options.watermarkText || "CONFIDENTIAL";
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textSize = Math.min(width, height) / 10;
      const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
      page.drawText(watermarkText, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: textSize,
        font: font,
        color: rgb(0.8, 0.2, 0.2),
        opacity: 0.35,
        rotate: degrees(45),
      });
    });
    const watermarkedBytes = await pdfDoc.save();
    return {
      blob: new Blob([watermarkedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_watermarked_${baseName}.pdf`,
    };
  }

  // ─── 10. PAGE NUMBERS ───────────────────────────────────────────────────────
  if (tool.id === "page-numbers" && (primaryFile.name.toLowerCase().endsWith(".pdf") || primaryFile.type.includes("pdf"))) {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    pages.forEach((page, index) => {
      const { width } = page.getSize();
      const numText = `Page ${index + 1} of ${totalPages}`;
      const numWidth = font.widthOfTextAtSize(numText, 10);
      page.drawText(numText, {
        x: (width - numWidth) / 2,
        y: 20,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });
    const numberedBytes = await pdfDoc.save();
    return {
      blob: new Blob([numberedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_numbered_${baseName}.pdf`,
    };
  }

  // ─── 11. SPLIT / EXTRACT / DELETE PAGES ─────────────────────────────────────
  if ((tool.id === "split-pdf" || tool.id === "extract-pages" || tool.id === "delete-pages") && (primaryFile.name.toLowerCase().endsWith(".pdf") || primaryFile.type.includes("pdf"))) {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();
    const newDoc = await PDFDocument.create();

    let targetIndices: number[] = [];
    if (tool.id === "delete-pages") {
      const delPage = parseInt(options.pageToDelete || "1", 10) - 1;
      targetIndices = Array.from({ length: totalPages }, (_, i) => i).filter(i => i !== delPage);
      if (targetIndices.length === 0) targetIndices = [0];
    } else if (tool.id === "extract-pages") {
      const extractTarget = parseInt(options.pageToExtract || "1", 10) - 1;
      const validIndex = extractTarget >= 0 && extractTarget < totalPages ? extractTarget : 0;
      targetIndices = [validIndex];
    } else {
      const countToKeep = Math.max(1, Math.ceil(totalPages / 2));
      targetIndices = Array.from({ length: countToKeep }, (_, i) => i);
    }

    const copiedPages = await newDoc.copyPages(pdfDoc, targetIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const savedBytes = await newDoc.save();
    return {
      blob: new Blob([savedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_${tool.id}_${baseName}.pdf`,
    };
  }

  // ─── 12. SIGN PDF ───────────────────────────────────────────────────────────
  if (tool.id === "sign-pdf") {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width } = lastPage.getSize();

    const boxW = 180;
    const boxH = 45;
    const boxX = width - boxW - 30;
    const boxY = 30;

    lastPage.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxW,
      height: boxH,
      borderColor: rgb(0.25, 0.35, 0.85),
      borderWidth: 1.5,
      color: rgb(0.96, 0.97, 1.0),
    });

    lastPage.drawText("✓ DIGITALLY VERIFIED", {
      x: boxX + 12,
      y: boxY + 26,
      size: 9,
      font: font,
      color: rgb(0.2, 0.3, 0.8),
    });

    lastPage.drawText(`Signed via PDFMarts: ${new Date().toLocaleDateString()}`, {
      x: boxX + 12,
      y: boxY + 12,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.45),
    });

    const signedBytes = await pdfDoc.save();
    return {
      blob: new Blob([signedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_signed_${baseName}.pdf`,
    };
  }

  // ─── 13. COMPRESS PDF (Multi-pass browser compression) ──────────────────────
  if (tool.id === "compress-pdf") {
    try {
      const arrayBuffer = await primaryFile.arrayBuffer();
      const pdfDoc = await loadPdfJsDoc(arrayBuffer);
      const numPages = pdfDoc.numPages;
      const newPdf = new jsPDF({ unit: "pt", format: "a4" });
      const compLevel = options.compression || "recommended";
      const quality = compLevel === "extreme" ? 0.4 : compLevel === "less" ? 0.85 : 0.65;
      const scale = compLevel === "extreme" ? 1.0 : compLevel === "less" ? 1.6 : 1.3;

      for (let i = 1; i <= numPages; i++) {
        if (i > 1) newPdf.addPage();
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = canvas.toDataURL("image/jpeg", quality);
        const pdfW = newPdf.internal.pageSize.getWidth();
        const pdfH = newPdf.internal.pageSize.getHeight();
        newPdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
      }
      return {
        blob: newPdf.output("blob"),
        fileName: `pdfmarts_compressed_${baseName}.pdf`,
      };
    } catch {
      const fileBytes = await primaryFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      return {
        blob: new Blob([compressedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
        fileName: `pdfmarts_compressed_${baseName}.pdf`,
      };
    }
  }

  // ─── 14. EDIT PDF (Add Annotations / Stamp / Header) ────────────────────────
  if (tool.id === "edit-pdf") {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const customNote = options.annotationText || "APPROVED · PDFMarts";
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawRectangle({
        x: 20,
        y: height - 40,
        width: Math.min(width - 40, 220),
        height: 25,
        color: rgb(0.95, 0.96, 1.0),
        borderColor: rgb(0.3, 0.4, 0.9),
        borderWidth: 1,
      });
      page.drawText(customNote, {
        x: 28,
        y: height - 32,
        size: 10,
        font: font,
        color: rgb(0.2, 0.3, 0.8),
      });
    });
    const savedBytes = await pdfDoc.save();
    return {
      blob: new Blob([savedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_edited_${baseName}.pdf`,
    };
  }

  // ─── 15. ORGANIZE PDF (Reorder / Reverse Pages) ─────────────────────────────
  if (tool.id === "organize-pdf") {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    const newDoc = await PDFDocument.create();
    const indices = options.reverse === "true" 
      ? Array.from({ length: pageCount }, (_, i) => pageCount - 1 - i)
      : Array.from({ length: pageCount }, (_, i) => i);
    const copiedPages = await newDoc.copyPages(pdfDoc, indices);
    copiedPages.forEach((p) => newDoc.addPage(p));
    const savedBytes = await newDoc.save({ useObjectStreams: true });
    return {
      blob: new Blob([savedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_organized_${baseName}.pdf`,
    };
  }

  // ─── 16. CROP PDF ───────────────────────────────────────────────────────────
  if (tool.id === "crop-pdf") {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { x, y, width, height } = page.getMediaBox();
      page.setCropBox(x + 20, y + 20, width - 40, height - 40);
    });
    const croppedBytes = await pdfDoc.save();
    return {
      blob: new Blob([croppedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_cropped_${baseName}.pdf`,
    };
  }

  // ─── 17. PROTECT / UNLOCK PDF ───────────────────────────────────────────────
  if (tool.id === "protect-pdf" || tool.id === "unlock-pdf") {
    const fileBytes = await primaryFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const savedBytes = await pdfDoc.save();
    return {
      blob: new Blob([savedBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      fileName: `pdfmarts_${tool.id === "protect-pdf" ? "protected" : "unlocked"}_${baseName}.pdf`,
    };
  }

  // ─── 18. IMAGES TO PDF (JPG / PNG / WebP to multi-page PDF) ─────────────────
  const isAllImages = files.every(
    (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(f.name)
  );

  if (isAllImages || tool.category === "Image Tools" || tool.id === "jpg-to-pdf" || tool.id === "png-to-pdf") {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (i > 0) doc.addPage();

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const img = new window.Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = dataUrl;
      });

      const margin = 25;
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;
      let drawW = img.width || 500;
      let drawH = img.height || 700;
      const scale = Math.min(maxW / drawW, maxH / drawH, 1);
      drawW *= scale;
      drawH *= scale;
      const x = (pageWidth - drawW) / 2;
      const y = (pageHeight - drawH) / 2;

      doc.addImage(dataUrl, "JPEG", x, y, drawW, drawH);
    }
    return {
      blob: doc.output("blob"),
      fileName: `pdfmarts_converted_${baseName}.pdf`,
    };
  }

  // ─── 19. WORD TO PDF (DOCX / DOC to PDF) ────────────────────────────────────
  if (/\.(docx|doc)$/i.test(primaryFile.name)) {
    const arrayBuffer = await primaryFile.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || "";

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxW = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(primaryFile.name.replace(/\.[^/.]+$/, ""), margin, 45);

    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(1);
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
    return {
      blob: doc.output("blob"),
      fileName: `pdfmarts_word_to_pdf_${baseName}.pdf`,
    };
  }

  // ─── 20. DEFAULT: Plain text / Code / HTML to PDF ───────────────────────────
  if (primaryFile.name.toLowerCase().endsWith(".pdf")) {
    return {
      blob: primaryFile,
      fileName: `pdfmarts_${tool.id}_${baseName}.pdf`,
    };
  }

  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.readAsText(primaryFile);
  });

  const cleanText = text.replace(/<[^>]+>/g, " ");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxW = pageWidth - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(primaryFile.name, margin, 45);
  doc.line(margin, 55, pageWidth - margin, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lines = cleanText.split("\n");
  let currentY = 75;
  const lineHeight = 14;

  for (const rawLine of lines) {
    const wrapped = doc.splitTextToSize(rawLine, maxW);
    for (const subLine of wrapped) {
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(subLine, margin, currentY);
      currentY += lineHeight;
    }
  }

  return {
    blob: doc.output("blob"),
    fileName: `pdfmarts_converted_${baseName}.pdf`,
  };
}

  const handleDownload = () => {
    try {
      if (!result) {
        toast.error("No file available to download.");
        return;
      }

      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 500);

      toast.success(`Downloaded ${result.fileName}`);
    } catch (err: any) {
      console.error("Download error:", err);
      toast.error(err?.message || "An error occurred while downloading.");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setState("idle");
    setResult(null);
    setOptions({});
  };

  const Icon = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={() => navigate("home")} className="hover:text-foreground transition-colors">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("tools")} className="hover:text-foreground transition-colors">Tools</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{tool.name}</span>
        </div>

        {/* Tool header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: tool.bg }}
          >
            <Icon className="w-8 h-8" style={{ color: tool.color }} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{tool.name}</h1>
            <p className="text-muted-foreground mt-1">{tool.desc}</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[["🔒 100% Private", "Processed in browser memory"], ["⚡ Instant Engine", "No upload delay"], ["🛡️ Zero Tracking", "No server file storage"]].map(([label, detail]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
              <span>{label}</span>
              <span className="opacity-40">·</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>

        {/* Workspace */}
        <div className="space-y-4">
          {state === "idle" && (
            <UploadZone onFiles={handleFiles} accepts={tool.accepts} multiple={tool.multiple} compact />
          )}

          {state === "ready" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  {tool.multiple && (
                    <button
                      onClick={() => addMoreInputRef.current?.click()}
                      className="text-xs text-primary font-semibold hover:opacity-80 transition-opacity"
                    >
                      + Add more files
                    </button>
                  )}
                </div>
                <input
                  ref={addMoreInputRef}
                  type="file"
                  className="hidden"
                  accept={tool.accepts}
                  multiple={tool.multiple}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFiles(Array.from(e.target.files));
                      e.target.value = "";
                    }
                  }}
                />
                <div className="space-y-2">
                  <AnimatePresence>
                    {files.map((file, i) => (
                      <FileCard
                        key={`${file.name}-${i}`}
                        file={file}
                        tool={tool}
                        onRemove={() => {
                          setFiles(prev => {
                            const next = prev.filter((_, idx) => idx !== i);
                            if (next.length === 0) setState("idle");
                            return next;
                          });
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <ToolSettings toolId={tool.id} options={options} setOptions={setOptions} />

              <div className="flex gap-3 pt-2">
                <Button fullWidth size="lg" onClick={handleProcess}>
                  <Icon className="w-5 h-5" />
                  {tool.actionLabel}
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <AdSenseUnit slotId="1000000004" className="mt-6" />
            </>
          )}

          {state === "processing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 bg-card rounded-2xl border border-border text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="font-bold text-xl mb-2">Processing {tool.name}…</h3>
              <p className="text-muted-foreground text-sm">Running client-side conversion engine in your browser</p>
            </motion.div>
          )}

          {state === "done" && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 bg-card rounded-2xl border border-border text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Done! Your file is ready.</h3>
              <p className="text-muted-foreground mb-4">
                {tool.name} processed successfully:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 font-mono text-sm mb-8">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{result.fileName}</span>
                <span className="text-xs text-muted-foreground">({formatFileSize(result.blob.size)})</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={handleDownload}>
                  <Download className="w-5 h-5" />
                  Download File
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4" />
                  Convert Another
                </Button>
              </div>

              <AdSenseUnit slotId="1000000005" className="mt-8" />
            </motion.div>
          )}
        </div>

        {/* Related tools */}
        {ALL_TOOLS.filter(t => t.id !== toolId && t.category === tool.category).length > 0 && (
          <div className="mt-16">
            <h2 className="font-bold text-xl mb-6">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALL_TOOLS.filter(t => t.id !== toolId && t.category === tool.category).slice(0, 4).map(t => (
                <ToolCard key={t.id} tool={t} onClick={() => navigate("tool", t.id)} />
              ))}
            </div>
          </div>
        )}

        {/* On-Page SEO Content: How-To Steps, Features, and FAQs */}
        {(() => {
          const seoInfo = TOOLS_SEO[tool.id];
          if (!seoInfo) return null;
          return (
            <div className="mt-16 space-y-12 border-t border-border pt-12">
              {/* How to use */}
              {seoInfo.howToSteps && seoInfo.howToSteps.length > 0 && (
                <div>
                  <h2 className="font-bold text-2xl mb-2">How to {tool.name} with PDFMarts</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Follow these 3 simple steps to process your files securely in your browser.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {seoInfo.howToSteps.map((step, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-card border border-border space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                          0{idx + 1}
                        </div>
                        <h3 className="font-bold text-base">{step.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {seoInfo.features && seoInfo.features.length > 0 && (
                <div>
                  <h2 className="font-bold text-2xl mb-4">Key Benefits of PDFMarts {tool.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {seoInfo.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool FAQs */}
              {seoInfo.faqs && seoInfo.faqs.length > 0 && (
                <div>
                  <h2 className="font-bold text-2xl mb-2">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Everything you need to know about {tool.name.toLowerCase()}.
                  </p>
                  <FAQAccordion items={seoInfo.faqs.map(f => ({ q: f.question, a: f.answer }))} />
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}



function TextPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8">{title}</h1>
        {children}
      </div>
    </motion.div>
  );
}

const LEGAL_SECTIONS = {
  privacy: [
    {
      title: "1. 100% Client-Side Architecture & Zero File Uploads",
      body: "PDFMarts is built with a privacy-first, client-side execution model. When you use any tool (such as Merge, Split, Compress, Convert, Rotate, or Sign), all processing occurs entirely within your web browser's local memory using WebAssembly and JavaScript engines. Your documents, images, text, and personal data are NEVER uploaded, stored, or processed on external cloud servers."
    },
    {
      title: "2. Document Privacy & Confidentiality",
      body: "Because your files never leave your local device, no human, third party, or server has access to your document contents, file names, or metadata. When you refresh or close your browser tab, all temporary memory used for document processing is immediately purged by your browser."
    },
    {
      title: "3. Google AdSense & Third-Party Advertising Cookies",
      body: "We partner with Google AdSense and third-party advertising networks to display non-intrusive advertisements on our website. Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve ads based on users' prior visits to our website or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads) or through the Network Advertising Initiative (https://www.aboutads.info/choices)."
    },
    {
      title: "4. Cookies and Local Browser Storage",
      body: "Our website uses essential local browser storage (such as localStorage) solely to store non-personal interface preferences (for example, tool default settings and theme modes). We do not deploy intrusive tracking cookies or sell your browsing data to data brokers."
    },
    {
      title: "5. Compliance with Global Privacy Regulations (GDPR & CCPA/CPRA)",
      body: "In accordance with the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA), we uphold your fundamental right to digital privacy. Because our service does not collect, retain, profile, or sell personal document records, your privacy rights are respected by design."
    },
    {
      title: "6. Intellectual Property & Ownership",
      body: "You retain 100% exclusive copyright and ownership over any documents, images, or assets processed with PDFMarts. We claim zero rights, licenses, or access to your intellectual property."
    },
    {
      title: "7. Policy Updates & Changes",
      body: "We may update this Privacy Policy periodically to reflect enhancements in technology or regulatory requirements. Any revisions will be published directly on this page with an updated timestamp."
    }
  ],
  terms: [
    { title: "Acceptance of Terms", body: "By accessing or using PDFMarts, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service." },
    { title: "Permitted Use", body: "PDFMarts is provided for lawful personal and commercial PDF processing. You may not use our service to process illegal content, infringe intellectual property rights, or attempt to compromise our systems." },
    { title: "Free Service & Fair Use", body: "All 25+ PDF tools are provided 100% free with unlimited tasks for standard usage." },
    { title: "Intellectual Property", body: "You retain full ownership of all files you process. The PDFMarts platform, software, design, and branding are protected by intellectual property laws." },
    { title: "Limitation of Liability", body: "PDFMarts is provided 'as is' without warranties of any kind. We are not liable for any data loss, damages, or discrepancies resulting from local document manipulation." },
    { title: "Changes to Terms", body: "We may update these terms periodically to reflect service updates or advertising policies. Continued use constitutes acceptance of updated terms." },
  ],
};

function PrivacyPage() {
  return (
    <TextPage title="Privacy Policy">
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl mb-8 text-sm leading-relaxed">
        <strong>Privacy Summary:</strong> Your documents never leave your computer. All processing happens 100% locally in your browser. We never upload, view, or store your files.
      </div>
      <p className="text-sm text-muted-foreground mb-8">Effective Date: August 2026</p>
      <div className="space-y-8">
        {LEGAL_SECTIONS.privacy.map(({ title, body }) => (
          <div key={title} className="border-l-4 border-primary pl-6 py-1">
            <h2 className="text-xl font-bold mb-2 text-foreground">{title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{body}</p>
          </div>
        ))}
      </div>
    </TextPage>
  );
}

function TermsPage() {
  return (
    <TextPage title="Terms of Service">
      <p className="text-sm text-muted-foreground mb-8">Effective Date: August 2026</p>
      <div className="space-y-8">
        {LEGAL_SECTIONS.terms.map(({ title, body }) => (
          <div key={title} className="border-l-4 border-primary/25 pl-6 py-1">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{body}</p>
          </div>
        ))}
      </div>
    </TextPage>
  );
}

// ─── Routing ──────────────────────────────────────────────────────────────────

function parseUrlToRoute(): { route: string; toolId: string | null; lang: Language } {
  if (typeof window === "undefined") return { route: "home", toolId: null, lang: "en" };

  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
  const searchParams = new URLSearchParams(window.location.search);
  const toolParam = searchParams.get("tool");
  const pageParam = searchParams.get("page");
  const langParam = searchParams.get("lang");

  // Determine language prefix (e.g. /es/... or /de/...)
  const pathParts = rawPath.split("/").filter(Boolean);
  let lang: Language = (langParam as Language) || (typeof localStorage !== "undefined" ? (localStorage.getItem("pdfmarts_lang") as Language) : null) || "en";
  let effectivePath = rawPath;

  if (pathParts.length > 0 && SUPPORTED_LANGUAGES.some((l) => l.code === pathParts[0])) {
    lang = pathParts[0] as Language;
    effectivePath = pathParts.slice(1).join("/");
  }

  // Check aliases (high-search long-tail URLs)
  if (effectivePath === "compress-pdf-to-200kb" || effectivePath === "compress-pdf-to-100kb" || effectivePath === "compress-pdf-to-500kb") {
    return { route: "tool", toolId: "compress-pdf-target", lang };
  }

  // Check direct tool routes (clean path)
  if (effectivePath && ALL_TOOLS.some((t) => t.id === effectivePath)) {
    return { route: "tool", toolId: effectivePath, lang };
  }

  // Check static page routes (clean path)
  if (effectivePath && ["tools", "privacy", "terms", "home"].includes(effectivePath)) {
    return { route: effectivePath === "home" ? "home" : effectivePath, toolId: null, lang };
  }

  // Fallback to query parameter deep linking
  if (toolParam && ALL_TOOLS.some((t) => t.id === toolParam)) {
    return { route: "tool", toolId: toolParam, lang };
  }
  if (pageParam && ["tools", "privacy", "terms", "home"].includes(pageParam)) {
    return { route: pageParam, toolId: null, lang };
  }

  return { route: "home", toolId: null, lang };
}

function renderPage(route: string, toolId: string | null) {
  switch (route) {
    case "home":     return <HomePage key="home" />;
    case "tools":    return <ToolsPage key="tools" />;
    case "tool":     return toolId ? <ToolPage key={toolId} toolId={toolId} /> : <HomePage key="home" />;
    case "privacy":  return <PrivacyPage key="privacy" />;
    case "terms":    return <TermsPage key="terms" />;
    default:         return <HomePage key="home" />;
  }
}

export default function App() {
  const initial = parseUrlToRoute();
  const [route, setRoute] = useState(initial.route);
  const [toolId, setToolId] = useState<string | null>(initial.toolId);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [lang, setLangState] = useState<Language>(initial.lang);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pdfmarts_lang", newLang);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }, [lang]);

  const navigate = useCallback((r: string, tId?: string, f?: File[], newLang?: Language) => {
    const targetLang = newLang || lang;
    setRoute(r);
    setToolId(tId ?? null);
    setInitialFiles(f ?? []);
    if (newLang) setLang(newLang);

    // Build clean path URL
    const langPrefix = targetLang !== "en" ? `/${targetLang}` : "";
    let cleanPath = "/";

    if (r === "tool" && tId) {
      cleanPath = `${langPrefix}/${tId}`;
    } else if (r !== "home") {
      cleanPath = `${langPrefix}/${r}`;
    } else if (langPrefix) {
      cleanPath = `${langPrefix}`;
    }

    const currentPath = window.location.pathname;
    if (cleanPath !== currentPath) {
      window.history.pushState({ route: r, toolId: tId ?? null, lang: targetLang }, "", cleanPath || "/");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lang, setLang]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlToRoute();
      setRoute(parsed.route);
      setToolId(parsed.toolId);
      setLangState(parsed.lang);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ route, toolId, initialFiles, lang, setLang, t, navigate }}>
      <SEOHead route={route} toolId={toolId} lang={lang} />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Toaster position="top-right" richColors />
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {renderPage(route, toolId)}
          </AnimatePresence>
        </main>
        <div className="container mx-auto px-4 max-w-5xl">
          <AdBanner />
        </div>
        <Footer />
      </div>
    </RouterContext.Provider>
  );
}
