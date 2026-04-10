import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, TextInput } from "react-native";
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
  Hash,
  Receipt,
  Clock,
  Building2,
  Plus,
  Trash2,
  ShieldCheck
} from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Text } from "@components/ui/text";
import useTheme from "@hooks/useTheme";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

function generateInvoiceNumber(jobId) {
  if (!jobId) return "INV-000000";
  return `INV-${jobId.slice(-6).toUpperCase()}`;
}



// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────


function InfoRow({ icon, label, value, valueColor }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowIcon}>{icon}</View>
      <View style={styles.infoRowContent}>
        <Text style={[styles.infoRowLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoRowValue, { color: valueColor || colors.textSecondary }]}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

function LineItemHeaderRow() {
  const { colors } = useTheme();
  return (
    <View style={[styles.lineItemRow, styles.lineItemHeader, { backgroundColor: colors.bgSurface }]}>
      <Text style={[styles.lineItemHeaderText, { flex: 1, color: colors.secondary }]}>Description</Text>
      <Text style={[styles.lineItemHeaderText, styles.lineItemQtyCol, { color: colors.secondary }]}>Qty</Text>
      <Text style={[styles.lineItemHeaderText, styles.lineItemAmtCol, { color: colors.secondary }]}>Amount</Text>
      <View style={styles.lineItemDelCol} />
    </View>
  );
}

function EditableLineItemRow({ item, onChangeDescription, onChangeQty, onChangeAmount, onDelete, isAlt }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.lineItemRow, isAlt && styles.lineItemAlt]}>
      <TextInput
        style={[styles.lineItemInput, { flex: 1, color: colors.textPrimary }]}
        value={item.description}
        onChangeText={onChangeDescription}
        placeholder="Description"
        placeholderTextColor={colors.textDisabled}
        multiline
      />
      <TextInput
        style={[styles.lineItemInput, styles.lineItemQtyCol, { color: colors.textPrimary }]}
        value={String(item.qty)}
        onChangeText={onChangeQty}
        keyboardType="numeric"
        placeholder="1"
        placeholderTextColor={colors.textDisabled}
        textAlign="center"
      />
      <TextInput
        style={[styles.lineItemInput, styles.lineItemAmtCol, { color: colors.textPrimary }]}
        value={String(item.amount)}
        onChangeText={onChangeAmount}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={colors.textDisabled}
        textAlign="right"
      />
      <TouchableOpacity onPress={onDelete} style={styles.lineItemDelBtn} activeOpacity={0.7}>
        <Trash2 color={colors.danger} size={14} />
      </TouchableOpacity>
    </View>
  );
}



