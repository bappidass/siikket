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


const S = StyleSheet.create({
    page: {
        fontSize: 7,
        fontFamily: "Helvetica",
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 14,
        backgroundColor: "#fff",
    },

    /* header */
    headerWrap: { flexDirection: "row", alignItems: "stretch", border: "0.75pt solid #000" },
    headerLeft: { width: 90, padding: "4pt 5pt", justifyContent: "center" },
    headerCenter: { padding: "3pt 4pt", alignItems: "center", justifyContent: "center", flex: 1 },
    headerRight: { width: 110, padding: "3pt 5pt", justifyContent: "space-between" },

    copyTag: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 3 },
    cnRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    cnLabel: { fontSize: 7 },
    cnNo: { fontSize: 9, fontFamily: "Helvetica-Bold", border: "0.5pt solid #000", paddingHorizontal: 4, paddingVertical: 1, color: 'red' },

    agencyName: { fontSize: 13, fontFamily: "Helvetica-Bold", letterSpacing: 0.5, textAlign: "center" },
    agencyPhone: { fontSize: 6.5, textAlign: "center", marginTop: 1 },
    agencyAddr1: { fontSize: 6.5, textAlign: "center" },
    agencyAddr2: { fontSize: 6.5, textAlign: "center" },
    cnTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 3, textDecoration: "underline", letterSpacing: 1 },

    gstLabel: { fontSize: 6.5, fontFamily: "Helvetica-Bold", marginBottom: 2 },
    gstOption: { fontSize: 6.5, marginBottom: 1 },
    gstOptionBold: { fontSize: 6.5, fontFamily: "Helvetica-Bold" },
    gstin: { fontSize: 6, color: "#444", marginTop: 3 },

    dateStrip: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        border: "0.5pt solid #000",
        borderTop: 0,
        padding: "2pt 5pt",
        backgroundColor: "#f7f7f7",
    },
    dateText: { fontSize: 6.5 },
    dateBold: { fontSize: 7, fontFamily: "Helvetica-Bold" },

    twoCol: { flexDirection: "row", border: "0.5pt solid #000", borderTop: 0 },
    colHalf: { flex: 1, padding: "3pt 5pt", borderRight: "0.5pt solid #000" },
    colHalfLast: { flex: 1, padding: "3pt 5pt" },
    fieldLabel: { fontSize: 6, color: "#555" },
    fieldValue: { fontSize: 7, fontFamily: "Helvetica-Bold", marginTop: 1, borderBottom: "0.4pt solid #aaa", paddingBottom: 1 },
    fieldRow: { marginBottom: 3 },

    deliveryBox: {
        border: "0.5pt solid #000",
        borderTop: 0,
        padding: "3pt 5pt",
    },
    deliveryTitle: { fontSize: 6.5, fontFamily: "Helvetica-Bold", marginBottom: 2 },
    deliveryGrid: { flexDirection: "row", gap: 8 },
    deliveryField: { flex: 1 },

    goodsTable: { border: "0.5pt solid #000", borderTop: 0 },
    goodsHeader: { flexDirection: "row", backgroundColor: "#ebebeb", borderBottom: "0.5pt solid #000" },
    goodsTh: {
        fontSize: 6,
        fontFamily: "Helvetica-Bold",
        padding: "2pt 3pt",
        borderRight: "0.5pt solid #000",
        flex: 1,
        textAlign: "center",
    },
    goodsRow: { flexDirection: "row", borderBottom: "0.4pt solid #ccc" },
    goodsTotalRow: { flexDirection: "row", borderBottom: "0.4pt solid #ccc", borderTop: "0.6pt solid black" },
    goodsTd: {
        fontSize: 6.5,
        padding: "2pt 3pt",
        borderRight: "0.5pt solid #000",
        flex: 1,
        textAlign: "center",
        minHeight: 20,
    },

    goodsTotalTd: {
        fontSize: 6.5,
        padding: "2pt 3pt",
        borderRight: "0.5pt solid #000",
        flex: 1,
        textAlign: "center",
        fontFamily: "Helvetica-Bold",
        minHeight: 20,
    },

    riskRow: {
        flexDirection: "row",
        border: "0.5pt solid #000",
        borderTop: 0,
        alignItems: "stretch",
    },
    riskCell: { flex: 1, padding: "2pt 4pt", borderRight: "0.5pt solid #000", justifyContent: "center" },
    riskCellLast: { flex: 2, padding: "2pt 4pt", justifyContent: "center" },
    riskLabel: { fontSize: 6, color: "#555" },
    riskValue: { fontSize: 7, fontFamily: "Helvetica-Bold" },

    bottomSection: { flexDirection: "row", border: "0.5pt solid #000", borderTop: 0 },
    leftBottom: { flex: 1.1, borderRight: "0.5pt solid #000" },
    rightBottom: { flex: 1 },

    weightBox: { padding: "2pt 4pt", borderBottom: "0.5pt solid #000" },
    weightRow: { flexDirection: "row", justifyContent: "space-between" },
    weightLabel: { fontSize: 6 },
    weightValue: { fontSize: 7, fontFamily: "Helvetica-Bold" },

    remarksBox: { padding: "3pt 4pt" },
    remarksText: { fontSize: 5.8, lineHeight: 1.35, color: "#333" },

    chargesHeader: {
        flexDirection: "row",
        backgroundColor: "#ebebeb",
        borderBottom: "0.5pt solid #000",
        padding: "2pt 3pt",
    },
    chargesTitle: { fontSize: 6, fontFamily: "Helvetica-Bold", flex: 2.5 },
    chargesCol: { fontSize: 6, fontFamily: "Helvetica-Bold", flex: 1, textAlign: "center" },

    chargeRow: { flexDirection: "row", borderBottom: "0.4pt solid #ddd", padding: "1.5pt 3pt" },
    chargeLabel: { fontSize: 6, flex: 2.5 },
    chargeCell: { fontSize: 6.5, flex: 1, textAlign: "center" },

    totalChargeRow: {
        flexDirection: "row",
        padding: "2pt 3pt",
        backgroundColor: "#f0f0f0",
        borderTop: "0.5pt solid #000",
    },
    totalChargeLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", flex: 2.5 },
    totalChargeCell: { fontSize: 7, fontFamily: "Helvetica-Bold", flex: 1, textAlign: "center" },

    bottomRow: { flexDirection: "row", border: "0.5pt solid #000", borderTop: 0, marginTop: 0 },
    receiptBox: { width: 100, borderRight: "0.5pt solid #000", padding: "3pt 5pt" },
    receiptTitle: { fontSize: 6.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
    receiptField: { marginBottom: 3 },
    declarationBox: { flex: 1, padding: "3pt 5pt" },
    declarationText: { fontSize: 5.8, lineHeight: 1.4, fontFamily: "Helvetica-Oblique" },

    sigStrip: {
        flexDirection: "row",
        border: "0.5pt solid #000",
        borderTop: 0,
        padding: "3pt 5pt",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    sigBlock: { alignItems: "center" },
    sigLine: { borderTop: "0.5pt solid #000", width: 110, marginBottom: 2 },
    sigLabel: { fontSize: 6 },

    counterBox: {
        border: "0.5pt solid #000",
        borderTop: 0,
        padding: "2pt 5pt",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    counterLabel: { fontSize: 6.5, fontFamily: "Helvetica-Bold" },
});


const ConsignmentNote = forwardRef<HTMLDivElement, Props>(
    ({ data }, ref) => {
        if (!data) return;
        const totalPackages = data.items.reduce(
            (sum: number, item: any) => sum + Number(item.number_of_packages || 0),
            0
        );

        const totalWeight = data.items.reduce(
            (sum: number, item: any) => sum + Number(item.weight || 0),
            0
        );

        const totalValue = data.items.reduce(
            (sum: number, item: any) => sum + Number(item.goods_value_for_insurance || 0),
            0
        );
        return (
            <Document title="Assam Transport Agency – Consignment Note">
                <Page size="A4" style={S.page}>

                    <View style={S.headerWrap}>

                        <View style={S.headerLeft}>
                            <View style={S.cnRow}>
                                <Text style={S.cnLabel}>C/N No.</Text>
                                <Text style={S.cnNo}>{data.cn_no}</Text>
                            </View>
                            <View style={[{ marginTop: 2 }]}>
                                <Text style={[S.cnLabel, { marginTop: 2 }]}>GSTIN NO.</Text>
                                <Text style={[S.cnLabel, { marginTop: 1 }]}>18AEIPC9370B3ZL</Text>
                            </View>

                        </View>

                        <View style={S.headerCenter}>
                            <Text style={S.agencyName}>ASSAM TRANSPORT AGENCY</Text>
                            <Text style={S.agencyAddr1}>HEAD OFFICE : JORHAT, 785014 (ASSAM)</Text>
                            <Text style={S.agencyAddr2}>RAJABARI MISSION COMPOUND</Text>
                            <Text style={S.agencyAddr2}>BRANCH OFFICE : BELTOLA, GUWAHATI</Text>
                            <Text style={S.cnTitle}>CONSIGNMENT NOTE</Text>
                        </View>
                        <View style={S.headerRight}>
                            <View style={[{ marginTop: 2 }]}>
                                <Text style={S.cnLabel}>Ph. 9678121562</Text>
                            </View>
                        </View>
                    </View>

                    <View style={S.dateStrip}>
                        <Text style={S.dateText}>
                            Date : <Text style={S.dateBold}>{new Date(data.created).toLocaleDateString("en-GB")}</Text>
                        </Text>
                        <Text style={S.dateText}>
                            Received goods as per details below for carriage Subject to the conditions given overleaf.
                        </Text>
                    </View>

                    <View style={S.twoCol}>
                        <View style={S.colHalf}>
                            <Text style={[S.fieldLabel, { fontFamily: "Helvetica-Bold", fontSize: 7, marginBottom: 3 }]}>Consignor</Text>
                            {[
                                ["Name", data.expand.client.name],
                                ["Address", data.expand.client.address],
                                ["Phone No.", data.expand.client.phone],
                                ["GSTIN No.", data.expand.client.gst],
                            ].map(([lbl, val]) => (
                                <View key={lbl} style={S.fieldRow}>
                                    <Text style={S.fieldLabel}>{lbl}</Text>
                                    <Text style={S.fieldValue}>{val}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={S.colHalfLast}>
                            <Text style={[S.fieldLabel, { fontFamily: "Helvetica-Bold", fontSize: 7, marginBottom: 3 }]}>Consignee</Text>
                            {[
                                ["Name", data.consignee.name],
                                ["Address", data.consignee.address],
                                ["Phone No.", data.consignee.mobile_number],
                                ["GSTIN No.", data.consignee.gst_number],
                            ].map(([lbl, val]) => (
                                <View key={lbl} style={S.fieldRow}>
                                    <Text style={S.fieldLabel}>{lbl}</Text>
                                    <Text style={S.fieldValue}>{val}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={S.deliveryBox}>
                        <Text style={S.deliveryTitle}>DELIVERY AT :</Text>
                        <View style={S.deliveryGrid}>
                            {[
                                ["Name", data.consignee.name],
                                ["Address", data.consignee.address],
                                ["Phone No.", data.consignee.mobile_number],
                                ["GSTIN No.", data.consignee.gst_number],
                            ].map(([lbl, val]) => (
                                <View key={lbl} style={S.deliveryField}>
                                    <Text style={S.fieldLabel}>{lbl}</Text>
                                    <Text style={[S.fieldValue, { fontSize: 6.5 }]}>{val}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={S.goodsTable}>
                        <View style={S.goodsHeader}>
                            {[
                                "No. of Packages",
                                "Method of Packing",
                                "Nature of Goods",
                                "Actual Weight (Tonne)",
                                "Value of Goods (Rs.)",
                                "Private Marks",
                                "Said to Contain",
                            ].map((h) => (
                                <Text key={h} style={S.goodsTh}>{h}</Text>
                            ))}
                        </View>
                        {data.items.map((item: any, rowIdx: number) => (
                            <View key={rowIdx} style={S.goodsRow}>
                                {[
                                    item.number_of_packages,
                                    item.package,
                                    item.contents,
                                    item.weight,
                                    item.goods_value_for_insurance,
                                    item.private_remarks,
                                    item.said_to_contain,
                                ].map((v, i) => (
                                    <Text key={i} style={S.goodsTd}>{v}</Text>
                                ))}
                            </View>
                        ))}
                        <View style={S.goodsTotalRow}>
                            <Text style={S.goodsTotalTd}>Total: {totalPackages}</Text>
                            <Text style={S.goodsTd}></Text>
                            <Text style={S.goodsTd}></Text>
                            <Text style={S.goodsTotalTd}>Total:{totalWeight * 1000} kg</Text>
                            <Text style={S.goodsTotalTd}>Total: {totalValue}</Text>
                            <Text style={S.goodsTd}></Text>
                            <Text style={S.goodsTd}></Text>
                        </View>
                    </View>

                    <View style={S.riskRow}>
                        <View style={S.riskCell}>
                            <Text style={S.riskLabel}>At Own Risk</Text>
                            <Text style={S.riskValue}>{data.at_own_risk}</Text>
                        </View>
                        <View style={S.riskCell}>
                            <Text style={S.riskLabel}>Carrier Risk</Text>
                            <Text style={S.riskValue}>{data.carrier_risk || "—"}</Text>
                        </View>
                        <View style={S.riskCell}>
                            <Text style={S.riskLabel}>Truck No.</Text>
                            <Text style={S.riskValue}>{data.expand.fleet.truck_no}</Text>
                        </View>
                        <View style={S.riskCell}>
                            <Text style={S.riskLabel}>e-Way Bill.</Text>
                            <Text style={S.riskValue}>{data.eway_bill_no}</Text>
                        </View>
                        <View style={S.riskCellLast}>
                            <Text style={S.riskLabel}>Vide Not Responsible for</Text>
                            <Text style={S.riskValue}>{data.vide_not_responsible}</Text>
                        </View>
                    </View>

                    <View style={S.bottomSection}>

                        <View style={S.leftBottom}>
                            <View style={S.remarksBox}>
                                <Text style={[S.riskLabel, { fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>Remarks:</Text>
                                <Text style={S.remarksText}>
                                    The Company is not responsible for any penalty if invoice which is essential is not given at the time of Booking for e.g. GST and full address on consignor and consignee.
                                </Text>
                            </View>
                        </View>

                        <View style={S.rightBottom}>
                            {data.is_fixed_charge == 'No' && <View style={S.chargesHeader}>
                                <Text style={S.chargesTitle}>Charges</Text>
                                <Text style={S.chargesCol}>Per KG Charge{"\n"}Rs.  P.</Text>
                                <Text style={S.chargesCol}>Weight{"\n"}</Text>
                                <Text style={S.chargesCol}>Amount{"\n"}Rs.  P.</Text>
                            </View>}

                            {data.is_fixed_charge == 'No' && <View style={S.chargeRow}>
                                <Text style={S.chargeLabel}>Freight Charge Per KG</Text>
                                <Text style={S.chargeCell}>{data.freight_charge_per_kg}</Text>
                                <Text style={S.chargeCell}>{totalWeight * 1000} Kg</Text>
                                <Text style={S.chargeCell}>{totalValue}</Text>
                            </View>}

                            {
                                data.is_fixed_charge == 'No' &&
                                <View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>Insurance</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.insurance}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>Sur Charges</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.surcharge}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>Statistical Charges</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.statistical_charge}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>Labour Charges</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.labour_charge}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>CGST</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.cgst}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>SGST</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.sgst_amount}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>IGST</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.igst_amount}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>Consignment Note</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.consignment_note_amount}</Text>
                                    </View>
                                    <View style={S.chargeRow}>
                                        <Text style={S.chargeLabel}>Guaranty Charges</Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}></Text>
                                        <Text style={S.chargeCell}>{data.guarantee_charge}</Text>
                                    </View>
                                </View>
                            }

                            <View style={S.totalChargeRow}>
                                <Text style={S.totalChargeLabel}>Total</Text>
                                <Text style={S.totalChargeCell}></Text>
                                <Text style={S.totalChargeCell}></Text>
                                <Text style={S.totalChargeCell}>{data.total_amount}</Text>
                            </View>
                            <View style={S.totalChargeRow}>
                                <Text style={S.totalChargeLabel}>Paid</Text>
                                <Text style={S.totalChargeCell}></Text>
                                <Text style={S.totalChargeCell}></Text>
                                <Text style={S.totalChargeCell}>{data.advance_amount}</Text>
                            </View>
                            <View style={S.totalChargeRow}>
                                <Text style={S.totalChargeLabel}>Balance To Pay</Text>
                                <Text style={S.totalChargeCell}></Text>
                                <Text style={S.totalChargeCell}></Text>
                                <Text style={S.totalChargeCell}>{data.remaining_balance}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={S.bottomRow}>
                        <View style={S.receiptBox}>
                            <View style={S.receiptField}>
                                <Text style={S.fieldLabel}>DATE</Text>
                                <Text style={[{ fontSize: 7 }]}>{new Date(data.created).toLocaleDateString("en-GB")}</Text>
                            </View>
                        </View>

                        <View style={S.declarationBox}>
                            <Text style={S.declarationText}>
                                This consignor hereby expressly declares that the above particulars furnished by him or
                                his agent are correct. No prohibited articles are included and he is aware of &amp; accepts
                                the condition of carriage.
                            </Text>
                        </View>
                    </View>
                </Page>
            </Document>
        );
    });

export default ConsignmentNote;
