import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { forwardRef } from "react";

type Props = {
  data: any;
};


const styles = StyleSheet.create({
  page: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },

  /* ── Header ── */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  lorryTag: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    border: "1pt solid #000",
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  agencyBlock: { alignItems: "center", flex: 1 },
  agencyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  agencySubtitle: { fontSize: 7, marginTop: 1 },
  agencyAddress: { fontSize: 6.5, color: "#333", marginTop: 1 },
  mfBlock: { alignItems: "flex-end", minWidth: 90 },
  mfLabel: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  mfValue: { fontSize: 7, marginTop: 1 },

  divider: { borderBottom: "1.5pt solid #000", marginVertical: 3 },
  thinLine: { borderBottom: "0.5pt solid #888", marginVertical: 2 },

  /* ── Grid helpers ── */
  row: { flexDirection: "row" },
  cell: {
    border: "0.5pt solid #000",
    padding: "2pt 3pt",
    justifyContent: "center",
  },
  label: { fontSize: 6, color: "#555" },
  value: { fontSize: 7.5, fontFamily: "Helvetica-Bold", marginTop: 1 },

  /* ── Consignment table ── */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    border: "0.5pt solid #000",
  },
  th: {
    padding: "2pt 3pt",
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    borderRight: "0.5pt solid #000",
    flex: 1,
    textAlign: "center",
  },
  td: {
    padding: "2pt 3pt",
    fontSize: 7,
    borderRight: "0.5pt solid #000",
    flex: 1,
    textAlign: "center",
    minHeight: 18,
  },
  tdRow: { flexDirection: "row", border: "0.5pt solid #000", borderTop: 0 },

  /* ── Freight summary ── */
  freightBox: {
    border: "0.5pt solid #000",
    padding: "3pt 5pt",
    flex: 1,
  },
  freightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  freightLabel: { fontSize: 6.5 },
  freightValue: { fontSize: 7, fontFamily: "Helvetica-Bold" },

  /* ── Vehicle / Owner details ── */
  detailsSection: { marginTop: 5 },
  detailRow: { flexDirection: "row", marginBottom: 3 },
  detailField: { flex: 1, borderBottom: "0.5pt solid #777", marginRight: 6 },
  detailFieldLabel: { fontSize: 6, color: "#555" },
  detailFieldValue: { fontSize: 7.5, fontFamily: "Helvetica-Bold", paddingBottom: 1 },

  /* ── Terms ── */
  termsBox: {
    border: "0.5pt solid #000",
    padding: "4pt 5pt",
    marginTop: 5,
    backgroundColor: "#fafafa",
  },
  termsTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    textDecoration: "underline",
  },
  termItem: { fontSize: 6, marginBottom: 2, lineHeight: 1.35 },

  /* ── Declaration ── */
  declarationBox: { marginTop: 5, border: "0.5pt solid #000", padding: "3pt 5pt" },
  declarationText: { fontSize: 6.5, lineHeight: 1.4, fontFamily: "Helvetica-Oblique" },

  /* ── Signature strip ── */
  sigStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  sigBlock: { alignItems: "center", flex: 1 },
  sigLine: { borderTop: "0.5pt solid #000", width: 90, marginBottom: 2 },
  sigLabel: { fontSize: 6.5 },

  /* ── Final payment ── */
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    border: "0.5pt solid #000",
    padding: "2pt",
    backgroundColor: "#e8e8e8",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fpTable: { border: "0.5pt solid #000", borderTop: 0 },
  fpRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ccc",
    padding: "2pt 5pt",
    justifyContent: "space-between",
  },
  fpLabel: { fontSize: 7 },
  fpAmount: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  fpTotalRow: {
    flexDirection: "row",
    padding: "2pt 5pt",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
  },
  fpTotalLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  fpTotalAmount: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  rupeesBox: {
    border: "0.5pt solid #000",
    borderTop: 0,
    padding: "2pt 5pt",
    fontSize: 7,
    fontFamily: "Helvetica-Oblique",
  },
  finalDetailsRow: { flexDirection: "row", marginTop: 4, gap: 6 },
  finalDetailField: {
    flex: 1,
    borderBottom: "0.5pt solid #777",
  },
  finalDetailLabel: { fontSize: 6, color: "#555" },
  finalDetailValue: { fontSize: 7, fontFamily: "Helvetica-Bold", paddingBottom: 1 },
});

