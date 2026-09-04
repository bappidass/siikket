import { useMemo, useRef, useState } from "react";

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
    Info,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";
import { ImageUpload } from "../ImageUpload";
import { PATH_URL } from "@/utils/api";
import bannerStore from "@/store/bannerStore";
import { SearchSelect } from "../SearchSelect";
import eventStore from "@/store/eventStore";

import bg from "@/assets/id_bg.jpeg";
import avatar from "@/assets/id_avatar.jpeg";
import { IdCard } from "../IDCard";
import { toPng } from "html-to-image";
type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: boolean;
    error: boolean;
};

export const BannerTable = React.memo(
    ({
        items,
        loading,
        error,
        onSearchChange,
    }: TableProps) => {
        const cardRef = useRef<HTMLDivElement>(null);
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
            event: "",
            image: "",
        });

        const pageSize = 5;

        const [openMenuId, setOpenMenuId] = useState<string | null>(null);

        const {
            deleteRecord: deleteRecordApi,
            createRecord: createDataApi,
            updateRecord: updateDataApi,
        } = bannerStore();

        const {
            searchEvents, items: events
        } = eventStore();


        const [eventItems, setEventItems] = useState(events)

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
                        "Failed to delete record"
                    );
                } else {
                    toast.success(
                        "Record deleted successfully!"
                    );
                }
            } finally {
                setDeleteLoadingId("");
            }
        };

        const resetForm = () => {
            setFormData({
                id: "",
                event: "",
                image: "",
            });
        };

        const openAddDialog = () => {
            resetForm();
            setOpen(true);
        };

        const openEditDialog = (
            item: any
        ) => {
            if (item.event != '') handleSearchEvents(item.event);

            setFormData({
                id: item.id || "",
                event: item.event || "",
                image:
                    item.image || "",
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
                    id: formData.id,
                    event: formData.event,
                    image: formData.image,
                };

                if (formData.id !== "") {
                    const result =
                        await updateDataApi(
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

        const handleFormChange = (key: string, value: any) => {
            setFormData((prev) => ({
                ...prev,
                [key]: value,
            }));
        };

        const handleSearchEvents = (() => {
            let timeout: any;
            return (search: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(async () => {
                    const record = await searchEvents(search);
                    setEventItems(record.items.length > 0 ? record.items : events)
                }, 300);
            };
        })();

        const downloadCard = async () => {
            if (!cardRef.current) return;

            try {
                const dataUrl = await toPng(cardRef.current, {
                    cacheBust: true,
                    pixelRatio: 3, // Higher quality
                });

                const link = document.createElement("a");
                link.download = "id-card.png";
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error(err);
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
                                        Banners
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <CardTitle>
                            <div ref={cardRef}>
                                <IdCard
                                    backgroundUrl={bg}
                                    avatarUrl={avatar}
                                    name="Rajdeepam Das"
                                    organization="Skylark Sports"
                                    role="Staff"
                                    zones="2, 4, 5"
                                    location="Guwahati"
                                    category="CON"
                                />
                            </div>
                            <button onClick={downloadCard}>
                                Download
                            </button>
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

                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <div className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            Image
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
                                                No Records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map(
                                            (item) => (
                                                <TableRow
                                                    key={item.id}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3 w-[140px] h-[80px]">
                                                            <img src={`${PATH_URL}/${item.image}`} className="w-full h-full object-contain" />
                                                        </div>
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

                                                            <DropdownMenuContent align="end" className="w-20">
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
                                Details
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 max-h-[90vh] overflow-y-auto px-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label className="mb-2 block">
                                        Events
                                    </Label>
                                    <SearchSelect
                                        items={eventItems.map((e) => ({
                                            id: e.id,
                                            label: e.title
                                        }))}
                                        value={
                                            eventItems
                                                .map((e) => ({
                                                    id: e.id,
                                                    label: e.title
                                                }))
                                                .find((e) => e.id === formData.event) || undefined
                                        }
                                        onSearch={handleSearchEvents}
                                        placeholder="Select Event"
                                        onChange={(item) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                event: item.id,
                                            }))
                                        }}
                                    />

                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Banner Image</Label>
                                    <ImageUpload
                                        folder={"categories"}
                                        initialImage={formData.image != '' ? `${PATH_URL}/${formData.image}` : ''}
                                        onUploadComplete={(url) => handleFormChange("image", url)}
                                        onRemoved={() => handleFormChange("image", "")}
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