export interface ToolSEOInfo {
  id: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  h2Subtitle: string;
  category: string;
  features: string[];
  howToSteps: { name: string; text: string }[];
  faqs: { question: string; answer: string }[];
}

export interface PageSEOInfo {
  route: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  canonicalPath: string;
}

export const SITE_CONFIG = {
  name: "PDFMarts",
  domain: "pdfmarts.vercel.app",
  baseUrl: "https://pdfmarts.vercel.app",
  defaultTitle: "PDFMarts - Free Online PDF Tools, Converter & Editor",
  defaultDescription: "Merge, split, compress, convert, edit, OCR, watermark, and sign PDFs directly in your browser. 100% free, private client-side processing with zero file size limits.",
  defaultKeywords: [
    "pdf converter",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "edit pdf",
    "sign pdf",
    "word to pdf",
    "pdf to word",
    "excel to pdf",
    "jpg to pdf",
    "free pdf editor",
    "client-side pdf tools",
    "offline pdf converter",
  ],
  ogImage: "https://pdfmarts.vercel.app/og-image.svg",
  themeColor: "#4f46e5",
  twitterHandle: "@pdfmarts",
};

export const PAGES_SEO: Record<string, PageSEOInfo> = {
  home: {
    route: "home",
    title: "PDFMarts - Free Online PDF Tools, Converter & Editor",
    metaDescription: "Merge, split, compress, convert, edit, OCR, watermark, and sign PDFs directly in your browser. 100% free with unlimited client-side processing.",
    keywords: ["pdf tools", "online pdf editor", "pdf converter", "merge pdf", "compress pdf free"],
    canonicalPath: "/",
  },
  tools: {
    route: "tools",
    title: "All 25+ PDF Tools & Converters | PDFMarts Suite",
    metaDescription: "Explore all 25+ free online PDF tools. Convert Word, Excel, PPT, JPG, merge, split, compress, edit, annotate, watermark, and sign PDFs with zero cloud uploads.",
    keywords: ["pdf tools directory", "all pdf converters", "pdf utilities", "free online pdf tools"],
    canonicalPath: "/tools",
  },
  privacy: {
    route: "privacy",
    title: "Privacy Policy - 100% Local Client-Side Processing | PDFMarts",
    metaDescription: "Read PDFMarts's privacy policy. Your documents never touch external servers or cloud storage. All processing occurs entirely in your local browser memory.",
    keywords: ["pdf privacy policy", "client-side privacy", "secure pdf converter", "gdpr pdf tools"],
    canonicalPath: "/?page=privacy",
  },
  terms: {
    route: "terms",
    title: "Terms of Service - Free & Open PDF Processing | PDFMarts",
    metaDescription: "Terms of Service for PDFMarts free online PDF tools and conversion platform.",
    keywords: ["pdf terms of service", "pdfmarts terms", "free software terms"],
    canonicalPath: "/?page=terms",
  },
};

