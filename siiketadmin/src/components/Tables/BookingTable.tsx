import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Loader2, MoreVertical, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "../ui/breadcrumb";

import TablePagination from "../ui/TablePagination";
import React from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import bookingStore from "@/store/bookingStore";
import eventStore from "@/store/eventStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

type TableProps = {
    items: any[];
    onSearchChange: (value: string) => void;
    loading: Boolean;
    error: Boolean;
};

const bookingStatusTitle: Record<string, string> = {
    pending: "Pending",
    completed: "Completed",
    cancelled: "expired",
    failed: "Failed",
};

const paymentStatusTitle: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
};

const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-blue-100 text-blue-700",
};

const StatusBadge = ({ value }: { value?: string }) => {
    if (!value) return <span className="text-muted-foreground text-xs">-</span>;
    return (
        <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[value] ?? "bg-gray-100 text-gray-700"
                }`}
        >
            {value}
        </span>
    );
};

export const BookingTable = React.memo(
    ({ items, loading, error, onSearchChange }: TableProps) => {
        const [openMenuId, setOpenMenuId] = useState<string | null>(null);
        const [open, setOpen] = useState(false);
        const [selected, setSelected] = useState<any>(null);

        const { loadMore, setFilters, page, totalItems, totalPages } = bookingStore();
        const [selectedPage, setSelectedPage] = useState(page);

        const events = eventStore((state) => state.items);
        const fetchEvents = eventStore((state) => state.fetchRecords);

        const [eventId, setEventId] = useState("all");
        const [bookingStatus, setBookingStatus] = useState("all");
        const [paymentStatus, setPaymentStatus] = useState("all");

        useEffect(() => {
            fetchEvents();
        }, []);

        const pageSize = 20;
        const startIndex = (selectedPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);

        const handlePageChange = async (p: number) => {
            const result = await loadMore(p);
            if (result.status) setSelectedPage(p);
        };

        const applyFilters = async (next: {
            event_id?: string;
            booking_status?: string;
            payment_status?: string;
        }) => {
            const merged = {
                event_id: next.event_id ?? eventId,
                booking_status: next.booking_status ?? bookingStatus,
                payment_status: next.payment_status ?? paymentStatus,
            };
            setEventId(merged.event_id);
            setBookingStatus(merged.booking_status);
            setPaymentStatus(merged.payment_status);

            const result = await setFilters({
                event_id: merged.event_id === "all" ? undefined : merged.event_id,
                booking_status: merged.booking_status === "all" ? undefined : merged.booking_status,
                payment_status: merged.payment_status === "all" ? undefined : merged.payment_status,
            });
            if (result.status) setSelectedPage(1);
        };

        const openDetail = (item: any) => {
            setSelected(item);
            setOpen(true);
        };

        return (
            <Card>
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between">
                        <div>
                            <Breadcrumb className="mb-2">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <Link to="/">Home</Link>
                                    </BreadcrumbItem>

                                    <BreadcrumbSeparator />

                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Bookings</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <CardTitle></CardTitle>
                        </div>

                        <div className="flex items-center w-[60%] md:w-[30%] relative">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400" />

                            <Input
                                type="search"
                                placeholder="Search by name, email, phone..."
                                className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        <Select value={eventId} onValueChange={(value) => applyFilters({ event_id: value })}>
                            <SelectTrigger className="h-10 rounded-xl w-full md:w-56">
                                <SelectValue placeholder="Filter by event" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                {events.map((ev: any) => (
                                    <SelectItem key={ev.id} value={ev.id}>
                                        {ev.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
{/* 
                        <Select
                            value={bookingStatus}
                            onValueChange={(value) => applyFilters({ booking_status: value })}
                        >
                            <SelectTrigger className="h-10 rounded-xl w-full md:w-44">
                                <SelectValue placeholder="Booking status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Booking Status</SelectItem>
                                {Object.entries(bookingStatusTitle).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={paymentStatus}
                            onValueChange={(value) => applyFilters({ payment_status: value })}
                        >
                            <SelectTrigger className="h-10 rounded-xl w-full md:w-44">
                                <SelectValue placeholder="Payment status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Payment Status</SelectItem>
                                {Object.entries(paymentStatusTitle).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select> */}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <div className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Seating</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Booking</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10">
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10">
                                                No bookings found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {item.contact_name || item.user_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.contact_phone || item.user_phone}
                                                    </div>
                                                </TableCell>

                                                <TableCell>{item.event_title}</TableCell>
                                                <TableCell>{item.seating_type}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>₹{item.total_amount}</TableCell>

                                                <TableCell>
                                                    <StatusBadge value={item.booking_status} />
                                                </TableCell>

                                                <TableCell>
                                                    <StatusBadge value={item.payment_status} />
                                                </TableCell>

                                                <TableCell>
                                                    <DropdownMenu
                                                        open={openMenuId === item.id}
                                                        onOpenChange={(o) => setOpenMenuId(o ? item.id : null)}
                                                    >
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="p-2 hover:bg-secondary rounded-lg">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end" className="w-24">
                                                            <DropdownMenuItem
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={() => openDetail(item)}
                                                            >
                                                                <Info className="h-4 w-4" />
                                                                Detail
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
                                    onPageChange={(p) => handlePageChange(p)}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    totalItems={totalItems}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="md:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                        </DialogHeader>

                        {selected && (
                            <div className="max-h-[80vh] overflow-y-auto space-y-6">
                                <div className="border rounded-xl p-4">
                                    <h3 className="font-semibold mb-4">Contact</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Name</p>
                                            <p className="font-medium">
                                                {selected.contact_name || selected.user_name || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">
                                                {selected.contact_phone || selected.user_phone || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">
                                                {selected.contact_email || selected.user_email || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Booked By</p>
                                            <p className="font-medium">{selected.booked_by || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-4">
                                    <h3 className="font-semibold mb-4">Event & Booking</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Event</p>
                                            <p className="font-medium">{selected.event_title || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Seating Type</p>
                                            <p className="font-medium">{selected.seating_type || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Quantity</p>
                                            <p className="font-medium">{selected.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Amount</p>
                                            <p className="font-medium">₹{selected.total_amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Booking Status</p>
                                            <StatusBadge value={selected.booking_status} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Payment Status</p>
                                            <StatusBadge value={selected.payment_status} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Order ID</p>
                                            <p className="font-medium">{selected.order_id || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Payment ID</p>
                                            <p className="font-medium">{selected.payment_id || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                {selected.tickets?.length > 0 && (
                                    <div className="border rounded-xl p-4">
                                        <h3 className="font-semibold mb-4">
                                            Tickets ({selected.tickets.length})
                                        </h3>

                                        <div className="space-y-2">
                                            {selected.tickets.map((t: any) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between border rounded-lg px-3 py-2"
                                                >
                                                    <div>
                                                        <p className="font-medium">{t.ticket_number}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {t.serial_number}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${t.is_used
                                                                ? "bg-gray-100 text-gray-700"
                                                                : "bg-green-100 text-green-700"
                                                            }`}
                                                    >
                                                        {t.is_used ? "Used" : "Unused"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }
);