const Field = ({ label, value, style }) => (
  <View style={[styles.cell, style]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const ChallanPDF = forwardRef<HTMLDivElement, Props>(
  ({ data }, ref) => {
    if (!data) return;

    const flatItems = data.expand?.transactions.flatMap((t: any) =>
      (t.items || []).map((item: any) => ({
        cn_no: t.cn_no,
        from: t.from_location,
        to: t.to_location,
        ...item,
      }))
    );

    const payments = data.expand?.challan_payments_via_challan ?? [];

    return (
      <Document title="Assam Transport Agency – Lorry Challan">
        <Page size="A4" style={styles.page}>

          <View style={styles.headerRow} fixed>
            <Text style={styles.lorryTag}>Lorry Copy</Text>

            <View style={styles.agencyBlock}>
              <Text style={styles.agencyName}>Assam Transport Agency</Text>
              <Text style={styles.agencySubtitle}>
                HEAD OFFICE : RAJABARI MISSION COMPOUND, JORHAT – 785014 (ASSAM)
              </Text>
              <Text style={styles.agencyAddress}>
                BRANCH OFFICE : BELTOLA, GUWAHATI
              </Text>
            </View>

            <View style={styles.mfBlock}>
              <Text style={styles.mfLabel}>M/F No.</Text>
              <Text style={styles.mfValue}>{data.mf_no}</Text>
              <Text style={[styles.mfLabel, { marginTop: 4 }]}>Date</Text>
              <Text style={styles.mfValue}>
                {new Date(data.created).toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} fixed />

          <View style={styles.row}>
            <Field label="Lorry No." value={data.expand.fleet.truck_no} style={{ flex: 2 }} />
            <Field label="To" value={data.destination} style={{ flex: 2 }} />
          </View>

          <View style={[styles.tableHeader, { marginTop: 3 }]}>
            {["C/N No.", "Package", "From", "To", "Contents", "Weight (MT)", "Remarks"].map((h) => (
              <Text key={h} style={styles.th}>{h}</Text>
            ))}
          </View>
          <View>
            {flatItems.map((row: any, i: number) => (
              <View key={i} style={styles.tdRow}>
                {[
                  row.cn_no,
                  row.package,
                  row.from,
                  row.to,
                  row.contents,
                  row.weight,
                  row.remarks,
                ].map((v, j) => (
                  <Text key={j} style={styles.td}>
                    {v}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          {/* ── FREIGHT SUMMARY ────────────────────────────────────────── */}
          <View style={[styles.row, { marginTop: 4, gap: 4 }]}>
            <View style={styles.freightBox}>
              <Text style={[styles.freightLabel, { fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>
                Freight Per Ton: {data.freight_per_ton}
              </Text>
              <Text style={[styles.freightLabel, { fontFamily: "Helvetica-Bold" }]}>
                Total Freight: {data.total_freight}
              </Text>
            </View>

            <View style={[styles.freightBox, { flex: 1 }]}>
              <View style={styles.freightRow}>
                <Text style={styles.freightLabel}>TDS.</Text>
                <Text style={styles.freightValue}>{data.tds_rs}%</Text>
              </View>
              <Text style={[styles.freightLabel, { marginTop: 3 }]}>
                Adjusted from Advance
              </Text>
              <Text style={[styles.freightLabel, { marginTop: 4 }]}>PAN No.</Text>
              <Text style={styles.freightValue}>{data.expand.fleet.truck_owner_pan_no}</Text>
              <Text style={[styles.freightLabel, { marginTop: 3, fontSize: 5.5, color: "#555" }]}>
                Balance payment at any of the Branches
              </Text>
            </View>

            <View style={[styles.freightBox, { flex: 1.4 }]}>
              {[
                ["Freight Rs.", data.freight_rs],
              ].map(([lbl, val]) => (
                <View key={lbl} style={styles.freightRow}>
                  <Text style={styles.freightLabel}>{lbl}</Text>
                  <Text style={styles.freightValue}>{val}</Text>
                </View>
              ))}
              <View
                style={[styles.tableHeader,{
                  flexDirection: "row",
                  padding: 2,
                }]}
              >
                <Text style={{ flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                  Paid
                </Text>
                <Text style={{ flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                  Balance
                </Text>
                <Text style={{ flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                  Date
                </Text>
              </View>

              {(payments || []).map((p: any, i: number) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 0.5,
                    borderColor: "#ddd",
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 7}}>
                    {p.paid ?? 0}
                  </Text>

                  <Text style={{ flex: 1, fontSize: 7}}>
                    {p.pending ?? 0}
                  </Text>

                  <Text style={{ flex: 1, fontSize: 7 }}>
                    {p.created
                      ? new Date(p.created).toLocaleDateString("en-GB")
                      : "-"}
                  </Text>
                </View>
              ))}
            </View>
            
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={[styles.detailField, { flex: 2 }]}>
                <Text style={styles.detailFieldLabel}>Owner's Name &amp; Address</Text>
                <Text style={styles.detailFieldValue}>
                  {data.expand.fleet.truck_owner_name} – {data.expand.fleet.truck_owner_address}
                </Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Owner's Aadhaar.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.truck_owner_aadhaar_no}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Driver's Name</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.driver_name}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>D/L No.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.driving_licence_no}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Driver's Aadhaar.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.driver_aadhaar_no}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Engine No.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.engine_no}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Chassis No.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.chassis_no}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Hired Through / Broker's</Text>
                <Text style={styles.detailFieldValue}>{data.hired_through}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Driver's Phone No.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.driver_mobile_no}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.detailFieldLabel}>Owner's Phone No.</Text>
                <Text style={styles.detailFieldValue}>{data.expand.fleet.truck_owner_mobile_no}</Text>
              </View>
            </View>
          </View>

          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>TERMS OF CARRIAGE</Text>
            {[
              "1. Goods are to be delivered at Party's Godown according to the instruction of our Destination Office.",
              "2. No delivery will be made/accepted on Sunday/Holidays.",
              "3. Goods loaded on the Board of this Truck are agreed to be delivered by the Owner(s)/Driver within stipulated days failing which penalty @ Rs. 200/- per day will be deducted from the balance.",
              "4. No additional or extra charges will be paid save & except the Freight Amount agreed upon and as mentioned hereinabove in the Challan. For any detention/interruption enroute caused for any unforeseen circumstances, no extra payment will be entertained.",
              "5. It may be specially noted that the driver/owner(s) of this Truck will not carry any other Goods of whatsoever nature legal or illegal, other than the Goods loaded on the Board of this Truck as per manifest.",
              "6. If any damage, shortage, or defect of goods is found, the value of goods will be recovered from the Truck Driver/Owner.",
            ].map((t) => (
              <Text key={t} style={styles.termItem}>{t}</Text>
            ))}
          </View>

          {/* <View style={styles.declarationBox}>
            <Text style={styles.declarationText}>
              We do hereby receive on the Board of this Truck Number{" "}
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{data.expand.fleet.truck_no}</Text> the
              goods/materials for carriage as mentioned hereinabove in the challan for their sound and
              safe delivery at the destination as agreed.
            </Text>
          </View> */}

          <View style={styles.declarationBox}>
            <Text style={styles.declarationText}>
             The Freight will be calculated on the weight bridge at the delivery point. The driver is responsible for delivering the goods on the weight slip of the loading point. If any shrinkage or shortage observed will have to be settled on Mutual understanding.
            </Text>
          </View>

          <View style={styles.sigStrip}>
            {["Dispatching Incharge", "Signature of Broker", "Signature of Driver/Owner"].map((s) => (
              <View key={s} style={styles.sigBlock}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>{s}</Text>
              </View>
            ))}
          </View>

          {/* ── FINAL PAYMENT PARTICULARS ──────────────────────────────── */}
          {/* <Text style={styles.sectionTitle}>Final Payment Particulars</Text>
 
      <View style={styles.fpTable}>
        {CHALLAN.finalPaymentRemarks.map((r) => (
          <View key={r.label} style={styles.fpRow}>
            <Text style={styles.fpLabel}>{r.label}</Text>
            <Text style={styles.fpAmount}>₹ {r.amount}</Text>
          </View>
        ))}
        <View style={styles.fpTotalRow}>
          <Text style={styles.fpTotalLabel}>TOTAL</Text>
          <Text style={styles.fpTotalAmount}>₹ {CHALLAN.finalTotal}</Text>
        </View>
      </View>
 
      <Text style={styles.rupeesBox}>
        Rupees: {CHALLAN.rupeesInWords}
      </Text>
 
      <View style={styles.finalDetailsRow}>
        {[
          ["Final Balance Amount Paid at", CHALLAN.finalBalancePaidAt],
          ["Cash / Cheque No.", CHALLAN.cashChequeNo],
          ["Bank", CHALLAN.bank],
        ].map(([lbl, val]) => (
          <View key={lbl} style={styles.finalDetailField}>
            <Text style={styles.finalDetailLabel}>{lbl}</Text>
            <Text style={styles.finalDetailValue}>{val}</Text>
          </View>
        ))}
      </View> */}

        </Page>
      </Document>
    );
  });
export default ChallanPDF;