/**
 * DHL India SOAP / WCF service client.
 *
 * Endpoint:  https://dhlindiaplugin.com/DHLWCFService_V6/DHLService.svc
 * Namespace: http://tempuri.org/
 * Auth:      SiteId + Password embedded in each SOAP request body
 *
 * Operations used:
 *   - PostQuote          → live rate quote (no shipper account needed)
 *   - PostShipment_V6    → create AWB + shipment (requires DHL_ACCOUNT_NUMBER)
 *   - PostTracking       → fetch tracking events by AWB
 *
 * Public function signatures match the previous MyDHL API client so all callers
 * (verify route, intl-rates route, admin DHL routes) keep working unchanged.
 */

import { HS_CODE_SWEETS, calculateStaticRate } from "./countries";
import { getUsdToInr } from "./fx";

const BASE_URL =
  process.env.DHL_API_BASE_URL ??
  "https://dhlindiaplugin.com/DHLWCFService_V6/DHLService.svc";
const NS = "http://tempuri.org/";

function siteId(): string {
  return process.env.DHL_SITE_ID ?? process.env.DHL_API_USER ?? "";
}
function password(): string {
  return process.env.DHL_PASSWORD ?? process.env.DHL_API_KEY ?? "";
}
function accountNumber(): string {
  return process.env.DHL_ACCOUNT_NUMBER ?? "";
}

// India compliance fields required by PostShipment_CSBV (CSB-V customs form).
function iecNo(): string { return process.env.DHL_IEC_NO ?? ""; }
function gstin(): string { return process.env.DHL_GSTIN ?? ""; }
function bankADCode(): string { return process.env.DHL_BANK_AD_CODE ?? ""; }
function shipperStateCode(): string { return process.env.DHL_PICKUP_STATE_CODE ?? "29"; } // 29 = Karnataka
function shipperStateName(): string { return process.env.DHL_PICKUP_STATE_NAME ?? "Karnataka"; }
function isUsingIGST(): "YES" | "NO" {
  return (process.env.DHL_IS_USING_IGST ?? "NO").toUpperCase() === "YES" ? "YES" : "NO";
}
function usingBondOrUT(): "YES" | "NO" {
  return (process.env.DHL_USING_BOND_OR_UT ?? "YES").toUpperCase() === "YES" ? "YES" : "NO";
}
function igstPercentage(): number {
  return parseFloat(process.env.DHL_IGST_PERCENTAGE ?? "0") || 0;
}

export function isDhlConfigured(): boolean {
  return Boolean(siteId()) && Boolean(password());
}

// ──────────────────────────────────────────────
// SOAP plumbing
// ──────────────────────────────────────────────

function escapeXml(s: string | number | boolean | undefined | null): string {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Render an object to a flat list of <Key>value</Key> XML elements (no nesting).
 * Element order is preserved (matches insertion order). Empty strings ARE emitted —
 * WCF needs every parameter present in the right position to deserialize correctly,
 * even when its value is empty/null.
 */
function fields(obj: Record<string, string | number | boolean | undefined | null>): string {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `<${k}>${escapeXml(v)}</${k}>`)
    .join("");
}

/** Optional capture buffer — set by the debug endpoint to record the raw exchange. */
let lastExchange: { request: string; status: number; response: string } | null = null;
export function getLastDhlExchange() {
  return lastExchange;
}

async function callSoap(operation: string, innerXml: string): Promise<string> {
  const envelope =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="${NS}">` +
    `<soap:Body><tem:${operation}>${innerXml}</tem:${operation}></soap:Body>` +
    `</soap:Envelope>`;

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${NS}IDHLService/${operation}`,
    },
    body: envelope,
  });

  const text = await res.text();
  lastExchange = { request: envelope, status: res.status, response: text };

  if (!res.ok) {
    throw new Error(`DHL SOAP ${operation} failed (${res.status}): ${text.slice(0, 600)}`);
  }
  // SOAP services often return 200 OK even on application errors; surface <faultstring> if present.
  const fault = pickXml(text, "faultstring");
  if (fault) throw new Error(`DHL SOAP ${operation} fault: ${fault}`);
  return text;
}

