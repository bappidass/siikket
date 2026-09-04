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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    ArrowUpDown,
    Edit,
    Loader2,
    Plus,
    Search,
    Trash,
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

import fleetStore from "@/store/fleetStore";
import managerStore from "@/store/managerStore";
import { Label } from "../ui/label";
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";
import PDFFileSelect from "../PDFSelect";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const FleetTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
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
            truck_no: "",
            chassis_no: "",
            engine_no: "",
            driver_name: "",
            driver_mobile_no: "",
            driving_licence_no: "",
            driver_aadhaar_no: "",
            truck_owner_name: "",
            truck_owner_mobile_no: "",
            truck_owner_aadhaar_no: "",
            truck_owner_pan_no: "",
            truck_owner_account_no: "",
            truck_owner_gst_no: "",
            truck_owner_address: "",
            owner_aadhaar: "",
            owner_pan: "",
            truck_rc: "",
            driver_aadhaar: "",
            driver_dl: "",
        });

        const [selectedOwnerAadharFile, setSelectedOwnerAadharFile] = useState<File | null>(null);
        const [selectedOwnerPanFile, setSelectedOwnerPanFile] = useState<File | null>(null);
        const [selectedRCFile, setSelectedRCFile] = useState<File | null>(null);
        const [selectedDriverAadhaarFile, setSelectedDriverAadhaarFile] = useState<File | null>(null);
        const [selectedDriverDLFile, setSelectedDriverDLFile] = useState<File | null>(null);

        const pageSize = 5;

        const {
            deleteRecord: deleteRecordApi,
            saveRecord: createDataApi,
            updateRecord: updateDataApi,
        } = fleetStore();

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
                        "Failed to delete fleet"
                    );
                } else {
                    toast.success(
                        "Fleet deleted successfully!"
                    );
                }
            } finally {
                setDeleteLoadingId("");
            }
        };

        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        };

        const resetForm = () => {
            setFormData({
                id: "",
                truck_no: "",
                chassis_no: "",
                engine_no: "",
                driver_name: "",
                driver_mobile_no: "",
                driving_licence_no: "",
                driver_aadhaar_no: "",
                truck_owner_name: "",
                truck_owner_mobile_no: "",
                truck_owner_aadhaar_no: "",
                truck_owner_pan_no: "",
                truck_owner_account_no: "",
                truck_owner_gst_no: "",
                truck_owner_address: "",
                owner_aadhaar: "",
                owner_pan: "",
                truck_rc: "",
                driver_aadhaar: "",
                driver_dl: "",
            });
            setSelectedOwnerAadharFile(null);
            setSelectedOwnerPanFile(null);
            setSelectedRCFile(null);
            setSelectedDriverAadhaarFile(null);
            setSelectedDriverDLFile(null);
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
                truck_no:
                    item.truck_no || "",
                chassis_no:
                    item.chassis_no || "",
                engine_no:
                    item.engine_no || "",
                driver_name:
                    item.driver_name || "",
                driver_mobile_no:
                    item.driver_mobile_no ||
                    "",
                driving_licence_no:
                    item.driving_licence_no ||
                    "",
                driver_aadhaar_no:
                    item.driver_aadhaar_no ||
                    "",
                truck_owner_name:
                    item.truck_owner_name ||
                    "",
                truck_owner_mobile_no:
                    item.truck_owner_mobile_no ||
                    "",
                truck_owner_aadhaar_no:
                    item.truck_owner_aadhaar_no ||
                    "",
                truck_owner_pan_no:
                    item.truck_owner_pan_no ||
                    "",
                truck_owner_account_no:
                    item.truck_owner_account_no ||
                    "",
                truck_owner_gst_no:
                    item.truck_owner_gst_no ||
                    "",
                truck_owner_address:
                    item.truck_owner_address ||
                    "",
                owner_aadhaar:
                    item.owner_aadhaar ||
                    "",
                owner_pan:
                    item.owner_pan ||
                    "",
                truck_rc:
                    item.truck_rc ||
                    "",
                driver_aadhaar:
                    item.driver_aadhaar ||
                    "",
                driver_dl:
                    item.driver_dl ||
                    "",
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
                    truck_no:
                        formData.truck_no,
                    chassis_no:
                        formData.chassis_no,
                    engine_no:
                        formData.engine_no,
                    driver_name:
                        formData.driver_name,
                    driver_mobile_no:
                        formData.driver_mobile_no,
                    driving_licence_no:
                        formData.driving_licence_no,
                    driver_aadhaar_no:
                        formData.driver_aadhaar_no,
                    truck_owner_name:
                        formData.truck_owner_name,
                    truck_owner_mobile_no:
                        formData.truck_owner_mobile_no,
                    truck_owner_aadhaar_no:
                        formData.truck_owner_aadhaar_no,
                    truck_owner_pan_no:
                        formData.truck_owner_pan_no,
                    truck_owner_account_no:
                        formData.truck_owner_account_no,
                    truck_owner_gst_no:
                        formData.truck_owner_gst_no,
                    truck_owner_address:
                        formData.truck_owner_address,
                    owner_aadhaar: selectedOwnerAadharFile ?? formData.owner_aadhaar,
                    owner_pan: selectedOwnerPanFile ?? formData.owner_pan,
                    truck_rc: selectedRCFile ?? formData.truck_rc,
                    driver_aadhaar: selectedDriverAadhaarFile ?? formData.driver_aadhaar,
                    driver_dl: selectedDriverDLFile ?? formData.driver_dl,
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
                            "Failed to update fleet"
                        );
                    } else {
                        toast.success(
                            "Fleet updated successfully!"
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
                        "Failed to create fleet"
                    );
                } else {
                    toast.success(
                        "Fleet added successfully!"
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
                                        Truck Details
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
                                            Truck No
                                        </TableHead>

                                        <TableHead>
                                            Driver
                                        </TableHead>

                                        <TableHead>
                                            Owner
                                        </TableHead>

                                        <TableHead>
                                            Mobile
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
                                                No Fleets found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(
                                            (item) => (
                                                <TableRow
                                                    key={item.id}
                                                >
                                                    <TableCell>
                                                        {
                                                            item.truck_no
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            item.driver_name
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            item.truck_owner_name
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            item.driver_mobile_no
                                                        }
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
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="px-2">
                                Truck Details
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 max-h-[80vh] overflow-y-auto px-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block">
                                        Truck Number
                                    </Label>

                                    <Input
                                        name="truck_no"
                                        value={formData.truck_no}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Chassis Number
                                    </Label>

                                    <Input
                                        name="chassis_no"
                                        value={formData.chassis_no}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Engine Number
                                    </Label>

                                    <Input
                                        name="engine_no"
                                        value={formData.engine_no}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Driver Name
                                    </Label>

                                    <Input
                                        name="driver_name"
                                        value={formData.driver_name}
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Driver Mobile Number
                                    </Label>

                                    <Input
                                        name="driver_mobile_no"
                                        value={
                                            formData.driver_mobile_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Driving Licence Number
                                    </Label>

                                    <Input
                                        name="driving_licence_no"
                                        value={
                                            formData.driving_licence_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Driver Aadhaar Number
                                    </Label>

                                    <Input
                                        name="driver_aadhaar_no"
                                        value={
                                            formData.driver_aadhaar_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner Name
                                    </Label>

                                    <Input
                                        name="truck_owner_name"
                                        value={
                                            formData.truck_owner_name
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner Mobile Number
                                    </Label>

                                    <Input
                                        name="truck_owner_mobile_no"
                                        value={
                                            formData.truck_owner_mobile_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner Aadhaar Number
                                    </Label>

                                    <Input
                                        name="truck_owner_aadhaar_no"
                                        value={
                                            formData.truck_owner_aadhaar_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner PAN Number
                                    </Label>

                                    <Input
                                        name="truck_owner_pan_no"
                                        value={
                                            formData.truck_owner_pan_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner Account Number
                                    </Label>

                                    <Input
                                        name="truck_owner_account_no"
                                        value={
                                            formData.truck_owner_account_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner GST Number
                                    </Label>

                                    <Input
                                        name="truck_owner_gst_no"
                                        value={
                                            formData.truck_owner_gst_no
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner Address
                                    </Label>

                                    <Input
                                        name="truck_owner_address"
                                        value={
                                            formData.truck_owner_address
                                        }
                                        onChange={handleChange}
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner AADHAR
                                    </Label>

                                    <PDFFileSelect
                                        initialFileUrl={formData.owner_aadhaar!='' ? `https://docs.haakudigital.com/pbc_3288676456/${formData.id}/${formData.owner_aadhaar}` : formData.owner_aadhaar}
                                        initialFileName={formData.owner_aadhaar}
                                        onFileChange={(file, url) => {
                                            setSelectedOwnerAadharFile(file)
                                         }}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        Truck Owner PAN
                                    </Label>

                                    <PDFFileSelect
                                        initialFileUrl={formData.owner_pan!='' ? `https://docs.haakudigital.com/pbc_3288676456/${formData.id}/${formData.owner_pan}` : formData.owner_pan}
                                        initialFileName={formData.owner_pan}
                                        onFileChange={(file, url) => {
                                            setSelectedOwnerPanFile(file)
                                         }}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        Truck RC
                                    </Label>

                                    <PDFFileSelect
                                        initialFileUrl={formData.truck_rc!='' ? `https://docs.haakudigital.com/pbc_3288676456/${formData.id}/${formData.truck_rc}` : formData.truck_rc}
                                        initialFileName={formData.truck_rc}
                                        onFileChange={(file, url) => {
                                            setSelectedRCFile(file)
                                         }}
                                    />
                                </div>
                                
                                <div>
                                    <Label className="mb-2 block">
                                        Driver AADHAR
                                    </Label>

                                    <PDFFileSelect
                                        initialFileUrl={formData.driver_aadhaar!='' ? `https://docs.haakudigital.com/pbc_3288676456/${formData.id}/${formData.driver_aadhaar}` : formData.driver_aadhaar}
                                        initialFileName={formData.driver_aadhaar}
                                       onFileChange={(file, url) => {
                                            setSelectedDriverAadhaarFile(file)
                                         }}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        Driver DL
                                    </Label>

                                    <PDFFileSelect
                                        initialFileUrl={formData.driver_dl!='' ? `https://docs.haakudigital.com/pbc_3288676456/${formData.id}/${formData.driver_dl}` : formData.driver_dl}
                                        initialFileName={formData.driver_dl}
                                        onFileChange={(file, url) => {
                                            setSelectedDriverDLFile(file)
                                         }}
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
                                            ? "Update Truck Details"
                                            : "Save Truck Details"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }
);