// ─────────────────────────────────────────────
// PDF HTML Generator
// ─────────────────────────────────────────────
function buildPdfHtml({ job, invoiceNumber, statusConfig, lineItems, grandTotal, techInfo }) {
  const customerName = job.customerId?.name ?? job.customerName ?? "N/A";
  const customerPhone = job.customerId?.phone ?? job.customerPhone ?? "N/A";
  
  const techName = techInfo?.companyName || techInfo?.name || "TechServ Pro";
  const techPhone = techInfo?.phone || "Available 9 AM – 7 PM";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #ffffff; color: #1a1a2e; font-size: 13px; }
    .page { max-width: 740px; margin: 0 auto; padding: 40px; }

    /* Header */
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 36px; border-radius: 16px; color: white; margin-bottom: 28px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand-name { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 11px; opacity: 0.8; margin-top: 4px; letter-spacing: 0.5px; }
    .invoice-meta { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: 700; }
    .invoice-label { font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .header-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); }
    .date-block { font-size: 12px; opacity: 0.9; }
    .date-block span { font-weight: 600; }
    .status-badge { background: rgba(16,185,129,0.2); color: #d1fae5; border: 1px solid rgba(16,185,129,0.4); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .status-badge.pending { background: rgba(245,158,11,0.2); color: #fef3c7; border-color: rgba(245,158,11,0.4); }
    .status-badge.cancelled { background: rgba(239,68,68,0.2); color: #fee2e2; border-color: rgba(239,68,68,0.4); }

    /* Billing Grid */
    .billing-grid { display: flex; gap: 20px; margin-bottom: 28px; }
    .billing-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .billing-card-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 12px; }
    .billing-name { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .billing-detail { font-size: 12px; color: #6b7280; margin-bottom: 3px; }

    /* Service Table */
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #374151; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f3f4f6; }
    thead th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
    thead th:not(:first-child) { text-align: right; }
    tbody tr { border-bottom: 1px solid #f3f4f6; }
    tbody tr:nth-child(even) { background: #fafafa; }
    tbody td { padding: 12px 14px; font-size: 12px; color: #374151; }
    tbody td:not(:first-child) { text-align: right; font-weight: 500; }
    .item-name { font-weight: 600; color: #1a1a2e; }
    .item-desc { font-size: 10px; color: #9ca3af; margin-top: 2px; }

    /* Totals */
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-table { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
    .total-row:last-child { border-bottom: none; }
    .grand-total-row { display: flex; justify-content: space-between; padding: 12px 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 10px; margin-top: 10px; font-weight: 800; font-size: 16px; }

    /* Notes */
    .notes-section { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #6366f1; }
    .notes-section p { font-size: 12px; color: #4b5563; line-height: 1.6; margin-top: 4px; }

    /* Footer */
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .footer-thanks { font-size: 16px; font-weight: 700; color: #6366f1; margin-bottom: 6px; }
    .footer-sub { font-size: 11px; color: #9ca3af; }

    /* Warranty Section */
    .warranty-section { margin-top: 24px; padding: 18px; border: 1.5px dashed #6366f1; border-radius: 12px; background: #f5f3ff; }
    .warranty-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 8px; display: flex; align-items: center; }
    .warranty-text { font-size: 12px; color: #1e1b4b; font-weight: 600; }
    .warranty-note { font-size: 9px; color: #6366f1; opacity: 0.8; margin-top: 6px; font-style: italic; }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div>
          <div class="brand-name">${techName}</div>
          <div class="brand-tagline">Professional Appliance Repair &amp; Maintenance</div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-label">Invoice Number</div>
          <div class="invoice-number">${invoiceNumber}</div>
        </div>
      </div>
      <div class="header-bottom">
        <div class="date-block">
          Date: <span>${formatDate(job.serviceDate)}</span> &nbsp;|&nbsp; 
          Due: <span>On Completion</span>
        </div>
        <div class="status-badge ${job.status === 'pending' ? 'pending' : job.status === 'cancelled' ? 'cancelled' : ''}">${statusConfig.label}</div>
      </div>
    </div>

    <!-- Billing Grid -->
    <div class="billing-grid">
      <div class="billing-card">
        <div class="billing-card-title">From</div>
        <div class="billing-name">${techName}</div>
        <div class="billing-detail">${techInfo?.name || 'Professional Technician'}</div>
        <div class="billing-detail">📞 ${techPhone}</div>
        <div class="billing-detail">GST: 09ABCDE1234F1Z5</div>
      </div>
      <div class="billing-card">
        <div class="billing-card-title">Bill To</div>
        <div class="billing-name">${customerName}</div>
        <div class="billing-detail">📞 ${customerPhone}</div>
        <div class="billing-detail">${job.location && job.location.address ? job.location.address : 'Address not provided'}</div>
      </div>
    </div>

    <!-- Service Details Table -->
    <div class="section-title">Service Details</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Rate (₹)</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems
          .map(
            (item) => `
          <tr>
            <td>
              <div class="item-name">${item.description}</div>
              ${item.note ? `<div class="item-desc">${item.note}</div>` : ""}
            </td>
            <td>${item.qty}</td>
            <td>${item.rate}</td>
            <td>₹${item.amount.toLocaleString("en-IN")}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="grand-total-row"><span>Grand Total</span><span>₹${grandTotal.toLocaleString("en-IN")}</span></div>
      </div>
    </div>

    <!-- Warranty Certificate -->
    ${job.warranty ? `
    <div class="warranty-section">
      <div class="warranty-title">🛡️ Service Warranty Certificate</div>
      <div class="warranty-text">This service is covered by a <strong>${job.warranty}</strong> limited warranty.</div>
      <div class="warranty-note">*Warranty covers labor and parts replaced as listed above. Physical damage or misuse is not covered.</div>
    </div>
    ` : ""}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-thanks">Thank you for choosing ${techName}! 🙏</div>
      <div class="footer-sub">We appreciate your business and look forward to serving you again.</div>
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

  // ── Build initial line items from job data ──
  function buildInitialLineItems() {
    if (!job) return [];
    const baseAmount = parseFloat(job.amount) || 0;
    const diagAmount = Math.max(50, Math.round(baseAmount * 0.20));
    const repairAmount = Math.max(50, Math.round(baseAmount * 0.60));
    const partsAmount = Math.max(0, baseAmount - diagAmount - repairAmount);
    const items = [
      { id: "1", description: "Appliance Diagnosis & Inspection", qty: 1, amount: diagAmount },
      { id: "2", description: `Repair Service — ${job.applianceType}`, qty: 1, amount: repairAmount },
    ];
    if (partsAmount > 0) {
      items.push({ id: "3", description: "Spare Parts & Consumables", qty: 1, amount: partsAmount });
    }
    return items;
  }

  const [lineItems, setLineItems] = useState(buildInitialLineItems);

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Receipt color={colors.primary} size={40} style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk', marginBottom: 6 }}>No Invoice Data</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>Please open an invoice from a job.</Text>
      </SafeAreaView>
    );
  }

  const invoiceNumber = generateInvoiceNumber(job._id);
  const statusConfig = getStatusConfig(job.status);
  const customerName = job.customerId?.name ?? job.customerName ?? "N/A";
  const customerPhone = job.customerId?.phone ?? job.customerPhone ?? "N/A";

  const grandTotal = lineItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  // ── Line item handlers ──
  function handleAddRow() {
    setLineItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: "", qty: 1, amount: 0 },
    ]);
  }

  function handleDeleteRow(id) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleChangeField(id, field, value) {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: field === "description" ? value : value } : item
      )
    );
  }

  // ── PDF Generation ──
  async function handleGeneratePdf() {
    const html = buildPdfHtml({ job, invoiceNumber, statusConfig, lineItems, grandTotal, techInfo: techUser });
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `Invoice ${invoiceNumber}` });
    } catch {
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    }
  }

  async function handlePrintPreview() {
    const html = buildPdfHtml({ job, invoiceNumber, statusConfig, lineItems, grandTotal, techInfo: techUser });
    try {
      await Print.printAsync({ html });
    } catch {
      Alert.alert("Error", "Print failed. Please try again.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <StatusBar barStyle={colors.bgPrimary === '#000000' ? 'light-content' : 'dark-content'} backgroundColor={colors.bgPrimary} />

      {/* ── Top Nav Bar ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, backgroundColor: colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: colors.borderMuted }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }} activeOpacity={0.7}>
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, fontFamily: 'Space Grotesk', letterSpacing: 1, textTransform: 'uppercase' }}>Invoice Preview</Text>
        <TouchableOpacity onPress={handlePrintPreview} style={{ padding: 8 }} activeOpacity={0.7}>
          <FileText color={colors.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ══ INVOICE HEADER CARD ══ */}
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.invoiceHeaderCard}
        >
          {/* Decorative glow circles */}
          <View style={styles.glowCircleTop} />
          <View style={styles.glowCircleBottom} />

          {/* Brand Row */}
          <View style={styles.headerBrandRow}>
            <View style={styles.brandIconWrap}>
              <Wrench color="#ffffff" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.brandName, { color: '#ffffff' }]}>{techName}</Text>
              <Text style={[styles.brandTagline, { color: 'rgba(255,255,255,0.7)' }]}>Professional Appliance Repair</Text>
            </View>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.headerDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />

          {/* Invoice Meta Row */}
          <View style={styles.headerMetaRow}>
            <View>
              <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.6)' }]}>Invoice Number</Text>
              <Text style={[styles.headerInvoiceNo, { color: '#ffffff' }]}>{invoiceNumber}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.6)' }]}>Issue Date</Text>
              <Text style={[styles.headerDateText, { color: '#ffffff' }]}>{formatDate(job.serviceDate)}</Text>
            </View>
          </View>

          <View style={[styles.headerMetaRow, { marginTop: 12 }]}>
            <View>
              <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.6)' }]}>Payment Due</Text>
              <Text style={[styles.headerDateText, { color: '#ffffff' }]}>On Completion</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.6)' }]}>Ref. Job ID</Text>
              <Text style={[styles.headerRefText, { color: '#ffffff' }]}>#{job._id?.slice(-6).toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ══ BILLING SECTION ══ */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {/* FROM */}
          <View style={{ flex: 1, marginRight: 8, backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.primary, fontFamily: 'Inter', marginBottom: 8 }}>FROM</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Building2 color={colors.primary} size={13} style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Space Grotesk', flex: 1 }} numberOfLines={1}>{techName}</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textDisabled, fontFamily: 'Inter', marginBottom: 8 }}>{techUser?.name || "Professional Technician"}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Phone color={colors.secondary} size={11} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'Inter' }}>{techUser?.phone || "Available 9AM–7PM"}</Text>
            </View>
          </View>

          {/* BILL TO */}
          <View style={{ flex: 1, marginLeft: 8, backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.secondary, fontFamily: 'Inter', marginBottom: 8 }}>BILL TO</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <User color={colors.secondary} size={13} style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Space Grotesk', flex: 1 }} numberOfLines={1}>{customerName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Phone color={colors.secondary} size={11} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'Inter' }}>{customerPhone}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin color={colors.textMuted} size={11} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'Inter' }} numberOfLines={2}>
                {job?.location?.address || 'Address not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* ══ SERVICE DATE & APPLIANCE INFO ══ */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: colors.secondary, fontFamily: 'Inter', marginBottom: 12 }}>Service Information</Text>
          <InfoRow icon={<Calendar color={colors.secondary} size={14} />} label="Service Date" value={formatDate(job.serviceDate)} valueColor={colors.textPrimary} />
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
          <InfoRow icon={<Wrench color={colors.primary} size={14} />} label="Appliance" value={job.applianceType || "—"} valueColor={colors.primary} />
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
          <InfoRow icon={<Hash color={colors.secondary} size={14} />} label="Issue Reported" value={job.issue || "—"} />
          {!!job.serviceDone && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
              <InfoRow icon={<CheckCircle2 color={colors.success} size={14} />} label="Work Done" value={job.serviceDone} valueColor={colors.success} />
            </>
          )}
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
          <InfoRow icon={<ShieldCheck color={colors.secondary} size={14} />} label="Warranty" value={job.warranty || "No warranty specified"} valueColor={colors.secondary} />
        </View>
        {/* ══ LINE ITEMS TABLE (EDITABLE) ══ */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: colors.secondary, fontFamily: 'Inter' }}>Service Breakdown</Text>
            <TouchableOpacity onPress={handleAddRow} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.primaryBorder }} activeOpacity={0.75}>
              <Plus color={colors.primary} size={13} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, fontFamily: 'Inter' }}>Add Row</Text>
            </TouchableOpacity>
          </View>
          <LineItemHeaderRow />
          {lineItems.map((item, idx) => (
            <EditableLineItemRow
              key={item.id}
              item={item}
              isAlt={idx % 2 === 1}
              onChangeDescription={(v) => handleChangeField(item.id, "description", v)}
              onChangeQty={(v) => handleChangeField(item.id, "qty", v)}
              onChangeAmount={(v) => handleChangeField(item.id, "amount", v)}
              onDelete={() => handleDeleteRow(item.id)}
            />
          ))}
          {lineItems.length === 0 && (
            <Text style={{ fontSize: 12, color: colors.textDisabled, fontFamily: 'Inter', textAlign: 'center', paddingVertical: 16 }}>No items. Tap &quot;Add Row&quot; to add a service line.</Text>
          )}
        </View>

        {/* ══ TOTALS SECTION ══ */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: colors.secondary, fontFamily: 'Inter', marginBottom: 12 }}>Payment Summary</Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />
          <LinearGradient
            colors={[colors.primaryBg, colors.secondaryBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, padding: 16, marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textMuted, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 2 }}>Grand Total</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, fontFamily: 'Space Grotesk' }}>{formatCurrency(grandTotal)}</Text>
            </View>
          </LinearGradient>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Clock color={colors.textMuted} size={12} />
            <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'Inter' }}>Accepted: Cash · UPI · Card</Text>
          </View>
        </View>

        {/* ══ THANK YOU FOOTER ══ */}
        <View style={{ alignItems: 'center', padding: 24, marginBottom: 12, backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🙏</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, fontFamily: 'Space Grotesk', marginBottom: 4 }}>Thank you for choosing {techName}!</Text>
          <Text style={{ fontSize: 12, color: colors.textDisabled, fontFamily: 'Inter' }}>We look forward to serving you again.</Text>
        </View>

        {/* ══ ACTION BUTTONS ══ */}
        <TouchableOpacity onPress={handleGeneratePdf} activeOpacity={0.85} style={{ marginBottom: 12, borderRadius: 14, overflow: 'hidden' }}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 }}
          >
            <Download color={colors.bgPrimary} size={18} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.bgPrimary, fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: 2 }}>Download & Share PDF</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrintPreview} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, marginBottom: 4 }}>
          <Share2 color={colors.secondary} size={18} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.secondary, fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: 2 }}>Print / Preview Invoice</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  center: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    color: "transparent",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    marginBottom: 6,
  },
  errorText: {
    color: "transparent",
    fontSize: 13,
    fontFamily: "Inter",
    textAlign: "center",
  },

  // Nav
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  navBackBtn: { padding: 8 },
  navActionBtn: { padding: 8 },
  navTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "transparent",
    fontFamily: "Space Grotesk",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Invoice Header Card (gradient)
  invoiceHeaderCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },
  glowCircleTop: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "transparent",
  },
  glowCircleBottom: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  brandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    color: "transparent",
    fontFamily: "Space Grotesk",
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 10,
    color: "transparent",
    fontFamily: "Inter",
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    fontFamily: "Space Grotesk",
    letterSpacing: 0.8,
  },
  headerDivider: {
    height: 1,
    backgroundColor: "transparent",
    marginBottom: 14,
  },
  headerMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLabel: {
    fontSize: 9,
    color: "transparent",
    fontFamily: "Inter",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  headerInvoiceNo: {
    fontSize: 18,
    fontWeight: "800",
    color: "transparent",
    fontFamily: "Space Grotesk",
    letterSpacing: -0.3,
  },
  headerDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "transparent",
    fontFamily: "Space Grotesk",
  },
  headerRefText: {
    fontSize: 11,
    fontWeight: "600",
    color: "transparent",
    fontFamily: "Space Grotesk",
    letterSpacing: 0.5,
  },

  // Billing Grid
  billingGrid: {
    flexDirection: "row",
    marginBottom: 14,
  },
  billingCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  billingCardTitle: {
    fontSize: 8,
    fontWeight: "800",
    fontFamily: "Space Grotesk",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  billingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  billingName: {
    fontSize: 13,
    fontWeight: "700",
    color: "transparent",
    fontFamily: "Space Grotesk",
    flex: 1,
  },
  billingDetail: {
    fontSize: 10,
    color: "transparent",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  billingPhone: {
    fontSize: 10,
    color: "transparent",
    fontFamily: "Inter",
    flex: 1,
  },

  // Card
  card: {
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "transparent",
    fontFamily: "Space Grotesk",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "transparent",
    marginVertical: 8,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoRowIcon: {
    width: 30,
    alignItems: "center",
    paddingTop: 1,
  },
  infoRowContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoRowLabel: {
    fontSize: 10,
    color: "transparent",
    fontFamily: "Inter",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  infoRowValue: {
    fontSize: 12,
    color: "transparent",
    fontFamily: "Inter",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "55%",
    lineHeight: 18,
  },

  // Line Items
  lineItemRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    borderRadius: 6,
  },
  // Section label row (with Add Row button)
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  addRowBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "transparent",
    fontFamily: "Space Grotesk",
    letterSpacing: 0.3,
  },

  // Line items (editable)
  lineItemHeader: {
    backgroundColor: "transparent",
    borderRadius: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  lineItemAlt: {
    backgroundColor: "transparent",
    borderRadius: 6,
  },
  lineItemHeaderText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "transparent",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lineItemInput: {
    fontSize: 11,
    color: "transparent",
    fontFamily: "Inter",
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 34,
  },
  lineItemQtyCol: {
    width: 36,
    textAlign: "center",
  },
  lineItemAmtCol: {
    width: 72,
    textAlign: "right",
  },
  lineItemDelCol: {
    width: 28,
  },
  lineItemDelBtn: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  emptyRowsText: {
    fontSize: 11,
    color: "transparent",
    fontFamily: "Inter",
    textAlign: "center",
    paddingVertical: 16,
    fontStyle: "italic",
  },

  // Totals
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: "transparent",
    fontFamily: "Inter",
  },
  totalValue: {
    fontSize: 12,
    color: "transparent",
    fontFamily: "Space Grotesk",
    fontWeight: "600",
  },
  totalsDivider: {
    height: 1,
    backgroundColor: "transparent",
    marginVertical: 12,
  },
  grandTotalCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "transparent",
    fontFamily: "Space Grotesk",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "transparent",
    fontFamily: "Space Grotesk",
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  paymentMethodText: {
    fontSize: 10,
    color: "transparent",
    fontFamily: "Inter",
    letterSpacing: 0.3,
  },



  // Thank You
  thankYouBox: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  thankYouEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  thankYouTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "transparent",
    fontFamily: "Space Grotesk",
    marginBottom: 4,
  },
  thankYouSub: {
    fontSize: 11,
    color: "transparent",
    fontFamily: "Inter",
  },

  // Buttons
  primaryBtnWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "transparent",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: "transparent",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "Space Grotesk",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  secondaryBtnText: {
    color: "transparent",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
