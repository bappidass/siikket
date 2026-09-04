import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Check,
    ChevronsUpDown,
    Info,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    Trash,
    Trash2,
    Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { PATH_URL } from "@/utils/api";
import { ImageUpload } from "../ImageUpload";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import eventStore from "@/store/eventStore";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import categoryStore from "@/store/categoryStore";
import { MultipleImageUpload } from "../MultipleImageSelector";
import { SearchSelect } from "../SearchSelect";
import organisationStore from "@/store/organisationStore";
import { SearchMultiSelect } from "../SearchMultiSelect";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: Boolean;
    error: Boolean;
};

export const EventTable = React.memo(
    ({ items, loading, error, onSearchChange }: TableProps) => {
        const navigate = useNavigate();
        const [openMenuId, setOpenMenuId] = useState<string | null>(null);

        const { items: categories } = categoryStore();
        const { searchItems } = organisationStore();

        const [organisationItems, setOrganisations] = useState([]);
        const [vendorItems, setVendors] = useState([]);

        const {
            saveRecord: createDataApi,
            updateRecord: updateDataApi,
            loadMore,
            page, totalItems, totalPages,
        } = eventStore();

        const [selectedPage, setSelectedPage] = useState(page);

        const [open, setOpen] = useState(false);

        const [saveLoading, setSaveLoading] = useState(false);

        const [deleteLoadingId, setDeleteLoadingId] =
            useState("");

        const [formData, setFormData] = useState({
            id: "",
            organizer_id: "",
            image: "",
            venue_image: "",
            vendor_ids: [],
            gallery: [],
            category: "",
            title: "",
            description: "",
            city: "",
            address: "",
            prefix: "",
            event_date: "",
            duration_minutes: 0,
            languages: [],
            is_active: true,
            seating_types: [],
            zones: [],
        });

        const pageSize = 5;

        const startIndex = (selectedPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);



        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        };

    

        const openEditDialog = async (item: any) => {
            if (item.organizer_id != '') handleSearchOrganisations(item.organizer_id);
            if (item.vendor_ids?.length > 0) {
                const vendors = await fetchVendors(item.vendor_ids.join(","));
                setSelectedVendors(
                    vendors
                        .filter((v: any) => item.vendor_ids.includes(v.id))
                        .map((v: any) => ({
                            id: v.id,
                            label: v.name,
                        }))
                );
            } else {
                setSelectedVendors([]);
            }
            setFormData({
                id: item.id || "",
                organizer_id: item.organizer_id || "",
                image: item.image || "",
                venue_image: item.venue_image || "",
                gallery: Array.isArray(item.gallery) ? item.gallery : [],
                vendor_ids: Array.isArray(item.vendor_ids) ? item.vendor_ids : [],
                category: item.category || "",
                title: item.title || "",
                description: item.description || "",
                city: item.city || "",
                address: item.address || "",
                prefix: item.prefix || "",
                event_date: item.event_date || "",
                duration_minutes: item.duration_minutes || 0,
                languages: item.languages || [],
                is_active: item.is_active ?? true,
                seating_types: item.seating_types || [],
                zones: item.zones || [],
            });

            setOpen(true);
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            try {
                setSaveLoading(true);

                const body = {
                    organizer_id: formData.organizer_id,
                    image: formData.image,
                    venue_image: formData.venue_image,
                    gallery: formData.gallery,
                    category: formData.category,
                    title: formData.title,
                    description: formData.description,
                    city: formData.city,
                    address: formData.address,
                    prefix: formData.prefix,
                    event_date: formData.event_date,
                    duration_minutes: Number(formData.duration_minutes),
                    languages: formData.languages,
                    is_active: formData.is_active,
                    seating_types: formData.seating_types,
                    vendor_ids: formData.vendor_ids,
                    zones: formData.zones,
                };

                let result: any;

                if (formData.id) {
                    result = await updateDataApi({
                        id: formData.id,
                        ...body,
                    });

                    if (!result.status) {
                        toast.error("Failed to update event");
                        return;
                    }

                    toast.success("Event updated successfully!");
                } else {
                    result = await createDataApi(body);

                    if (!result.status) {
                        toast.error("Failed to create event");
                        return;
                    }

                    toast.success("Event created successfully!");
                }

                setOpen(false);

                setFormData({
                    id: "",
                    organizer_id: "",
                    image: "",
                    venue_image: "",
                    vendor_ids: [],
                    gallery: [],
                    category: "",
                    title: "",
                    description: "",
                    city: "",
                    address: "",
                    prefix: "",
                    event_date: "",
                    duration_minutes: 0,
                    languages: [],
                    is_active: true,
                    seating_types: [],
                    zones: [],
                });
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

        const handlePageChange = async (page: number) => {
            const result = await loadMore(page);
            if (result.status) {
                setSelectedPage(page);
            }
        };

        const updateSeatType = (
            index: number,
            field: string,
            value: any
        ) => {
            const updated = [...formData.seating_types];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            handleFormChange("seating_types", updated);
        };

        const addSeatType = () => {
            handleFormChange("seating_types", [
                ...formData.seating_types,
                {
                    name: "",
                    image: "",
                    price: 0,
                    total_seats: 0,
                    available_seats: 0,
                    sort_order: formData.seating_types.length,
                },
            ]);
        };

        const removeSeatType = (index: number) => {
            handleFormChange(
                "seating_types",
                formData.seating_types.filter(
                    (_: any, i: number) => i !== index
                )
            );
        };

        const formatDateTimeLocal = (date?: string | null) => {
            if (!date) return "";

            const d = new Date(date);

            const pad = (n: number) => String(n).padStart(2, "0");

            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                d.getDate()
            )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const addZone = () => {
            handleFormChange(
                "zones",
                [
                    ...formData.zones,
                    {
                        name: ""
                    }
                ]
            );
        };

        const updateZone = (
            index: number,
            value: string
        ) => {
            const updated = [...formData.zones];

            updated[index].name = value;

            handleFormChange(
                "zones",
                updated
            );
        };

        const removeZone = (index: number) => {
            handleFormChange(
                "zones",
                formData.zones.filter(
                    (_: any, i: number) => i !== index
                )
            );
        };

        const [selectedVendors, setSelectedVendors] = useState<
            { id: string; label: string }[]
        >([]);

        const fetchVendors = async (search: string) => {
            const record = await searchItems(search, "vendors");
            setVendors(record.items ?? []);
            return record.items ?? [];
        };

        const handleSearchOrganisations = (() => {
            let timeout: any;
            return (search: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(async () => {
                    const record = await searchItems(search, 'organizers');
                    setOrganisations(record.items.length > 0 ? record.items : [])
                }, 300);
            };
        })();

        const handleSearchVendors = (() => {
            let timeout: ReturnType<typeof setTimeout>;

            return (search: string) => {
                clearTimeout(timeout);

                timeout = setTimeout(() => {
                    fetchVendors(search);
                }, 300);
            };
        })();

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <Breadcrumb className="mb-5">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Link to="/">Home</Link>
                                </BreadcrumbItem>

                                <BreadcrumbSeparator />

                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        Events
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <CardTitle></CardTitle>

                      
                    </div>

                    <div className="flex items-center w-[60%] md:w-[30%] relative">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />

                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
                            onChange={(e) =>
                                onSearchChange(e.target.value)
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
                                            Title
                                        </TableHead>

                                        <TableHead>
                                            Category
                                        </TableHead>

                                        <TableHead>
                                            City
                                        </TableHead>

                                        <TableHead>
                                            Date
                                        </TableHead>

                                        <TableHead>
                                            Status
                                        </TableHead>

                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-10"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-10"
                                            >
                                                No records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {item.title}
                                                </TableCell>

                                                <TableCell>
                                                    {item.category}
                                                </TableCell>

                                                <TableCell>
                                                    {item.city}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(item.event_date).toLocaleString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    }).toUpperCase()}
                                                </TableCell>

                                                <TableCell>
                                                    {item.is_active ? 'Active' : 'Inactive'}
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

                                                        <DropdownMenuContent align="end" className="w-48">
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
                                                                onClick={() => navigate(`/crew-members-assignment/${item.id}`)}
                                                            >
                                                                <Users2 className="h-4 w-4" />
                                                                Crew Members
                                                            </DropdownMenuItem>

                                                       
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
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
                    <DialogContent className="md:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {formData.id
                                    ? "Edit Event"
                                    : "Create Event"}
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 max-h-[80vh] overflow-y-auto px-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block">
                                        Organization
                                    </Label>
                                    <SearchSelect
                                        items={organisationItems.map((e) => ({
                                            id: e.id,
                                            label: e.name
                                        }))}
                                        value={
                                            organisationItems
                                                .map((e) => ({
                                                    id: e.id,
                                                    label: e.name
                                                }))
                                                .find((e) => e.id === formData.organizer_id) || undefined
                                        }
                                        onSearch={handleSearchOrganisations}
                                        placeholder="Select Organiser"
                                        onChange={(item) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                organizer_id: item.id,
                                            }))
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        Vendors
                                    </Label>

                                    <SearchMultiSelect
                                        items={vendorItems.map((e) => ({
                                            id: e.id,
                                            label: e.name,
                                        }))}
                                        value={selectedVendors}
                                        onChange={(vendors) => {
                                            setSelectedVendors(vendors);
                                            setFormData((prev) => ({
                                                ...prev,
                                                vendor_ids: vendors.map((v) => v.id),
                                            }));
                                        }}
                                        onSearch={handleSearchVendors}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">
                                        Event Title *
                                    </Label>

                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter event title"
                                    />
                                </div>


                                <div>
                                    <Label className="mb-2 block">Category *</Label>

                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            handleFormChange('category', value)
                                        }
                                    >
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {
                                                categories.map((item) =>
                                                    <SelectItem value={item.title} key={item.id}>
                                                        {item.title}
                                                    </SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Prefix *
                                    </Label>

                                    <Input
                                        name="prefix"
                                        value={formData.prefix}
                                        onChange={handleChange}
                                        placeholder="EVT"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        City *
                                    </Label>

                                    <Input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="mb-2 block">
                                        Address *
                                    </Label>

                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Venue address"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Event Date *
                                    </Label>

                                    <Input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(formData.event_date)}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "event_date",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Duration (Minutes)
                                    </Label>

                                    <Input
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "duration_minutes",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="mb-2 block">
                                        Description *
                                    </Label>

                                    <textarea
                                        className="w-full min-h-32 rounded-md border p-3"
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleFormChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Active Status
                                    </Label>

                                    <Select
                                        value={
                                            formData.is_active
                                                ? "true"
                                                : "false"
                                        }
                                        onValueChange={(value) =>
                                            handleFormChange(
                                                "is_active",
                                                value === "true"
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="true">
                                                Active
                                            </SelectItem>

                                            <SelectItem value="false">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-2 block">
                                        Languages
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                            >
                                                {formData.languages.length > 0
                                                    ? formData.languages.join(", ")
                                                    : "Select languages"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search language..." />

                                                <CommandList>
                                                    <CommandEmpty>
                                                        No language found.
                                                    </CommandEmpty>

                                                    <CommandGroup>
                                                        {[
                                                            "English",
                                                            "Hindi",
                                                            "Assamese",
                                                            "Bengali",
                                                            "Tamil",
                                                            "Telugu",
                                                            "Malayalam",
                                                            "Kannada",
                                                            "Marathi",
                                                            "Gujarati",
                                                        ].map((lang) => (
                                                            <CommandItem
                                                                key={lang}
                                                                onSelect={() => {
                                                                    const exists =
                                                                        formData.languages.includes(lang);

                                                                    handleFormChange(
                                                                        "languages",
                                                                        exists
                                                                            ? formData.languages.filter(
                                                                                (x) => x !== lang
                                                                            )
                                                                            : [
                                                                                ...formData.languages,
                                                                                lang,
                                                                            ]
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={`mr-2 h-4 w-4 ${formData.languages.includes(lang)
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                        }`}
                                                                />

                                                                {lang}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {formData.languages.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.languages.map((lang) => (
                                                <Badge
                                                    key={lang}
                                                    variant="secondary"
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleFormChange(
                                                            "languages",
                                                            formData.languages.filter(
                                                                (x) => x !== lang
                                                            )
                                                        )
                                                    }
                                                >
                                                    {lang} ×
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 my-4">

                                    <div className="flex items-center justify-between">

                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Event Zones
                                            </h3>

                                            <p className="text-sm text-muted-foreground">
                                                Add areas for crew/member assignment
                                            </p>
                                        </div>


                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addZone}
                                        >
                                            Add More Zone
                                        </Button>

                                    </div>



                                    {formData.zones.length === 0 && (

                                        <div className="border rounded-xl p-8 text-center text-muted-foreground">
                                            No zones added yet
                                        </div>

                                    )}



                                    {formData.zones.map(
                                        (zone: any, index: number) => (

                                            <div
                                                key={index}
                                                className="
                                                    border rounded-xl
                                                    p-4 flex gap-4 items-center
                                                "
                                            >

                                                <div className="flex-1">

                                                    <Label className="mb-2 block">
                                                        Zone Name
                                                    </Label>


                                                    <Input
                                                        placeholder="North Stand"
                                                        value={zone.name}
                                                        onChange={(e) =>
                                                            updateZone(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="text-red-500 mt-6"
                                                    onClick={() =>
                                                        removeZone(index)
                                                    }
                                                >
                                                    Remove
                                                </Button>


                                            </div>

                                        ))}

                                </div>

                                <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">
                                            Event Poster *
                                        </Label>

                                        <ImageUpload
                                            folder="events"
                                            initialImage={
                                                formData.image
                                                    ? `${PATH_URL}/${formData.image}`
                                                    : ""
                                            }
                                            onUploadComplete={(url) =>
                                                handleFormChange(
                                                    "image",
                                                    url
                                                )
                                            }
                                            onRemoved={() =>
                                                handleFormChange(
                                                    "image",
                                                    ""
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">
                                            Venue Image
                                        </Label>

                                        <ImageUpload
                                            folder="events"
                                            initialImage={
                                                formData.venue_image
                                                    ? `${PATH_URL}/${formData.venue_image}`
                                                    : ""
                                            }
                                            onUploadComplete={(url) =>
                                                handleFormChange(
                                                    "venue_image",
                                                    url
                                                )
                                            }
                                            onRemoved={() =>
                                                handleFormChange(
                                                    "venue_image",
                                                    ""
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <Label className="mb-2 block">
                                        Gallery Images
                                    </Label>
                                    <MultipleImageUpload
                                        folder="events"
                                        pathUrl={PATH_URL}
                                        initialImages={formData.gallery}
                                        onUploadComplete={(urls) => {
                                            handleFormChange("gallery", urls)
                                        }}
                                        onRemoved={(url) => { }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Seating Types
                                            </h3>

                                            <p className="text-sm text-muted-foreground">
                                                Configure ticket categories and seat allocations
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addSeatType}
                                        >
                                            Add Seating Type
                                        </Button>
                                    </div>

                                    {formData.seating_types.length === 0 && (
                                        <div className="border rounded-xl p-8 text-center text-muted-foreground">
                                            No seating types added yet
                                        </div>
                                    )}

                                    {formData.seating_types.map(
                                        (seat: any, index: number) => (
                                            <div
                                                key={index}
                                                className="border rounded-xl p-4 space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {seat.name ||
                                                                `Seat Type ${index + 1}`}
                                                        </h4>

                                                        {seat.price > 0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                ₹{seat.price} •{" "}
                                                                {seat.total_seats || 0} Seats
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={() =>
                                                            removeSeatType(index)
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="mb-2 block">
                                                            Name
                                                        </Label>

                                                        <Input
                                                            placeholder="VIP"
                                                            value={seat.name}
                                                            onChange={(e) =>
                                                                updateSeatType(
                                                                    index,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="mb-2 block">
                                                            Price
                                                        </Label>

                                                        <Input
                                                            type="number"
                                                            placeholder="5000"
                                                            value={seat.price}
                                                            onChange={(e) =>
                                                                updateSeatType(
                                                                    index,
                                                                    "price",
                                                                    Number(
                                                                        e.target.value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="mb-2 block">
                                                            Total Seats
                                                        </Label>

                                                        <Input
                                                            type="number"
                                                            placeholder="100"
                                                            value={seat.total_seats}
                                                            onChange={(e) =>
                                                                updateSeatType(
                                                                    index,
                                                                    "total_seats",
                                                                    Number(
                                                                        e.target.value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="mb-2 block">
                                                            Available Seats
                                                        </Label>

                                                        <Input
                                                            type="number"
                                                            placeholder="100"
                                                            value={seat.available_seats}
                                                            onChange={(e) =>
                                                                updateSeatType(
                                                                    index,
                                                                    "available_seats",
                                                                    Number(
                                                                        e.target.value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="mb-2 block">
                                                        Seat Image
                                                    </Label>

                                                    <ImageUpload
                                                        folder="events"
                                                        initialImage={
                                                            seat.image
                                                                ? `${PATH_URL}/${seat.image}`
                                                                : ""
                                                        }
                                                        onUploadComplete={(url) =>
                                                            updateSeatType(
                                                                index,
                                                                "image",
                                                                url
                                                            )
                                                        }
                                                        onRemoved={() =>
                                                            updateSeatType(
                                                                index,
                                                                "image",
                                                                ""
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
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

                                    {formData.id
                                        ? "Update Event"
                                        : "Create Event"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }
);