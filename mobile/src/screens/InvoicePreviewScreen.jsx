import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  User,
  Phone,
  MapPin,
  Wrench,
  CheckCircle2,
  Calendar,
  Receipt,
  Building2,
  Plus,
  Trash2,
  ShieldCheck,
  Mail,
  Hash,
  ChevronDown,
  ChevronRight,
  Info,
  Bell,
} from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Text } from "@components/ui/text";
import useTheme from "@hooks/useTheme";
import { useUpdateJobMutation } from "@services/api/jobApi";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function generateInvoiceNumber(jobId) {
  if (!jobId) return "INV-000000";
  return `INV-${jobId.slice(-6).toUpperCase()}`;
}

function computeLineTotal(item) {
  const qty = parseFloat(item.qty) || 0;
  const rate = parseFloat(item.rate) || 0;
  return qty * rate;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SectionLabel({ title, colors }) {
  return (
    <Text style={{ fontFamily: "Inter", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3, color: colors.secondary, marginBottom: 14 }}>
      {title}
    </Text>
  );
}

function Divider({ colors }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />;
}

function InfoRow({ icon, label, value, valueColor, colors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <View style={{ width: 30, alignItems: "center", paddingTop: 1 }}>{icon}</View>
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 }}>
          {label}
        </Text>
        <Text style={{ fontFamily: "Inter", fontSize: 12, color: valueColor || colors.textSecondary, fontWeight: "600", textAlign: "right", maxWidth: "55%", lineHeight: 18 }}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

function Card({ children, style, colors }) {
  return (
    <View style={[{ backgroundColor: colors.bgCard, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────
// PDF HTML Builder
// ─────────────────────────────────────────────
function buildPdfHtml({ job, invoiceNumber, lineItems, techInfo, grandTotal, subtotal }) {
  const customerName = job.customerId?.name ?? job.customerName ?? "N/A";
  const customerPhone = job.customerId?.phone ?? job.customerPhone ?? "N/A";
  const customerAddress = job.location?.address || "—";

  const techName = techInfo?.companyName || techInfo?.name || "TechServ Pro";
  const techPersonName = techInfo?.name || "Professional Technician";
  const techPhone = techInfo?.phone || "N/A";
  const techEmail = techInfo?.email || "";
  const techAddress = techInfo?.address || "";

  const statusColors = {
    completed: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    in_progress: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    pending: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  };
  const sc = statusColors[job.status] || statusColors.pending;
  const statusLabel = (job.status || "pending").replace("_", " ").toUpperCase();

  const lineItemRows = lineItems.map((item, i) => {
    const lineTotal = computeLineTotal(item);
    return `
      <tr class="${i % 2 === 1 ? "alt" : ""}">
        <td>
          <div class="item-name">${item.description || "—"}</div>
          ${item.note ? `<div class="item-note">${item.note}</div>` : ""}
        </td>
        <td class="right">${item.qty}</td>
        <td class="right">₹${parseFloat(item.rate || 0).toLocaleString("en-IN")}</td>
        <td class="right bold">₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111827; font-size: 13px; line-height: 1.5; }
    .page { max-width: 794px; margin: 0 auto; padding: 36px 40px; }

    /* ── Header ── */
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%); padding: 30px 32px; border-radius: 18px; color: #fff; margin-bottom: 24px; position: relative; overflow: hidden; }
    .header-orb1 { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.07); }
    .header-orb2 { position: absolute; bottom: -30px; left: 20px; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.05); }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .brand-block {}
    .brand-icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 8px; font-size: 22px; }
    .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
    .brand-tagline { font-size: 10px; opacity: 0.75; margin-top: 2px; letter-spacing: 0.5px; }
    .invoice-meta { text-align: right; }
    .invoice-label { font-size: 9px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
    .invoice-number { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-divider { border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 0 0 18px; }
    .header-bottom { display: flex; justify-content: space-between; align-items: center; }
    .date-label { font-size: 9px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
    .date-value { font-size: 13px; font-weight: 600; }
    .meta-group { display: flex; gap: 32px; }
    .status-pill { padding: 5px 16px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; border: 1px solid; }

    /* ── Billing Grid ── */
    .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .billing-card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; }
    .billing-tag { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .billing-tag.from { color: #4f46e5; }
    .billing-tag.to { color: #7c3aed; }
    .billing-name { font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 6px; }
    .billing-row { display: flex; align-items: center; gap: 7px; font-size: 11px; color: #6b7280; margin-bottom: 4px; }
    .billing-row .icon { font-size: 12px; }

    /* ── Service Info ── */
    .section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; }
    .service-card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .info-item label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; display: block; margin-bottom: 3px; }
    .info-item .val { font-size: 12px; font-weight: 600; color: #111827; }
    .info-item .val.purple { color: #4f46e5; }
    .info-item .val.green { color: #059669; }
    .text-block { margin-top: 14px; padding-top: 14px; border-top: 1px solid #f3f4f6; }
    .text-block label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; display: block; margin-bottom: 5px; }
    .text-block .val { font-size: 12px; color: #374151; line-height: 1.6; }
    .text-block .val.green { color: #059669; font-weight: 600; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    th { padding: 10px 12px; background: #f8f7ff; text-align: left; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    th.right { text-align: right; }
    td { padding: 11px 12px; font-size: 12px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    td.right { text-align: right; }
    td.bold { font-weight: 700; color: #111827; }
    td.muted { color: #9ca3af; font-size: 11px; }
    tr.alt td { background: #fafafe; }
    .item-name { font-weight: 600; color: #111827; }
    .item-note { font-size: 10px; color: #9ca3af; margin-top: 2px; }
    .table-card { border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; margin-bottom: 20px; }

    /* ── Totals ── */
    .totals-row { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-inner { width: 340px; }
    .grand-total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; color: #fff; margin-top: 10px; }
    .grand-total-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .grand-total-value { font-size: 22px; font-weight: 900; }

    /* ── Warranty ── */
    .warranty-card { border: 2px dashed #c4b5fd; border-radius: 14px; padding: 18px; background: #faf5ff; margin-bottom: 20px; }
    .warranty-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .warranty-icon { font-size: 20px; }
    .warranty-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #4f46e5; }
    .warranty-text { font-size: 13px; font-weight: 700; color: #1e1b4b; margin-bottom: 6px; }
    .warranty-note { font-size: 10px; color: #6d28d9; font-style: italic; line-height: 1.5; }

    /* ── Reminder ── */
    .reminder-card { border: 1px solid #d1fae5; border-radius: 14px; padding: 14px 18px; background: #f0fdf4; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
    .reminder-text { font-size: 12px; font-weight: 600; color: #065f46; }
    .reminder-date { font-size: 13px; font-weight: 800; color: #059669; }

    /* ── Terms ── */
    .terms-card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; margin-bottom: 24px; }
    .terms-list { list-style: none; padding: 0; }
    .terms-list li { font-size: 10px; color: #9ca3af; margin-bottom: 6px; padding-left: 14px; position: relative; line-height: 1.5; }
    .terms-list li::before { content: "•"; position: absolute; left: 0; color: #c4b5fd; font-size: 12px; top: -1px; }

    /* ── Signature ── */
    .signature-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .sig-block { text-align: center; }
    .sig-line { width: 160px; height: 1px; background: #374151; margin-bottom: 6px; }
    .sig-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .sig-name { font-size: 11px; font-weight: 700; color: #374151; margin-bottom: 2px; }

    /* ── Footer ── */
    .footer { text-align: center; padding-top: 20px; border-top: 2px solid #f3f4f6; }
    .footer-brand { font-size: 15px; font-weight: 800; color: #4f46e5; margin-bottom: 4px; }
    .footer-sub { font-size: 10px; color: #9ca3af; margin-bottom: 8px; }
    .footer-line { width: 40px; height: 3px; background: linear-gradient(90deg, #4f46e5, #9333ea); border-radius: 2px; margin: 0 auto; }
    .page-num { font-size: 9px; color: #d1d5db; margin-top: 14px; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-orb1"></div>
    <div class="header-orb2"></div>
    <div class="header-top">
      <div class="brand-block">
        <div class="brand-icon">🔧</div>
        <div class="brand-name">${techName}</div>
        <div class="brand-tagline">Professional Appliance Repair &amp; Maintenance</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-label">Invoice Number</div>
        <div class="invoice-number">${invoiceNumber}</div>
      </div>
    </div>
    <hr class="header-divider" />
    <div class="header-bottom">
      <div class="meta-group">
        <div>
          <div class="date-label">Issue Date</div>
          <div class="date-value">${formatDate(job.serviceDate)}</div>
        </div>
        <div>
          <div class="date-label">Payment Due</div>
          <div class="date-value">On Completion</div>
        </div>
        ${job._id ? `<div><div class="date-label">Job Ref #</div><div class="date-value">${job._id.slice(-6).toUpperCase()}</div></div>` : ""}
      </div>
      <div class="status-pill" style="background:${sc.bg};color:${sc.text};border-color:${sc.border};">${statusLabel}</div>
    </div>
  </div>

  <!-- Billing Grid -->
  <div class="billing-grid">
    <div class="billing-card">
      <div class="billing-tag from">From / Service Provider</div>
      <div class="billing-name">${techName}</div>
      ${techPersonName !== techName ? `<div class="billing-row">👤 ${techPersonName}</div>` : ""}
      <div class="billing-row">📞 ${techPhone}</div>
      ${techEmail ? `<div class="billing-row">✉️ ${techEmail}</div>` : ""}
      ${techAddress ? `<div class="billing-row">📍 ${techAddress}</div>` : ""}
    </div>
    <div class="billing-card">
      <div class="billing-tag to">Bill To / Customer</div>
      <div class="billing-name">${customerName}</div>
      <div class="billing-row">📞 ${customerPhone}</div>
      ${customerAddress !== "—" ? `<div class="billing-row">📍 ${customerAddress}</div>` : ""}
    </div>
  </div>

  <!-- Service Information -->
  <div class="service-card">
    <div class="section-title">Service Information</div>
    <div class="info-grid">
      <div class="info-item">
        <label>Appliance Type</label>
        <div class="val purple">${job.applianceType || "—"}</div>
      </div>
      <div class="info-item">
        <label>Service Date</label>
        <div class="val">${formatDate(job.serviceDate)}</div>
      </div>
      <div class="info-item">
        <label>Job Status</label>
        <div class="val" style="color:${sc.text}">${statusLabel}</div>
      </div>
      <div class="info-item">
        <label>Warranty</label>
        <div class="val">${job.warranty || "No Warranty"}</div>
      </div>
    </div>
    ${job.issue ? `<div class="text-block"><label>Issue Reported</label><div class="val">${job.issue}</div></div>` : ""}
    ${job.serviceDone ? `<div class="text-block"><label>Work Done / Resolution</label><div class="val green">${job.serviceDone}</div></div>` : ""}
  </div>

  <!-- Line Items Table -->
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th style="width:50%">Description</th>
          <th class="right" style="width:10%">Qty</th>
          <th class="right" style="width:16%">Rate (₹)</th>
          <th class="right" style="width:18%">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemRows}
        <tr>
          <td colspan="3" style="padding:14px 12px; text-align:right;"><strong style="font-size:13px;color:#111827;">Grand Total</strong></td>
          <td class="right bold" style="font-size:16px;color:#4f46e5;padding:14px 12px;">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Warranty Certificate -->
  ${job.warranty && job.warranty !== "No Warranty" ? `
  <div class="warranty-card">
    <div class="warranty-header">
      <div class="warranty-icon">🛡️</div>
      <div class="warranty-title">Service Warranty Certificate</div>
    </div>
    <div class="warranty-text">This service is covered by a <strong>${job.warranty}</strong> limited warranty from ${formatDate(job.serviceDate)}.</div>
    <div class="warranty-note">* Warranty covers the labour and replaced parts listed in this invoice. Warranty is void in case of physical damage, tampering, power surge damage, or misuse by the customer. Contact us immediately if issues recur within the warranty period.</div>
  </div>` : ""}

  <!-- Next Service Reminder -->
  ${job.nextReminderDate ? `
  <div class="reminder-card">
    <div style="font-size:22px;">🔔</div>
    <div>
      <div style="font-size:9px;color:#065f46;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Next Service Reminder</div>
      <div class="reminder-date">${formatDate(job.nextReminderDate)}</div>
      <div class="reminder-text">We recommend scheduling your next service visit on or before this date.</div>
    </div>
  </div>` : ""}

  <!-- Signature Row -->
  <div class="signature-row">
    <div class="sig-block">
      <div style="height:40px;"></div>
      <div class="sig-line"></div>
      <div class="sig-label">Customer Signature</div>
    </div>
    <div class="sig-block" style="text-align:right;">
      <div style="height:40px;"></div>
      <div class="sig-line" style="margin-left:auto;"></div>
      <div class="sig-name">${techName}</div>
      <div class="sig-label">Authorised Signatory</div>
    </div>
  </div>

  <!-- Terms & Conditions -->
  <div class="terms-card">
    <div class="section-title">Terms &amp; Conditions</div>
    <ul class="terms-list">
      <li>Payment is due on completion of service unless otherwise agreed in writing.</li>
      <li>Warranty is valid only for the specific fault repaired and parts replaced as listed above.</li>
      <li>Warranty is void if the appliance has been tampered with, subjected to power fluctuations, or physically damaged after service.</li>
      <li>Parts once fitted are non-returnable. Charges apply for re-visits not covered under warranty.</li>
      <li>This invoice is computer-generated and constitutes a valid tax document where GST is applicable.</li>
      <li>Disputes, if any, are subject to the jurisdiction of local courts only.</li>
    </ul>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">Thank you for choosing ${techName}! 🙏</div>
    <div class="footer-sub">We appreciate your trust and look forward to serving you again.</div>
    <div class="footer-line"></div>
    ${techPhone ? `<div class="page-num" style="margin-top:8px;">📞 ${techPhone}${techEmail ? `  ✉️ ${techEmail}` : ""}</div>` : ""}
    <div class="page-num">Invoice ${invoiceNumber} • Generated ${new Date().toLocaleDateString("en-IN")}</div>
  </div>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function InvoicePreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { job } = route.params ?? {};
  const { colors } = useTheme();
  const techUser = useSelector((state) => state.auth.user);

  const techName = techUser?.companyName || techUser?.name || "TechServ Pro";

  // ── Status config ──
  function getStatusConfig(status) {
    switch (status) {
      case "completed":
      case "paid":
        return { label: "PAID", color: colors.success, bg: colors.successBg, border: colors.successBorder };
      case "in_progress":
        return { label: "IN PROGRESS", color: colors.warningIcon, bg: colors.warningBg, border: colors.warningBorder };
      case "cancelled":
        return { label: "CANCELLED", color: colors.danger, bg: colors.dangerBg, border: colors.dangerBorder };
      default:
        return { label: "PENDING", color: colors.warningIcon, bg: colors.warningBg, border: colors.warningBorder };
    }
  }

  // ── Initial line items from job total ──
  function buildInitialLineItems() {
    if (!job) return [];
    
    if (job.lineItems && job.lineItems.length > 0) {
      return job.lineItems;
    }

    const base = parseFloat(job.amount) || 0;
    if (base > 0) {
      const diagRate = Math.max(50, Math.round(base * 0.20));
      const repairRate = Math.max(50, Math.round(base * 0.60));
      const partsAmt = Math.max(0, base - diagRate - repairRate);
      const items = [
        { id: "1", description: "Appliance Diagnosis & Inspection", qty: "1", rate: String(diagRate), note: "" },
        { id: "2", description: `Repair Service — ${job?.applianceType || "Appliance"}`, qty: "1", rate: String(repairRate), note: job?.serviceDone ? "Refer: Work Done section" : "" },
      ];
      if (partsAmt > 0) {
        items.push({ id: "3", description: "Spare Parts & Consumables", qty: "1", rate: String(partsAmt), note: "" });
      }
      return items;
    }

    if (job.diagnosticFee > 0) {
      return [
        { id: "1", description: "Diagnostic / Visiting Fee", qty: "1", rate: String(job.diagnosticFee), note: "" },
      ];
    }

    return [];
  }

  const [lineItems, setLineItems] = useState(buildInitialLineItems);
  const [showTerms, setShowTerms] = useState(false);
  const [updateJob, { isLoading: isSaving }] = useUpdateJobMutation();

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center", padding: 24 }} edges={["top"]}>
        <Receipt color={colors.primary} size={40} style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700", fontFamily: "Space Grotesk", marginBottom: 6 }}>No Invoice Data</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "Inter", textAlign: "center" }}>Please open an invoice from a job.</Text>
      </SafeAreaView>
    );
  }

  const invoiceNumber = generateInvoiceNumber(job._id);
  const statusConfig = getStatusConfig(job.status);
  const customerName = job.customerId?.name ?? job.customerName ?? "N/A";
  const customerPhone = job.customerId?.phone ?? job.customerPhone ?? "N/A";

  // ── Tax computation ──
  const subtotal = lineItems.reduce((s, i) => s + computeLineTotal(i), 0);
  const grandTotal = subtotal;

  // ── Line item handlers ──
  function handleAddRow() {
    setLineItems((prev) => [...prev, { id: String(Date.now()), description: "", qty: "1", rate: "0", note: "" }]);
  }

  function handleDeleteRow(id) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleChangeField(id, field, value) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  async function handleSaveInvoice() {
    try {
      await updateJob({
        id: job._id,
        lineItems,
        amount: grandTotal,
      }).unwrap();
      Alert.alert("Success", "Invoice details saved successfully.");
    } catch {
      Alert.alert("Error", "Failed to save invoice. Please try again.");
    }
  }

  // ── PDF actions ──
  async function handleGeneratePdf() {
    const html = buildPdfHtml({ job, invoiceNumber, lineItems, techInfo: techUser, grandTotal, subtotal });
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `Invoice ${invoiceNumber}` });
    } catch {
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    }
  }

  async function handlePrintPreview() {
    const html = buildPdfHtml({ job, invoiceNumber, lineItems, techInfo: techUser, grandTotal, subtotal });
    try {
      await Print.printAsync({ html });
    } catch {
      Alert.alert("Error", "Print failed. Please try again.");
    }
  }

  // ── Card wrapper ──
  // (Moved outside the component to prevent unmounting and focus loss in TextInputs)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />

      {/* ── Nav Bar ── */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, backgroundColor: colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: colors.borderMuted }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }} activeOpacity={0.7}>
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary, fontFamily: "Space Grotesk", letterSpacing: 2, textTransform: "uppercase" }}>
          Invoice Preview
        </Text>
        <TouchableOpacity onPress={handlePrintPreview} style={{ padding: 8 }} activeOpacity={0.7}>
          <FileText color={colors.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* ══ GRADIENT HEADER CARD ══ */}
        <LinearGradient colors={colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 22, padding: 22, marginBottom: 12, overflow: "hidden", position: "relative" }}>
          {/* Orb accents */}
          <View style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.07)" }} />
          <View style={{ position: "absolute", bottom: -20, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.05)" }} />

          {/* Brand + Status */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Wrench color="#fff" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: -0.3 }}>{techName}</Text>
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>Professional Appliance Services</Text>
            </View>
            <View style={{ backgroundColor: statusConfig.bg, borderWidth: 1, borderColor: statusConfig.border, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: statusConfig.color }} />
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 9, fontWeight: "800", color: statusConfig.color, letterSpacing: 0.8 }}>{statusConfig.label}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 16 }} />

          {/* Invoice number + dates */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <View>
              <Text style={{ fontFamily: "Inter", fontSize: 9, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Invoice Number</Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "800", color: "#fff" }}>{invoiceNumber}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Inter", fontSize: 9, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Issue Date</Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: "600", color: "#fff" }}>{formatDate(job.serviceDate)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontFamily: "Inter", fontSize: 9, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Payment Due</Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: "600", color: "#fff" }}>On Completion</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Inter", fontSize: 9, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Job Ref</Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: "600", color: "#fff" }}>#{job._id?.slice(-6).toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ══ BILLING CARDS ══ */}
        <View style={{ flexDirection: "row", marginBottom: 12, gap: 10 }}>
          {/* FROM */}
          <Card colors={colors} style={{ flex: 1, margin: 0 }}>
            <Text style={{ fontFamily: "Inter", fontSize: 8, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: colors.primary, marginBottom: 10 }}>FROM</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Building2 size={12} color={colors.primary} />
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: "700", color: colors.textPrimary, flex: 1 }} numberOfLines={1}>{techName}</Text>
            </View>
            {techUser?.name && techUser.name !== techName && (
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textDisabled, marginBottom: 3 }}>{techUser.name}</Text>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <Phone size={10} color={colors.secondary} />
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted }}>{techUser?.phone || "—"}</Text>
            </View>
            {techUser?.email ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <Mail size={10} color={colors.secondary} />
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted }} numberOfLines={1}>{techUser.email}</Text>
              </View>
            ) : null}
            {techUser?.gstNumber ? (
              <View style={{ marginTop: 6, backgroundColor: colors.primaryBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" }}>
                <Text style={{ fontFamily: "Inter", fontSize: 9, fontWeight: "700", color: colors.primary }}>GSTIN: {techUser.gstNumber}</Text>
              </View>
            ) : null}
          </Card>

          {/* BILL TO */}
          <Card colors={colors} style={{ flex: 1, margin: 0 }}>
            <Text style={{ fontFamily: "Inter", fontSize: 8, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: colors.secondary, marginBottom: 10 }}>BILL TO</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <User size={12} color={colors.secondary} />
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: "700", color: colors.textPrimary, flex: 1 }} numberOfLines={1}>{customerName}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <Phone size={10} color={colors.secondary} />
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted }}>{customerPhone}</Text>
            </View>
            {job?.location?.address ? (
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 2 }}>
                <MapPin size={10} color={colors.textMuted} style={{ marginTop: 1 }} />
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, flex: 1, lineHeight: 15 }} numberOfLines={3}>{job.location.address}</Text>
              </View>
            ) : null}
          </Card>
        </View>

        {/* ══ SERVICE INFORMATION ══ */}
        <Card colors={colors}>
          <SectionLabel title="Service Information" colors={colors} />
          <InfoRow icon={<Wrench size={14} color={colors.primary} />} label="Appliance" value={job.applianceType} valueColor={colors.primary} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon={<Calendar size={14} color={colors.secondary} />} label="Service Date" value={formatDate(job.serviceDate)} valueColor={colors.textPrimary} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon={<Hash size={14} color={colors.secondary} />} label="Issue Reported" value={job.issue} colors={colors} />
          {job.serviceDone ? (
            <>
              <Divider colors={colors} />
              <InfoRow icon={<CheckCircle2 size={14} color={colors.success} />} label="Work Done" value={job.serviceDone} valueColor={colors.success} colors={colors} />
            </>
          ) : null}
          <Divider colors={colors} />
          <InfoRow icon={<ShieldCheck size={14} color={colors.secondary} />} label="Warranty" value={job.warranty || "No Warranty"} valueColor={colors.secondary} colors={colors} />
          {job.nextReminderDate ? (
            <>
              <Divider colors={colors} />
              <InfoRow icon={<Bell size={14} color={colors.success} />} label="Next Service" value={formatDate(job.nextReminderDate)} valueColor={colors.success} colors={colors} />
            </>
          ) : null}
        </Card>

        {/* ══ LINE ITEMS TABLE ══ */}
        <Card colors={colors}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionLabel title="Service Breakdown" colors={colors} />
            <TouchableOpacity onPress={handleAddRow} style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.primaryBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.primaryBorder }} activeOpacity={0.75}>
              <Plus size={12} color={colors.primary} />
              <Text style={{ fontFamily: "Inter", fontSize: 10, fontWeight: "700", color: colors.primary }}>Add Row</Text>
            </TouchableOpacity>
          </View>

          {/* Table Header */}
          <View style={{ flexDirection: "row", backgroundColor: colors.bgSurface, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, marginBottom: 4 }}>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 9, fontWeight: "700", color: colors.secondary, flex: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</Text>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 9, fontWeight: "700", color: colors.secondary, width: 36, textAlign: "center", textTransform: "uppercase" }}>Qty</Text>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 9, fontWeight: "700", color: colors.secondary, width: 68, textAlign: "right", textTransform: "uppercase" }}>Rate ₹</Text>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 9, fontWeight: "700", color: colors.secondary, width: 68, textAlign: "right", textTransform: "uppercase" }}>Amt ₹</Text>
            <View style={{ width: 28 }} />
          </View>

          {lineItems.map((item, idx) => {
            const lineTotal = computeLineTotal(item);
            return (
              <View key={item.id} style={{ flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4, alignItems: "center", borderRadius: 6, backgroundColor: idx % 2 === 1 ? colors.bgSurface : "transparent" }}>
                <TextInput
                  style={{ fontFamily: "Inter", fontSize: 11, color: colors.textPrimary, flex: 1, paddingVertical: 4, paddingHorizontal: 2, minHeight: 32 }}
                  value={item.description}
                  onChangeText={(v) => handleChangeField(item.id, "description", v)}
                  placeholder="Service description"
                  placeholderTextColor={colors.textDisabled}
                  multiline
                />
                <TextInput
                  style={{ fontFamily: "Inter", fontSize: 11, color: colors.textPrimary, width: 36, textAlign: "center", paddingVertical: 4 }}
                  value={String(item.qty)}
                  onChangeText={(v) => handleChangeField(item.id, "qty", v)}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.textDisabled}
                />
                <TextInput
                  style={{ fontFamily: "Inter", fontSize: 11, color: colors.textPrimary, width: 68, textAlign: "right", paddingVertical: 4 }}
                  value={String(item.rate)}
                  onChangeText={(v) => handleChangeField(item.id, "rate", v)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textDisabled}
                />
                <Text style={{ fontFamily: "Space Grotesk", fontSize: 11, color: colors.textPrimary, fontWeight: "700", width: 68, textAlign: "right", paddingRight: 2 }}>
                  {lineTotal.toFixed(0)}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteRow(item.id)} style={{ width: 28, alignItems: "center", justifyContent: "center" }} activeOpacity={0.7}>
                  <Trash2 size={13} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}

          {lineItems.length === 0 && (
            <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textDisabled, textAlign: "center", paddingVertical: 16, fontStyle: "italic" }}>
              No items. Tap &quot;Add Row&quot; to add a service line.
            </Text>
          )}
        </Card>

        {/* ══ TAX & TOTALS ══ */}
        <Card colors={colors}>
          <SectionLabel title="Payment Summary" colors={colors} />

          {/* Grand Total */}
          <LinearGradient colors={[colors.primaryBg, colors.secondaryBg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textDisabled, textTransform: "uppercase", letterSpacing: 2 }}>Grand Total</Text>
              </View>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 26, fontWeight: "900", color: colors.textPrimary }}>{formatCurrency(grandTotal)}</Text>
            </View>
          </LinearGradient>
        </Card>

        {/* ══ WARRANTY CERTIFICATE ══ */}
        {job.warranty && job.warranty !== "No Warranty" ? (
          <View style={{ borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: colors.primaryBorder, borderStyle: "dashed", backgroundColor: colors.primaryBg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={18} color="#fff" />
              </View>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 11, fontWeight: "800", color: colors.primary, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Service Warranty Certificate
              </Text>
            </View>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 }}>
              {job.warranty} Limited Warranty
            </Text>
            <Text style={{ fontFamily: "Inter", fontSize: 11, color: colors.textMuted, lineHeight: 17 }}>
              From: {formatDate(job.serviceDate)} · Covers labour & parts replaced as listed above.{"\n"}Void in case of physical damage, power fluctuations, or tampering.
            </Text>
          </View>
        ) : null}

        {/* ══ TERMS & CONDITIONS ══ */}
        <Card colors={colors}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }} onPress={() => setShowTerms(!showTerms)} activeOpacity={0.7}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Info size={14} color={colors.textDisabled} />
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 11, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>
                Terms &amp; Conditions
              </Text>
            </View>
            {showTerms ? <ChevronDown size={14} color={colors.textDisabled} /> : <ChevronRight size={14} color={colors.textDisabled} />}
          </TouchableOpacity>

          {showTerms && (
            <View style={{ marginTop: 14, gap: 8 }}>
              {[
                "Payment is due on completion of service unless otherwise agreed in writing.",
                "Warranty is valid only for the specific fault repaired and parts replaced as listed in this invoice.",
                "Warranty is void if the appliance is tampered with, subjected to power fluctuations, or physically damaged after service.",
                "Parts once fitted are non-returnable. Charges apply for re-visits not covered under warranty.",
                "This is a computer-generated invoice and constitutes a valid tax document where GST is applicable.",
                "Disputes, if any, are subject to the jurisdiction of local courts only.",
              ].map((term, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primaryBorder, marginTop: 5, flexShrink: 0 }} />
                  <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textDisabled, lineHeight: 16, flex: 1 }}>{term}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* ══ THANK YOU ══ */}
        <View style={{ alignItems: "center", padding: 24, marginBottom: 12, backgroundColor: colors.bgCard, borderRadius: 18, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 30, marginBottom: 8 }}>🙏</Text>
          <Text style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: "700", color: colors.primary, marginBottom: 4 }}>
            Thank you, {customerName.split(" ")[0]}!
          </Text>
          <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textDisabled, textAlign: "center" }}>
            Thank you for choosing {techName}.{"\n"}We look forward to serving you again.
          </Text>
        </View>

        {/* ══ ACTION BUTTONS ══ */}
        <TouchableOpacity onPress={handleSaveInvoice} disabled={isSaving} activeOpacity={0.8} style={{ marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.primaryBorder, backgroundColor: colors.primaryBg, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <CheckCircle2 color={colors.primary} size={18} />
          <Text style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: "800", color: colors.primary, textTransform: "uppercase", letterSpacing: 2 }}>
            {isSaving ? "Saving..." : "Save Invoice Details"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGeneratePdf} activeOpacity={0.85} style={{ marginBottom: 12, borderRadius: 16, overflow: "hidden", shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 }}>
          <LinearGradient colors={colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 }}>
            <Download color="#fff" size={18} />
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: "800", color: "#fff", textTransform: "uppercase", letterSpacing: 2 }}>
              Download &amp; Share PDF
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrintPreview} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, marginBottom: 4 }}>
          <Share2 color={colors.secondary} size={18} />
          <Text style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: "700", color: colors.secondary, textTransform: "uppercase", letterSpacing: 2 }}>
            Print / Preview Invoice
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
