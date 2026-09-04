import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { forwardRef } from "react";
import { toast } from "sonner";
import { ToWords } from 'to-words';
type Props = {
  data: any;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 25,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  outerBorder: {
    border: 1,
    borderColor: "#000",
    flexGrow: 1,
  },

  titleBar: {
    backgroundColor: "#FABE8E",
    textAlign: "center",
    paddingVertical: 4,
    borderBottom: 1,
    borderColor: "#000",
  },
  titleText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },

  topSection: {
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#000",
    marginBottom: 6
  },
  transporterBox: {
    flex: 1,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    borderRight: 1,
    borderColor: "#000",
  },
  billToBox: {
    flex: 1,
    padding: 6,
  },
  labelText: {
    fontSize: 8,
    textDecoration: "underline",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 1,
  },
  normalText: {
    fontSize: 8,
    marginBottom: 1,
  },
  gstinRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  gstinLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  gstinValue: {
    fontSize: 8,
  },

  metaRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#000",
    marginBottom: 4
  },
  metaCell: {
    flex: 1,
    borderRight: 1,
    borderColor: "#000",
    padding: 4,
  },
  metaCellLast: {
    flex: 1,
    padding: 4,
  },
  metaLabel: {
    fontSize: 7,
    color: "#555",
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#92CDDC",
    borderBottom: 1,
    borderColor: "#000",
    paddingVertical: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 0.5,
    borderColor: "#ccc",
    paddingVertical: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: 0.5,
    borderColor: "#ccc",
    paddingVertical: 4,
    backgroundColor: "#f9f9f9",
  },

  colSN: { width: "5%", paddingHorizontal: 4 },
  colTruck: { width: "16%", paddingHorizontal: 4 },
  colBillNo: { width: "18%", paddingHorizontal: 4 },
  colLoading: { width: "20%", paddingHorizontal: 4 },
  colDate: { width: "12%", paddingHorizontal: 4 },
  colUnload: { width: "20%", paddingHorizontal: 4 },
  colWt: { width: "10%", paddingHorizontal: 4, textAlign: "right" },
  colRate: { width: "12%", paddingHorizontal: 4, textAlign: "right" },
  colAmount: { width: "18%", paddingHorizontal: 4, textAlign: "right" },

  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  cell: {
    fontSize: 8,
  },

  totalsSection: {
    flexDirection: "row",
    borderTop: 1,
    borderColor: "#000",
  },
  leftBlank: {
    flex: 3,
    borderRight: 1,
    borderColor: "#000",
    padding: 6,
  },
  rightTotals: {
    flex: 2,
    padding: 0,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottom: 0.5,
    borderColor: "#ddd",
  },
  totalLabelBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  totalLabel: {
    fontSize: 8,
  },
  totalValue: {
    fontSize: 8,
    textAlign: "right",
  },
  totalValueBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "right",
  },
  outstandingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#d9d9d9",
  },

  wordsRow: {
    borderTop: 1,
    borderBottom: 1,
    borderColor: "#000",
    padding: 5,
    flexDirection: "row",
  },
  wordsLabel: {
    fontSize: 8,
    textDecoration: "underline",
    marginRight: 4,
    fontFamily: "Helvetica-Bold",
  },
  wordsText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  eoe: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },

  bottomSection: {
    flexDirection: "row",
    borderTop: 0,
    borderColor: "#000",
  },
  bankBox: {
    flex: 2,
    padding: 6,
    borderRight: 1,
    borderColor: "#000",
  },
  declarationBox: {
    flex: 3,
    padding: 6,
  },
  bankLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textDecoration: "underline",
    marginBottom: 4,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bankKey: {
    fontSize: 8,
    width: 90,
  },
  bankVal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    flex: 1,
  },
  declarationLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textDecoration: "underline",
    marginBottom: 4,
  },
  declarationText: {
    fontSize: 8,
    color: "#333",
    lineHeight: 1.4,
  },
  signatureBox: {
    marginTop: 6,
    textAlign: "right",
  },
  signatureText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "right",
  },

  footerSection: {
    borderTop: 1,
    borderColor: "#000",
    padding: 4,
    marginTop: 5
  },
  footerText: {
    fontSize: 7,
    color: "#555",
    textAlign: "center",
    marginBottom: 1,
  },
});


const transporter = {
  name: "ASSAM TRANSPORT AGENCY",
  address: "H.O. RAJABARI MISSION COMPOUND JORHAT-785014 (ASSAM)",
  mob: "MOB: +91 96781 21562",
  gstin: "18AEIPC9370B3ZL",
};

