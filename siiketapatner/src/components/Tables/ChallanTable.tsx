import { useEffect, useState } from "react";

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
    History,
    Info,
    Loader2,
    MessageCircle,
    MoreVertical,
    Plus,
    Printer,
    Receipt,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "../ui/input";

import { Link, useNavigate } from "react-router-dom";

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
import ChallanPDF from "../Challan";
import TransactionSelectDialog from "../TransactionDialog";
import challanStore from "@/store/challanStore";
import { pb } from "@/lib/pocketbase";
import { SearchSelect } from "../SearchSelect";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const ChallanTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
        const navigate = useNavigate();

        const startDate = challanStore((state) => state.startDate);
        const endDate = challanStore((state) => state.endDate);
        const getTxnByFleetId = txnStore((state) => state.getTxnByFleetId);
        const txns = txnStore((state) => state.txns);
        const [query, setQuery] = useState('');
        const [weight_auto, setWeightAuto] = useState('yes');

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
        } = challanStore();

        const [selectedPage, setSelectedPage] = useState(page);

        const [open, setOpen] = useState(false);

        const [openn, setOpenn] = useState(false);

        const [saveLoading, setSaveLoading] =
            useState(false);

        const [deleteLoadingId, setDeleteLoadingId] =
            useState("");

        const [txDialogOpen, setTxDialogOpen] = useState(false);

        const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
        const [item, setItem] = useState(null);

        const [formData, setFormData] = useState({
            id: "",
            mf_no: "",
            fleet: "",
            transactions: [],
            driver_name: "",
            driver_mobile_no: "",
            driving_licence_no: "",
            driver_aadhaar_no: "",
            freight_per_ton: "",
            total_freight: "",
            freight_rs: "",
            advance_rs: "",
            part_payment_rs: "",
            balance_rs: "",
            tds_rs: "",
            hired_through: "",
            destination: "",
            vehicle_provider: "no",
            provider_name: "",
            provider_amount: "",
            tonne: "",
            origin: "",
        });

        const pageSize = 16;
        const startIndex = (selectedPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const [load, setLoad] = useState(false);

        const getCSV = challanStore((state) => state.getCSV);
        const [show, setShow] = useState(false);
        const [loadingg, setLoadingg] = useState(false);


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

                    console.log(records)

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

        const today = new Date().toISOString().split("T")[0];

        const [start, setStart] = useState(today);
        const [end, setEnd] = useState(today);

        const [txs, setTxs] = useState([]);
        const [otxs, setOTxs] = useState([]);

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
                mf_no: "",
                fleet: "",
                transactions: [],
                driver_name: "",
                driver_mobile_no: "",
                driving_licence_no: "",
                driver_aadhaar_no: "",
                freight_per_ton: "",
                total_freight: "",
                freight_rs: "",
                advance_rs: "",
                part_payment_rs: "",
                balance_rs: "",
                tds_rs: "",
                hired_through: "",
                destination: "",
                vehicle_provider: "no",
                provider_name: "",
                provider_amount: "",
                tonne: "",
                origin: "",
            });
            setSelectedFleet(null);
            setTxs([]);
            setOTxs([]);
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
                mf_no: item.mf_no || "",
                fleet: item.fleet || "",
                transactions: item.transactions || [],
                driver_name: item.driver_name || "",
                driver_mobile_no: item.driver_mobile_no || "",
                driving_licence_no: item.driving_licence_no || "",
                driver_aadhaar_no: item.driver_aadhaar_no || "",
                freight_per_ton: item.freight_per_ton || "",
                total_freight: item.total_freight || "",
                freight_rs: item.freight_rs || "",
                advance_rs: item.advance_rs || "",
                part_payment_rs: item.part_payment_rs || "",
                balance_rs: item.balance_rs || "",
                tds_rs: item.tds_rs || "",
                hired_through: item.hired_through || "",
                destination: item.destination || "",
                vehicle_provider: item.vehicle_provider || "no",
                provider_name: item.provider_name || "",
                provider_amount: item.provider_amount || "",
                tonne: item.tonne || "",
                origin: item.origin || "",
            });
            setTxs(item.expand?.transactions ?? []);
            setOTxs(item.expand?.transactions ?? []);

            setSelectedFleet({
                id: item.expand.fleet.id,
                label: `${item.expand.fleet.truck_no}, ${item.expand.fleet.driver_name}`,
            });

            setOpen(true);
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            try {
                setSaveLoading(true);

                const body = {
                    mf_no: formData.mf_no,
                    fleet: formData.fleet,

                    transactions: formData.transactions || [],

                    driver_name: formData.driver_name,
                    driver_mobile_no: formData.driver_mobile_no,
                    driving_licence_no: formData.driving_licence_no,
                    driver_aadhaar_no: formData.driver_aadhaar_no,

                    freight_per_ton: Number(formData.freight_per_ton) || 0,
                    total_freight: Number(formData.total_freight) || 0,
                    freight_rs: Number(formData.total_freight) || 0,

                    advance_rs: Number(formData.advance_rs) || 0,
                    part_payment_rs: Number(formData.part_payment_rs) || 0,
                    balance_rs: Number(formData.balance_rs) || 0,

                    tds_rs: Number(formData.tds_rs) || 0,
                    tonne: Number(formData.tonne) || 0,

                    hired_through: formData.hired_through,
                    destination: formData.destination,
                    origin: formData.origin,
                    vehicle_provider: formData.vehicle_provider || 'no',
                    provider_name: formData.provider_name,
                    provider_amount: formData.provider_amount || 0,
                };


                if (formData.id !== "") {
                    const result = await updateDataApi(formData.id, body);

                    if (!result.status) {
                        toast.error("Failed to update record");
                    } else {
                        toast.success("Updated successfully!");

                        setOpen(false);
                        resetForm();
                    }

                    return;
                }

                const result = await createDataApi(body);

                if (!result.status) {
                    toast.error("Failed to create record");
                } else {
                    toast.success("Created successfully!");

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

        const removeTransaction = (id: string) => {
            setFormData(prev => ({
                ...prev,
                transactions: prev.transactions.filter(txId => txId !== id)
            }));
            const tx = [...txs].filter((e) => e.id != id);
            setTxs(tx);
        };

        useEffect(() => {
            if (formData.fleet != '') {
                getTxnByFleetId(formData.fleet);
            }
        }, [formData.fleet]);

        const handleDownloadChallan = async (data: any) => {
            const blob = await pdf(<ChallanPDF data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.expand.fleet.driver_name}_challan.pdf`;
            a.click();
            URL.revokeObjectURL(url);
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

        const handlePrintChallan = async (data: any) => {
            const blob = await pdf(<ChallanPDF data={item} />).toBlob();
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.print();
            };
        }

        const handleChallanWhatsapp = async () => {
            if (!item) return;
            setLoadingWhatsapp(true);
            try {
                const blob = await pdf(<ChallanPDF data={item} />).toBlob();
                const file = new File(
                    [blob],
                    `${item.driver_name}_challan.pdf`,
                    {
                        type: "application/pdf",
                    }
                );

                const record = await pb.collection("documents").create({
                    file: file,
                    type: "challan",
                    name: item.driver_name,
                    id_no: item.mf_no ?? ""
                });
                const url = `https://docs.haakudigital.com/${record.collectionId}/${record.id}/${record.file}`;
                const lines = [
                    `Hello ${item.driver_name},`,
                    "",
                    `Your challan for MF No. ${item.mf_no ?? "-"} is ready.`,
                    "",
                    "Please keep this document available during transit and delivery.",
                    "",
                    "Challan Link:",
                    url,
                    "",
                    "For any assistance, please contact the transport office.",
                    "",
                    "Thank you,",
                    "Assam Transport Agency"
                ];

                const message = lines.join("\n");

                window.open(
                    `https://wa.me/${item.driver_mobile_no}?text=${encodeURIComponent(message)}`,
                    "_blank"
                );
            } catch (e) {
                toast.error(
                    "Failed to send Challan"
                );
            } finally {
                setLoadingWhatsapp(false);
            }
        }

        useEffect(() => {
            if (weight_auto == 'yes') {
                const totalLoadingWeight = txs
                    .filter(txn => formData.transactions.includes(txn.id))
                    .reduce((sum, txn) => sum + (Number(txn.loading_point_weight) || 0), 0);

                setFormData((prev) => ({
                    ...prev,
                    tonne: totalLoadingWeight,
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    tonne: '',
                }));
            }
        }, [formData.transactions, txns, weight_auto, txs]);

        useEffect(() => {
            const tonne = Number(formData.tonne || 0);
            const freight_per_ton = Number(formData.freight_per_ton || 0);
            const total_freight = tonne * freight_per_ton;
            setFormData((prev) => ({
                ...prev,
                total_freight: total_freight == 0 ? '' : total_freight.toFixed(2),
            }));
        }, [formData.tonne, formData.freight_per_ton]);

        useEffect(() => {
            const total_freight = Number(formData.total_freight || 0);
            const advance_amount = Number(formData.advance_rs || 0);
            const balance = total_freight - advance_amount;
            setFormData((prev) => ({
                ...prev,
                balance_rs: balance == 0 ? '' : balance.toFixed(2),
            }));
        }, [formData.advance_rs, formData.total_freight]);

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
                                            Freight Challans
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
                                <label>Truck No./MF No.</label>
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
                                                MF No
                                            </TableHead>
                                            <TableHead>
                                                Truck
                                            </TableHead>

                                            <TableHead>
                                                Advance
                                            </TableHead>

                                            <TableHead>
                                                Balance
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
                                                    No Challan
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
                                                                item.mf_no
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                item
                                                                    ?.expand
                                                                    ?.fleet
                                                                    ?.truck_no
                                                            }
                                                        </TableCell>


                                                        <TableCell>
                                                            ₹{
                                                                item.advance_rs
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            ₹
                                                            {
                                                                item.balance_rs
                                                            }
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
                                                                            setOpenn(true);
                                                                        }}
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        Download Challan
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                        onClick={() => {
                                                                            navigate(`/challan-payments/${item.id}`);
                                                                        }}
                                                                    >
                                                                        <History className="h-4 w-4" />
                                                                        Payment Records
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

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-0">
                            <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Receipt className="w-5 h-5 text-primary" />
                                        </div>

                                        {formData.id !== ""
                                            ? "Edit Freight Challan"
                                            : "Add Freight Challan"}
                                    </DialogTitle>

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
                                                MF & Driver Details
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Driver, MF reference and freight settlement details
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label>Is Weight Automatic?</Label>

                                                <Select
                                                    value={weight_auto}
                                                    onValueChange={(value) =>
                                                        setWeightAuto(value)
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
                                            <div className="space-y-2">
                                                <Label>Truck</Label>
                                                <SearchSelect
                                                    items={fleetItems}
                                                    value={selectedFleet}
                                                    onSearch={handleSearchFleets}
                                                    placeholder="Select Truck"
                                                    onChange={(item) => {
                                                        setSelectedFleet(item);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            fleet: item.id,
                                                        }))
                                                    }}
                                                />
                                            </div>
                                            {
                                                formData.fleet && (
                                                    <div className="space-y-2 flex-col col-span-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() => setTxDialogOpen(true)}
                                                        >
                                                            Choose Consignment Notes
                                                        </Button>

                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {formData.transactions.map((id) => {
                                                                const ar = [...otxs, ...txns];
                                                                const tx = ar.find((t) => t.id === id);

                                                                return (
                                                                    <span
                                                                        key={id}
                                                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg border"
                                                                    >
                                                                        {tx?.cn_no || id}

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeTransaction(id)}
                                                                            className="ml-1 hover:text-red-600"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            }


                                            {[
                                                "tonne",
                                                "freight_per_ton",
                                                "total_freight",
                                                "advance_rs",
                                                "balance_rs",
                                                "tds_rs",
                                                "hired_through",
                                                "origin",
                                                "destination",
                                            ].map((field) => (
                                                <div key={field} className="space-y-2">
                                                    <Label className="capitalize">
                                                        {field == 'tds_rs' ? 'TDS (in %)' : field == 'tonne' ? 'Total Tonne' : field.replace(/_/g, " ")}
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        name={field}
                                                        type={[
                                                            "freight_per_ton",
                                                            "total_freight",
                                                            "freight_rs",
                                                            "advance_rs",
                                                            "balance_rs",
                                                            "tds_rs",
                                                            "tonne",
                                                        ].includes(field)
                                                            ? "number"
                                                            : "text"
                                                        }
                                                        min={0}
                                                        step="0.001"
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        value={
                                                            formData[field as keyof typeof formData] as string
                                                        }
                                                        onChange={handleChange}
                                                        disabled={saveLoading}
                                                    />
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <Label>Vehicle Provider</Label>

                                                <Select
                                                    value={formData.vehicle_provider}
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            vehicle_provider: value,
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

                                            {formData.vehicle_provider == "yes" && (
                                                <div className="space-y-2">
                                                    <Label>
                                                        Client Provider Name
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        type="text"
                                                        name={"provider_name"}
                                                        value={
                                                            formData.provider_name
                                                        }
                                                        onChange={handleChange}
                                                        disabled={saveLoading}
                                                    />
                                                </div>
                                            )}

                                            {formData.vehicle_provider == "yes" && (
                                                <div className="space-y-2">
                                                    <Label>
                                                        Vehicle Provider Amount
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl"
                                                        type="number"
                                                        name={"provider_amount"}
                                                        min={0}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        step="0.001"
                                                        value={
                                                            formData.provider_amount
                                                        }
                                                        onChange={handleChange}
                                                        disabled={saveLoading}
                                                    />
                                                </div>
                                            )}

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
                                                ? "Update Record"
                                                : "Save Record"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <TransactionSelectDialog
                        open={txDialogOpen}
                        onOpenChange={setTxDialogOpen}
                        data={[...otxs, ...txns]}
                        selected={formData.transactions}
                        onChange={(selected) => {
                            setFormData((prev) => ({
                                ...prev,
                                transactions: selected,
                            }));
                            const ar = [...otxs, ...txns];
                            const txxs = ar.filter((t) => selected.includes(t.id));
                            setTxs(txxs)
                         }
                        }
                    />

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
                                }
                            }}
                        >
                            {
                                <DialogContent
                                    className="sm:max-w-2xl rounded-2xl bg-white p-0 overflow-hidden shadow-xl"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                    <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                                        <DialogTitle className="text-lg font-semibold">
                                            {'Challan'}
                                        </DialogTitle>
                                    </div>

                                    <div className="px-6 py-5 max-h-[550px] overflow-y-auto space-y-6 bg-white">

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-xl bg-slate-50 border">
                                                <p className="text-xs text-slate-500">{'MF No'}</p>
                                                <p className="font-medium">{item.mf_no}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 border">
                                                <p className="text-xs text-slate-500">Driver Name</p>
                                                <p className="font-medium">{item.driver_name}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 border">
                                                <p className="text-xs text-slate-500">Whatsapp No./Phone No.</p>
                                                <p className="font-medium">{item.driver_mobile_no}</p>
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
                                            onClick={() => handleDownloadChallan(item)}
                                            className="h-10 w-10 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
                                        >
                                            <Download className="w-5 h-5" />
                                        </Button>

                                        <Button
                                            onClick={() => handlePrintChallan(item)}
                                            className="h-10 w-10 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
                                        >
                                            <Printer className="w-5 h-5" />
                                        </Button>

                                        <Button
                                            disabled={loadingWhatsapp}
                                            onClick={handleChallanWhatsapp}
                                            className="h-10 w-10 p-0 rounded-xl bg-green-600 hover:bg-green-700 flex items-center justify-center"
                                        >
                                            <MessageCircle className="w-5 h-5" />
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