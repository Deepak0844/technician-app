import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useUpdateJobMutation } from "@services/api/jobApi";
import { JobStatuses, PaymentMethods } from "@constants/appConstants";
import { formatDate, formatCurrency } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";
import { Text } from "@components/ui/text";

// Icons
import {
  ArrowLeft,
  Download,
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
  Bell,
  MessageCircle,
  Banknote,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronRight,
  Info,
  Hash,
  IndianRupee,
  Printer,
  Save,
} from "lucide-react-native";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
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
// PDF HTML Builder — Premium redesign
// ─────────────────────────────────────────────
function buildPdfHtml({ job, invoiceNumber, lineItems, techInfo, grandTotal }) {
  const partsUsed = job.partsUsed || [];
  const customerName = job.customerId?.name ?? job.customerName ?? "N/A";
  const customerPhone = job.customerId?.phone ?? job.customerPhone ?? "N/A";
  const customerAddress = job.location?.address || "";

  const techName = techInfo?.companyName || techInfo?.name || "TechServ Pro";
  const techPersonName = techInfo?.name || "";
  const techPhone = techInfo?.phone || "";
  const techEmail = techInfo?.email || "";
  const techAddress = techInfo?.address || "";
  const gstNumber = techInfo?.gstNumber || "";

  const statusMeta = {
    completed: {
      bg: "#dcfce7",
      text: "#15803d",
      border: "#86efac",
      label: "COMPLETED",
    },
    in_progress: {
      bg: "#fef9c3",
      text: "#a16207",
      border: "#fde047",
      label: "IN PROGRESS",
    },
    pending: {
      bg: "#fef9c3",
      text: "#a16207",
      border: "#fde047",
      label: "PENDING",
    },
    cancelled: {
      bg: "#fee2e2",
      text: "#b91c1c",
      border: "#fca5a5",
      label: "CANCELLED",
    },
    paid: { bg: "#dcfce7", text: "#15803d", border: "#86efac", label: "PAID" },
  };
  const sc = statusMeta[job.status] || statusMeta.pending;

  const lineItemRows = lineItems
    .map(
      (item, i) => `
      <tr>
        <td class="desc${i % 2 === 1 ? " stripe" : ""}">
          <span class="item-name">${item.description || "—"}</span>
          ${item.note ? `<span class="item-note">${item.note}</span>` : ""}
        </td>
        <td class="center${i % 2 === 1 ? " stripe" : ""}">${item.qty}</td>
        <td class="right${i % 2 === 1 ? " stripe" : ""}">₹${Number(item.rate || 0).toLocaleString("en-IN")}</td>
        <td class="right amount${i % 2 === 1 ? " stripe" : ""}">₹${computeLineTotal(item).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>`,
    )
    .join("");

  const partsRows = partsUsed
    .map(
      (part, i) => `
      <tr>
        <td class="desc${i % 2 === 1 ? " stripe" : ""}">
          <span class="item-name">${part.name || "Part"}</span>
          ${part.warranty ? `<span class="item-note">Warranty: ${part.warranty}</span>` : ""}
        </td>
        <td class="center${i % 2 === 1 ? " stripe" : ""}">${part.quantity}</td>
        <td class="right${i % 2 === 1 ? " stripe" : ""}">₹${Number(part.price || 0).toLocaleString("en-IN")}</td>
        <td class="right amount${i % 2 === 1 ? " stripe" : ""}">₹${(Number(part.price || 0) * Number(part.quantity || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>`,
    )
    .join("");

  const subtotal = lineItems.reduce((s, i) => s + computeLineTotal(i), 0);
  const partsTotal = partsUsed.reduce(
    (s, p) => s + Number(p.price || 0) * Number(p.quantity || 0),
    0,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Invoice ${invoiceNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f0f0f8;color:#1a1a2e;font-size:13px;line-height:1.55;}
  .page{max-width:794px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);}
  .header{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%);padding:32px 36px 28px;position:relative;overflow:hidden;}
  .orb1{position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.06);}
  .orb2{position:absolute;bottom:-40px;left:10px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,0.04);}
  .h-top{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;}
  .brand-icon{width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.2);}
  .brand-name{font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;line-height:1.2;}
  .brand-sub{font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px;}
  .inv-meta{text-align:right;}
  .inv-tag{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.6);margin-bottom:5px;}
  .inv-num{font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;}
  .h-divider{height:1px;background:rgba(255,255,255,0.18);margin:20px 0;position:relative;z-index:1;}
  .h-bottom{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;}
  .meta-group{display:flex;gap:28px;}
  .meta-item .lbl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.55);margin-bottom:4px;}
  .meta-item .val{font-size:13px;font-weight:700;color:#fff;}
  .status-pill{padding:6px 18px;border-radius:30px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;border:1.5px solid;}
  .body{padding:28px 36px;}
  .billing-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
  .billing-card{border:1.5px solid #e8e4f9;border-radius:14px;padding:18px 20px;}
  .billing-tag{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
  .billing-tag.from{color:#4f46e5;}
  .billing-tag.to{color:#7c3aed;}
  .billing-tag::before{content:'';display:inline-block;width:24px;height:2px;border-radius:2px;background:currentColor;}
  .billing-name{font-size:16px;font-weight:800;color:#1a1a2e;margin-bottom:8px;line-height:1.3;}
  .billing-row{display:flex;align-items:flex-start;gap:8px;font-size:11px;color:#6b7280;margin-bottom:5px;}
  .gst-tag{display:inline-block;background:#eef2ff;color:#4f46e5;border:1px solid #c7d2fe;border-radius:6px;padding:3px 8px;font-size:9px;font-weight:800;margin-top:8px;}
  .section-title{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
  .section-title::after{content:'';flex:1;height:1px;background:#f0f0f8;}
  .service-card{border:1.5px solid #e8e4f9;border-radius:14px;padding:20px;margin-bottom:20px;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
  .info-item .lbl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:4px;}
  .info-item .val{font-size:13px;font-weight:700;color:#1a1a2e;}
  .info-item .val.purple{color:#4f46e5;}
  .info-item .val.green{color:#059669;}
  .text-field{border-top:1px solid #f3f4f6;padding-top:14px;margin-top:0;}
  .text-field .lbl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:6px;}
  .text-field .val{font-size:13px;color:#374151;line-height:1.6;}
  .text-field .val.green{color:#059669;font-weight:600;}
  .table-wrap{border:1.5px solid #e8e4f9;border-radius:14px;overflow:hidden;margin-bottom:20px;}
  table{width:100%;border-collapse:collapse;}
  thead{background:linear-gradient(90deg,#f0eeff,#f5f3ff);}
  th{padding:11px 14px;text-align:left;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#4f46e5;border-bottom:1.5px solid #e8e4f9;}
  th.right,th.center{text-align:right;}
  th.center{text-align:center;}
  td{padding:12px 14px;font-size:12px;color:#374151;border-bottom:1px solid #f5f3ff;vertical-align:top;}
  td.right,td.center{text-align:right;}
  td.center{text-align:center;}
  td.amount{font-weight:700;color:#1a1a2e;}
  td.stripe{background:#fafafe;}
  td.desc{max-width:260px;}
  .item-name{display:block;font-weight:600;color:#1a1a2e;}
  .item-note{display:block;font-size:10px;color:#9ca3af;margin-top:2px;font-style:italic;}
  .parts-header td{background:#fdf4ff;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;padding:8px 14px;border-top:1.5px solid #e8e4f9;}
  .totals-section{display:flex;justify-content:flex-end;margin-bottom:24px;}
  .totals-box{width:320px;}
  .total-row{display:flex;justify-content:space-between;padding:7px 14px;font-size:12px;}
  .total-row .lbl{color:#6b7280;}
  .total-row .val{font-weight:600;color:#1a1a2e;}
  .total-divider{height:1px;background:#e8e4f9;margin:6px 0;}
  .grand-row{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-top:10px;}
  .grand-row .lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.8);}
  .grand-row .val{font-size:24px;font-weight:900;color:#fff;}
  .warranty-card{border:2px dashed #c4b5fd;border-radius:14px;background:#faf5ff;padding:20px;margin-bottom:20px;display:flex;gap:14px;}
  .warranty-icon{width:42px;height:42px;background:#7c3aed;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
  .warranty-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#4f46e5;margin-bottom:4px;}
  .warranty-text{font-size:13px;font-weight:700;color:#1e1b4b;margin-bottom:6px;}
  .warranty-note{font-size:10px;color:#6d28d9;line-height:1.6;}
  .reminder-card{border:1.5px solid #bbf7d0;border-radius:14px;background:#f0fdf4;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:14px;}
  .reminder-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#065f46;margin-bottom:3px;}
  .reminder-date{font-size:16px;font-weight:800;color:#059669;}
  .reminder-sub{font-size:11px;color:#065f46;margin-top:2px;}
  .sig-section{display:flex;justify-content:space-between;align-items:flex-end;padding:20px 0;border-top:1.5px solid #e8e4f9;margin-bottom:20px;}
  .sig-block{text-align:center;}
  .sig-space{height:50px;}
  .sig-line{width:160px;height:1.5px;background:#374151;margin-bottom:6px;}
  .sig-name{font-size:11px;font-weight:700;color:#374151;margin-bottom:2px;}
  .sig-lbl{font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;}
  .terms-card{border:1.5px solid #e8e4f9;border-radius:14px;padding:18px 20px;margin-bottom:24px;}
  .terms-list{list-style:none;padding:0;margin-top:10px;}
  .terms-list li{font-size:10px;color:#9ca3af;margin-bottom:7px;padding-left:16px;position:relative;line-height:1.6;}
  .terms-list li::before{content:"•";position:absolute;left:0;color:#c4b5fd;font-size:13px;top:-2px;}
  .footer{background:linear-gradient(135deg,#f5f3ff,#faf5ff);padding:24px 36px;text-align:center;border-top:1.5px solid #e8e4f9;}
  .footer-brand{font-size:17px;font-weight:900;color:#4f46e5;margin-bottom:5px;}
  .footer-sub{font-size:11px;color:#9ca3af;margin-bottom:12px;}
  .footer-bar{width:48px;height:4px;background:linear-gradient(90deg,#4f46e5,#9333ea);border-radius:2px;margin:0 auto 14px;}
  .footer-contact{font-size:11px;color:#6b7280;margin-bottom:6px;}
  .footer-ref{font-size:9px;color:#d1d5db;letter-spacing:0.5px;}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="orb1"></div><div class="orb2"></div>
    <div class="h-top">
      <div>
        <div class="brand-icon">🔧</div>
        <div class="brand-name">${techName}</div>
        <div class="brand-sub">Professional Appliance Repair &amp; Maintenance</div>
      </div>
      <div class="inv-meta">
        <div class="inv-tag">Invoice Number</div>
        <div class="inv-num">${invoiceNumber}</div>
      </div>
    </div>
    <div class="h-divider"></div>
    <div class="h-bottom">
      <div class="meta-group">
        <div class="meta-item"><div class="lbl">Issue Date</div><div class="val">${formatDate(job.serviceDate)}</div></div>
        <div class="meta-item"><div class="lbl">Due</div><div class="val">On Completion</div></div>
        ${job._id ? `<div class="meta-item"><div class="lbl">Job Ref</div><div class="val">#${job._id.slice(-6).toUpperCase()}</div></div>` : ""}
      </div>
      <div class="status-pill" style="background:${sc.bg};color:${sc.text};border-color:${sc.border};">${sc.label}</div>
    </div>
  </div>
  <div class="body">
    <div class="billing-grid">
      <div class="billing-card">
        <div class="billing-tag from">Service Provider</div>
        <div class="billing-name">${techName}</div>
        ${techPersonName && techPersonName !== techName ? `<div class="billing-row">👤 ${techPersonName}</div>` : ""}
        ${techPhone ? `<div class="billing-row">📞 ${techPhone}</div>` : ""}
        ${techEmail ? `<div class="billing-row">✉️ ${techEmail}</div>` : ""}
        ${techAddress ? `<div class="billing-row">📍 ${techAddress}</div>` : ""}
        ${gstNumber ? `<div class="gst-tag">GSTIN: ${gstNumber}</div>` : ""}
      </div>
      <div class="billing-card">
        <div class="billing-tag to">Bill To</div>
        <div class="billing-name">${customerName}</div>
        <div class="billing-row">📞 ${customerPhone}</div>
        ${customerAddress ? `<div class="billing-row">📍 ${customerAddress}</div>` : ""}
      </div>
    </div>
    <div class="service-card">
      <div class="section-title">Service Information</div>
      <div class="info-grid">
        <div class="info-item"><div class="lbl">Appliance Type</div><div class="val purple">${job.applianceType || "—"}</div></div>
        <div class="info-item"><div class="lbl">Service Date</div><div class="val">${formatDate(job.serviceDate)}</div></div>
        <div class="info-item"><div class="lbl">Status</div><div class="val" style="color:${sc.text}">${sc.label}</div></div>
        <div class="info-item"><div class="lbl">Warranty</div><div class="val">${job.warranty || "No Warranty"}</div></div>
      </div>
      ${job.issue ? `<div class="text-field"><div class="lbl">Issue Reported</div><div class="val">${job.issue}</div></div>` : ""}
      ${job.serviceDone ? `<div class="text-field" style="margin-top:12px;"><div class="lbl">Work Done</div><div class="val green">${job.serviceDone}</div></div>` : ""}
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:50%">Description</th>
            <th class="center" style="width:8%">Qty</th>
            <th class="right" style="width:18%">Rate (₹)</th>
            <th class="right" style="width:18%">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemRows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:20px;">No service items</td></tr>'}
          ${partsRows ? `<tr class="parts-header"><td colspan="4">Parts &amp; Components</td></tr>${partsRows}` : ""}
        </tbody>
      </table>
    </div>
    <div class="totals-section">
      <div class="totals-box">
        ${lineItems.length > 0 ? `<div class="total-row"><span class="lbl">Service Subtotal</span><span class="val">₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>` : ""}
        ${partsTotal > 0 ? `<div class="total-row"><span class="lbl">Parts &amp; Components</span><span class="val">₹${partsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>` : ""}
        ${lineItems.length > 0 || partsTotal > 0 ? `<div class="total-divider"></div>` : ""}
        <div class="grand-row"><span class="lbl">Grand Total</span><span class="val">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
      </div>
    </div>
    ${
      job.warranty && job.warranty !== "No Warranty"
        ? `
    <div class="warranty-card">
      <div class="warranty-icon">🛡️</div>
      <div>
        <div class="warranty-title">Service Warranty Certificate</div>
        <div class="warranty-text">Covered by a <strong>${job.warranty}</strong> warranty from ${formatDate(job.serviceDate)}.</div>
        <div class="warranty-note">Covers labour and replaced parts listed above. Void if physically damaged, tampered with, or exposed to power surges after service.</div>
      </div>
    </div>`
        : ""
    }
    ${
      job.nextReminderDate
        ? `
    <div class="reminder-card">
      <div style="font-size:22px;">🔔</div>
      <div>
        <div class="reminder-lbl">Next Service Reminder</div>
        <div class="reminder-date">${formatDate(job.nextReminderDate)}</div>
        <div class="reminder-sub">We recommend scheduling your next service on or before this date.</div>
      </div>
    </div>`
        : ""
    }
    <div class="sig-section">
      <div class="sig-block">
        <div class="sig-space"></div>
        <div class="sig-line"></div>
        <div class="sig-lbl">Customer Signature</div>
      </div>
      <div class="sig-block" style="text-align:right;">
        <div class="sig-space"></div>
        <div class="sig-line" style="margin-left:auto;"></div>
        <div class="sig-name">${techName}</div>
        <div class="sig-lbl">Authorised Signatory</div>
      </div>
    </div>
    <div class="terms-card">
      <div class="section-title">Terms &amp; Conditions</div>
      <ul class="terms-list">
        <li>Payment is due on completion of service unless otherwise agreed in writing.</li>
        <li>Warranty is valid only for the specific fault repaired and parts replaced as listed above.</li>
        <li>Warranty is void if the appliance is tampered with, subjected to power fluctuations, or physically damaged after service.</li>
        <li>Parts once fitted are non-returnable. Charges apply for re-visits not covered under warranty.</li>
        <li>This is a computer-generated invoice and constitutes a valid tax document where GST is applicable.</li>
        <li>Disputes, if any, are subject to the jurisdiction of local courts only.</li>
      </ul>
    </div>
  </div>
  <div class="footer">
    <div class="footer-brand">Thank you for choosing ${techName}! 🙏</div>
    <div class="footer-sub">We appreciate your trust and look forward to serving you again.</div>
    <div class="footer-bar"></div>
    ${techPhone || techEmail ? `<div class="footer-contact">${techPhone ? "📞 " + techPhone : ""}${techPhone && techEmail ? "  " : ""}${techEmail ? "✉️ " + techEmail : ""}</div>` : ""}
    <div class="footer-ref">Invoice ${invoiceNumber} · Generated ${formatDate(new Date())}</div>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// UI Sub-components
// ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, colors, action }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <Icon size={14} color={colors.primary} />
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 13,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
}

function Card({ children, style, colors }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.bgCard,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function InfoPill({ icon: Icon, label, value, colors, accent }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgSurface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        gap: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Icon size={11} color={accent || colors.textMuted} />
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 9,
            fontWeight: "700",
            color: colors.textDisabled,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "Space Grotesk",
          fontSize: 13,
          fontWeight: "700",
          color: accent || colors.textPrimary,
          lineHeight: 18,
        }}
        numberOfLines={2}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

function Divider({ colors }) {
  return (
    <View
      style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }}
    />
  );
}

function InfoRow({ icon, label, value, valueColor, colors }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 2,
      }}
    >
      <View style={{ width: 28, alignItems: "center", paddingTop: 2 }}>
        {icon}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 11,
            color: colors.textMuted,
            marginTop: 1,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 12,
            color: valueColor || colors.textSecondary,
            fontWeight: "600",
            textAlign: "right",
            maxWidth: "58%",
            lineHeight: 18,
          }}
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
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

  function getStatusConfig(status) {
    switch (status) {
      case JobStatuses.COMPLETED:
      case "paid":
        return {
          label: "PAID",
          color: colors.success,
          bg: colors.successBg,
          border: colors.successBorder,
        };
      case JobStatuses.IN_PROGRESS:
        return {
          label: "IN PROGRESS",
          color: colors.warningIcon,
          bg: colors.warningBg,
          border: colors.warningBorder,
        };
      case JobStatuses.CANCELLED:
        return {
          label: "CANCELLED",
          color: colors.danger,
          bg: colors.dangerBg,
          border: colors.dangerBorder,
        };
      default:
        return {
          label: "PENDING",
          color: colors.warningIcon,
          bg: colors.warningBg,
          border: colors.warningBorder,
        };
    }
  }

  function buildInitialLineItems() {
    if (!job) return [];
    if (job.lineItems && job.lineItems.length > 0) return job.lineItems;
    const base = Number(job.amount) || 0;
    const pt = (job.partsUsed || []).reduce(
      (acc, p) => acc + p.price * p.quantity,
      0,
    );
    const laborAmt = Math.max(0, base - pt);
    if (laborAmt > 0) {
      return [
        {
          id: "1",
          description: `Service Charge — ${job?.applianceType || "Appliance Repair"}`,
          qty: "1",
          rate: String(laborAmt),
          note: job?.serviceDone || "",
        },
      ];
    }
    if (job.diagnosticFee > 0 && base === 0) {
      return [
        {
          id: "1",
          description: "Diagnostic / Visiting Fee",
          qty: "1",
          rate: String(job.diagnosticFee),
          note: "",
        },
      ];
    }
    return [];
  }

  const [lineItems, setLineItems] = useState(buildInitialLineItems);
  const [partsUsed, setPartsUsed] = useState(job?.partsUsed || []);
  const [showTerms, setShowTerms] = useState(false);
  const [isPaid, setIsPaid] = useState(job?.isPaid ?? false);
  const [paymentMethod, setPaymentMethod] = useState(
    job?.paymentMethod ?? PaymentMethods.CASH,
  );
  const [updateJob, { isLoading: isSaving }] = useUpdateJobMutation();

  if (!job) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
        edges={["top"]}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.primaryBg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Receipt color={colors.primary} size={32} />
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "700",
            fontFamily: "Space Grotesk",
            marginBottom: 8,
          }}
        >
          No Invoice Data
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 13,
            fontFamily: "Inter",
            textAlign: "center",
          }}
        >
          Please open an invoice from a job.
        </Text>
      </SafeAreaView>
    );
  }

  const invoiceNumber = generateInvoiceNumber(job._id);
  const statusConfig = getStatusConfig(job.status);
  const customerName = job.customerId?.name ?? job.customerName ?? "N/A";
  const customerPhone = job.customerId?.phone ?? job.customerPhone ?? "N/A";
  const partsTotal = partsUsed.reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0,
  );
  const subtotal = lineItems.reduce((s, i) => s + computeLineTotal(i), 0);
  const grandTotal = subtotal + partsTotal;

  // ── Handlers ──
  function handleAddRow() {
    setLineItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
        qty: "1",
        rate: "0",
        note: "",
      },
    ]);
  }
  function handleDeleteRow(id) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }
  function handleChangeField(id, field, value) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }
  function handleAddPart() {
    setPartsUsed((prev) => [...prev, { name: "", quantity: "1", price: "0" }]);
  }
  function handleDeletePart(idx) {
    setPartsUsed((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleChangePart(idx, field, value) {
    setPartsUsed((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  async function handleSaveInvoice() {
    try {
      await updateJob({
        id: job._id,
        lineItems,
        partsUsed,
        amount: grandTotal,
        isPaid,
        paymentMethod,
        status: isPaid ? JobStatuses.COMPLETED : job.status,
      }).unwrap();
      Alert.alert("Saved", "Invoice details saved successfully.");
    } catch {
      Alert.alert("Error", "Failed to save invoice. Please try again.");
    }
  }

  function buildPdfArgs() {
    return {
      job: { ...job, partsUsed },
      invoiceNumber,
      lineItems,
      techInfo: techUser,
      grandTotal,
      subtotal,
    };
  }

  async function handleGeneratePdf() {
    const html = buildPdfHtml(buildPdfArgs());
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice ${invoiceNumber}`,
      });
    } catch {
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    }
  }

  async function handlePrintPreview() {
    const html = buildPdfHtml(buildPdfArgs());
    try {
      await Print.printAsync({ html });
    } catch {
      Alert.alert("Error", "Print failed. Please try again.");
    }
  }

  function handleWhatsAppShare() {
    const phone = job.customerId?.phone || job.customerPhone;
    if (!phone) {
      Alert.alert("Error", "Customer phone number not found.");
      return;
    }
    const cleanPhone = phone.replace(/[^\d]/g, "");
    const formattedPhone =
      cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message =
      `*INVOICE: ${invoiceNumber}*\n\n` +
      `Hi ${customerName},\n` +
      `This is ${techName}. Here is your invoice for the *${job.applianceType}* service on ${formatDate(job.serviceDate)}.\n\n` +
      `*Total Amount:* ${formatCurrency(grandTotal)}\n` +
      `*Warranty:* ${job.warranty || "No Warranty"}\n\n` +
      `Thank you for your business! 🙏`;
    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        Linking.openURL(
          supported
            ? url
            : `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
        );
      })
      .catch(() => Alert.alert("Error", "Could not open WhatsApp."));
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top"]}
    >
      {/* ── Top Bar ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          height: 52,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft color={colors.textPrimary} size={18} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 14,
              fontWeight: "700",
              color: colors.textPrimary,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Invoice Preview
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 10,
              color: colors.textDisabled,
            }}
          >
            {invoiceNumber}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePrintPreview}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.primaryBg,
            borderWidth: 1,
            borderColor: colors.primaryBorder,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <Printer color={colors.primary} size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ══ INVOICE HERO CARD ══ */}
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 22,
            marginBottom: 12,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          />

          {/* Brand row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Wrench color="#fff" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#fff",
                }}
              >
                {techName}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 1,
                }}
              >
                Professional Appliance Services
              </Text>
            </View>
            <View
              style={{
                backgroundColor: statusConfig.bg,
                borderWidth: 1,
                borderColor: statusConfig.border,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: statusConfig.color,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  fontWeight: "800",
                  color: statusConfig.color,
                  letterSpacing: 0.8,
                }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.18)",
              marginBottom: 18,
            }}
          />

          {/* Invoice number + dates */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 4,
                }}
              >
                Invoice Number
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: -0.5,
                }}
              >
                {invoiceNumber}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 2,
                  }}
                >
                  Issue Date
                </Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {formatDate(job.serviceDate)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 2,
                  }}
                >
                  Job Ref
                </Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  #{job._id?.slice(-6).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Grand total preview */}
          <View
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.18)",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 10,
                color: "rgba(255,255,255,0.65)",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Grand Total
            </Text>
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 28,
                fontWeight: "900",
                color: "#fff",
              }}
            >
              {formatCurrency(grandTotal)}
            </Text>
          </View>
        </LinearGradient>

        {/* ══ BILLING CARDS ══ */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          {/* FROM card */}
          <Card colors={colors} style={{ flex: 1, margin: 0, padding: 14 }}>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 8,
                fontWeight: "800",
                letterSpacing: 2,
                textTransform: "uppercase",
                color: colors.primary,
                marginBottom: 10,
              }}
            >
              FROM
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={13} color={colors.primary} />
              </View>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {techName}
              </Text>
            </View>
            {techUser?.name && techUser.name !== techName ? (
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  color: colors.textDisabled,
                  marginBottom: 4,
                }}
              >
                {techUser.name}
              </Text>
            ) : null}
            {techUser?.phone ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 3,
                }}
              >
                <Phone size={10} color={colors.textMuted} />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                  }}
                >
                  {techUser.phone}
                </Text>
              </View>
            ) : null}
            {techUser?.email ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 3,
                }}
              >
                <Mail size={10} color={colors.textMuted} />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                  }}
                  numberOfLines={1}
                >
                  {techUser.email}
                </Text>
              </View>
            ) : null}
            {techUser?.gstNumber ? (
              <View
                style={{
                  marginTop: 6,
                  backgroundColor: colors.primaryBg,
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 9,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  GST: {techUser.gstNumber}
                </Text>
              </View>
            ) : null}
          </Card>

          {/* BILL TO card */}
          <Card colors={colors} style={{ flex: 1, margin: 0, padding: 14 }}>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 8,
                fontWeight: "800",
                letterSpacing: 2,
                textTransform: "uppercase",
                color: colors.secondary,
                marginBottom: 10,
              }}
            >
              BILL TO
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: colors.secondaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={13} color={colors.secondary} />
              </View>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {customerName}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 3,
              }}
            >
              <Phone size={10} color={colors.textMuted} />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  color: colors.textMuted,
                }}
              >
                {customerPhone}
              </Text>
            </View>
            {job?.location?.address ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <MapPin
                  size={10}
                  color={colors.textMuted}
                  style={{ marginTop: 1 }}
                />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                    flex: 1,
                    lineHeight: 14,
                  }}
                  numberOfLines={3}
                >
                  {job.location.address}
                </Text>
              </View>
            ) : null}
          </Card>
        </View>

        {/* ══ SERVICE DETAILS ══ */}
        <Card colors={colors}>
          <SectionHeader
            icon={Wrench}
            title="Service Details"
            colors={colors}
          />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <InfoPill
              icon={Wrench}
              label="Appliance"
              value={job.applianceType}
              colors={colors}
              accent={colors.primary}
            />
            <InfoPill
              icon={Calendar}
              label="Service Date"
              value={formatDate(job.serviceDate)}
              colors={colors}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: job.issue || job.serviceDone ? 8 : 0,
            }}
          >
            <InfoPill
              icon={ShieldCheck}
              label="Warranty"
              value={job.warranty || "No Warranty"}
              colors={colors}
              accent={
                job.warranty && job.warranty !== "No Warranty"
                  ? colors.success
                  : undefined
              }
            />
            {job.nextReminderDate ? (
              <InfoPill
                icon={Bell}
                label="Next Service"
                value={formatDate(job.nextReminderDate)}
                colors={colors}
                accent={colors.success}
              />
            ) : null}
          </View>
          {job.issue ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<Hash size={13} color={colors.textMuted} />}
                label="Issue Reported"
                value={job.issue}
                colors={colors}
              />
            </>
          ) : null}
          {job.serviceDone ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<CheckCircle2 size={13} color={colors.success} />}
                label="Work Done"
                value={job.serviceDone}
                valueColor={colors.success}
                colors={colors}
              />
            </>
          ) : null}
        </Card>

        {/* ══ LINE ITEMS ══ */}
        <Card colors={colors}>
          <SectionHeader
            icon={Receipt}
            title="Service Breakdown"
            colors={colors}
            action={
              <TouchableOpacity
                onPress={handleAddRow}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: colors.primaryBg,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.primaryBorder,
                }}
                activeOpacity={0.75}
              >
                <Plus size={12} color={colors.primary} />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  Add Row
                </Text>
              </TouchableOpacity>
            }
          />

          {/* Table header */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.bgSurface,
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 6,
              marginBottom: 2,
            }}
          >
            {[
              { label: "Description", style: { flex: 1 } },
              { label: "Qty", style: { width: 36, textAlign: "center" } },
              { label: "Rate", style: { width: 64, textAlign: "right" } },
              { label: "Amt", style: { width: 64, textAlign: "right" } },
              { label: "", style: { width: 28 } },
            ].map((col, i) => (
              <Text
                key={i}
                style={[
                  {
                    fontFamily: "Inter",
                    fontSize: 9,
                    fontWeight: "700",
                    color: colors.primary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  },
                  col.style,
                ]}
              >
                {col.label}
              </Text>
            ))}
          </View>

          {lineItems.map((item, idx) => {
            const lineTotal = computeLineTotal(item);
            return (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  alignItems: "center",
                  borderRadius: 6,
                  backgroundColor:
                    idx % 2 === 1 ? colors.bgSurface : "transparent",
                }}
              >
                <TextInput
                  style={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    color: colors.textPrimary,
                    flex: 1,
                    paddingVertical: 4,
                    paddingHorizontal: 2,
                    minHeight: 32,
                  }}
                  value={item.description}
                  onChangeText={(v) =>
                    handleChangeField(item.id, "description", v)
                  }
                  placeholder="Description"
                  placeholderTextColor={colors.textDisabled}
                  multiline
                />
                <TextInput
                  style={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    color: colors.textPrimary,
                    width: 36,
                    textAlign: "center",
                    paddingVertical: 4,
                  }}
                  value={String(item.qty)}
                  onChangeText={(v) => handleChangeField(item.id, "qty", v)}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.textDisabled}
                />
                <TextInput
                  style={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    color: colors.textPrimary,
                    width: 64,
                    textAlign: "right",
                    paddingVertical: 4,
                  }}
                  value={String(item.rate)}
                  onChangeText={(v) => handleChangeField(item.id, "rate", v)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textDisabled}
                />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 11,
                    color: colors.textPrimary,
                    fontWeight: "700",
                    width: 64,
                    textAlign: "right",
                    paddingRight: 2,
                  }}
                >
                  {lineTotal.toFixed(0)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteRow(item.id)}
                  style={{
                    width: 28,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Parts sub-section */}
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  fontWeight: "800",
                  color: colors.secondary,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Replaced Parts / Spares
              </Text>
              <TouchableOpacity onPress={handleAddPart} activeOpacity={0.7}>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  + Add Part
                </Text>
              </TouchableOpacity>
            </View>

            {partsUsed.map((part, idx) => {
              const partTotal =
                (Number(part.price) || 0) * (Number(part.quantity) || 0);
              return (
                <View
                  key={`part-${idx}`}
                  style={{
                    flexDirection: "row",
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    alignItems: "center",
                    borderRadius: 6,
                    backgroundColor:
                      idx % 2 === 1 ? colors.bgSurface : "transparent",
                  }}
                >
                  <TextInput
                    style={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      color: colors.textPrimary,
                      flex: 1,
                      paddingVertical: 4,
                      paddingHorizontal: 2,
                      minHeight: 32,
                    }}
                    value={part.name}
                    onChangeText={(v) => handleChangePart(idx, "name", v)}
                    placeholder="Part name"
                    placeholderTextColor={colors.textDisabled}
                    multiline
                  />
                  <TextInput
                    style={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      color: colors.textPrimary,
                      width: 36,
                      textAlign: "center",
                      paddingVertical: 4,
                    }}
                    value={String(part.quantity)}
                    onChangeText={(v) => handleChangePart(idx, "quantity", v)}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={colors.textDisabled}
                  />
                  <TextInput
                    style={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      color: colors.textPrimary,
                      width: 64,
                      textAlign: "right",
                      paddingVertical: 4,
                    }}
                    value={String(part.price)}
                    onChangeText={(v) => handleChangePart(idx, "price", v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textDisabled}
                  />
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 11,
                      color: colors.textPrimary,
                      fontWeight: "700",
                      width: 64,
                      textAlign: "right",
                      paddingRight: 2,
                    }}
                  >
                    {partTotal.toFixed(0)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeletePart(idx)}
                    style={{
                      width: 28,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={13} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}

            {lineItems.length === 0 && partsUsed.length === 0 && (
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 12,
                  color: colors.textDisabled,
                  textAlign: "center",
                  paddingVertical: 14,
                  fontStyle: "italic",
                }}
              >
                {'No items yet — tap "Add Row" or "Add Part"'}
              </Text>
            )}
          </View>
        </Card>

        {/* ══ PAYMENT SUMMARY ══ */}
        <Card colors={colors}>
          <SectionHeader
            icon={IndianRupee}
            title="Payment Summary"
            colors={colors}
          />

          {lineItems.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                Service Subtotal
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                {formatCurrency(subtotal)}
              </Text>
            </View>
          )}
          {partsTotal > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                Parts &amp; Spares
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                {formatCurrency(partsTotal)}
              </Text>
            </View>
          )}

          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 14,
              padding: 16,
              marginTop: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Grand Total
            </Text>
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 26,
                fontWeight: "900",
                color: "#fff",
              }}
            >
              {formatCurrency(grandTotal)}
            </Text>
          </LinearGradient>

          {/* Payment status toggle */}
          <View
            style={{
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isPaid ? 16 : 0,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.textPrimary,
                    marginBottom: 3,
                  }}
                >
                  Payment Status
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    color: isPaid ? colors.success : colors.warningIcon,
                  }}
                >
                  {isPaid ? "Successfully Collected" : "Payment Pending"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPaid(!isPaid)}
                style={{
                  backgroundColor: isPaid ? colors.successBg : colors.bgSurface,
                  borderWidth: 1.5,
                  borderColor: isPaid ? colors.successBorder : colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: isPaid
                      ? colors.success
                      : colors.textDisabled,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 11,
                    fontWeight: "800",
                    color: isPaid ? colors.success : colors.textPrimary,
                  }}
                >
                  {isPaid ? "PAID" : "UNPAID"}
                </Text>
              </TouchableOpacity>
            </View>

            {isPaid && (
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.textPrimary,
                    marginBottom: 10,
                  }}
                >
                  Payment Method
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { id: "cash", label: "Cash", icon: Banknote },
                    { id: "upi", label: "UPI", icon: Wallet },
                    { id: "online", label: "Online", icon: CreditCard },
                    { id: "cheque", label: "Cheque", icon: FileText },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    return (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => setPaymentMethod(method.id)}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          paddingVertical: 10,
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active
                            ? colors.primaryBg
                            : colors.bgSurface,
                          gap: 4,
                        }}
                      >
                        <method.icon
                          size={16}
                          color={active ? colors.primary : colors.textMuted}
                        />
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 9,
                            fontWeight: "700",
                            color: active ? colors.primary : colors.textMuted,
                          }}
                        >
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* ══ WARRANTY ══ */}
        {job.warranty && job.warranty !== "No Warranty" ? (
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: colors.primaryBorder,
              backgroundColor: colors.primaryBg,
              flexDirection: "row",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: colors.primary,
                  marginBottom: 4,
                }}
              >
                Service Warranty Certificate
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  marginBottom: 5,
                }}
              >
                {job.warranty} Coverage
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 11,
                  color: colors.textMuted,
                  lineHeight: 17,
                }}
              >
                {"From "}
                {formatDate(job.serviceDate)}
                {
                  " - Covers labour & parts as listed. Void if physically damaged, tampered with, or exposed to power surges after service."
                }
              </Text>
            </View>
          </View>
        ) : null}

        {/* ══ TERMS & CONDITIONS ══ */}
        <Card colors={colors}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => setShowTerms(!showTerms)}
            activeOpacity={0.7}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
            >
              <Info size={14} color={colors.textMuted} />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Terms &amp; Conditions
              </Text>
            </View>
            {showTerms ? (
              <ChevronDown size={14} color={colors.textDisabled} />
            ) : (
              <ChevronRight size={14} color={colors.textDisabled} />
            )}
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
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: colors.primaryBorder,
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      color: colors.textDisabled,
                      lineHeight: 16,
                      flex: 1,
                    }}
                  >
                    {term}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* ══ THANK YOU ══ */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 24,
            paddingHorizontal: 20,
            marginBottom: 12,
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🙏</Text>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 17,
              fontWeight: "800",
              color: colors.primary,
              marginBottom: 4,
            }}
          >
            Thank you, {customerName.split(" ")[0]}!
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 12,
              color: colors.textMuted,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            {"Thank you for choosing "}
            {techName}
            {".\nWe look forward to serving you again."}
          </Text>
        </View>
      </ScrollView>

      {/* ══ STICKY BOTTOM ACTION BAR ══ */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={handleSaveInvoice}
            disabled={isSaving}
            activeOpacity={0.8}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.primaryBorder,
              backgroundColor: colors.primaryBg,
            }}
          >
            <Save size={15} color={colors.primary} />
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 12,
                fontWeight: "800",
                color: colors.primary,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsAppShare}
            activeOpacity={0.8}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.successBorder,
              backgroundColor: colors.successBg,
            }}
          >
            <MessageCircle size={15} color={colors.success} />
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 12,
                fontWeight: "800",
                color: colors.success,
              }}
            >
              WhatsApp
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleGeneratePdf}
          activeOpacity={0.85}
          style={{
            borderRadius: 14,
            overflow: "hidden",
            shadowColor: colors.primary,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 3 },
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              paddingVertical: 14,
            }}
          >
            <Download color="#fff" size={17} />
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 13,
                fontWeight: "800",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              Download &amp; Share PDF
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
