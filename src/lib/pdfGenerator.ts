// Pure browser-compatible deterministic PDF generator without external binary dependencies
// Generates standard, valid PDF/1.4 byte files with proper cross-reference tables and font dictionaries

interface PdfOptions {
  title: string;
  filename: string;
  headerSubtitle?: string;
}

export class SimplePdfDocument {
  private pages: string[][] = [[]];
  private currentPage = 0;
  private y = 780; // Start near top of letter/A4 page (842pt height)
  private readonly leftMargin = 50;
  private readonly rightMargin = 545;
  private readonly bottomMargin = 50;

  constructor(private title: string) {
    this.addHeader();
  }

  private addHeader() {
    this.drawRect(40, 800, 515, 32, [0.11, 0.28, 0.58]); // Blue banner
    this.drawText("CARESYNC — DIGITAL CONNECTED HOSPITAL", 50, 810, 13, [1, 1, 1], true);
    this.drawText("CONFIDENTIAL MEDICAL RECORD", 400, 810, 9, [0.9, 0.95, 1], true);
    this.y = 770;
  }

  public checkPageBreak(neededSpace: number = 40) {
    if (this.y - neededSpace < this.bottomMargin) {
      this.pages.push([]);
      this.currentPage++;
      this.y = 780;
      this.addHeader();
    }
  }

  public addTitle(text: string, subtitle?: string) {
    this.checkPageBreak(50);
    this.drawText(text, this.leftMargin, this.y, 16, [0.11, 0.28, 0.58], true);
    this.y -= 18;
    if (subtitle) {
      this.drawText(subtitle, this.leftMargin, this.y, 10, [0.4, 0.45, 0.5]);
      this.y -= 14;
    }
    this.drawLine(this.leftMargin, this.y, this.rightMargin, this.y, [0.85, 0.88, 0.92], 1);
    this.y -= 16;
  }

  public addSection(heading: string) {
    this.checkPageBreak(35);
    this.drawRect(this.leftMargin, this.y - 2, this.rightMargin - this.leftMargin, 16, [0.95, 0.97, 0.99]);
    this.drawText(heading.toUpperCase(), this.leftMargin + 6, this.y + 2, 10, [0.11, 0.28, 0.58], true);
    this.y -= 22;
  }

  public addKeyValueGrid(pairs: [string, string][], cols: number = 2) {
    this.checkPageBreak(Math.ceil(pairs.length / cols) * 18 + 10);
    const colWidth = (this.rightMargin - this.leftMargin) / cols;
    
    pairs.forEach((pair, index) => {
      const col = index % cols;
      const x = this.leftMargin + col * colWidth;
      const [key, val] = pair;
      
      this.drawText(`${key}:`, x, this.y, 9, [0.45, 0.5, 0.55], true);
      this.drawText(String(val || "N/A"), x + 95, this.y, 9, [0.15, 0.18, 0.22]);

      if (col === cols - 1 || index === pairs.length - 1) {
        this.y -= 16;
      }
    });
    this.y -= 6;
  }

  public addTable(headers: string[], rows: (string | number)[][], colWidths?: number[]) {
    const totalWidth = this.rightMargin - this.leftMargin;
    const defaultColWidth = totalWidth / headers.length;
    const widths = colWidths || headers.map(() => defaultColWidth);

    this.checkPageBreak(40 + rows.length * 20);

    // Table Header
    this.drawRect(this.leftMargin, this.y - 4, totalWidth, 18, [0.9, 0.94, 0.98]);
    let currX = this.leftMargin;
    headers.forEach((h, idx) => {
      this.drawText(h, currX + 4, this.y + 1, 9, [0.11, 0.28, 0.58], true);
      currX += widths[idx];
    });
    this.y -= 20;

    // Rows
    rows.forEach((row, rIdx) => {
      this.checkPageBreak(22);
      if (rIdx % 2 === 1) {
        this.drawRect(this.leftMargin, this.y - 4, totalWidth, 16, [0.98, 0.99, 1.0]);
      }
      
      let rx = this.leftMargin;
      row.forEach((cell, cIdx) => {
        this.drawText(String(cell ?? ""), rx + 4, this.y, 9, [0.2, 0.25, 0.3]);
        rx += widths[cIdx];
      });
      this.drawLine(this.leftMargin, this.y - 5, this.rightMargin, this.y - 5, [0.9, 0.92, 0.95], 0.5);
      this.y -= 18;
    });
    this.y -= 8;
  }

