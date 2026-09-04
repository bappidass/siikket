import { useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Loader2, Search, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "../ui/breadcrumb";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PATH_URL } from "@/utils/api";
import { IdCard } from "../IDCard";
import bg from "@/assets/id_bg.jpeg";
import avatar from "@/assets/id_avatar.jpeg";
import { toPng } from "html-to-image";

// NOTE: This table now simply renders the members already fetched for the
// event (via getEventMembers). There's no separate "all crew" list to
// compare against, so the assign/toggle column and assignedIds/togglingId
// props have been removed. Every row shown here is, by definition, an
// assigned member of the event, and we surface which partner/organisation
// they belong to via `event_partner_name`.
type CrewMemberAssignmentTableProps = {
    event: any;
    items: any[];
    loading: Boolean;
    error: Boolean;
    profileType?: string;
    onSearchChange: (value: string) => void;
};

export const CrewMemberAssignmentTable = React.memo(
    ({
        event,
        items,
        loading,
        error,
        profileType,
        onSearchChange
    }: CrewMemberAssignmentTableProps) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const [cardOpen, setCardOpen] = useState(false);
        const [cardMember, setCardMember] = useState<any>(null);
        const [downloadingCard, setDownloadingCard] = useState(false);

        const openCard = (member: any) => {
            setCardMember(member);
            setCardOpen(true);
        };

        const downloadCard = async () => {
            if (!cardRef.current) return;

            try {
                setDownloadingCard(true);

                const dataUrl = await toPng(cardRef.current, {
                    cacheBust: true,
                    pixelRatio: 3,
                });

                const link = document.createElement("a");
                const fileNameSafe = `${cardMember?.name || "crew"}-${
                    event?.title || "event"
                }`
                    .trim()
                    .replace(/\s+/g, "-")
                    .toLowerCase();

                link.download = `${fileNameSafe}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                toast.error("Failed to generate ID card");
            } finally {
                setDownloadingCard(false);
            }
        };

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
                                        Crew Assignment
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center w-[60%] md:w-[30%] relative">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />

                        <Input
                            type="search"
                            placeholder="Search crew..."
                            className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <div className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Partner</TableHead>
                                        <TableHead>ID Card</TableHead>
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
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-10 text-destructive"
                                            >
                                                Failed to load crew members
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-10"
                                            >
                                                No crew members assigned to this event
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((member) => (
                                            <TableRow
                                                key={member.assignment_id || member.id}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {member.image ? (
                                                            <img
                                                                src={`${PATH_URL}/${member.image}`}
                                                                alt={member.name}
                                                                className="h-8 w-8 rounded-full object-cover border shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                                {`${
                                                                    member.name?.[0] ||
                                                                    ""
                                                                }${
                                                                    member.last_name?.[0] ||
                                                                    ""
                                                                }`}
                                                            </div>
                                                        )}

                                                        <span>
                                                            {member.name}{" "}
                                                            {member.last_name}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    {member.designation || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    {member.category || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    {member.event_partner_name || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => openCard(member)}
                                                    >
                                                        <CreditCard className="w-3 h-3 mr-1" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>

                <Dialog open={cardOpen} onOpenChange={setCardOpen}>
                    <DialogContent className="md:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Crew ID Card</DialogTitle>
                        </DialogHeader>

                        <div className="flex justify-center bg-muted/30 rounded-lg p-4 overflow-x-auto">
                            <div ref={cardRef}>
                                <IdCard
                                    backgroundUrl={bg}
                                    avatarUrl={
                                        cardMember?.image
                                            ? `${PATH_URL}/${cardMember.image}`
                                            : avatar
                                    }
                                    // type={profileType}
                                    name={`${cardMember?.name || ""} ${
                                        cardMember?.last_name || ""
                                    }`.trim()}
                                    organization={
                                        cardMember?.event_partner_name ||
                                        event?.title ||
                                        "Skylark Sports"
                                    }
                                    role={cardMember?.designation || "Crew"}
                                    zones={
                                        profileType === "vendors"
                                            ? cardMember?.zones || "-"
                                            : "-"
                                    }
                                    location={
                                        event?.city || cardMember?.city || "-"
                                    }
                                    category={cardMember?.category || "-"}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={downloadCard}
                                disabled={downloadingCard}
                            >
                                {downloadingCard ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {downloadingCard
                                    ? "Generating..."
                                    : "Download ID Card"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }
);