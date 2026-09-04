import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Users, Ticket, IndianRupee } from "lucide-react";
import eventStore from "@/store/eventStore";
import bookingStore from "@/store/bookingStore";

type UserType = "general" | "guest" | "sponsored";
type PaymentMethod = "cash" | "card" | "upi";

const USER_TYPE_OPTIONS: { value: UserType; label: string; requiresPayment: boolean }[] = [
    { value: "general", label: "General (Paid)", requiresPayment: true },
    { value: "guest", label: "Guest (Complimentary)", requiresPayment: false },
    { value: "sponsored", label: "Sponsored (Complimentary)", requiresPayment: false },
];

const CashierBookingPanel = () => {
    const { toast } = useToast();

    const events = eventStore((state) => state.items);
    const fetchEvents = eventStore((state) => state.fetchRecords);
    const createOfflineBooking = bookingStore((state: any) => state.createOfflineBooking);

    const [submitting, setSubmitting] = useState(false);

    const [eventId, setEventId] = useState<string>("");
    const [seatingTypeId, setSeatingTypeId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [userType, setUserType] = useState<UserType>("general");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

    const [contactName, setContactName] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactEmail, setContactEmail] = useState("");

    const [lastResult, setLastResult] = useState<any>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const selectedEvent = useMemo(
        () => events.find((e: any) => e.id === eventId),
        [events, eventId]
    );

    const seatingTypes = selectedEvent?.seating_types || [];

    const selectedSeatingType = useMemo(
        () => seatingTypes.find((s: any) => s.id === seatingTypeId),
        [seatingTypes, seatingTypeId]
    );

    const availableSeats = selectedSeatingType?.available_seats ?? 0;
    const pricePerSeat = selectedSeatingType ? Number(selectedSeatingType.price) : 0;
    const totalAmount = pricePerSeat * quantity;

    const requiresPayment = USER_TYPE_OPTIONS.find((u) => u.value === userType)?.requiresPayment;

    const resetForm = () => {
        setEventId("");
        setSeatingTypeId("");
        setQuantity(1);
        setUserType("general");
        setPaymentMethod("");
        setContactName("");
        setContactPhone("");
        setContactEmail("");
    };

    const handleEventChange = (value: string) => {
        setEventId(value);
        setSeatingTypeId("");
        setQuantity(1);
    };

    const handleSeatingTypeChange = (value: string) => {
        setSeatingTypeId(value);
        setQuantity(1);
    };

    const handleQuantityChange = (value: string) => {
        const num = Number(value);
        if (Number.isNaN(num)) return;
        const clamped = Math.max(1, Math.min(num, availableSeats || 1));
        setQuantity(clamped);
    };

    const isFormValid =
        eventId &&
        seatingTypeId &&
        quantity > 0 &&
        quantity <= availableSeats &&
        contactName.trim() &&
        contactPhone.trim() &&
        (!requiresPayment || paymentMethod);

    const handleSubmit = async () => {
        if (!isFormValid) {
            toast({
                title: "Missing details",
                description: "Please fill in all required fields before submitting.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        const result = await createOfflineBooking({
            event_id: eventId,
            seating_type_id: seatingTypeId,
            quantity,
            user_type: userType,
            payment_method: requiresPayment ? paymentMethod : undefined,
            contact_name: contactName.trim(),
            contact_phone: contactPhone.trim(),
            contact_email: contactEmail.trim() || undefined,
        });

        setSubmitting(false);

        if (!result.status) {
            toast({
                title: "Booking failed",
                description: result.message,
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Booking confirmed",
            description: `${quantity} ticket(s) booked for ${contactName}.`,
            variant: "success",
        });

        setLastResult(result.data);
        resetForm();
        await fetchEvents(); 
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Offline Booking
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Event */}
                <div className="space-y-2">
                    <Label>Event</Label>
                    <Select value={eventId} onValueChange={handleEventChange}>
                        <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map((ev: any) => (
                                <SelectItem key={ev.id} value={ev.id}>
                                    {ev.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Seating type */}
                {eventId && (
                    <div className="space-y-2">
                        <Label>Seating Type</Label>
                        <Select value={seatingTypeId} onValueChange={handleSeatingTypeChange}>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Select seating type" />
                            </SelectTrigger>
                            <SelectContent>
                                {seatingTypes.map((s: any) => (
                                    <SelectItem
                                        key={s.id}
                                        value={s.id}
                                        disabled={s.available_seats <= 0}
                                    >
                                        {s.name} — ₹{s.price} ({s.available_seats} left)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Price + quantity */}
                {selectedSeatingType && (
                    <div className="grid grid-cols-2 gap-4 border rounded-xl p-4 bg-gray-50">
                        <div>
                            <p className="text-sm text-muted-foreground">Price per seat</p>
                            <p className="font-semibold flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                {pricePerSeat}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Available seats</p>
                            <p className="font-semibold">{availableSeats}</p>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min={1}
                                max={availableSeats}
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                className="h-11 rounded-xl w-32"
                            />
                        </div>
                    </div>
                )}

                {/* Contact details */}
                {selectedSeatingType && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Users className="h-4 w-4" />
                            Attendee Details
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="Full name"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="Phone number"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Email (optional)</Label>
                                <Input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* User type + payment */}
                {selectedSeatingType && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Attendee Type</Label>
                            <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {requiresPayment ? (
                            <div className="border rounded-xl p-4 space-y-3 bg-yellow-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Amount to collect</span>
                                    <span className="font-semibold text-lg flex items-center gap-1">
                                        <IndianRupee className="h-4 w-4" />
                                        {totalAmount}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select
                                        value={paymentMethod}
                                        onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-xl p-4 bg-green-50 text-sm text-green-700">
                                No payment required — {quantity} complimentary ticket(s) will be issued.
                            </div>
                        )}
                    </div>
                )}

                {selectedSeatingType && (
                    <Button
                        className="w-full h-11 rounded-xl"
                        onClick={handleSubmit}
                        disabled={!isFormValid || submitting}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating booking...
                            </span>
                        ) : (
                            "Confirm Booking"
                        )}
                    </Button>
                )}

                {lastResult && (
                    <div className="border rounded-xl p-4 space-y-2">
                        <p className="font-medium">Last booking</p>
                        <p className="text-sm text-muted-foreground">
                            {lastResult.tickets?.length} ticket(s) issued for booking{" "}
                            {lastResult.booking?.id}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CashierBookingPanel;