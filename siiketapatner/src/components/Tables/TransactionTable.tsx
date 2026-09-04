import { useEffect, useRef, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Download,
    FileText,
    Info,
    Loader2,
    MessageCircle,
    MoreVertical,
    Plus,
    Printer,
    Receipt,
    Search,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "../ui/input";

import { Link } from "react-router-dom";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";

import TablePagination from "../ui/TablePagination";

import { toast } from "sonner";

import React from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "../ui/label";

import txnStore from "@/store/txnStore";
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";
import { DatePicker } from "../Forms/DatePicker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { pdf } from "@react-pdf/renderer";
import TransportBillPDF from "../Invoice";
import ConsignmentNote from "../Note";
import { pb } from "@/lib/pocketbase";
import { SearchSelect } from "../SearchSelect";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const TransactionTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
        const startDate = txnStore((state) => state.startDate);
        const endDate = txnStore((state) => state.endDate);
        const getCSV = txnStore((state) => state.getCSV);
        const [show, setShow] = useState(false);
        const [openn, setOpenn] = useState(false);
        const [loadingg, setLoadingg] = useState(false);
        const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
        const [item, setItem] = useState(null);
        const [docType, setDocType] = useState(null);

        const [sendingTo, setSendingTo] = useState<string | null>(null);

        const [clientItems, setClientItems] = useState([]);
        const [selectedClient, setSelectedClient] = useState(null);

        const handleSearchClients = (() => {
            let timeout: any;

            return (search: string) => {
                clearTimeout(timeout);

                timeout = setTimeout(async () => {
                    const records = await pb.collection("clients").getList(1, 20, {
                        filter: search
                            ? `name ~ "${search.replace(/"/g, '\\"').trim()}" || phone ~ "${search.replace(/"/g, '\\"').trim()}" || email ~ "${search.replace(/"/g, '\\"').trim()}"`
                            : "",
                        sort: "name",
                    });

                    setClientItems(
                        records.items.map((client) => ({
                            id: client.id,
                            label: client.name,
                            ...client,
                        }))
                    );
                }, 300);
            };
        })();

        const [fleetItems, setFleetItems] = useState([]);
        const [selectedFleet, setSelectedFleet] = useState(null);

        const handleSearchFleets = (() => {
            let timeout: any;

            return (search: string) => {
                clearTimeout(timeout);

                timeout = setTimeout(async () => {
                    const records = await pb.collection("fleets").getList(1, 20, {
                        filter: search
                            ? `truck_no ~ "${search.replace(/"/g, '\\"').trim()}" || driver_name ~ "${search.replace(/"/g, '\\"').trim()}" || driver_mobile_no ~ "${search.replace(/"/g, '\\"').trim()}"`
                            : "",
                        sort: "truck_no, driver_name",
                    });

                    setFleetItems(
                        records.items.map((client) => ({
                            id: client.id,
                            label: `${client.truck_no}, ${client.driver_name}`,
                            ...client,
                        }))
                    );
                }, 300);
            };
        })();

        const [nameItems, setNameItems] = useState([]);
        const [selectedConsignor, setSelectedConsignor] = useState(null);
        const [selectedConsignee, setSelectedConsignee] = useState(null);

        const handleSearchNames = (() => {
            let timeout: any;

            return (search: string) => {
                clearTimeout(timeout);

                timeout = setTimeout(async () => {
                    const records = await pb.collection("people").getList(1, 20, {
                        filter: search
                            ? `name ~ "${search.replace(/"/g, '\\"').trim()}"`
                            : "",
                        sort: "name",
                    });

                    setNameItems(
                        records.items.map((client) => ({
                            id: client.id,
                            label: client.name,
                            ...client,
                        }))
                    );
                }, 300);
            };
        })();

        const today = new Date().toISOString().split("T")[0];

        const [start, setStart] = useState(today);
        const [end, setEnd] = useState(today);

        const [query, setQuery] = useState('');


        const [dates, setDates] = useState<Date[]>([
            startDate != "" ? new Date(startDate) : null,
            endDate != "" ? new Date(endDate) : null,
        ]);


        const {
            deleteRecord: deleteRecordApi,
            saveRecord: createDataApi,
            updateRecord: updateDataApi,
            searchRecords,
            loadMore,
            page, totalItems, totalPages,
        } = txnStore();

        const [selectedPage, setSelectedPage] = useState(page);

        const [open, setOpen] = useState(false);

        const [saveLoading, setSaveLoading] =
            useState(false);

        const [deleteLoadingId, setDeleteLoadingId] =
            useState("");

        const [formData, setFormData] = useState({
            id: "",
            fleet: "",
            client: "",
            from_location: "",
            to_location: "",
            loading_point_weight: '',
            unloading_point_weight: '',
            date_of_loading: "",
            eway_bill_no: "",
            eway_bill_valid_till: "",
            delivery_date: "",
            rate_per_tonne: '',
            tonne: '',
            amount: '',
            freight_charge_per_kg: '',
            cgst: '',
            sgst_amount: '',
            igst_amount: '',
            total_amount: '',
            tds_amount: '',
            insurance: '',
            surcharge: '',
            statistical_charge: '',
            labour_charge: '',
            advance_amount: '',
            remaining_balance: '',
            client_provider: "no",
            client_amount: '',
            client_provider_name: '',
            items: [
                {
                    contents: "",
                    package: "",
                    remarks: "",
                    private_remarks: "",
                    weight: '',
                    number_of_packages: '',
                    goods_value_for_insurance: '',
                    said_to_contain: ""
                }
            ],
            guarantee_charge: '',

            consignee: {
                address: "",
                delivery_at: "",
                gst_number: "",
                mobile_number: "",
                name: ""
            },
            consignment_note_amount: "",
            fixed_charge: "",
            at_own_risk: "No",
            carrier_risk: "No",
            is_fixed_charge: "No",
            vide_not_responsible: "",
            consignor_name: "",
            consignee_name: "",
        });

        const pageSize = 16;
        const startIndex = (selectedPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const [load, setLoad] = useState(false);

        const [openMenuId, setOpenMenuId] = useState<string | null>(null);


        const handleDelete = async (
            id: string
        ) => {
            try {
                setDeleteLoadingId(id);

                const result =
                    await deleteRecordApi(id);

                if (!result.status) {
                    toast.error(
                        "Failed to delete transaction"
                    );
                } else {
                    toast.success(
                        "Transaction deleted successfully!"
                    );
                }
            } finally {
                setDeleteLoadingId("");
            }
        };

        const handleChange = (
            e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLSelectElement>
        ) => {
            setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        };

        const resetForm = () => {
            setFormData({
                id: "",
                fleet: "",
                client: "",
                from_location: "",
                to_location: "",
                loading_point_weight: '',
                unloading_point_weight: '',
                date_of_loading: "",
                eway_bill_no: "",
                eway_bill_valid_till: "",
                delivery_date: "",
                rate_per_tonne: '',
                tonne: '',
                amount: '',
                freight_charge_per_kg: '',
                cgst: '',
                sgst_amount: '',
                igst_amount: '',
                total_amount: '',
                tds_amount: '',
                insurance: '',
                surcharge: '',
                statistical_charge: '',
                labour_charge: '',
                advance_amount: '',
                remaining_balance: '',
                client_provider_name: '',
                client_provider: "no",
                client_amount: '',
                vide_not_responsible: '',
                items: [
                    {
                        contents: "",
                        package: "",
                        remarks: "",
                        private_remarks: "",
                        weight: '',
                        number_of_packages: '',
                        goods_value_for_insurance: '',
                        said_to_contain: ""
                    }
                ],
                guarantee_charge: '',
                consignee: {
                    address: "",
                    delivery_at: "",
                    gst_number: "",
                    mobile_number: "",
                    name: ""
                },
                consignment_note_amount: "",
                fixed_charge: "",
                at_own_risk: "No",
                carrier_risk: "No",
                is_fixed_charge: "No",
                consignor_name: "",
                consignee_name: "",
            });
            setSelectedClient(null);
            setSelectedFleet(null);
            setSelectedConsignor(null);
            setSelectedConsignee(null);
        };

        const openAddDialog = () => {
            resetForm();
            setOpen(true);
        };

        const openEditDialog = (
            item: any
        ) => {
            setFormData({
                id: item.id || "",

                fleet: item.fleet || "",
                client: item.client || "",

                from_location:
                    item.from_location || "",

                to_location:
                    item.to_location || "",
                consignor_name:
                    item.consignor_name || "",
                consignee_name:
                    item.consignee_name || "",

                loading_point_weight:
                    item.loading_point_weight?.toString() ||
                    "",

                unloading_point_weight:
                    item.unloading_point_weight?.toString() ||
                    "",

                date_of_loading:
                    item.date_of_loading
                        ? item.date_of_loading.split(" ")[0]
                        : "",

                eway_bill_no:
                    item.eway_bill_no || "",

                eway_bill_valid_till:
                    item.eway_bill_valid_till
                        ? item.eway_bill_valid_till.split(" ")[0]
                        : "",

                delivery_date:
                    item.delivery_date
                        ? item.delivery_date.split(" ")[0]
                        : "",

                rate_per_tonne:
                    item.rate_per_tonne?.toString() ||
                    "",

                tonne:
                    item.tonne?.toString() || "",

                amount:
                    item.amount?.toString() || "",

                freight_charge_per_kg:
                    item.freight_charge_per_kg?.toString() ||
                    "",

                cgst:
                    item.cgst?.toString() || "",

                sgst_amount:
                    item.sgst_amount?.toString() || "",

                igst_amount:
                    item.igst_amount?.toString() || "",

                total_amount:
                    item.total_amount?.toString() ||
                    "",

                tds_amount:
                    item.tds_amount?.toString() ||
                    "",

                insurance:
                    item.insurance?.toString() ||
                    "",

                surcharge:
                    item.surcharge?.toString() ||
                    "",

                statistical_charge:
                    item.statistical_charge?.toString() ||
                    "",

                labour_charge:
                    item.labour_charge?.toString() ||
                    "",

                advance_amount:
                    item.advance_amount?.toString() ||
                    "",

                remaining_balance:
                    item.remaining_balance?.toString() ||
                    "",

                client_provider_name:
                    item.client_provider_name || "",

                client_provider:
                    item.client_provider || "no",

                client_amount:
                    item.client_amount?.toString() ||
                    "",

                guarantee_charge:
                    item.guarantee_charge?.toString() ||
                    "",
                consignment_note_amount:
                    item.consignment_note_amount?.toString() ||
                    "",
                fixed_charge:
                    item.fixed_charge?.toString() ||
                    "",
                at_own_risk:
                    item.at_own_risk?.toString() ||
                    "No",
                carrier_risk:
                    item.carrier_risk?.toString() ||
                    "No",
                is_fixed_charge:
                    item.is_fixed_charge?.toString() ||
                    "No",
                vide_not_responsible:
                    item.vide_not_responsible?.toString() ||
                    "No",

                consignee: {
                    address:
                        item.consignee?.address || "",

                    delivery_at:
                        item.consignee?.delivery_at || "",

                    gst_number:
                        item.consignee?.gst_number || "",

                    mobile_number:
                        item.consignee?.mobile_number || "",

                    name:
                        item.consignee?.name || "",
                },

                items:
                    item.items?.length > 0
                        ? item.items.map(
                            (itm: any) => ({
                                contents:
                                    itm.contents || "",

                                package:
                                    itm.package || "",

                                remarks:
                                    itm.remarks || "",
                                private_remarks:
                                    itm.private_remarks || "",

                                weight:
                                    itm.weight?.toString() ||
                                    "",
                                goods_value_for_insurance:
                                    itm.goods_value_for_insurance?.toString() ||
                                    "",
                                said_to_contain:
                                    itm.said_to_contain || "",
                                number_of_packages:
                                    itm.number_of_packages?.toString() ||
                                    "",
                            })
                        )
                        : [
                            {
                                contents: "",
                                package: "",
                                remarks: "",
                                weight: '',
                                number_of_packages: '',
                                goods_value_for_insurance: '',
                                said_to_contain: ""
                            }
                        ]
            });

            setSelectedClient({
                id: item.expand.client.id,
                label: item.expand.client.name,
            });

            setSelectedFleet({
                id: item.expand.fleet.id,
                label: `${item.expand.fleet.truck_no}, ${item.expand.fleet.driver_name}`,
            });

            if (item.expand?.consignor_name) {
                setSelectedConsignor({
                    id: item.expand.consignor_name.id,
                    label: item.expand.consignor_name.name,
                });
            }

            if (item.expand?.consignee_name) {
                setSelectedConsignee({
                    id: item.expand.consignee_name.id,
                    label: item.expand.consignee_name.name,
                });
            }

            setOpen(true);
        };

        const handleSubmit = async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            try {
                setSaveLoading(true);

                const body = {
                    fleet: formData.fleet,

                    client: formData.client,

                    from_location:
                        formData.from_location,

                    to_location:
                        formData.to_location,

                    loading_point_weight:
                        Number(
                            formData.loading_point_weight
                        ) || 0,

                    unloading_point_weight:
                        Number(
                            formData.unloading_point_weight
                        ) || 0,

                    date_of_loading:
                        formData.date_of_loading,

                    eway_bill_no:
                        formData.eway_bill_no,

                    eway_bill_valid_till:
                        formData.eway_bill_valid_till,

                    delivery_date:
                        formData.delivery_date,

                    client_provider:
                        formData.client_provider,

                    client_provider_name:
                        formData.client_provider_name,
                    consignor_name:
                        formData.consignor_name,
                    consignee_name:
                        formData.consignee_name,

                    rate_per_tonne:
                        Number(
                            formData.rate_per_tonne
                        ) || 0,

                    tonne:
                        Number(
                            formData.tonne
                        ) || 0,

                    amount:
                        Number(
                            formData.amount
                        ) || 0,

                    freight_charge_per_kg:
                        Number(
                            formData.freight_charge_per_kg
                        ) || 0,

                    cgst:
                        Number(
                            formData.cgst
                        ) || 0,
                    igst_amount:
                        Number(
                            formData.igst_amount
                        ) || 0,
                    sgst_amount:
                        Number(
                            formData.sgst_amount
                        ) || 0,

                    total_amount:
                        Number(
                            formData.total_amount
                        ) || 0,

                    tds_amount:
                        Number(
                            formData.tds_amount
                        ) || 0,

                    insurance:
                        Number(
                            formData.insurance
                        ) || 0,

                    surcharge:
                        Number(
                            formData.surcharge
                        ) || 0,

                    statistical_charge:
                        Number(
                            formData.statistical_charge
                        ) || 0,

                    labour_charge:
                        Number(
                            formData.labour_charge
                        ) || 0,

                    advance_amount:
                        Number(
                            formData.advance_amount
                        ) || 0,

                    remaining_balance:
                        Number(
                            formData.remaining_balance
                        ) || 0,

                    client_amount:
                        Number(
                            formData.client_amount
                        ) || 0,

                    guarantee_charge:
                        Number(
                            formData.guarantee_charge
                        ) || 0,
                    consignment_note_amount:
                        Number(
                            formData.consignment_note_amount
                        ) || 0,
                    fixed_charge:
                        Number(
                            formData.fixed_charge
                        ) || 0,
                    is_fixed_charge: formData.is_fixed_charge || 'No',
                    at_own_risk: formData.at_own_risk || 'No',
                    carrier_risk: formData.carrier_risk || 'No',
                    vide_not_responsible: formData.vide_not_responsible || '',

                    consignee: {
                        address:
                            formData.consignee.address,

                        delivery_at:
                            formData.consignee.delivery_at,

                        gst_number:
                            formData.consignee.gst_number,

                        mobile_number:
                            formData.consignee.mobile_number,

                        name:
                            formData.consignee.name,
                    },

                    items:
                        formData.items.map(
                            (item) => ({
                                contents:
                                    item.contents,

                                package:
                                    item.package,

                                remarks:
                                    item.remarks,
                                private_remarks:
                                    item.private_remarks,

                                weight:
                                    Number(
                                        item.weight
                                    ) || 0,
                                goods_value_for_insurance:
                                    Number(
                                        item.goods_value_for_insurance
                                    ) || 0,
                                said_to_contain:
                                    item.said_to_contain,
                                number_of_packages:
                                    Number(
                                        item.number_of_packages
                                    ) || 0,

                            })
                        ),
                };


                if (formData.id !== "") {
                    const result =
                        await updateDataApi(
                            formData.id,
                            body
                        );

                    if (!result.status) {
                        toast.error(
                            "Failed to update transaction"
                        );
                    } else {
                        toast.success(
                            "Transaction updated successfully!"
                        );

                        setOpen(false);

                        resetForm();
                    }

                    return;
                }


                const result =
                    await createDataApi(body);

                if (!result.status) {
                    toast.error(
                        "Failed to create transaction"
                    );
                } else {
                    toast.success(
                        "Transaction added successfully!"
                    );

                    setOpen(false);

                    resetForm();
                }
            } finally {
                setSaveLoading(false);
            }
        };

        const handlePageChange = async (page: number) => {
            const params: any = { page };

            if (dates?.[0] && dates?.[1]) {
                params.fromDate = dates[0].toLocaleDateString();
                params.toDate = dates[1].toLocaleDateString();
            }

            if (query?.trim()) {
                params.query = query.trim();
            }

            const result = await loadMore(
                params.page,
                params.fromDate,
                params.toDate,
                params.query
            );

            if (result.status) {
                setSelectedPage(page);
            }
        };

        const formatDate = (date: Date | string) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        const handleApply = async () => {
            setLoad(true);
            const fromDate = dates?.[0] ? formatDate(dates[0]) : '';
            const toDate = dates?.[1] ? formatDate(dates[1]) : '';
            const cleanedQuery = query?.trim();
            await searchRecords(fromDate, toDate, cleanedQuery);
            setLoad(false);
        };

        const clr = async () => {
            setDates([null, null]);
            setQuery('');
            await searchRecords('', '', '');
        };

        const handleDownloadInvoice = async (data: any) => {
            const blob = await pdf(<TransportBillPDF data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.expand.client.name}_invoice.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }

        const handlePrintInvoice = async (data: any) => {
            const blob = await pdf(<TransportBillPDF data={item} />).toBlob();
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.print();
            };
        }

        const handleDownloadConsignmentNote = async (data: any) => {
            const blob = await pdf(<ConsignmentNote data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.expand.client.name}_consignment_note.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }

        const handlePrintConsignmentNote = async (data: any) => {
            const blob = await pdf(<ConsignmentNote data={item} />).toBlob();
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.print();
            };
        }

        const handleCSV = async () => {
            setLoadingg(true);
            const result = await getCSV(start, end);
            if (!result.status) {
                toast.error("Failed to generate CSV!", {
                    style: {
                        background: "#dc2626",
                        color: "white",
                        border: "none"
                    }
                });
            }
            setLoadingg(false)
        };

        const handleInvoiceWhatsapp = async () => {
            if (!item) return;
            setLoadingWhatsapp(true);
            try {
                const blob = await pdf(<TransportBillPDF data={item} />).toBlob();
                const file = new File(
                    [blob],
                    `${item.expand.client.name}_invoice.pdf`,
                    {
                        type: "application/pdf",
                    }
                );

                const record = await pb.collection("documents").create({
                    file: file,
                    type: "invoice",
                    name: item.expand.client.name,
                    id_no: item.expand?.invoices_via_transaction[0]?.invoice_number ?? ""
                });
                const url = `https://docs.haakudigital.com/${record.collectionId}/${record.id}/${record.file}`;
                const lines = [
                    `Hello ${item.expand.client.name},`,
                    "",
                    "Please find your transport invoice at the link below.",
                    "",
                    `Invoice No: ${item.expand?.invoices_via_transaction[0]?.invoice_number ?? "-"}`,
                    "",
                    url,
                    "",
                    "If you have any questions regarding this invoice, please contact our office.",
                    "",
                    "Regards,",
                    "Assam Transport Agency"
                ];

                const message = lines.join("\n");

                window.open(
                    `https://wa.me/${item.expand.client.phone}?text=${encodeURIComponent(message)}`,
                    "_blank"
                );
            } catch (e) {
                toast.error(
                    "Failed to send Invoice"
                );
            } finally {
                setLoadingWhatsapp(false);
            }
        }

        const handleNoteWhatsapp = async (
            name: string,
            phone: string,
            type: "consignor" | "consignee" | "driver"
        ) => {
            if (!item) return;

            try {
                setSendingTo(type);
                const blob = await pdf(<ConsignmentNote data={item} />).toBlob();

                const file = new File(
                    [blob],
                    `${item.cn_no}_consignment_note.pdf`,
                    {
                        type: "application/pdf",
                    }
                );

                const record = await pb.collection("documents").create({
                    file,
                    type: "consignment note",
                    name,
                    id_no: item.cn_no ?? ""
                });

                const url = `https://docs.haakudigital.com/${record.collectionId}/${record.id}/${record.file}`;

                let lines: string[] = [];

                switch (type) {
                    case "consignor":
                        lines = [
                            `Hello ${name},`,
                            "",
                            `The consignment note for CN No. ${item.cn_no} has been generated successfully.`,
                            "",
                            "You can view/download it using the link below:",
                            url,
                            "",
                            "Thank you,",
                            "Assam Transport Agency"
                        ];
                        break;

                    case "consignee":
                        lines = [
                            `Hello ${name},`,
                            "",
                            `Your shipment is being processed.`,
                            `Consignment Note No: ${item.cn_no}`,
                            "",
                            "You can view the consignment note here:",
                            url,
                            "",
                            "Thank you for choosing our services.",
                            "",
                            "Assam Transport Agency"
                        ];
                        break;

                    case "driver":
                        lines = [
                            `Hello ${name},`,
                            "",
                            `You have been assigned to transport CN No. ${item.cn_no}.`,
                            "",
                            "Please keep the following consignment note accessible during transit:",
                            url,
                            "",
                            "Safe travels.",
                            "",
                            "Assam Transport Agency"
                        ];
                        break;
                }

                const message = lines.join("\n");

                window.open(
                    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                    "_blank"
                );
            } catch (e) {
                toast.error("Failed to send PDF");
            } finally {
                setSendingTo(null);
            }
        };

        useEffect(() => {
            if (formData.rate_per_tonne) {
                setFormData(prev => ({
                    ...prev,
                    freight_charge_per_kg: (Number(prev.rate_per_tonne) / 1000).toFixed(2),
                }));
            }
        }, [formData.rate_per_tonne]);

        const handleAdd = async (name: string, type: string) => {
            try {
                const record = await pb.collection("people").create({
                    name: name.trim()
                });

                const newItem = {
                    id: record.id,
                    label: record.name,
                };

                setNameItems((prev) => [...prev, newItem]);

                type == 'consignor' ? setSelectedConsignor(newItem) : setSelectedConsignee(newItem);
            } catch (e) {
                toast.error(
                    "Failed to add record!"
                );
            }
        };

        useEffect(() => {
            const total = Number(formData.total_amount || 0);
            const advance_amount = Number(formData.advance_amount || 0);
            const balance = total - advance_amount;
            setFormData((prev) => ({
                ...prev,
                remaining_balance: balance == 0 ? '' : balance.toFixed(2),
            }));
        }, [formData.total_amount, formData.advance_amount]);

        return (
            <>
                <Card>
                    <CardHeader className="flex flex-col">
                        <div>
                            <Breadcrumb className="mb-5">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <Link to="/">
                                            Home
                                        </Link>
                                    </BreadcrumbItem>

                                    <BreadcrumbSeparator />

                                    <BreadcrumbItem>
                                        <BreadcrumbPage>
                                            Invoice & Consignment
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <CardTitle>
                            </CardTitle>

                            <Button
                                className="my-3"
                                size="sm"
                                onClick={
                                    openAddDialog
                                }
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add New
                            </Button>
                        </div>
                        <div className="w-full flex flex-wrap gap-2 mt-3">
                            <DatePicker
                                initialDate={dates[0]}
                                onDateChange={(value) => {
                                    const newDates = [...dates];
                                    newDates[0] = value;
                                    setDates(newDates);
                                }}
                                title="From"
                            />
                            <DatePicker
                                initialDate={dates[1]}
                                onDateChange={(value) => {
                                    const newDates = [...dates];
                                    newDates[1] = value;
                                    setDates(newDates);
                                }}
                                title={"Till"}
                            />
                            <div className="space-y-2 w-1/2 md:w-1/4 mt-[-7px]">
                                <label>Client Name/Phone/Email/Vehicle No</label>
                                <div className="flex items-center relative">
                                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search..."
                                        className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="mt-[1.7rem] h-[38px]"
                                onClick={() => handleApply()}
                            >
                                {load ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                            />
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    "Apply"
                                )}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="mt-[1.7rem] h-[38px]"
                                onClick={() => setShow(true)}
                            >
                                CSV
                            </Button>
                            <Button
                                onClick={clr}
                                type="button"
                                className="mt-[1.7rem] h-[38px] flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
                                disabled={load}
                            >
                                Clear
                            </Button>
                        </div>

                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border">
                            <div className="w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Truck
                                            </TableHead>

                                            <TableHead>
                                                Client
                                            </TableHead>

                                            <TableHead>
                                                From
                                            </TableHead>

                                            <TableHead>
                                                To
                                            </TableHead>

                                            <TableHead>
                                                Amount
                                            </TableHead>

                                            <TableHead>
                                                Date of Loading
                                            </TableHead>

                                            <TableHead>
                                                Created At
                                            </TableHead>

                                            <TableHead>
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center py-10"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : items.length ===
                                            0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center py-10"
                                                >
                                                    No Transaction
                                                    found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map(
                                                (item) => (
                                                    <TableRow
                                                        key={item.id} className="text-[14px]"
                                                    >
                                                        <TableCell>
                                                            {
                                                                item
                                                                    ?.expand
                                                                    ?.fleet
                                                                    ?.truck_no
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            {
                                                                item
                                                                    ?.expand
                                                                    ?.client
                                                                    ?.name
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            {
                                                                item.from_location
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            {
                                                                item.to_location
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            ₹
                                                            {
                                                                item.total_amount
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(item.date_of_loading)
                                                                .toLocaleString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })
                                                                .toUpperCase()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(item.created)
                                                                .toLocaleString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })
                                                                .toUpperCase()}
                                                        </TableCell>

                                                        <TableCell className="flex gap-2">

                                                            <DropdownMenu
                                                                open={openMenuId === item.id}
                                                                onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}
                                                            >
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-2 hover:bg-secondary rounded-lg">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>

                                                                <DropdownMenuContent align="end" className="w-52">
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                        onClick={() => {
                                                                            openEditDialog(
                                                                                item
                                                                            )
                                                                        }}
                                                                    >
                                                                        <Info className="h-4 w-4" />
                                                                        Detail
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                        onClick={() => {
                                                                            setItem(item);
                                                                            setDocType('invoice');
                                                                            setOpenn(true);
                                                                        }}
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        Invoice Bill
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                        onClick={() => {
                                                                            setItem(item);
                                                                            setDocType('note');
                                                                            setOpenn(true);
                                                                        }}
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        Consignment Note
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <DeleteConfirmationDialog
                                                                            itemId={item.id}
                                                                            itemName={"record"}
                                                                            onConfirm={() => handleDelete(item.id)}
                                                                            onCancel={() => setOpenMenuId(null)}
                                                                            trigger={
                                                                                <div className="flex gap-2">
                                                                                    <Trash2 className="h-4 w-4" /> Delete
                                                                                </div>
                                                                            }
                                                                        />
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="my-4 w-full flex justify-end">
                                    <TablePagination
                                        currentPage={selectedPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => handlePageChange(page)}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        totalItems={totalItems}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <Dialog open={open} onOpenChange={(isOpen) => {
                        setOpen(isOpen);
                        if (!isOpen) {
                            setSelectedClient(null);
                            setSelectedFleet(null);
                        }
                    }}>
                        <DialogContent className="sm:max-w-6xl p-0 overflow-hidden rounded-2xl border-0">
                            <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Receipt className="w-5 h-5 text-primary" />
                                        </div>

                                        Invoice & Consignment
                                    </DialogTitle>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Manage transport transaction details, goods, billing and
                                        consignee information.
                                    </p>
                                </DialogHeader>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="max-h-[85vh] overflow-y-auto"
                            >
                                <div className="p-6 pt-2 space-y-8">
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Basic Information
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Enter primary transaction and route details
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            <div className="space-y-2">
                                                <Label>Truck</Label>
                                                <SearchSelect
                                                    items={fleetItems}
                                                    value={selectedFleet}
                                                    onSearch={handleSearchFleets}
                                                    placeholder="Select truck"
                                                    onChange={(item) => {
                                                        setSelectedFleet(item);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            fleet: item.id,
                                                        }))
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Client</Label>
                                                <SearchSelect
                                                    items={clientItems}
                                                    value={selectedClient}
                                                    onSearch={handleSearchClients}
                                                    placeholder="Select Bill To"
                                                    onChange={(item) => {
                                                        setSelectedClient(item);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            client: item.id,
                                                        }))
                                                    }}
                                                />
                                            </div>

                                            {[
                                                "from_location",
                                                "to_location",
                                                "eway_bill_no",
                                            ].map((field) => (
                                                <div
                                                    key={field}
                                                    className="space-y-2"
                                                >
                                                    <Label className="capitalize">
                                                        {field.replace("_", " ")}
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        name={field}
                                                        value={
                                                            formData[
                                                            field as keyof typeof formData
                                                            ] as string
                                                        }
                                                        onChange={handleChange}
                                                        disabled={saveLoading}
                                                    />
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <Label>Date of Loading</Label>

                                                <Input
                                                    className="h-11 rounded-xl"
                                                    type="date"
                                                    name="date_of_loading"
                                                    value={
                                                        formData.date_of_loading
                                                            ? formData.date_of_loading.split(
                                                                " "
                                                            )[0]
                                                            : ""
                                                    }
                                                    onChange={handleChange}
                                                    disabled={saveLoading}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Eway Valid Till</Label>

                                                <Input
                                                    className="h-11 rounded-xl"
                                                    type="date"
                                                    name="eway_bill_valid_till"
                                                    value={
                                                        formData.eway_bill_valid_till
                                                    }
                                                    onChange={handleChange}
                                                    disabled={saveLoading}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Estimated Delivery Date</Label>

                                                <Input
                                                    className="h-11 rounded-xl"
                                                    type="date"
                                                    name="delivery_date"
                                                    value={formData.delivery_date}
                                                    onChange={handleChange}
                                                    disabled={saveLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Financial Details
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Charges, taxes, weights and amount calculations
                                            </p>
                                        </div>

                                        <div className="space-y-2 mb-5">
                                            <Label>Is Charge Fixed ?</Label>

                                            <Select
                                                value={formData.is_fixed_charge}
                                                onValueChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        is_fixed_charge: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="Yes">
                                                        Yes
                                                    </SelectItem>

                                                    <SelectItem value="No">
                                                        No
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {
                                            formData.is_fixed_charge == 'No' ?
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                                    {[
                                                        "loading_point_weight",
                                                        "unloading_point_weight",
                                                        "rate_per_tonne",
                                                        "tonne",
                                                        "amount",
                                                        "freight_charge_per_kg",
                                                        "insurance",
                                                        "surcharge",
                                                        "statistical_charge",
                                                        "labour_charge",
                                                        "guarantee_charge",
                                                        "consignment_note_amount",
                                                        "cgst",
                                                        "sgst_amount",
                                                        "igst_amount",
                                                        "tds_amount",
                                                        "total_amount",
                                                        "advance_amount",
                                                        "remaining_balance",
                                                    ].map((field) => (
                                                        <div
                                                            key={field}
                                                            className="space-y-2"
                                                        >
                                                            <Label className="capitalize">
                                                                {field == 'cgst' ? 'Cgst Amount' : field == 'loading_point_weight' ? 'Loading Point Weight (Tonne)' : field == 'unloading_point_weight' ? 'Unloading Point Weight (Tonne)' : field == 'tonne' ? 'Tonne Guranteed' : field.replace(/_/g, " ")}
                                                            </Label>

                                                            <Input
                                                                className="h-11 rounded-xl"
                                                                type="number"
                                                                name={field}
                                                                min={0}
                                                                onWheel={(e) => e.currentTarget.blur()}
                                                                step="0.001"
                                                                value={
                                                                    formData[
                                                                    field as keyof typeof formData
                                                                    ] as string
                                                                }
                                                                onChange={handleChange}
                                                                disabled={saveLoading}
                                                            />
                                                        </div>
                                                    ))}
                                                </div> :
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                                    {[
                                                        "loading_point_weight",
                                                        "unloading_point_weight",
                                                        "total_amount",
                                                        "advance_amount",
                                                        "remaining_balance",
                                                    ].map((field) => (
                                                        <div
                                                            key={field}
                                                            className="space-y-2"
                                                        >
                                                            <Label className="capitalize">
                                                                {field.replace(/_/g, " ")}
                                                            </Label>

                                                            <Input
                                                                className="h-11 rounded-xl"
                                                                type="number"
                                                                name={field}
                                                                min={0}
                                                                onWheel={(e) => e.currentTarget.blur()}
                                                                step="0.001"
                                                                value={
                                                                    formData[
                                                                    field as keyof typeof formData
                                                                    ] as string
                                                                }
                                                                onChange={handleChange}
                                                                disabled={saveLoading}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                        }
                                    </div>

                                    {/* Provider Details */}
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Provider Details
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Configure provider related information
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label>Client Provider</Label>

                                                <Select
                                                    value={formData.client_provider}
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            client_provider: value,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="yes">
                                                            Yes
                                                        </SelectItem>

                                                        <SelectItem value="no">
                                                            No
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {formData.client_provider == "yes" && (
                                                <div className="space-y-2">
                                                    <Label>
                                                        Client Provider Name
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        type="text"
                                                        name={"client_provider_name"}
                                                        value={
                                                            formData.client_provider_name
                                                        }
                                                        onChange={handleChange}
                                                        disabled={saveLoading}
                                                    />
                                                </div>
                                            )}

                                            {formData.client_provider == "yes" && (
                                                <div className="space-y-2">
                                                    <Label>
                                                        Client Provider Amount
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        type="number"
                                                        name={"client_amount"}
                                                        min={0}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        step="0.001"
                                                        value={
                                                            formData.client_amount
                                                        }
                                                        onChange={handleChange}
                                                        disabled={saveLoading}
                                                    />
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                    {/* Consignee Details */}
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Delivery Details
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Delivery destination and receiver information
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {[
                                                "delivery_at",
                                                "name",
                                                "address",
                                                "mobile_number",
                                                "gst_number",
                                            ].map((field) => (
                                                <div
                                                    key={field}
                                                    className="space-y-2"
                                                >
                                                    <Label className="capitalize">
                                                        {field.replace(/_/g, " ")}
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        value={
                                                            formData.consignee[
                                                            field as keyof typeof formData.consignee
                                                            ]
                                                        }
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                consignee: {
                                                                    ...prev.consignee,
                                                                    [field]:
                                                                        e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>


                                    {/* Items */}
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <h2 className="text-lg font-semibold text-slate-800">
                                                    Goods Details
                                                </h2>

                                                <p className="text-sm text-slate-500">
                                                    Add challan or package related items
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-xl"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        items: [
                                                            ...prev.items,
                                                            {
                                                                contents: "",
                                                                package: "",
                                                                remarks: "",
                                                                private_remarks: "",
                                                                weight: "",
                                                                goods_value_for_insurance:
                                                                    "",
                                                                said_to_contain: "",
                                                                number_of_packages:
                                                                    "",
                                                            },
                                                        ],
                                                    }))
                                                }
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Item
                                            </Button>
                                        </div>

                                        {formData.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="border rounded-2xl p-5 bg-slate-50/60 space-y-5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-700">
                                                            Item #{index + 1}
                                                        </h3>

                                                        <p className="text-xs text-slate-500">
                                                            Package and weight
                                                            information
                                                        </p>
                                                    </div>

                                                    {formData.items.length >
                                                        1 && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="rounded-xl"
                                                                onClick={() => {
                                                                    const updated =
                                                                        [
                                                                            ...formData.items,
                                                                        ];

                                                                    updated.splice(
                                                                        index,
                                                                        1
                                                                    );

                                                                    setFormData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            items:
                                                                                updated,
                                                                        })
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                                    {[
                                                        "contents",
                                                        "package",
                                                        "number_of_packages",
                                                        "goods_value_for_insurance",
                                                        "remarks",
                                                        "private_remarks",
                                                        "weight",
                                                        "said_to_contain",
                                                    ].map((field) => (
                                                        <div
                                                            key={field}
                                                            className="space-y-2"
                                                        >
                                                            <Label className="capitalize">
                                                                {field == 'weight' ? 'Weight (in Tonne)' : field == 'contents' ? 'Nature of Goods' : field == 'package' ? 'Method of Packaging' : field.replace(
                                                                    /_/g,
                                                                    " "
                                                                )}
                                                            </Label>

                                                            <Input
                                                                className="h-11 rounded-xl"
                                                                type={
                                                                    [
                                                                        "number_of_packages",
                                                                        "weight",
                                                                        "goods_value_for_insurance",
                                                                    ].includes(
                                                                        field
                                                                    )
                                                                        ? "number"
                                                                        : "text"
                                                                }
                                                                min={0}
                                                                onWheel={(e) => e.currentTarget.blur()}
                                                                step="0.001"
                                                                value={
                                                                    item[
                                                                    field as keyof typeof item
                                                                    ]
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const updated =
                                                                        [
                                                                            ...formData.items,
                                                                        ];

                                                                    updated[
                                                                        index
                                                                    ] = {
                                                                        ...updated[
                                                                        index
                                                                        ],
                                                                        [field]:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };

                                                                    setFormData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            items:
                                                                                updated,
                                                                        })
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Risk Details */}
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Risk Details
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Risk related information
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label>At Own Risk</Label>

                                                <Select
                                                    value={formData.at_own_risk}
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            at_own_risk: value,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="Yes">
                                                            Yes
                                                        </SelectItem>

                                                        <SelectItem value="No">
                                                            No
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Carrier Risk</Label>

                                                <Select
                                                    value={formData.carrier_risk}
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            carrier_risk: value,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="Yes">
                                                            Yes
                                                        </SelectItem>

                                                        <SelectItem value="No">
                                                            No
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Responsibility Remarks</Label>

                                                <Input
                                                    className="h-11 rounded-xl"
                                                    type="text"
                                                    name={"vide_not_responsible"}
                                                    min={0}
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    value={
                                                        formData.vide_not_responsible
                                                    }
                                                    onChange={handleChange}
                                                    disabled={saveLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* /Other Details */}
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Other Details
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Additional information
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label>Consignor</Label>
                                                <SearchSelect
                                                    items={nameItems}
                                                    value={selectedConsignor}
                                                    onSearch={handleSearchNames}
                                                    onAdd={(name) => handleAdd(name, 'consignor')}
                                                    placeholder=""
                                                    onChange={(item) => {
                                                        setSelectedConsignor(item);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            consignor_name: item.id,
                                                        }))
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Consignee</Label>
                                                <SearchSelect
                                                    items={nameItems}
                                                    value={selectedConsignee}
                                                    onSearch={handleSearchNames}
                                                    onAdd={(name) => handleAdd(name, 'consignee')}
                                                    placeholder=""
                                                    onChange={(item) => {
                                                        setSelectedConsignee(item);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            consignee_name: item.id,
                                                        }))
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={saveLoading}
                                        className="h-11 px-8 rounded-xl shadow-sm"
                                    >
                                        {saveLoading && (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        )}

                                        {saveLoading
                                            ? formData.id !== ""
                                                ? "Updating..."
                                                : "Saving..."
                                            : formData.id !== ""
                                                ? "Update Detail"
                                                : "Save Detail"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        open={show}
                        onOpenChange={(val) => {
                            setShow(val);
                        }}
                    >
                        <DialogContent
                            className="sm:max-w-xl rounded-2xl bg-white"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                            <DialogHeader>
                                <DialogTitle>CSV</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 max-h-[500px] md:max-h-[550px] overflow-y-auto px-2 space-y-6">
                                <div className="flex gap-2 flex-wrap">
                                    <DatePicker
                                        initialDate={new Date(start)}
                                        onDateChange={(value) => {
                                            if (value) {
                                                const year = value.getFullYear();
                                                const month = String(value.getMonth() + 1).padStart(
                                                    2,
                                                    "0"
                                                );
                                                const day = String(value.getDate()).padStart(2, "0");
                                                setStart(`${year}-${month}-${day}`);
                                            }
                                        }}
                                        title="From"
                                    />
                                    <DatePicker
                                        initialDate={new Date(end)}
                                        onDateChange={(value) => {
                                            if (value) {
                                                const year = value.getFullYear();
                                                const month = String(value.getMonth() + 1).padStart(
                                                    2,
                                                    "0"
                                                );
                                                const day = String(value.getDate()).padStart(2, "0");
                                                setEnd(`${year}-${month}-${day}`);
                                            }
                                        }}
                                        title="To"
                                    />

                                </div>
                            </div>

                            <div className="w-full flex justify-end gap-2">
                                <Button className="w-full bg-black hover:bg-gray-700" disabled={load} onClick={() => handleCSV()} type="button">
                                    {loadingg ? "Downloading..." : "Download"}
                                </Button>
                            </div>
                        </DialogContent>

                    </Dialog>
                    {
                        item && <Dialog
                            open={openn}
                            onOpenChange={(val) => {
                                setOpenn(val);
                                if (!val) {
                                    setItem(null);
                                    setDocType(null);
                                }
                            }}
                        >
                            {
                                docType == 'invoice' ?
                                    <DialogContent
                                        className="sm:max-w-2xl rounded-2xl bg-white p-0 overflow-hidden shadow-xl"
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                    >
                                        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                                            <DialogTitle className="text-lg font-semibold">
                                                {'Invoice'}
                                            </DialogTitle>
                                        </div>

                                        <div className="px-6 py-5 max-h-[550px] overflow-y-auto space-y-6 bg-white">

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 rounded-xl bg-slate-50 border">
                                                    <p className="text-xs text-slate-500">{'Invoice No'}</p>
                                                    <p className="font-medium">{item.expand.invoices_via_transaction[0].invoice_number}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-slate-50 border">
                                                    <p className="text-xs text-slate-500">Client Name</p>
                                                    <p className="font-medium">{item.expand.client.name}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-slate-50 border">
                                                    <p className="text-xs text-slate-500">Whatsapp No./Phone No.</p>
                                                    <p className="font-medium">{item.expand.client.phone}</p>
                                                </div>

                                                <div className="p-3 rounded-xl bg-slate-50 border">
                                                    <p className="text-xs text-slate-500">Date</p>
                                                    <p className="font-medium">{new Date(item.created).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t bg-slate-50 px-6 py-4 flex justify-end gap-3">

                                            <Button
                                                disabled={load}
                                                onClick={() => handleDownloadInvoice(item)}
                                                className="h-10 w-10 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
                                            >
                                                <Download className="w-5 h-5" />
                                            </Button>

                                            <Button
                                                onClick={() => handlePrintInvoice(item)}
                                                className="h-10 w-10 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </Button>

                                            <Button
                                                disabled={loadingWhatsapp}
                                                onClick={handleInvoiceWhatsapp}
                                                className="h-10 w-10 p-0 rounded-xl bg-green-600 hover:bg-green-700 flex items-center justify-center"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </Button>

                                        </div>
                                    </DialogContent>
                                    :
                                    <DialogContent
                                        className="sm:max-w-2xl rounded-2xl bg-white p-0 overflow-hidden shadow-xl"
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                    >
                                        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                                            <DialogTitle className="text-lg font-semibold">
                                                {'Consignment Note'}
                                            </DialogTitle>
                                        </div>

                                        <div className="px-6 py-5 max-h-[550px] overflow-y-auto space-y-6 bg-white">
                                            <div className="p-3 rounded-xl bg-slate-50 border">
                                                <p className="text-xs text-slate-500">CN No.</p>
                                                <p className="font-medium">{item.cn_no}</p>
                                            </div>

                                            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500">Consignor</p>
                                                    <p className="font-medium">{item.expand.client.name}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {item.expand.client.phone}
                                                    </p>
                                                </div>

                                                <button
                                                    disabled={sendingTo === "consignor"}
                                                    onClick={() =>
                                                        handleNoteWhatsapp(
                                                            item.expand.client.name,
                                                            item.expand.client.phone,
                                                            "consignor"
                                                        )
                                                    }
                                                    className="px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                                                >
                                                    {sendingTo === "consignor" ? "Sending..." : "WhatsApp"}
                                                </button>
                                            </div>

                                            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500">Consignee</p>
                                                    <p className="font-medium">{item.consignee.name}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {item.consignee.mobile_number}
                                                    </p>
                                                </div>

                                                <button
                                                    disabled={sendingTo === "consignee"}
                                                    onClick={() =>
                                                        handleNoteWhatsapp(
                                                            item.consignee.name,
                                                            item.consignee.mobile_number,
                                                            "consignee"
                                                        )
                                                    }
                                                    className="px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                                                >
                                                    {sendingTo === "consignee" ? "Sending..." : "WhatsApp"}
                                                </button>
                                            </div>

                                            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500">Driver</p>
                                                    <p className="font-medium">{item.expand.invoices_via_transaction[0].driver_name}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {item.expand.invoices_via_transaction[0].driver_mobile_no}
                                                    </p>
                                                </div>

                                                <button
                                                    disabled={sendingTo === "driver"}
                                                    onClick={() =>
                                                        handleNoteWhatsapp(
                                                            item.expand.invoices_via_transaction[0].driver_name,
                                                            item.expand.invoices_via_transaction[0].driver_mobile_no,
                                                            "driver"
                                                        )
                                                    }
                                                    className="px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                                                >
                                                    {sendingTo === "driver" ? "Sending..." : "WhatsApp"}
                                                </button>
                                            </div>

                                        </div>

                                        <div className="border-t bg-slate-50 px-6 py-4 flex justify-end gap-3">

                                            <Button
                                                disabled={load}
                                                onClick={() => handleDownloadConsignmentNote(item)}
                                                className="h-10 w-10 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
                                            >
                                                <Download className="w-5 h-5" />
                                            </Button>

                                            <Button
                                                onClick={() => handlePrintConsignmentNote(item)}
                                                className="h-10 w-10 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </DialogContent>
                            }
                        </Dialog>
                    }
                </Card>
            </>
        );
    }
);