import { useCallback, useMemo, useState } from "react";

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

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

import {
    ArrowUpDown,
    Edit,
    FileText,
    Info,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    Trash,
    Trash2,
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

import clientStore from "@/store/clientStore";
import managerStore from "@/store/managerStore";
import { Label } from "../ui/label";
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const ClientTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
        const navigate = useNavigate();
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
            name: "",
            phone: "",
            email: "",
            aadhar: "",
            pan: "",
            gst: "",
            address: "",
        });

        const pageSize = 5;

        const [openMenuId, setOpenMenuId] = useState<string | null>(null);

        const {
            deleteRecord: deleteRecordApi,
            saveRecord: createDataApi,
            updateRecord: updateDataApi,
        } = clientStore();


        const sortData = useCallback(
            (field: any) => {
                if (sortedField === field) {
                    setSorting(
                        sorting === "asc"
                            ? "desc"
                            : "asc"
                    );
                } else {
                    setSortedField(field);
                    setSorting("asc");
                }

                setPage(1);
            },
            [sorting, sortedField]
        );

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
                name: "",
                phone: "",
                email: "",
                aadhar: "",
                pan: "",
                gst: "",
                address: "",
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
                name: item.name || "",
                phone: item.phone || "",
                email: item.email || "",
                aadhar:
                    item.aadhar || "",
                pan: item.pan || "",
                address:
                    item.address || "",
                gst:
                    item.gst || "",
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
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    aadhar: formData.aadhar,
                    pan: formData.pan,
                    address: formData.address,
                    gst: formData.gst,
                };

                // UPDATE

                if (formData.id !== "") {
                    const result =
                        await updateDataApi(
                            formData.id,
                            body
                        );

                    if (!result.status) {
                        toast.error(
                            "Failed to update client"
                        );
                    } else {
                        toast.success(
                            "Client updated successfully!"
                        );

                        setOpen(false);

                        resetForm();
                    }

                    return;
                }

                // CREATE

                const result =
                    await createDataApi(body);

                if (!result.status) {
                    toast.error(
                        "Failed to create client"
                    );
                } else {
                    toast.success(
                        "Client added successfully!"
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
                                    <BreadcrumbPage>
                                        Clients
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
                            Add Client
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
                                            <Button
                                                variant="ghost"
                                                className="p-0 font-medium"
                                                onClick={() =>
                                                    sortData("name")
                                                }
                                            >
                                                Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>

                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="p-0 font-medium"
                                                onClick={() =>
                                                    sortData("email")
                                                }
                                            >
                                                Email
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>

                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="p-0 font-medium"
                                                onClick={() =>
                                                    sortData("phone")
                                                }
                                            >
                                                Phone
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>

                                        <TableHead>
                                            PAN
                                        </TableHead>

                                        <TableHead>
                                            GST
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
                                                No Clients found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(
                                            (item) => (
                                                <TableRow
                                                    key={item.id}
                                                >
                                                    <TableCell>
                                                        {item.name}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item.email}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item.phone}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item.pan}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item.gst}
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
                                                                    onClick={() => navigate(`/sum-invoices/${item.id}`)}
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                    Bill Invoices
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
                    <DialogContent className="sm:max-w-lg ">
                        <DialogHeader>
                            <DialogTitle>
                                {formData.id !== ""
                                    ? "Edit Client"
                                    : "Add Client"}
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 max-h-[90vh] overflow-y-auto px-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block">
                                        Name
                                    </Label>

                                    <Input
                                        name="name"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Email
                                    </Label>

                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Phone
                                    </Label>

                                    <Input
                                        name="phone"
                                        placeholder="Phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Aadhaar Number
                                    </Label>

                                    <Input
                                        name="aadhar"
                                        placeholder="Aadhar Number"
                                        value={formData.aadhar}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        PAN Number
                                    </Label>

                                    <Input
                                        name="pan"
                                        placeholder="PAN Number"
                                        value={formData.pan}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        GST
                                    </Label>

                                    <Input
                                        name="gst"
                                        placeholder="GST"
                                        value={formData.gst}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="mb-2 block">
                                        Address
                                    </Label>

                                    <Input
                                        name="address"
                                        placeholder="Address"
                                        value={formData.address}
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
                                            ? "Update Client"
                                            : "Save Client"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }
);