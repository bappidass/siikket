import { useMemo, useState } from "react";

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
    Edit,
    Loader2,
    Plus,
    Search,
    Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "../ui/input";

import { Link, useParams } from "react-router-dom";

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
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";
import invoicePaymentstore from "@/store/invoicePaymentStore";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const InvoicePaymentTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
        const { id, client_id } = useParams();
        const [sorting, setSorting] = useState<
            "asc" | "desc" | ""
        >("");

        const [sortedField, setSortedField] =
            useState<keyof any>("createdAt");

        const [page, setPage] = useState(1);

        const [open, setOpen] = useState(false);

        const [saveLoading, setSaveLoading] =
            useState(false);

        const [deleteLoadingId, setDeleteLoadingId] =
            useState("");

        const [formData, setFormData] = useState({
            id: "",
            master_invoice: id,
            amount: "",
            payment_date: "",
            mode: "CASH",
            notes: ""
        });

        const pageSize = 5;

        const {
            deleteRecord: deleteRecordApi,
            saveRecord: createDataApi,
            updateRecord: updateDataApi,
        } = invoicePaymentstore();


        const sortedData = useMemo(() => {
            return [...items].sort((a, b) => {
                if (sortedField === "createdAt") {
                    return sorting === "asc"
                        ? new Date(
                            a.createdAt
                        ).getTime() -
                        new Date(
                            b.createdAt
                        ).getTime()
                        : new Date(
                            b.createdAt
                        ).getTime() -
                        new Date(
                            a.createdAt
                        ).getTime();
                }

                const aVal = a[sortedField];
                const bVal = b[sortedField];

                if (
                    typeof aVal === "number" &&
                    typeof bVal === "number"
                ) {
                    return sorting === "asc"
                        ? aVal - bVal
                        : bVal - aVal;
                }

                return sorting === "asc"
                    ? String(aVal).localeCompare(
                        String(bVal)
                    )
                    : String(bVal).localeCompare(
                        String(aVal)
                    );
            });
        }, [items, sortedField, sorting]);

        const startIndex =
            (page - 1) * pageSize;

        const endIndex = Math.min(
            startIndex + pageSize,
            sortedData.length
        );

        const totalPages = Math.ceil(
            sortedData.length / pageSize
        );

        const paginatedData = sortedData.slice(
            startIndex,
            endIndex
        );

        const handleDelete = async (
            id: string
        ) => {
            try {
                setDeleteLoadingId(id);

                const result =
                    await deleteRecordApi(id);

                if (!result.status) {
                    toast.error(
                        "Failed to delete client"
                    );
                } else {
                    toast.success(
                        "Client deleted successfully!"
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
                master_invoice: id,
                amount: "",
                payment_date: "",
                mode: "CASH",
                notes: ""
            });
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
                master_invoice: item.master_invoice || "",
                amount: item.amount || "",
                payment_date: item.payment_date.split(" ")[0],
                mode: item.mode || "CASH",
                notes: item.notes || "",
            });
            setOpen(true);
        };

        const handleSubmit = async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            try {
                setSaveLoading(true);

                const body = {
                    master_invoice: formData.master_invoice,
                    amount: Number(formData.amount) || 0,
                    payment_date: formData.payment_date,
                    mode: formData.mode,
                    notes: formData.notes,
                };

                if (formData.id !== "") {
                    const result =
                        await updateDataApi(
                            formData.id,
                            body
                        );

                    if (!result.status) {
                        toast.error(
                            "Failed to update record"
                        );
                    } else {
                        toast.success(
                            "Record updated successfully!"
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
                        "Failed to create record"
                    );
                } else {
                    toast.success(
                        "Record added successfully!"
                    );

                    setOpen(false);

                    resetForm();
                }
            } finally {
                setSaveLoading(false);
            }
        };

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
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
                                    <Link to={`/sum-invoices/${client_id}`}>
                                        Summary Invoices
                                    </Link>
                                </BreadcrumbItem>

                                <BreadcrumbSeparator />

                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        Payments
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <CardTitle>
                            Payment List
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

                    <div className="flex items-center w-[60%] md:w-[30%] relative">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />

                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
                            onChange={(e) =>
                                onSearchChange(
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <div className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>

                                        <TableHead>
                                            Paid
                                        </TableHead>

                                        <TableHead>
                                            Date
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
                                                colSpan={5}
                                                className="text-center py-10"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedData.length ===
                                        0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-10"
                                            >
                                                No Payments found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(
                                            (item) => (
                                                <TableRow
                                                    key={item.id}
                                                >

                                                    <TableCell>
                                                        ₹{item.amount}
                                                    </TableCell>

                                                    <TableCell>
                                                        {new Date(item.payment_date)
                                                            .toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            .toUpperCase()}
                                                    </TableCell>

                                                    <TableCell className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Edit />
                                                        </Button>

                                                        <DeleteConfirmationDialog
                                                            itemId={item.id}
                                                            itemName={"record"}
                                                            onConfirm={() => handleDelete(item.id)}
                                                            trigger={
                                                                <Button className="bg-red-500 hover:bg-red-400"
                                                                    size="icon"
                                                                >
                                                                    <Trash />
                                                                </Button>
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>

                            <div className="my-4 w-full flex justify-end">
                                <TablePagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    startIndex={
                                        startIndex
                                    }
                                    endIndex={endIndex}
                                    totalItems={
                                        sortedData.length
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>

                <Dialog
                    open={open}
                    onOpenChange={setOpen}
                >
                    <DialogContent className="sm:max-w-xl ">
                        <DialogHeader>
                            <DialogTitle>
                                {formData.id !== ""
                                    ? "Edit Record"
                                    : "Add Record"}
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 max-h-[90vh] overflow-y-auto px-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="space-y-2">
                                    <Label>
                                        Amount Paid
                                    </Label>

                                    <Input
                                        name="amount"
                                        type="number"
                                        placeholder="Enter Value"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Date</Label>
                                    <Input
                                        className="h-11 rounded-xl"
                                        type="date"
                                        name="payment_date"
                                        value={formData.payment_date}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saveLoading}
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
            </Card>
        );
    }
);