const bank = {
  holder: "Assam Transport Agency",
  bank: "State Bank of India",
  account: "36383276487575",
  branch: "Borpool  SBIN0007575",
};


const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


const TransportBillPDF = forwardRef<HTMLDivElement, Props>(
  ({ data }, ref) => {
    if (!data) return;
    if (!data.expand?.invoices_via_transaction) {
      toast.error("Refresh the page!", {
        style: {
          background: "#dc2626",
          color: "white",
          border: "none"
        }
      });
      return;
    };
    const shipments = data.expand?.invoices_via_transaction ? data.expand.invoices_via_transaction.map((e: any, i: number) => ({
      sn: i + 1,
      truck: data.expand.fleet.truck_no,
      bill: e.invoice_number,
      loading: data.from_location,
      date: new Date(data.date_of_loading).toLocaleDateString("en-GB"),
      unloading: data.to_location,
      wt: data.loading_point_weight,
      rate: data.rate_per_tonne,
      total_amount: data.total_amount,
    })) : [];
    const payments = [
      {
        date: new Date(data.created).toLocaleDateString("en-GB"),
        amount: data.advance_amount
      }
    ];
    const totalChargeable = shipments.reduce((s, r) => s + Number(r.total_amount), 0);
    const totalReceived = payments.reduce((s, p) => s + Number(p.amount), 0);
    const outstanding = totalChargeable - totalReceived;

    const meta = {
      paymentMode: "e-Fund Transfer",
      dueDate: "Within 7 Days",
      billNo: shipments[0]?.bill ?? "",
      consignmentNo: data.cn_no,
      billDate: new Date(data.created).toLocaleDateString("en-GB"),
    };

    const client = {
      name: data.expand.client.name,
      address: data.expand.client.address,
      contact: `WhatsApp: ${data.expand.client.phone}`,
      gstin: data.expand.client.gst,
    };

    const tw = new ToWords({ localeCode: 'en-IN' });

     const word = tw.convert(outstanding, { currency: true });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerBorder}>

            <View style={styles.titleBar} fixed>
              <Text style={styles.titleText}>INVOICE</Text>
            </View>

            <View style={styles.topSection} fixed>
              <View style={styles.transporterBox}>
                <Text style={styles.labelText}>TRANSPORTER</Text>
                <Text style={styles.boldText}>{transporter.name}</Text>
                <Text style={styles.normalText}>{transporter.address}</Text>
                <Text style={styles.normalText}>{transporter.mob}</Text>
                <View style={styles.gstinRow}>
                  <Text style={styles.gstinLabel}>GSTIN/UIN: </Text>
                  <Text style={styles.gstinValue}>{transporter.gstin}</Text>
                </View>
              </View>

              <View style={{ width: 1, backgroundColor: "#000" }} />

              <View style={styles.billToBox}>
                <Text style={styles.labelText}>BILL TO</Text>
                <Text style={styles.boldText}>{client.name}</Text>
                <Text style={styles.normalText}>{client.address}</Text>
                <Text style={styles.normalText}>{client.contact}</Text>
                <View style={styles.gstinRow}>
                  <Text style={styles.gstinLabel}>GSTIN/UIN: </Text>
                  <Text style={styles.gstinValue}>{client.gstin}</Text>
                </View>
              </View>
              <View style={{
                position: "absolute",
                bottom: -1,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "#000",
              }} />
            </View>


            <View style={styles.metaRow}>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Payement Mode</Text>
                <Text style={styles.metaValue}>{meta.paymentMode}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaValue}>{meta.dueDate}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>BILL NO</Text>
                <Text style={styles.metaValue}>{meta.billNo}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Consignment No.</Text>
                <Text style={styles.metaValue}>{meta.consignmentNo}</Text>
              </View>
              <View style={styles.metaCellLast}>
                <Text style={styles.metaLabel}>BILL DATE</Text>
                <Text style={styles.metaValue}>{meta.billDate}</Text>
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colSN]}>S/N</Text>
              <Text style={[styles.headerCell, styles.colTruck]}>Truck No.</Text>
              <Text style={[styles.headerCell, styles.colBillNo]}>Bill No.</Text>
              <Text style={[styles.headerCell, styles.colLoading]}>Loading</Text>
              <Text style={[styles.headerCell, styles.colDate]}>Load Date</Text>
              <Text style={[styles.headerCell, styles.colUnload]}>Unloading</Text>
              <Text style={[styles.headerCell, styles.colWt]}>Wt./MT</Text>
              <Text style={[styles.headerCell, styles.colRate]}>Rate/MT</Text>
              <Text style={[styles.headerCell, styles.colAmount]}>Amount</Text>
            </View>

            {shipments.map((r, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.cell, styles.colSN]}>{r.sn}</Text>
                <Text style={[styles.cell, styles.colTruck]}>{r.truck}</Text>
                <Text style={[styles.cell, styles.colBillNo]}>{r.bill}</Text>
                <Text style={[styles.cell, styles.colLoading]}>{r.loading}</Text>
                <Text style={[styles.cell, styles.colDate]}>{r.date}</Text>
                <Text style={[styles.cell, styles.colUnload]}>{r.unloading}</Text>
                <Text style={[styles.cell, styles.colWt]}>{r.wt.toFixed(3)}</Text>
                <Text style={[styles.cell, styles.colRate]}>{fmt(r.rate)}</Text>
                <Text style={[styles.cell, styles.colAmount]}>{fmt(r.total_amount)}</Text>
              </View>
            ))}

            <View style={{
              height: 1,
              backgroundColor: "#000",
              marginBottom: 0,
            }} />

            <View style={styles.totalsSection}>
              <View style={styles.leftBlank} />

              <View style={styles.rightTotals}>
                <View style={[styles.totalRow, { backgroundColor: "#f3f4f6" }]}>
                  <Text style={styles.totalLabelBold}>Total Amount Chargeable</Text>
                  <Text style={styles.totalValueBold}>{fmt(totalChargeable)}</Text>
                </View>

                <View style={[styles.totalRow, { backgroundColor: "#e8f0e8" }]}>
                  <Text style={styles.totalLabelBold}>Amount Received</Text>
                  <Text style={styles.totalLabel}></Text>
                </View>

                {payments.map((p, i) => (
                  <View key={i} style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Received as on {p.date}</Text>
                    <Text style={styles.totalValue}>{fmt(p.amount)}</Text>
                  </View>
                ))}

                <View style={[styles.totalRow, { backgroundColor: "#f3f4f6" }]}>
                  <Text style={styles.totalLabelBold}>Total Amount Received</Text>
                  <Text style={styles.totalValueBold}>{fmt(totalReceived)}</Text>
                </View>
              </View>
            </View>
            <View style={{
              height: 1,
              backgroundColor: "#000",
              marginBottom: 0,
            }} />
            <View style={styles.totalsSection}>
              <View style={styles.leftBlank} />
              <View style={styles.rightTotals}>
                <View style={styles.outstandingRow}>
                  <Text style={styles.totalLabelBold}>Total Outstanding Amount</Text>
                  <Text style={styles.totalValueBold}>{fmt(outstanding)}</Text>
                </View>
              </View>
            </View>

            <View style={{
              height: 1,
              backgroundColor: "#000",
              marginBottom: 8,
            }} />

            <View style={styles.wordsRow}>
              <Text style={styles.wordsLabel}>Total Outstanding Amount (in words)</Text>
              <Text style={styles.eoe}>E. &amp; O.E.</Text>
            </View>
            <View style={{ padding: 5, borderBottom: 1, borderColor: "#000" }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8 }}>
                {word}
              </Text>
            </View>

            <View style={{
              height: 1,
              backgroundColor: "#000",
              marginBottom: 0,
            }} />

            <View style={styles.bottomSection}>
              <View style={styles.bankBox}>
                <Text style={styles.bankLabel}>Company's Bank Details</Text>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>A/c Holder's Name</Text>
                  <Text style={styles.bankVal}>: {bank.holder}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>Bank Name</Text>
                  <Text style={styles.bankVal}>: {bank.bank}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>A/c No.</Text>
                  <Text style={styles.bankVal}>: {bank.account}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>Branch &amp; IFS Code</Text>
                  <Text style={styles.bankVal}>: {bank.branch}</Text>
                </View>
              </View>

              <View style={styles.declarationBox}>
                <Text style={styles.declarationLabel}>Declaration</Text>
                <Text style={styles.declarationText}>
                  We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
                </Text>
                <View style={styles.signatureBox}>
                  <Text style={styles.signatureText}>for Assam Transport Agency</Text>
                  <Text style={{ fontSize: 8, textAlign: "right", marginTop: 16 }}>Authorised Signatory</Text>
                </View>
              </View>
            </View>

            <View style={{
              height: 1,
              backgroundColor: "#000",
              marginTop: 4,
            }} />

            <View style={styles.footerSection}>
              <Text style={styles.footerText}>SUBJECT TO JORHAT JURISDICTION ONLY</Text>
              <Text style={styles.footerText}>This is a Computer Generated Invoice</Text>
            </View>

          </View>
        </Page>
      </Document>
    );
  });

export default TransportBillPDF;