/** Extract the *innermost* text content of <Tag>…</Tag> from a chunk of XML. Returns null if absent. */
function pickXml(xml: string, tag: string): string | null {
  const re = new RegExp(`<(?:[a-z0-9]+:)?${tag}[^>]*>([\\s\\S]*?)</(?:[a-z0-9]+:)?${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

// ──────────────────────────────────────────────
// Public types (kept identical to the previous client)
// ──────────────────────────────────────────────

export interface DhlRateResult {
  rate_inr: number;
  rate_usd: number; // not used by this service; kept for shape compatibility (always 0)
  etd_days: string;
  service_code: string;
}

export interface DhlShipmentItem {
  name: string;
  sku: string;
  units: number;
  selling_price_inr: number;
  weight_kg: number;
  hs_code?: string;
}

export interface CreateDhlShipmentPayload {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string; // ISO-2
  items: DhlShipmentItem[];
  declared_value_inr: number;
  weight_kg: number;
  payment_method: "Prepaid";
}

export interface CreateDhlShipmentResult {
  shipment_id: string;
  tracking_number: string;
  label_url: string;
  invoice_url: string;
}

export interface DhlTrackingResult {
  raw_status: string;
  events: { ts: string; description: string }[];
}

// ──────────────────────────────────────────────
// 1) Rate quote — PostQuote
// ──────────────────────────────────────────────

export async function getDhlRate(p: {
  destination_country: string;
  destination_postal_code: string;
  weight_kg: number;
  declared_value_inr: number;
}): Promise<DhlRateResult | null> {
  if (!isDhlConfigured()) {
    console.error("[dhl] credentials not set; skipping rate fetch");
    return null;
  }

  const wKg = Math.max(0.5, p.weight_kg);

  // Convert declared value INR → USD. DHL India outbound quotes expect USD
  // declared value for international shipments (customs valuation standard).
  const fxRate = await getUsdToInr();
  const declaredUsd = Math.max(1, Number((p.declared_value_inr / fxRate).toFixed(2)));

  // PostQuote element order matches the WCF method signature exactly. WCF
  // deserializes by element order — wrong order = NullReferenceException.
  // Real signature observed from the service stack trace:
  //   PostQuote(ShipperPostCode, ReceiverCountryCode, PostCode, fromCity,
  //             IsDutiable, PickupHours, PickupMinutes, DeclaredCurrency,
  //             DeclaredValue, NetworkTypeCode, GlobalProductCode,
  //             LocalProductCode, toCity, PaymentAccountNumber,
  //             pieces, ShipPieceWt, ShipPieceDepth, ShipPieceWidth, ShipPieceHeight)
  // Note: PostQuote does NOT take SiteId/Password (those belong to PostShipment_V6).
  // Empty strings cause the service to NullReferenceException — every field gets
  // a non-empty placeholder.
  const inner = fields({
    ShipperPostCode: process.env.DHL_PICKUP_POSTAL_CODE ?? "570011",
    ReceiverCountryCode: p.destination_country.toUpperCase(),
    PostCode: p.destination_postal_code,
    fromCity: process.env.DHL_PICKUP_CITY ?? "Mysuru",
    IsDutiable: "Y",            // sweets are dutiable goods (non-document)
    PickupHours: "17",          // 5pm placeholder; service crashes on empty
    PickupMinutes: "00",
    DeclaredCurrency: "USD",
    DeclaredValue: declaredUsd,
    NetworkTypeCode: "TD",      // Time Definite (DHL Express air)
    GlobalProductCode: "P",     // Express Worldwide (non-doc)
    LocalProductCode: "P",
    toCity: "NA",               // service crashes on empty toCity
    PaymentAccountNumber: accountNumber(),
    pieces: 1,
    ShipPieceWt: wKg.toFixed(2),
    ShipPieceDepth: 20,
    ShipPieceWidth: 15,
    ShipPieceHeight: 10,
  });

  try {
    // DHL India docs: "For Shipping Cost — kindly call PostQuote_RAS".
    const xml = await callSoap("PostQuote_RAS", inner);

    // The result is wrapped as a string inside <PostQuote_RASResult>…</PostQuote_RASResult>.
    // DHL packs the actual rate response either as inline XML (HTML-entity-encoded)
    // or pipe/comma-delimited inside that single string element.
    const rawResult = pickXml(xml, "PostQuote_RASResult") ?? xml;

    // Decode HTML entities so we can search for inner XML tags.
    const decoded = rawResult
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");

    // Try several common price-field names. The first numeric hit wins.
    const priceCandidates = [
      pickXml(decoded, "TotalAmount"),
      pickXml(decoded, "RateValue"),
      pickXml(decoded, "Total"),
      pickXml(decoded, "Amount"),
      pickXml(decoded, "Charge"),
      pickXml(decoded, "WeightCharge"),
      pickXml(decoded, "ShippingCharge"),
      pickXml(decoded, "BaseCharge"),
      pickXml(decoded, "FinalAmount"),
    ].filter(Boolean);

    const priceStr = priceCandidates[0] ?? null;
    const transit =
      pickXml(decoded, "TransitDays") ??
      pickXml(decoded, "ETD") ??
      pickXml(decoded, "DeliveryDays");
    const product =
      pickXml(decoded, "GlobalProductCode") ??
      pickXml(decoded, "ProductCode") ??
      "P";

    const rateInr = priceStr
      ? Math.ceil(parseFloat(priceStr.replace(/[^\d.]/g, "")))
      : NaN;

    if (!Number.isFinite(rateInr) || rateInr <= 0) {
      console.error(
        "[dhl] PostQuote_RAS response had no usable price. Decoded body:",
        decoded.slice(0, 800)
      );
      // Fall through to static fallback below.
    } else {
      return {
        rate_inr: rateInr,
        rate_usd: 0,
        etd_days: transit ?? "5-7",
        service_code: product,
      };
    }
  } catch (err) {
    console.error("[dhl] PostQuote_RAS threw — using static fallback:", err);
  }

  // ── Static zone-based fallback ─────────────────────────────────────────
  // DHL India's live rate service is currently unreliable for our account.
  // Fall back to a curated zone-based rate table per country (see countries.ts).
  // To switch back to live rates exclusively, remove this block.
  const staticRate = calculateStaticRate(p.destination_country, p.weight_kg);
  if (staticRate) {
    return {
      rate_inr: staticRate.rate_inr,
      rate_usd: 0,
      etd_days: staticRate.etd_days,
      service_code: "P",
    };
  }
  return null;
}

// ──────────────────────────────────────────────
// 2) Create shipment — PostShipment_CSBV (India ecom exports / CSB-V customs form)
// ──────────────────────────────────────────────

export async function createDhlShipment(
  p: CreateDhlShipmentPayload
): Promise<CreateDhlShipmentResult> {
  if (!isDhlConfigured()) {
    throw new Error("DHL credentials not set");
  }
  if (!accountNumber()) throw new Error("Missing DHL_ACCOUNT_NUMBER");
  if (!iecNo()) throw new Error("Missing DHL_IEC_NO (Import Export Code)");
  if (!gstin()) throw new Error("Missing DHL_GSTIN");
  if (!bankADCode()) throw new Error("Missing DHL_BANK_AD_CODE (Authorised Dealer code)");

  const wKg = Math.max(0.5, p.weight_kg);

  // Convert INR amounts to USD per item for the CSB-V customs invoice.
  const fxRate = await getUsdToInr();
  const declaredUsdTotal = Math.max(
    1,
    Number((p.declared_value_inr / fxRate).toFixed(2))
  );

  // Build per-item CSV strings (CSB-V uses comma-delimited per-item fields).
  const totalUnits = p.items.reduce((s, it) => s + it.units, 0);
  const items = p.items.map((it, idx) => {
    const fobUsd = Number(((it.selling_price_inr * it.units) / fxRate).toFixed(2));
    const igstAmt = Number(((fobUsd * igstPercentage()) / 100).toFixed(2));
    return {
      serial: idx + 1,
      mfgCode: "IN",
      mfgName: "INDIA",
      desc: it.name.slice(0, 75),
      qty: it.units,
      weight: it.weight_kg,
      hsCode: (it.hs_code ?? HS_CODE_SWEETS).replace(/\./g, ""),
      ratePerUnit: Number((it.selling_price_inr / fxRate).toFixed(2)),
      fobValue: fobUsd,
      taxableValue: fobUsd,
      igstPct: igstPercentage(),
      igstAmt,
      uom: "PCS",
      cess: 0,
      discount: 0,
      commodityType: "OTHERS",
    };
  });
  const csv = (key: keyof typeof items[number]) =>
    items.map((i) => i[key]).join(",");

  const totalIgst = items.reduce((s, it) => s + it.igstAmt, 0);
  const todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // PostShipment_CSBV element order matches the WSDL schema exactly.
  // Reference example XML provided by DHL India support.
  const inner = fields({
    Shipmentpurpose: "CSBV",
    ShipperAccNumber: accountNumber(),
    ShippingPaymentType: "S",                                // S = Shipper pays
    BillingAccNumber: accountNumber(),

    // Consignee (customer)
    ConsigneeCompName: p.customer_name.slice(0, 60),
    ConsigneeAddLine1: p.address.slice(0, 45),
    ConsigneeAddLine2: p.address2?.slice(0, 45) ?? "",
    ConsigneeAddLine3: "",
    ConsigneeCity: p.city.slice(0, 35),
    ConsigneeDivCode: p.country.toUpperCase() === "US" ? p.state.slice(0, 2) : "",
    PostalCode: p.postal_code,
    ConsigneeCountryCode: p.country.toUpperCase(),
    ConsigneeCountryName: p.country.toUpperCase(),
    ConsigneeName: p.customer_name.slice(0, 35),
    ConsigneePh: p.customer_phone,
    ConsigneeEmail: p.customer_email,
    RegistrationNumber: "",
    RegistrationNumberTypeCode: "",
    RegistrationNumberIssuerCountryCode: "",
    BusinessPartyTypeCode: "",

    // Shipment-level dutiable / piece info (USD)
    DutiableDeclaredvalue: declaredUsdTotal,
    DutiableDeclaredCurrency: "USD",
    ShipNumberOfPieces: 1,
    ShipCurrencyCode: "USD",
    ShipPieceWt: wKg.toFixed(2),
    ShipPieceDepth: 20,
    ShipPieceWidth: 15,
    ShipPieceHeight: 10,
    ShipGlobalProductCode: "P",
    ShipLocalProductCode: "P",
    ShipContents: items.map((i) => i.desc).join(", ").slice(0, 90),

    // Shipper (us)
    ShipperId: accountNumber(),
    ShipperCompName: (process.env.DHL_PICKUP_NAME ?? "World of Mysore Pak").slice(0, 60),
    ShipperAddress1: (process.env.DHL_PICKUP_ADDRESS_LINE1 ?? "").slice(0, 45),
    ShipperAddress2: "",
    ShipperAddress3: "",
    ShipperCountryCode: "IN",
    ShipperCountryName: "INDIA",
    ShipperCity: (process.env.DHL_PICKUP_CITY ?? "Mysuru").slice(0, 35),
    ShipperPostalCode: process.env.DHL_PICKUP_POSTAL_CODE ?? "570011",
    ShipperPhoneNumber: process.env.DHL_PICKUP_PHONE ?? "",
    SiteId: siteId(),
    Password: password(),
    ShipperName: (process.env.DHL_PICKUP_NAME ?? "World of Mysore Pak").slice(0, 35),
    ShipperRef: p.order_number,
    ShipperRegistrationNumber: "",
    ShipperRegistrationNumberTypeCode: "",
    ShipperRegistrationNumberIssuerCountryCode: "",
    ShipperBusinessPartyTypeCode: "",

    // BillTo (we are the payer; leave blank when ShippingPaymentType=S)
    BillToCompanyName: "", BillToContactName: "", BillToAddressLine1: "",
    BillToCity: "", BillToPostcode: "", BillToSuburb: "", BillToState: "",
    BillToCountryName: "", BillToCountryCode: "", BillToPhoneNumber: "",

    // India compliance
    IECNo: iecNo(),
    TermsOfTrade: "DAP",
    Usingecommerce: "Y",
    IsUnderMEISScheme: "N",
    GSTIN: gstin(),
    GSTInvNo: "",
    GSTInvNoDate: "",
    NonGSTInvNo: p.order_number,
    NonGSTInvDate: todayIso,
    IsUsingIGST: isUsingIGST(),
    UsingBondorUT: usingBondOrUT(),
    BankADCode: bankADCode(),

    // Exporter on Record (same as shipper for SMB exporters)
    Exporter_CompanyName: "", Exporter_AddressLine1: "", Exporter_AddressLine2: "",
    Exporter_AddressLine3: "", Exporter_City: "", Exporter_DivisionCode: "",
    Exporter_PostalCode: "", Exporter_CountryCode: "", Exporter_CountryName: "",
    Exporter_PersonName: "", Exporter_PhoneNumber: "", Exporter_Email: "",
    Exporter_RegistrationNumber: "", Exporter_RegistrationNumberTypeCode: "",
    Exporter_RegistrationNumberIssuerCountryCode: "", Exporter_BusinessPartyTypeCode: "",

    // Invoice / customs declaration
    UseDHLInvoice: "Y",
    SignatureName: "",
    SignatureTitle: "",
    LicenseNumber: "",
    ExpiryDate: "",
    ManufactureCountryCode: items.map((i) => i.mfgCode).join(","),
    ManufactureCountryName: items.map((i) => i.mfgName).join(","),
    SerialNumber: csv("serial"),
    FOBValue: csv("fobValue"),
    Discount: csv("discount"),
    Description: csv("desc"),
    Qty: csv("qty"),
    Weight: csv("weight"),
    HSCode: csv("hsCode"),
    CommodityCode: csv("hsCode"),
    CommodityType: csv("commodityType"),
    InvoiceRatePerUnit: csv("ratePerUnit"),
    ShipPieceUOM: csv("uom"),
    ShipPieceCESS: csv("cess"),
    ShipPieceIGSTPercentage: csv("igstPct"),
    ShipPieceIGST: csv("igstAmt"),
    ShipPieceTaxableValue: csv("taxableValue"),

    // Charges
    FreightCharge: 0,
    InsuranceCharge: 0,
    TotalIGST: Number(totalIgst.toFixed(2)),
    CessCharge: 0,
    ReverseCharge: 0,
    PayerGSTVAT: "",

    // Label / response
    IsResponseRequired: "Y",
    LabelReq: "Y",
    SpecialService: "",
    InsuredAmount: 0,

    // Indemnity + state
    Invoicevalueinword: "",
    Placeofsupply: process.env.DHL_PICKUP_CITY ?? "Mysuru",
    dateofsupply: todayIso,
    Shipperstatecode: shipperStateCode(),
    ShipperstateName: shipperStateName(),
    isIndemnityClauseRead: "YES",

    // Account / governance flags from the example
    GOV_NONGOV_TYPE: "P",   // P = Private
    NFEI_FLAG: "NO",
    CustomerBarcodeCode: "",
    CustomerBarcodeText: "",
    // Use totalUnits to silence unused-var lint if needed
    ...(totalUnits > 0 ? {} : {}),
  });

  const xml = await callSoap("PostShipment_CSBV", inner);
  const rawResult = pickXml(xml, "PostShipment_CSBVResult") ?? xml;

  // The CSB-V result is a packed string — decode HTML entities so we can scan tags.
  const result = rawResult
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

  const awb =
    pickXml(result, "AWBNumber") ??
    pickXml(result, "AwbNumber") ??
    pickXml(result, "AWB") ??
    pickXml(result, "WaybillNumber") ??
    pickXml(result, "AirwayBillNumber") ??
    "";
  const shipmentId =
    pickXml(result, "ShipmentID") ??
    pickXml(result, "ShipmentId") ??
    awb;

  const labelB64 =
    pickXml(result, "LabelImage") ??
    pickXml(result, "Label") ??
    pickXml(result, "Image") ??
    "";
  const invoiceB64 =
    pickXml(result, "InvoiceImage") ??
    pickXml(result, "Invoice") ??
    "";

  if (!awb) {
    const errMsg =
      pickXml(result, "ErrorMessage") ??
      pickXml(result, "Message") ??
      pickXml(result, "Status") ??
      result.slice(0, 400) ??
      "Unknown DHL error (no AWB returned)";
    throw new Error(`DHL PostShipment_CSBV failed: ${errMsg}`);
  }

  return {
    shipment_id: shipmentId,
    tracking_number: awb,
    label_url: labelB64 ? `data:application/pdf;base64,${labelB64}` : "",
    invoice_url: invoiceB64 ? `data:application/pdf;base64,${invoiceB64}` : "",
  };
}

// ──────────────────────────────────────────────
// 3) Tracking — PostTracking
// ──────────────────────────────────────────────

export async function getDhlTracking(
  tracking_number: string
): Promise<DhlTrackingResult | null> {
  if (!isDhlConfigured()) return null;

  const inner = fields({
    SiteId: siteId(),
    Password: password(),
    awbnumber: tracking_number,
  });

  try {
    // DHL India docs: "For Tracking — kindly call PostTracking_AllCheckpoint".
    const xml = await callSoap("PostTracking_AllCheckpoint", inner);
    const rawResult =
      pickXml(xml, "PostTracking_AllCheckpointResult") ??
      pickXml(xml, "PostTrackingResult") ??
      xml;
    const result = rawResult
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");

    const status =
      pickXml(result, "ShipmentStatus") ??
      pickXml(result, "Status") ??
      pickXml(result, "CurrentStatus") ??
      "";

    // Pull <Checkpoint>…</Checkpoint> blocks if present
    const events: { ts: string; description: string }[] = [];
    const cpRe = /<(?:[a-z0-9]+:)?Checkpoint[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?Checkpoint>/gi;
    let m: RegExpExecArray | null;
    while ((m = cpRe.exec(result)) !== null) {
      const cp = m[1];
      events.push({
        ts: pickXml(cp, "Date") ?? pickXml(cp, "Time") ?? "",
        description:
          pickXml(cp, "Description") ??
          pickXml(cp, "ScanDescription") ??
          pickXml(cp, "Status") ??
          "",
      });
    }

    return { raw_status: status, events };
  } catch (err) {
    console.error("[dhl] PostTracking threw:", err);
    return null;
  }
}
