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
import { Switch } from "@/components/ui/switch";
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
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { PATH_URL } from "@/utils/api";
import { IdCard } from "../IDCard";
import bg from "@/assets/id_bg.jpeg";
import avatar from "@/assets/id_avatar.jpeg";
import { toPng } from "html-to-image";

type Zone = { id: string; name: string };

type CrewMemberAssignmentTableProps = {
  event: any;
  items: any[];
  zones: Zone[];
  selectedZoneIds: string[];
  onZoneIdsChange: (zoneIds: string[]) => void;
  // memberId -> zones currently assigned to that member
  assignedZoneMap: Map<string, Zone[]>;
  loading: Boolean;
  error: Boolean;
  togglingId: string;
  profileType?: string;
  onSearchChange: (value: string) => void;
  onToggle: (memberId: string, nextChecked: boolean) => void;
  profile: any;
};

export const CrewMemberAssignmentTable = React.memo(
  ({
    event,
    items,
    zones,
    selectedZoneIds,
    onZoneIdsChange,
    assignedZoneMap,
    loading,
    error,
    togglingId,
    profileType,
    onSearchChange,
    onToggle,
    profile,
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
    const bannerSrc = profile?.bg_image
      ? `${PATH_URL}/${profile?.bg_image}`
      : undefined;

    return (
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Breadcrumb className="mb-5">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">Home</Link>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  <BreadcrumbPage>Crew Assignment</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <CardTitle>{event ? event.title : "Loading event..."}</CardTitle>

            {event?.event_date && (
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(event.event_date)
                  .toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                Assigning to
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-[220px] justify-between"
                    disabled={zones.length === 0}
                  >
                    <span className="truncate">
                      {selectedZoneIds.length === 0
                        ? "Select zone(s)"
                        : zones
                            .filter((z) => selectedZoneIds.includes(z.id))
                            .map((z) => z.name)
                            .join(", ")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No zones on this event.</CommandEmpty>
                      <CommandGroup>
                        {zones.map((zone) => {
                          const checked = selectedZoneIds.includes(zone.id);
                          return (
                            <CommandItem
                              key={zone.id}
                              onSelect={() => {
                                onZoneIdsChange(
                                  checked
                                    ? selectedZoneIds.filter(
                                        (id) => id !== zone.id,
                                      )
                                    : [...selectedZoneIds, zone.id],
                                );
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  checked ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {zone.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center w-full sm:w-[240px] relative">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />

              <Input
                type="search"
                placeholder="Search crew..."
                className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {zones.length === 0 && !loading && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This event has no zones configured yet. Add zones on the event
              before assigning checkers, so each checker can be scoped to
              the area they're allowed to scan.
            </div>
          )}

          <div className="rounded-md border">
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Assign</TableHead>
                    <TableHead>ID Card</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-destructive"
                      >
                        Failed to load crew members
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No approved crew members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((member) => {
                      const memberZones = assignedZoneMap.get(member.id) || [];
                      // "Assigned" here means: assigned to every zone
                      // currently selected in the picker above. Partial
                      // overlap still shows their existing zones in the
                      // Zone column, but the switch reflects the
                      // selection being toggled right now.
                      const isAssigned =
                        selectedZoneIds.length > 0 &&
                        selectedZoneIds.every((zid) =>
                          memberZones.some((z) => z.id === zid),
                        );

                      return (
                        <TableRow key={member.id}>
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
                                  {`${member.name?.[0] || ""}${
                                    member.last_name?.[0] || ""
                                  }`}
                                </div>
                              )}

                              <span>
                                {member.name} {member.last_name}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>{member.designation || "-"}</TableCell>

                          <TableCell>{member.category || "-"}</TableCell>

                          <TableCell>
                            {memberZones.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {memberZones.map((z) => (
                                  <Badge
                                    key={z.id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {z.name || "Zone"}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            {togglingId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Switch
                                checked={isAssigned}
                                disabled={selectedZoneIds.length === 0}
                                onCheckedChange={(checked) =>
                                  onToggle(member.id, checked)
                                }
                              />
                            )}
                          </TableCell>

                          <TableCell>
                            {isAssigned ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() => openCard(member)}
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                  backgroundUrl={bannerSrc}
                  avatarUrl={
                    cardMember?.image
                      ? `${PATH_URL}/${cardMember.image}`
                      : avatar
                  }
                  type={profileType}
                  name={`${cardMember?.name || ""} ${
                    cardMember?.last_name || ""
                  }`.trim()}
                  organization={event?.title || "Skylark Sports"}
                  role={cardMember?.designation || "Crew"}
                  zones={
                    cardMember
                      ? (assignedZoneMap.get(cardMember.id) || [])
                          .map((z) => z.name)
                          .join(", ") || "-"
                      : "-"
                  }
                  location={event?.city || cardMember?.city || "-"}
                  category={cardMember?.category || "-"}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={downloadCard} disabled={downloadingCard}>
                {downloadingCard ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {downloadingCard ? "Generating..." : "Download ID Card"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  },
);