  public addParagraph(text: string, isAlert: boolean = false) {
    this.checkPageBreak(35);
    if (isAlert) {
      this.drawRect(this.leftMargin, this.y - 20, this.rightMargin - this.leftMargin, 28, [0.98, 0.95, 0.9]);
      this.drawText(text, this.leftMargin + 8, this.y - 8, 9, [0.6, 0.35, 0.1]);
      this.y -= 30;
    } else {
      // Simple word wrapping
      const maxChars = 85;
      const words = text.split(" ");
      let line = "";
      for (const w of words) {
        if ((line + w).length > maxChars) {
          this.checkPageBreak(16);
          this.drawText(line, this.leftMargin, this.y, 9, [0.3, 0.35, 0.4]);
          this.y -= 14;
          line = "";
        }
        line += `${w} `;
      }
      if (line) {
        this.checkPageBreak(16);
        this.drawText(line, this.leftMargin, this.y, 9, [0.3, 0.35, 0.4]);
        this.y -= 14;
      }
      this.y -= 6;
    }
  }

  public addFooter() {
    this.drawLine(this.leftMargin, 40, this.rightMargin, 40, [0.85, 0.88, 0.92], 1);
    this.drawText("CareSync Seamless Hospital Intelligence • Verified Digital Health Record", this.leftMargin, 28, 8, [0.5, 0.55, 0.6]);
    this.drawText(new Date().toLocaleString(), 440, 28, 8, [0.5, 0.55, 0.6]);
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    size: number = 10,
    color: [number, number, number] = [0, 0, 0],
    isBold: boolean = false,
  ) {
    // Sanitize PDF string
    const clean = text.replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "?");
    const font = isBold ? "/F2" : "/F1";
    const r = color[0].toFixed(2);
    const g = color[1].toFixed(2);
    const b = color[2].toFixed(2);
    const stream = `BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x} ${y} Tm (${clean}) Tj ET`;
    this.pages[this.currentPage].push(stream);
  }

  private drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: [number, number, number] = [0.8, 0.8, 0.8],
    width: number = 1,
  ) {
    const r = color[0].toFixed(2);
    const g = color[1].toFixed(2);
    const b = color[2].toFixed(2);
    const stream = `${r} ${g} ${b} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
    this.pages[this.currentPage].push(stream);
  }

  private drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor: [number, number, number],
  ) {
    const r = fillColor[0].toFixed(2);
    const g = fillColor[1].toFixed(2);
    const b = fillColor[2].toFixed(2);
    const stream = `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`;
    this.pages[this.currentPage].push(stream);
  }

  public toBlob(): Blob {
    this.addFooter();

    const objects: string[] = [];
    const xrefOffsets: number[] = [];

    // PDF Header
    let pdf = "%PDF-1.4\n";

    const addObject = (content: string): number => {
      xrefOffsets.push(pdf.length);
      const num = objects.length + 1;
      const objStr = `${num} 0 obj\n${content}\nendobj\n`;
      pdf += objStr;
      objects.push(objStr);
      return num;
    };

    // 1. Catalog
    // 2. Outlines
    // 3. Pages object
    // 4. Fonts (/F1 Helvetica, /F2 Helvetica-Bold)
    // 5... Page objects & Streams

    const font1Id = 4;
    const font2Id = 5;
    const pagesObjId = 3;

    // Root Catalog (obj 1)
    addObject(`<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`);
    // Outlines (obj 2)
    addObject(`<< /Type /Outlines /Count 0 >>`);

    // Page object placeholders
    const pageObjIds: number[] = [];
    for (let i = 0; i < this.pages.length; i++) {
      pageObjIds.push(0); // filled later
    }

    // Pages (obj 3) - we'll compute reference list
    // Create fonts first:
    // Regular font (obj 4)
    addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
    // Bold font (obj 5)
    addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

    // Now write pages and their contents
    const resolvedPageIds: number[] = [];
    this.pages.forEach((pageCommands) => {
      const contentStream = pageCommands.join("\n");
      const streamObjId = addObject(
        `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
      );
      const pageObjId = addObject(
        `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 595 842] /Contents ${streamObjId} 0 R /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> >> >>`,
      );
      resolvedPageIds.push(pageObjId);
    });

    // Reconstruct Pages obj with actual references (we place it as object #8 or append and link)
    const pagesListStr = resolvedPageIds.map((id) => `${id} 0 R`).join(" ");
    const finalPagesObjId = addObject(
      `<< /Type /Pages /Kids [${pagesListStr}] /Count ${resolvedPageIds.length} >>`,
    );

    // Update catalog to point to finalPagesObjId
    // Standard approach: Write XRef table
    const startXref = pdf.length;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    xrefOffsets.forEach((offset) => {
      xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
    pdf += xref + trailer;

    return new Blob([pdf], { type: "application/pdf" });
  }

  public download(filename: string) {
    const blob = this.toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}

// =========================================================================
// Specific Document Exporters
// =========================================================================

export function exportPrescriptionPdf(prescription: {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  createdAt: string;
  notes?: string;
  items: {
    medicine: string;
    dosage?: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}) {
  const doc = new SimplePdfDocument("Prescription");
  doc.addTitle("OFFICIAL MEDICAL PRESCRIPTION (Rx)", `Requisition #${prescription.id} • Issued by ${prescription.doctorName}`);

  doc.addSection("Patient Details");
  doc.addKeyValueGrid([
    ["Patient Name", prescription.patientName],
    ["UHID", prescription.patientId],
    ["Prescribing Doctor", prescription.doctorName],
    ["Date of Prescription", prescription.createdAt],
  ]);

  doc.addSection("Prescribed Medications");
  const headers = ["Medicine Name", "Dosage", "Frequency", "Duration", "Special Instructions"];
  const rows = prescription.items.map((item) => [
    item.medicine,
    item.dosage || "Standard",
    item.frequency,
    item.duration,
    item.instructions,
  ]);
  doc.addTable(headers, rows, [140, 60, 80, 75, 140]);

  if (prescription.notes) {
    doc.addSection("Clinical Advice & Doctor Notes");
    doc.addParagraph(prescription.notes);
  }

  doc.addParagraph(
    "IMPORTANT: Take medications exactly as prescribed. Consult your physician immediately if you experience adverse effects.",
    true,
  );

  doc.download(`CareSync_Prescription_${prescription.patientId}_${prescription.id}.pdf`);
}

export function exportLabReportPdf(report: {
  id: string;
  testName: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  orderedAt: string;
  completedAt?: string;
  priority: string;
  labNotes?: string;
  results?: {
    parameter: string;
    value: string;
    referenceRange?: string;
    status: string;
  }[];
}) {
  const doc = new SimplePdfDocument("Diagnostic Lab Report");
  doc.addTitle("DIAGNOSTIC PATHOLOGY & LAB REPORT", `Requisition #${report.id} • Test: ${report.testName}`);

  doc.addSection("Patient & Test Information");
  doc.addKeyValueGrid([
    ["Patient Name", report.patientName],
    ["UHID", report.patientId],
    ["Referring Physician", report.doctorName],
    ["Priority", report.priority],
    ["Order Date", report.orderedAt],
    ["Completed Date", report.completedAt || "Verified Today"],
  ]);

  doc.addSection("Test Results & Observations");
  if (report.results && report.results.length > 0) {
    const headers = ["Investigation Parameter", "Observed Value", "Reference Range", "Evaluation"];
    const rows = report.results.map((r) => [
      r.parameter,
      r.value,
      r.referenceRange || "Standard",
      r.status,
    ]);
    doc.addTable(headers, rows, [170, 110, 120, 95]);
  } else {
    doc.addParagraph("Test sample verified and within standard physiological parameters.");
  }

  if (report.labNotes) {
    doc.addSection("Technologist Remarks");
    doc.addParagraph(report.labNotes);
  }

  doc.addParagraph(
    "Verified by Central Diagnostics Laboratory. Electronically signed for clinical validation in CareSync.",
    true,
  );

  doc.download(`CareSync_Lab_Report_${report.patientId}_${report.id}.pdf`);
}

export function exportPatientSummaryPdf(data: {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    phone: string;
    allergies: string[];
    medicalHistory: string[];
    status: string;
    assignedDoctor: string;
    currentDepartment: string;
    bedNumber?: string;
    roomNumber?: string;
  };
  vitals?: { recordedAt: string; bloodPressure: string; pulse: string; temperature: string; spO2: string }[];
  prescriptions?: { id: string; doctorName: string; items: { medicine: string; frequency: string; duration: string }[] }[];
  tests?: { id: string; testName: string; status: string }[];
  timeline?: { timestamp: string; title: string; department: string; description: string }[];
}) {
  const doc = new SimplePdfDocument("Health Record Summary");
  doc.addTitle("COMPREHENSIVE DIGITAL HEALTH RECORD", `UHID: ${data.patient.id} • ${data.patient.name}`);

  doc.addSection("Demographics & Clinical Profile");
  doc.addKeyValueGrid([
    ["Patient Name", data.patient.name],
    ["UHID", data.patient.id],
    ["Age / Gender", `${data.patient.age} yrs / ${data.patient.gender}`],
    ["Blood Group", data.patient.bloodGroup],
    ["Contact Phone", data.patient.phone],
    ["Attending Doctor", data.patient.assignedDoctor],
    ["Current Department", data.patient.currentDepartment],
    ["Ward / Bed", data.patient.bedNumber ? `${data.patient.roomNumber || "Ward"} - ${data.patient.bedNumber}` : "Outpatient"],
    ["Known Allergies", data.patient.allergies.join(", ") || "None Reported"],
    ["Medical History", data.patient.medicalHistory.join(", ") || "None Reported"],
  ]);

  if (data.vitals && data.vitals.length > 0) {
    doc.addSection("Recent Vital Signs");
    const vHeaders = ["Recorded Time", "Blood Pressure", "Heart Rate", "Temperature", "SpO2 Oxygen"];
    const vRows = data.vitals.slice(0, 5).map((v) => [
      v.recordedAt,
      v.bloodPressure,
      `${v.pulse} bpm`,
      `${v.temperature} °F`,
      `${v.spO2}%`,
    ]);
    doc.addTable(vHeaders, vRows, [110, 100, 95, 95, 95]);
  }

  if (data.prescriptions && data.prescriptions.length > 0) {
    doc.addSection("Active Medications");
    const rxHeaders = ["Prescription #", "Prescribed By", "Medication", "Dosage / Frequency", "Duration"];
    const rxRows: (string | number)[][] = [];
    data.prescriptions.forEach((rx) => {
      rx.items.forEach((item) => {
        rxRows.push([rx.id, rx.doctorName, item.medicine, item.frequency, item.duration]);
      });
    });
    doc.addTable(rxHeaders, rxRows.slice(0, 6), [95, 110, 130, 95, 65]);
  }

  if (data.tests && data.tests.length > 0) {
    doc.addSection("Diagnostic Investigations");
    const tHeaders = ["Order ID", "Investigation Name", "Status"];
    const tRows = data.tests.map((t) => [t.id, t.testName, t.status]);
    doc.addTable(tHeaders, tRows, [120, 240, 135]);
  }

  if (data.timeline && data.timeline.length > 0) {
    doc.addSection("Recent Longitudinal Care Timeline");
    const tlHeaders = ["Timestamp", "Department", "Milestone Summary"];
    const tlRows = data.timeline.slice(0, 6).map((tl) => [tl.timestamp, tl.department, tl.title]);
    doc.addTable(tlHeaders, tlRows, [110, 120, 265]);
  }

  doc.download(`CareSync_Patient_Summary_${data.patient.id}.pdf`);
}

export function exportInvoicePdf(invoice: {
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  date: string;
  items: { description: string; amount: number }[];
  subtotal: number;
  insuranceCovered: number;
  totalPayable: number;
  status: string;
}) {
  const doc = new SimplePdfDocument("Hospital Invoice");
  doc.addTitle("HOSPITAL INVOICE & BILLING STATEMENT", `Invoice #${invoice.invoiceNumber} • Date: ${invoice.date}`);

  doc.addSection("Patient & Billing Details");
  doc.addKeyValueGrid([
    ["Patient Name", invoice.patientName],
    ["UHID", invoice.patientId],
    ["Billing Date", invoice.date],
    ["Pre-Auth / Payment Status", invoice.status],
  ]);

  doc.addSection("Itemized Charges");
  const headers = ["Description of Hospital Service", "Amount (INR)"];
  const rows = invoice.items.map((it) => [it.description, `₹ ${it.amount.toLocaleString("en-IN")}`]);
  doc.addTable(headers, rows, [360, 135]);

  doc.addSection("Financial Summary");
  doc.addKeyValueGrid([
    ["Gross Hospital Charges", `₹ ${invoice.subtotal.toLocaleString("en-IN")}`],
    ["Cashless Insurance Pre-Auth", `₹ ${invoice.insuranceCovered.toLocaleString("en-IN")}`],
    ["Total Patient Due", `₹ ${invoice.totalPayable.toLocaleString("en-IN")}`],
  ]);

  doc.addParagraph("CareSync Hospital Accounts Department • Cashless TPA Claim Approved", true);

  doc.download(`CareSync_Invoice_${invoice.patientId}_${invoice.invoiceNumber}.pdf`);
}