export const TOOLS_SEO: Record<string, ToolSEOInfo> = {
  "merge-pdf": {
    id: "merge-pdf",
    title: "Merge PDF - Combine Multiple PDF Files Online Free | PDFMarts",
    metaDescription: "Combine multiple PDF documents into one seamless file in seconds. Drag and drop to reorder pages. 100% free, secure, and client-side with no file size limits.",
    keywords: ["merge pdf", "combine pdf files", "join pdf", "merge pdf online free", "pdf joiner"],
    h1: "Merge PDF Files Online",
    h2Subtitle: "Combine multiple PDFs into a single organized document in seconds.",
    category: "Edit PDF",
    features: [
      "Combine unlimited PDF files into one master document",
      "Interactive drag-and-drop page and file reordering",
      "100% private in-browser merging — zero server uploads",
      "Preserves original layout, bookmarks, and font fidelity",
    ],
    howToSteps: [
      { name: "Upload PDFs", text: "Drag and drop two or more PDF files into the upload dropzone." },
      { name: "Arrange Order", text: "Drag the file cards to set your preferred page and file order." },
      { name: "Merge & Download", text: "Click 'Merge PDFs' to combine instantly and download your merged PDF." },
    ],
    faqs: [
      { question: "Is there a limit on how many PDFs I can merge?", answer: "No! PDFMarts runs completely inside your browser, so you can merge as many documents as your device memory allows." },
      { question: "Are my merged documents stored on a server?", answer: "Never. All processing happens in local browser memory via WebAssembly and JavaScript." },
      { question: "Can I rearrange the order before merging?", answer: "Yes, you can easily drag and drop files to change their sequence before clicking merge." },
    ],
  },

  "compress-pdf": {
    id: "compress-pdf",
    title: "Compress PDF - Reduce PDF File Size Online Free | PDFMarts",
    metaDescription: "Reduce PDF file size quickly while preserving maximum visual quality. Choose compression levels for email and web sharing. 100% private and free.",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "compress pdf online", "pdf size reducer"],
    h1: "Compress PDF File Size",
    h2Subtitle: "Shrink your PDF documents for effortless sharing without losing quality.",
    category: "Edit PDF",
    features: [
      "Significant file size reduction with optimized image streams",
      "Customizable compression presets (Extreme, Recommended, High Quality)",
      "Ideal for email attachments, government portals, and web publishing",
      "Instant client-side compression without uploading sensitive data",
    ],
    howToSteps: [
      { name: "Select PDF", text: "Upload the PDF document you wish to compress." },
      { name: "Select Level", text: "Choose your compression quality level." },
      { name: "Download", text: "Download your lightweight, compressed PDF document instantly." },
    ],
    faqs: [
      { question: "Will compressing my PDF reduce text clarity?", answer: "No, PDFMarts optimizes document streams and image assets while keeping text crisp and vector-sharp." },
      { question: "Is it free to compress large PDF files?", answer: "Yes! PDFMarts is 100% free with no file size limits or paywalls." },
    ],
  },

  "split-pdf": {
    id: "split-pdf",
    title: "Split PDF - Extract Pages or Divide PDF Online Free | PDFMarts",
    metaDescription: "Divide a PDF into separate files or extract specific page ranges with ease. Fast, accurate, and 100% private in-browser PDF splitter.",
    keywords: ["split pdf", "extract pdf pages", "divide pdf", "split pdf online free", "cut pdf pages"],
    h1: "Split PDF into Multiple Files",
    h2Subtitle: "Extract specific pages or separate your document into individual files.",
    category: "Edit PDF",
    features: [
      "Split by custom page ranges (e.g. 1-3, 5, 8-10)",
      "Extract every page into individual single-page PDFs",
      "Visual page thumbnail selection",
      "100% client-side security with zero cloud uploads",
    ],
    howToSteps: [
      { name: "Select PDF", text: "Upload the PDF file you want to divide." },
      { name: "Choose Range", text: "Enter the specific page numbers or select split mode." },
      { name: "Split & Save", text: "Click 'Split PDF' to download your split PDF documents in a zip archive or single file." },
    ],
    faqs: [
      { question: "Can I extract non-consecutive pages?", answer: "Yes! You can specify comma-separated ranges like '1-3, 5, 7-10' to extract exactly the pages you need." },
    ],
  },

  "pdf-to-word": {
    id: "pdf-to-word",
    title: "PDF to Word Converter - Convert PDF to DOCX Online Free | PDFMarts",
    metaDescription: "Convert PDF documents to editable Microsoft Word (.docx) files with high accuracy. Preserves text layout, formatting, and tables. 100% free.",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "pdf to word converter free", "editable word doc"],
    h1: "Convert PDF to Microsoft Word",
    h2Subtitle: "Transform PDF documents into fully editable Word (DOCX) files.",
    category: "Convert PDF",
    features: [
      "High-fidelity text and paragraph extraction",
      "Outputs standard Microsoft Word (.docx) format",
      "Edit converted documents in Microsoft Word, Google Docs, or LibreOffice",
      "Zero server latency — instant client-side conversion",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Choose or drag and drop your PDF file." },
      { name: "Convert", text: "Click 'Convert to Word' to parse text and structures." },
      { name: "Download DOCX", text: "Download and edit your newly created Word document." },
    ],
    faqs: [
      { question: "Is the converted Word document editable?", answer: "Yes, you can edit all converted text and headings directly in Word or Google Docs." },
    ],
  },

  "word-to-pdf": {
    id: "word-to-pdf",
    title: "Word to PDF Converter - Convert DOCX to PDF Online Free | PDFMarts",
    metaDescription: "Convert Microsoft Word (.docx) documents to PDF format instantly. Preserves fonts, images, and alignments. Free and private.",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf free", "doc to pdf online"],
    h1: "Convert Word to PDF",
    h2Subtitle: "Convert Microsoft Word documents (.docx) to PDF format instantly.",
    category: "Convert PDF",
    features: [
      "Support for .docx and .doc Microsoft Word files",
      "Crisp vector font rendering and exact layout replication",
      "Instant in-browser document compilation",
      "Complete data privacy with zero external uploads",
    ],
    howToSteps: [
      { name: "Upload DOCX", text: "Drag and drop your Word document." },
      { name: "Convert", text: "Click 'Convert to PDF' to compile your document." },
      { name: "Download", text: "Download your standardized PDF file." },
    ],
    faqs: [
      { question: "Does this require Microsoft Office installed?", answer: "No, our browser engine converts your DOCX file directly without needing Office installed." },
    ],
  },

  "pdf-to-excel": {
    id: "pdf-to-excel",
    title: "PDF to Excel Converter - Extract Tables to XLSX Free | PDFMarts",
    metaDescription: "Extract tables and tabular data from PDF files directly into Microsoft Excel spreadsheets (.xlsx). Fast, clean, and 100% free.",
    keywords: ["pdf to excel", "pdf to xlsx", "extract table from pdf", "convert pdf to excel free"],
    h1: "Convert PDF to Excel Spreadsheet",
    h2Subtitle: "Extract structured data and tables from PDF documents into Excel (XLSX).",
    category: "Convert PDF",
    features: [
      "Intelligent table structure recognition",
      "Exports to native .xlsx spreadsheet format",
      "Clean separation of columns and rows for financial reports and data sheets",
      "Completely private client-side extraction",
    ],
    howToSteps: [
      { name: "Select PDF", text: "Upload your PDF containing tabular data or reports." },
      { name: "Process", text: "Click 'Convert to Excel' to parse data tables." },
      { name: "Download", text: "Open your extracted spreadsheet in Microsoft Excel or Google Sheets." },
    ],
    faqs: [
      { question: "Can I open the output in Google Sheets?", answer: "Yes! The exported XLSX file is fully compatible with Google Sheets, Excel, and Apple Numbers." },
    ],
  },

  "excel-to-pdf": {
    id: "excel-to-pdf",
    title: "Excel to PDF Converter - Convert XLSX to PDF Online Free | PDFMarts",
    metaDescription: "Convert Excel spreadsheets (.xlsx, .xls, .csv) into clean, printable PDF documents. 100% client-side and free.",
    keywords: ["excel to pdf", "xlsx to pdf", "convert excel to pdf free", "spreadsheet to pdf"],
    h1: "Convert Excel to PDF",
    h2Subtitle: "Turn spreadsheets and tables into publication-ready PDF documents.",
    category: "Convert PDF",
    features: [
      "Convert XLSX, XLS, and CSV files to PDF format",
      "Formatted gridlines and clean tabular presentation",
      "Instant conversion in your web browser",
    ],
    howToSteps: [
      { name: "Upload Spreadsheet", text: "Choose your .xlsx, .xls, or .csv file." },
      { name: "Generate PDF", text: "Click 'Convert to PDF' to format the spreadsheet." },
      { name: "Download", text: "Save your newly created PDF file." },
    ],
    faqs: [
      { question: "Does it support multiple sheets?", answer: "Yes, all data from your active worksheets will be compiled into the PDF document." },
    ],
  },

  "pdf-to-powerpoint": {
    id: "pdf-to-powerpoint",
    title: "PDF to PowerPoint Converter - Convert PDF to PPTX Free | PDFMarts",
    metaDescription: "Convert PDF slides and presentations into editable Microsoft PowerPoint (.pptx) decks. Free, fast, and secure.",
    keywords: ["pdf to ppt", "pdf to powerpoint", "convert pdf to pptx free", "pdf slides to powerpoint"],
    h1: "Convert PDF to PowerPoint Presentation",
    h2Subtitle: "Transform PDF slides into editable Microsoft PowerPoint presentations.",
    category: "Convert PDF",
    features: [
      "Converts PDF pages into PowerPoint slides (.pptx)",
      "Preserves slide dimensions and layout",
      "Ready to present in Microsoft PowerPoint or Keynote",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select your PDF presentation file." },
      { name: "Convert", text: "Click 'Convert to PPT' to generate slides." },
      { name: "Download", text: "Open and present with Microsoft PowerPoint." },
    ],
    faqs: [
      { question: "Will each PDF page become a slide?", answer: "Yes, every page of your PDF is translated into a dedicated slide in the presentation." },
    ],
  },

  "powerpoint-to-pdf": {
    id: "powerpoint-to-pdf",
    title: "PowerPoint to PDF Converter - Convert PPTX to PDF Free | PDFMarts",
    metaDescription: "Convert PowerPoint presentations (.pptx, .ppt) to universal PDF format with exact slide formatting. 100% free.",
    keywords: ["powerpoint to pdf", "pptx to pdf", "convert ppt to pdf free", "presentation to pdf"],
    h1: "Convert PowerPoint to PDF",
    h2Subtitle: "Export presentations to universal PDF format for easy sharing.",
    category: "Convert PDF",
    features: [
      "Convert PPTX and PPT files into standard PDF slides",
      "Maintains slide aspect ratio and formatting",
      "Instant client-side rendering",
    ],
    howToSteps: [
      { name: "Upload PPTX", text: "Choose your presentation deck." },
      { name: "Convert", text: "Click 'Convert to PDF' to compile slides." },
      { name: "Download", text: "Save your presentation as a PDF." },
    ],
    faqs: [
      { question: "Can anyone view the exported PDF?", answer: "Yes, PDFs are universally viewable across mobile devices, tablets, and desktop computers without PowerPoint." },
    ],
  },

  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    title: "PDF to JPG Converter - Extract Images from PDF Free | PDFMarts",
    metaDescription: "Convert PDF pages to high-resolution JPG images with sharp quality. Extract all pages or specific pages online for free.",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpeg", "extract images from pdf", "pdf to jpg free"],
    h1: "Convert PDF to JPG Images",
    h2Subtitle: "Extract and convert every PDF page into crystal-clear JPG images.",
    category: "Convert PDF",
    features: [
      "High DPI image rendering for ultra-sharp visuals",
      "Download all pages bundled in a single ZIP file",
      "No image compression artifacts",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select the PDF you want to convert to images." },
      { name: "Process", text: "Click 'Convert to JPG' to render pages." },
      { name: "Download", text: "Download your high-resolution JPG image archive." },
    ],
    faqs: [
      { question: "What is the output image resolution?", answer: "PDFMarts renders pages at high resolution (up to 300 DPI) to ensure crisp graphics and readable text." },
    ],
  },

  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    title: "JPG to PDF Converter - Convert Images to PDF Online Free | PDFMarts",
    metaDescription: "Convert JPG and JPEG images to a single PDF document in seconds. Reorder images, adjust orientation, and download free.",
    keywords: ["jpg to pdf", "jpeg to pdf", "convert image to pdf", "photos to pdf free", "jpg to pdf converter"],
    h1: "Convert JPG Images to PDF",
    h2Subtitle: "Combine multiple photos and JPEG images into a single PDF document.",
    category: "Image Tools",
    features: [
      "Batch convert multiple JPG/JPEG photos into one PDF",
      "Automatic orientation and page margin adjustment",
      "Instant client-side compilation",
    ],
    howToSteps: [
      { name: "Upload JPGs", text: "Select or drop your photos." },
      { name: "Arrange", text: "Order your images as desired." },
      { name: "Generate PDF", text: "Click 'Convert to PDF' and download." },
    ],
    faqs: [
      { question: "Can I combine multiple JPGs into one PDF?", answer: "Yes! You can upload dozens of photos and compile them into a multi-page PDF book or portfolio." },
    ],
  },

  "png-to-pdf": {
    id: "png-to-pdf",
    title: "PNG to PDF Converter - Convert PNG Images to PDF Free | PDFMarts",
    metaDescription: "Convert PNG images with transparency and crisp graphics into PDF documents with one click. 100% private and free.",
    keywords: ["png to pdf", "convert png to pdf", "png to pdf converter free", "image to pdf"],
    h1: "Convert PNG Images to PDF",
    h2Subtitle: "Transform PNG graphics, screenshots, and artwork into PDF format.",
    category: "Image Tools",
    features: [
      "Preserves image sharpness and transparency",
      "Multi-image batch support",
      "Fast client-side rendering",
    ],
    howToSteps: [
      { name: "Select PNGs", text: "Upload one or more PNG image files." },
      { name: "Convert", text: "Click 'Convert to PDF'." },
      { name: "Download", text: "Save your newly created PDF." },
    ],
    faqs: [
      { question: "Will transparency in PNGs be preserved?", answer: "Yes, transparent backgrounds are cleanly composited on clean white PDF pages." },
    ],
  },

  "convert-to-pdf": {
    id: "convert-to-pdf",
    title: "Universal Convert to PDF - Convert Any File to PDF Online Free | PDFMarts",
    metaDescription: "Universal converter to turn Word, Excel, PowerPoint, JPG, PNG, TXT, HTML, and Markdown files into standardized PDF documents instantly.",
    keywords: ["convert to pdf", "universal pdf converter", "file to pdf free", "make pdf online", "document to pdf"],
    h1: "Universal Convert to PDF",
    h2Subtitle: "Convert Word, Excel, PowerPoint, images, or documents to PDF.",
    category: "Convert PDF",
    features: [
      "Supports 10+ file formats: DOCX, XLSX, PPTX, JPG, PNG, TXT, MD, HTML",
      "Automatic format detection",
      "Batch file processing",
      "100% private in-browser processing",
    ],
    howToSteps: [
      { name: "Upload Any File", text: "Drop your document, spreadsheet, presentation, or image." },
      { name: "Auto-Convert", text: "Our engine automatically detects format and converts it." },
      { name: "Download", text: "Save your standardized PDF document." },
    ],
    faqs: [
      { question: "What formats can I upload?", answer: "You can convert DOCX, XLSX, PPTX, JPG, PNG, WebP, TXT, CSV, HTML, and Markdown files." },
    ],
  },

  "edit-pdf": {
    id: "edit-pdf",
    title: "Free Online PDF Editor - Add Text, Shapes & Annotations | PDFMarts",
    metaDescription: "Edit PDF files directly in your web browser. Add text, drawings, highlights, annotations, and shapes. 100% free and private.",
    keywords: ["edit pdf", "online pdf editor", "free pdf editor", "annotate pdf", "add text to pdf", "pdf markup"],
    h1: "Edit PDF Documents Online",
    h2Subtitle: "Add text, annotations, highlights, and custom shapes directly to any PDF.",
    category: "Edit PDF",
    features: [
      "Add custom text annotations with custom fonts, colors, and sizes",
      "Draw freehand sketches and highlights",
      "Add geometric shapes (rectangles, circles, lines)",
      "Zero server uploads — 100% secure client-side editing",
    ],
    howToSteps: [
      { name: "Open PDF", text: "Upload the PDF document you want to edit." },
      { name: "Add Elements", text: "Click to add text, shapes, or draw annotations on any page." },
      { name: "Save & Download", text: "Download your modified PDF document immediately." },
    ],
    faqs: [
      { question: "Can I add text to an existing PDF?", answer: "Yes, you can place text boxes anywhere on the page, customize colors, and adjust font sizes." },
    ],
  },

  "sign-pdf": {
    id: "sign-pdf",
    title: "Sign PDF Online Free - Add Electronic Signature to PDF | PDFMarts",
    metaDescription: "Sign PDF documents online for free. Draw your digital signature, type your name, or upload a signature image. 100% private and legally binding.",
    keywords: ["sign pdf", "sign pdf online free", "electronic signature pdf", "digital signature", "fill and sign pdf"],
    h1: "Sign PDF Documents Online",
    h2Subtitle: "Create and apply your digital signature to contracts, forms, and documents.",
    category: "Security",
    features: [
      "Draw signature with mouse, stylus, or touchscreen",
      "Type name with stylized signature typography",
      "Upload transparent signature image stamps",
      "Add date stamps and signer name tags",
      "Zero data collection — your signature never leaves your device",
    ],
    howToSteps: [
      { name: "Upload Document", text: "Select the contract or PDF form to sign." },
      { name: "Create Signature", text: "Draw, type, or upload your electronic signature." },
      { name: "Place & Save", text: "Position the signature on the page and download the signed PDF." },
    ],
    faqs: [
      { question: "Is my signature saved on a server?", answer: "No! Your signature is drawn and embedded entirely within your local browser for 100% privacy." },
    ],
  },

  "protect-pdf": {
    id: "protect-pdf",
    title: "Password Protect PDF - Encrypt PDF Files Online Free | PDFMarts",
    metaDescription: "Add strong encryption and password protection to your PDF files. Prevent unauthorized access and viewing. 100% client-side security.",
    keywords: ["protect pdf", "password protect pdf", "encrypt pdf free", "secure pdf document", "lock pdf"],
    h1: "Password Protect PDF",
    h2Subtitle: "Lock your confidential documents with robust password encryption.",
    category: "Security",
    features: [
      "Industry-standard password encryption",
      "Fast client-side encryption without transmitting passwords to servers",
      "Compatible with all standard PDF viewers (Adobe Acrobat, Chrome, Apple Preview)",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Choose the document you want to secure." },
      { name: "Enter Password", text: "Type a strong encryption password." },
      { name: "Lock & Download", text: "Click 'Protect PDF' and download your locked file." },
    ],
    faqs: [
      { question: "Can anyone open the file without the password?", answer: "No, the PDF will be encrypted and cannot be opened or viewed without entering the password." },
    ],
  },

  "unlock-pdf": {
    id: "unlock-pdf",
    title: "Unlock PDF - Remove Password from PDF Online Free | PDFMarts",
    metaDescription: "Remove password security and restrictions from PDF files you own. Instant, free, and completely client-side in-browser unlocking.",
    keywords: ["unlock pdf", "remove pdf password", "decrypt pdf", "unlock pdf online free"],
    h1: "Unlock Protected PDF",
    h2Subtitle: "Remove password protection from your documents for easy access.",
    category: "Security",
    features: [
      "Remove user and owner passwords from authorized PDFs",
      "Download clean, unrestricted PDF copies",
      "Completely local browser decryption",
    ],
    howToSteps: [
      { name: "Select Protected PDF", text: "Upload the locked PDF document." },
      { name: "Enter Known Password", text: "Provide the decryption password." },
      { name: "Unlock & Save", text: "Download the unlocked, unrestricted PDF." },
    ],
    faqs: [
      { question: "Do I need the document password to unlock it?", answer: "Yes, you must provide the valid password once so our client-side engine can remove the encryption." },
    ],
  },

  "watermark-pdf": {
    id: "watermark-pdf",
    title: "Add Watermark to PDF Online Free - Custom Text & Stamps | PDFMarts",
    metaDescription: "Add custom text watermarks, 'CONFIDENTIAL' stamps, or copyright notices to PDF pages. Customize position, opacity, and rotation.",
    keywords: ["watermark pdf", "add watermark to pdf", "stamp pdf", "pdf watermark online free", "confidential watermark"],
    h1: "Add Watermark to PDF",
    h2Subtitle: "Stamp custom text watermarks or confidential marks across your documents.",
    category: "Security",
    features: [
      "Custom text, font size, rotation angle, and opacity",
      "Apply to all pages or select page ranges",
      "Preset templates (Confidential, Draft, Sample, Approved)",
      "Instant client-side rendering",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select your PDF file." },
      { name: "Customize Watermark", text: "Type your text, adjust angle, opacity, and color." },
      { name: "Apply & Download", text: "Click 'Add Watermark' and download your stamped document." },
    ],
    faqs: [
      { question: "Can I adjust watermark transparency?", answer: "Yes, you can adjust the opacity slider so your document content remains completely readable." },
    ],
  },

  "rotate-pdf": {
    id: "rotate-pdf",
    title: "Rotate PDF Pages Online Free - Fix Orientation Permanently | PDFMarts",
    metaDescription: "Rotate PDF pages 90, 180, or 270 degrees clockwise or counterclockwise. Fix landscape and portrait orientation permanently for free.",
    keywords: ["rotate pdf", "turn pdf pages", "rotate pdf online free", "fix pdf orientation", "flip pdf"],
    h1: "Rotate PDF Pages",
    h2Subtitle: "Correct the orientation of upside-down or sideways PDF pages permanently.",
    category: "Edit PDF",
    features: [
      "Rotate individual pages or all pages at once",
      "Rotate by 90°, 180°, or 270° degrees",
      "Instant visual page preview",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select the PDF with incorrect orientation." },
      { name: "Rotate Pages", text: "Click rotate buttons on individual pages or rotate all." },
      { name: "Save", text: "Download your properly oriented PDF document." },
    ],
    faqs: [
      { question: "Is the rotation saved permanently?", answer: "Yes, the new orientation is written directly to the PDF structure and opens correctly in every viewer." },
    ],
  },

  "crop-pdf": {
    id: "crop-pdf",
    title: "Crop PDF Online Free - Trim Margins and Resize Pages | PDFMarts",
    metaDescription: "Crop PDF pages to remove unwanted white margins, headers, or footers. Interactive visual cropping with precision margin controls.",
    keywords: ["crop pdf", "trim pdf margins", "resize pdf pages", "crop pdf online free", "cut pdf margins"],
    h1: "Crop PDF Margins",
    h2Subtitle: "Trim white space and crop PDF pages to your exact desired dimensions.",
    category: "Edit PDF",
    features: [
      "Visual box selection for custom page crops",
      "Precision margin adjustments (Top, Bottom, Left, Right)",
      "Apply crop to current page or all document pages",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select the document you wish to crop." },
      { name: "Adjust Crop Box", text: "Drag crop handles to define the visible area." },
      { name: "Apply & Download", text: "Download your trimmed PDF document." },
    ],
    faqs: [
      { question: "Can I apply the same crop to all pages?", answer: "Yes! You can apply your crop dimensions across all pages simultaneously." },
    ],
  },

  "page-numbers": {
    id: "page-numbers",
    title: "Add Page Numbers to PDF Online Free - Numbering Tool | PDFMarts",
    metaDescription: "Insert custom page numbers, header/footer pagination, and Bates numbering to PDF documents. Customize format, position, and font.",
    keywords: ["add page numbers to pdf", "number pdf pages", "bates numbering pdf", "paginate pdf online free"],
    h1: "Add Page Numbers to PDF",
    h2Subtitle: "Automatically insert professional page numbers and pagination to your PDF files.",
    category: "Edit PDF",
    features: [
      "Custom number formats (e.g. '1', 'Page 1 of N', '1/10')",
      "Position anywhere (Bottom-Center, Bottom-Right, Top-Right, etc.)",
      "Custom starting number and font sizes",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Choose your PDF document." },
      { name: "Select Position & Format", text: "Choose where and how you want numbers displayed." },
      { name: "Apply & Download", text: "Download your numbered PDF file." },
    ],
    faqs: [
      { question: "Can I start numbering from a specific number?", answer: "Yes, you can set the starting number offset to whatever value you need." },
    ],
  },

  "organize-pdf": {
    id: "organize-pdf",
    title: "Organize PDF Pages - Reorder, Rotate & Delete Pages Free | PDFMarts",
    metaDescription: "Visual drag-and-drop PDF page organizer. Reorder pages, rotate sideways pages, and delete unwanted pages all in one screen.",
    keywords: ["organize pdf", "reorder pdf pages", "sort pdf pages", "rearrange pdf", "pdf page organizer"],
    h1: "Organize PDF Pages",
    h2Subtitle: "Drag and drop to reorder, rotate, or remove pages from your document.",
    category: "Organize PDF",
    features: [
      "Visual grid of all PDF page thumbnails",
      "Drag-and-drop page reordering",
      "One-click page rotation and deletion",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select your PDF file to view page thumbnails." },
      { name: "Organize Pages", text: "Drag pages to reorder, click to rotate, or trash unwanted pages." },
      { name: "Export", text: "Download your reorganized PDF file." },
    ],
    faqs: [
      { question: "Can I organize large documents with many pages?", answer: "Yes, our high-performance thumbnail renderer handles multi-page PDFs smoothly." },
    ],
  },

  "delete-pages": {
    id: "delete-pages",
    title: "Delete Pages from PDF Online Free - Remove Unwanted Pages | PDFMarts",
    metaDescription: "Easily delete specific pages from any PDF document online for free. Select pages visually or enter page numbers to remove.",
    keywords: ["delete pages from pdf", "remove pdf pages", "delete pdf pages online free", "drop pages from pdf"],
    h1: "Delete Pages from PDF",
    h2Subtitle: "Quickly remove unnecessary pages from your PDF documents.",
    category: "Organize PDF",
    features: [
      "Select pages to delete with a single click",
      "Specify page numbers or ranges to remove",
      "Instant clean PDF generation",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Upload your document." },
      { name: "Select Pages", text: "Click on the pages you want to remove." },
      { name: "Download", text: "Download your streamlined PDF." },
    ],
    faqs: [
      { question: "Is the original PDF modified?", answer: "No, your original file on disk remains untouched. A new clean PDF is generated for download." },
    ],
  },

  "extract-pages": {
    id: "extract-pages",
    title: "Extract PDF Pages Online Free - Save Selected Pages | PDFMarts",
    metaDescription: "Extract specific pages from a PDF document and save them into a new standalone PDF file. Fast, free, and completely secure.",
    keywords: ["extract pages from pdf", "save selected pdf pages", "extract pdf", "separate pdf pages"],
    h1: "Extract Pages from PDF",
    h2Subtitle: "Select and extract only the pages you need into a new PDF document.",
    category: "Organize PDF",
    features: [
      "Extract single pages or custom ranges",
      "High fidelity vector extraction",
      "Zero server latency",
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select your source PDF." },
      { name: "Choose Pages", text: "Select the pages you want to extract." },
      { name: "Download New PDF", text: "Save your extracted pages as a new file." },
    ],
    faqs: [
      { question: "Can I extract multiple disjointed pages?", answer: "Yes, you can select any combination of pages to create your new PDF." },
    ],
  },

  "ocr-pdf": {
    id: "ocr-pdf",
    title: "OCR PDF Online Free - Optical Character Recognition & Text Extraction | PDFMarts",
    metaDescription: "Extract editable text from scanned PDFs and document images using high-accuracy client-side Optical Character Recognition (OCR). 100% free.",
    keywords: ["ocr pdf", "optical character recognition", "extract text from scanned pdf", "scanned pdf to text", "free ocr online"],
    h1: "OCR PDF & Extract Text",
    h2Subtitle: "Extract text from scanned PDFs and images using client-side OCR.",
    category: "OCR",
    features: [
      "Fast in-browser Optical Character Recognition",
      "Extract searchable and selectable text from scanned papers and photos",
      "Copy text to clipboard or download as text document",
      "100% private processing without uploading documents to cloud APIs",
    ],
    howToSteps: [
      { name: "Upload Scanned PDF", text: "Select the scanned PDF or image document." },
      { name: "Run OCR", text: "Click 'Run OCR' to recognize characters." },
      { name: "Copy or Download Text", text: "Copy the extracted text or download as a text file." },
    ],
    faqs: [
      { question: "Does OCR work with multi-page scanned documents?", answer: "Yes, the OCR engine analyzes each page sequentially and extracts all recognized text." },
      { question: "Is my scanned document uploaded to any server for OCR?", answer: "No! OCR runs directly on your machine's browser, maintaining total privacy for sensitive documents." },
    ],
  },

  "compress-pdf-target": {
    id: "compress-pdf-target",
    title: "Compress PDF to 200KB / 100KB Online Free - Exact Size Reducer | PDFMarts",
    metaDescription: "Compress PDF to specific size limits like 200KB, 100KB, or 500KB for government forms, job applications, and visa portals. 100% free and client-side private.",
    keywords: [
      "compress pdf to 200kb",
      "compress pdf to 100kb",
      "compress pdf to 500kb",
      "reduce pdf size to 200 kb online",
      "compress pdf for job application",
      "upsc pdf compressor",
      "visa portal pdf size reducer",
      "target size pdf compression"
    ],
    h1: "Compress PDF to 200KB, 100KB, or Custom Size",
    h2Subtitle: "Iteratively shrink PDF files to fit strict upload requirements for portals and exams.",
    category: "Edit PDF",
    features: [
      "Select exact target sizes (100KB, 200KB, 500KB, 1MB, or Custom KB)",
      "Smart multi-pass compression algorithm",
      "Ideal for SSC, UPSC, Government, University, and Visa portals",
      "100% secure client-side compression without uploading sensitive forms"
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Upload your application PDF or certificate." },
      { name: "Select Target Size", text: "Pick 200KB, 100KB, or enter custom KB." },
      { name: "Compress & Download", text: "Get an optimized PDF that meets your portal upload limit." }
    ],
    faqs: [
      { question: "How does target size compression work?", answer: "PDFMarts optimizes image streams, font encodings, and objects iteratively until the file size dips below your desired threshold." },
      { question: "Will my identity documents stay secure?", answer: "Yes, 100%. Processing takes place exclusively in your browser memory so your personal documents never get uploaded anywhere." }
    ]
  },

  "grayscale-pdf": {
    id: "grayscale-pdf",
    title: "Convert PDF to Grayscale / Black and White Online Free | PDFMarts",
    metaDescription: "Convert colored PDF files to black and white / grayscale. Save printer ink, reduce printing costs, and prepare documents for official court filings. Free & instant.",
    keywords: [
      "convert pdf to grayscale",
      "pdf to black and white",
      "b&w pdf converter",
      "save printer ink pdf",
      "court filing grayscale pdf",
      "remove color from pdf online"
    ],
    h1: "Convert PDF to Black and White (Grayscale)",
    h2Subtitle: "Remove all color elements to save printer ink and prepare documents for legal archives.",
    category: "Edit PDF",
    features: [
      "Converts color vector and raster assets to high-contrast grayscale",
      "Significantly cuts down color printing and copying costs",
      "Standard format required for court submissions and government archives",
      "Zero server latency, 100% in-browser conversion"
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select the color PDF document." },
      { name: "Choose Contrast", text: "Select standard grayscale or high-contrast B&W." },
      { name: "Download", text: "Save your ink-optimized black & white PDF." }
    ],
    faqs: [
      { question: "Why should I convert PDF to grayscale?", answer: "Grayscale PDFs print much cheaper on monochrome laser printers and comply with court filing standards." }
    ]
  },

  "flatten-pdf": {
    id: "flatten-pdf",
    title: "Flatten PDF Online Free - Lock Form Fields & Annotations | PDFMarts",
    metaDescription: "Flatten interactive PDF forms, digital signatures, and annotations into a single static layer. Prevent tampering and ensure consistent viewing across all devices.",
    keywords: [
      "flatten pdf",
      "flatten pdf online free",
      "lock pdf form fields",
      "make fillable pdf uneditable",
      "flatten pdf annotations",
      "secure pdf form submission"
    ],
    h1: "Flatten PDF Forms & Annotations",
    h2Subtitle: "Lock form fields, signatures, and markups into permanent, non-editable pages.",
    category: "Organize PDF",
    features: [
      "Locks all fillable form text fields, checkboxes, and radio buttons",
      "Merges all annotation layers into the base document",
      "Prevents recipients from modifying your completed forms",
      "Universal rendering across legacy PDF viewers"
    ],
    howToSteps: [
      { name: "Upload Fillable PDF", text: "Select your completed form or annotated document." },
      { name: "Flatten", text: "Click Flatten PDF to rasterize interactive layers." },
      { name: "Download", text: "Download your permanent, tamper-resistant PDF." }
    ],
    faqs: [
      { question: "Can a flattened PDF be edited again?", answer: "No, flattening merges interactive elements into static page graphics, preventing anyone from editing form fields." }
    ]
  },

  "pdf-to-txt": {
    id: "pdf-to-txt",
    title: "PDF to Text (.txt) Converter Online Free - Extract Clean Text | PDFMarts",
    metaDescription: "Extract all text from PDF documents into clean, editable TXT files. Super-fast in-browser text extraction with no character limits or subscriptions.",
    keywords: [
      "pdf to text",
      "pdf to txt converter",
      "extract text from pdf online",
      "convert pdf to txt free",
      "pdf text scraper"
    ],
    h1: "Convert PDF to Plain Text (.txt)",
    h2Subtitle: "Extract raw readable and editable text from any PDF document in milliseconds.",
    category: "Convert PDF",
    features: [
      "Fast Unicode text extraction with preserved line breaks",
      "Instant copy to clipboard or download as .txt file",
      "Processes hundreds of pages in seconds locally",
      "100% private with no server storage"
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Drop your PDF document." },
      { name: "Extract", text: "Click Convert to Text." },
      { name: "Download TXT", text: "Download your formatted text file." }
    ],
    faqs: [
      { question: "Does it extract text from scanned images?", answer: "For scanned image documents, use our 'OCR PDF' tool which uses optical character recognition." }
    ]
  },

  "pdf-metadata": {
    id: "pdf-metadata",
    title: "PDF Metadata Editor & Sanitizer - Remove Author & EXIF Online | PDFMarts",
    metaDescription: "Inspect, edit, or wipe PDF document metadata including Title, Author, Subject, Keywords, and Creator software. Protect privacy before sharing.",
    keywords: [
      "edit pdf metadata",
      "remove author from pdf",
      "clean pdf metadata",
      "pdf exif remover",
      "pdf properties editor",
      "sanitize pdf privacy"
    ],
    h1: "PDF Metadata Editor & Privacy Sanitizer",
    h2Subtitle: "View, update, or completely wipe tracking metadata and author information.",
    category: "Security",
    features: [
      "Inspect hidden document properties and creation timestamps",
      "1-Click 'Sanitize All Metadata' privacy wipe",
      "Edit Title, Author, Subject, Producer, and Keywords",
      "Ensures anonymous document distribution"
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select your PDF file to inspect properties." },
      { name: "Edit or Wipe", text: "Modify fields or click 'Wipe All Metadata'." },
      { name: "Download", text: "Save the sanitized, privacy-safe PDF." }
    ],
    faqs: [
      { question: "Why sanitize PDF metadata?", answer: "PDFs often contain author names, operating system info, company names, and internal file paths you may not want to expose publicly." }
    ]
  },

  "invert-pdf": {
    id: "invert-pdf",
    title: "Invert PDF Colors / Dark Mode PDF Online Free | PDFMarts",
    metaDescription: "Invert colors on PDF documents to create a high-contrast dark mode for night reading, saving battery on OLED screens, and reducing toner usage.",
    keywords: [
      "invert pdf colors",
      "pdf dark mode",
      "night mode pdf reader",
      "high contrast pdf",
      "invert black and white pdf online"
    ],
    h1: "Invert PDF Colors (Dark Mode)",
    h2Subtitle: "Convert bright white documents into high-contrast dark mode for comfortable night reading.",
    category: "Edit PDF",
    features: [
      "Inverts page background to dark and text to high-contrast white",
      "Reduces eye strain during late-night study sessions",
      "Saves power on mobile and laptop OLED displays",
      "Instant client-side color transformation"
    ],
    howToSteps: [
      { name: "Upload PDF", text: "Select any bright or light-themed PDF." },
      { name: "Invert", text: "Click Invert Colors to generate dark mode pages." },
      { name: "Download", text: "Download your night-friendly PDF document." }
    ],
    faqs: [
      { question: "Will the text still be crisp?", answer: "Yes, the inversion process retains sharp typography and vector clarity." }
    ]
  },

  "heic-webp-to-pdf": {
    id: "heic-webp-to-pdf",
    title: "HEIC & WEBP to PDF Converter Online Free | PDFMarts",
    metaDescription: "Convert modern smartphone HEIC photos, Google WebP graphics, and SVG vectors directly into standard PDF documents in your browser. 100% free.",
    keywords: [
      "heic to pdf",
      "webp to pdf",
      "svg to pdf",
      "iphone photo to pdf",
      "convert heic to pdf online free",
      "webp image to pdf"
    ],
    h1: "Convert HEIC, WebP & SVG to PDF",
    h2Subtitle: "Transform modern Apple HEIC photos and web formats into universal PDF files.",
    category: "Image Tools",
    features: [
      "Native support for iPhone HEIC/HEIF photos",
      "Convert WebP and SVG vector graphics seamlessly",
      "Combine multiple photos into a single organized PDF",
      "Preserves original full photographic resolution"
    ],
    howToSteps: [
      { name: "Upload Images", text: "Select your HEIC, WebP, SVG, or JPG images." },
      { name: "Arrange Order", text: "Drag to reorder pages as needed." },
      { name: "Convert & Download", text: "Download your unified, high-res PDF file." }
    ],
    faqs: [
      { question: "Can I combine multiple HEIC photos from my iPhone?", answer: "Yes, select multiple HEIC photos and they will be converted and merged into a single multi-page PDF." }
    ]
  },
};
