import { useEffect, useMemo, useState } from "react";

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
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Link, useNavigate, useParams } from "react-router-dom";

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


import txnStore from "@/store/txnStore";
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";
import { DatePicker } from "../Forms/DatePicker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { pdf } from "@react-pdf/renderer";
import invoiceStore from "@/store/invoiceStore";
import InvoiceSelectDialog from "../InvoiceDialog";
import TransportSumBillPDF from "../SumInvoice";
import { pb } from "@/lib/pocketbase";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const InvoiceTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
        const { id } = useParams();

        const navigate = useNavigate();

        const startDate = invoiceStore((state) => state.startDate);
        const endDate = invoiceStore((state) => state.endDate);
        const getTxnByClientId = txnStore((state) => state.getTxnByClientId);
        const txnItems = txnStore((state) => state.txnItems);
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
        } = invoiceStore();

        const [selectedPage, setSelectedPage] = useState(page);

        const [open, setOpen] = useState(false);
        const [openn, setOpenn] = useState(false);


        const [saveLoading, setSaveLoading] =
            useState(false);

        const [deleteLoadingId, setDeleteLoadingId] =
            useState("");

        const [txDialogOpen, setTxDialogOpen] = useState(false);

        const [formData, setFormData] = useState({
            id: "",
            client: id,
            received: "",
            pending: "",
            invoices: []
        });

        useEffect(() => {
            if (id != '') {
                getTxnByClientId(id);
            }
        }, [id]);

        const pageSize = 16;
        const startIndex = (selectedPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const [load, setLoad] = useState(false);

        const [txs, setTxs] = useState([]);
        const [otxs, setOTxs] = useState([]);

        const [openMenuId, setOpenMenuId] = useState<string | null>(null);


        const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
        const [item, setItem] = useState(null);

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

        const resetForm = () => {
            setFormData({
                id: "",
                client: id,
                received: "",
                pending: "",
                invoices: []
            });
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
                client: item.client || "",
                received: item.received || "",
                pending: item.pending || "",
                invoices: item.invoices || []
            });
            setTxs(item.expand?.invoices_via_master_invoice ?? []);
            setOTxs(item.expand?.invoices_via_master_invoice ?? []);
            setOpen(true);
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            try {
                setSaveLoading(true);

                const body = {
                    client: id,
                    received: Number(formData.received) || 0,
                    pending: Number(formData.pending) || 0,
                    invoices: formData.invoices || []
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
                invoices: prev.invoices.filter(txId => txId !== id)
            }));
            const tx = [...txs].filter((e) => e.id != id);
            setTxs(tx);
        };


        const handleDownloadInvoice = async (data: any) => {
            const blob = await pdf(<TransportSumBillPDF data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.expand.client.name}_invoice.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }

        const handlePrintInvoice = async (data: any) => {
            const blob = await pdf(<TransportSumBillPDF data={item} />).toBlob();
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.print();
            };
        }

        const handleInvoiceWhatsapp = async () => {
            if (!item) return;
            setLoadingWhatsapp(true);
            try {
                const blob = await pdf(<TransportSumBillPDF data={item} />).toBlob();
                const file = new File(
                    [blob],
                    `${item.expand.client.name}_invoice.pdf`,
                    {
                        type: "application/pdf",
                    }
                );

                const record = await pb.collection("documents").create({
                    file: file,
                    type: "collective invoice",
                    name: item.expand.client.name,
                    id_no: item.invoice_number ?? ""
                });
                const url = `https://docs.haakudigital.com/${record.collectionId}/${record.id}/${record.file}`;
                const lines = [
                    `Hello ${item.expand.client.name},`,
                    "",
                    `Your collective invoice (${item.invoice_number ?? "-"}) has been generated.`,
                    "",
                    "Invoice Link:",
                    url,
                    "",
                    "Please retain this document for your records.",
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

        const enrichedItems = useMemo(() => {
            return items.map((item: any) => {
                const pending = Number(item.pending || 0);
                const paid = Number(item.received || 0);

                const paidFromInvoices =
                    (item.expand?.payments_via_master_invoice || [])
                        .reduce((sum: number, inv: any) => {
                            return sum + Number(inv.amount || 0);
                        }, 0);

                return {
                    ...item,
                    adjustedPending: pending - paidFromInvoices,
                    adjustedPaid: paid + paidFromInvoices,
                };
            });
        }, [items]);

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
                                        <Link to="/clients">
                                            Clients
                                        </Link>
                                    </BreadcrumbItem>

                                    <BreadcrumbSeparator />

                                    <BreadcrumbItem>
                                        <BreadcrumbPage>
                                            Invoices
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <CardTitle>
                                Summary Invoice List
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
                            {/* <Button
                                type="button"
                                size="sm"
                                className="mt-[1.7rem] h-[38px]"
                                onClick={() => exportCSV()}
                            >
                                CSV
                            </Button> */}
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
                                                Inv No
                                            </TableHead>
                                            <TableHead>
                                                Client
                                            </TableHead>

                                            <TableHead>
                                                Received
                                            </TableHead>

                                            <TableHead>
                                                Pending
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
                                        ) : enrichedItems.length ===
                                            0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center py-10"
                                                >
                                                    No records
                                                    found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            enrichedItems.map(
                                                (item) => (
                                                    <TableRow
                                                        key={item.id} className="text-[14px]"
                                                    >
                                                        <TableCell>
                                                            {
                                                                item.invoice_number
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
                                                            ₹{
                                                                item.adjustedPaid
                                                            }
                                                        </TableCell>

                                                        <TableCell>
                                                            ₹
                                                            {
                                                                item.adjustedPending
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
                                                                        Download Bill Invoice
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                        onClick={() => {
                                                                            navigate(`/invoice-payments/${id}/${item.id}`);
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
                                            ? "Edit Record"
                                            : "Add Record"}
                                    </DialogTitle>

                                </DialogHeader>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="max-h-[85vh] overflow-y-auto"
                            >
                                <div className="p-6 space-y-8">
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800">
                                                Summary Invoice Details
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <div className="space-y-2 flex-col col-span-2">
                                                <Button
                                                    type="button"
                                                    onClick={() => setTxDialogOpen(true)}
                                                >
                                                    Select Invoices
                                                </Button>

                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.invoices.map((id) => {
                                                        const ar = [...otxs, ...txnItems];
                                                        const tx = ar.find((t) => t.id === id);

                                                        return (
                                                            <span
                                                                key={id}
                                                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg border"
                                                            >
                                                                {tx?.invoice_number || id}

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
                    <InvoiceSelectDialog
                        open={txDialogOpen}
                        onOpenChange={setTxDialogOpen}
                        data={[...otxs, ...txnItems]}
                        selected={formData.invoices}
                        onChange={(selected) => {
                            setFormData((prev) => ({
                                ...prev,
                                invoices: selected,
                            }));
                            const ar = [...otxs, ...txnItems];
                            const txxs = ar.filter((t) => selected.includes(t.id));
                            setTxs(txxs)
                         }
                        }
                    />

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
                                            {'Collective Invoice'}
                                        </DialogTitle>
                                    </div>

                                    <div className="px-6 py-5 max-h-[550px] overflow-y-auto space-y-6 bg-white">

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-xl bg-slate-50 border">
                                                <p className="text-xs text-slate-500">{'Invoice No'}</p>
                                                <p className="font-medium">{item.invoice_number}</p>
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
                            }
                        </Dialog>
                    }
                </Card>
            </>
        );
    }
);