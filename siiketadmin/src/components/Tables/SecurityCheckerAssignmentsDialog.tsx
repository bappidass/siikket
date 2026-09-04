import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  CalendarDays,
  ChevronRight,
  Loader2,
  RadioTower,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import securityCheckerStore from "@/store/securityCheckerStore";
import eventStore from "@/store/eventStore";

type Props = {
  checker: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// Every zone gets a stable tag color derived from its name, so "North Gate"
// looks the same everywhere it shows up rather than getting a random color
// per render.
const ZONE_PALETTE = [
  { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500" },
  { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", dot: "bg-sky-500" },
  { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", dot: "bg-violet-500" },
  { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200", dot: "bg-cyan-500" },
];

const zoneStyle = (zoneName: string) => {
  let hash = 0;
  for (let i = 0; i < zoneName.length; i++) {
    hash = (hash * 31 + zoneName.charCodeAt(i)) >>> 0;
  }
  return ZONE_PALETTE[hash % ZONE_PALETTE.length];
};

const formatEventDate = (date?: string) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const SecurityCheckerAssignmentsDialog = ({
  checker,
  open,
  onOpenChange,
}: Props) => {
  const { getCheckerAssignments, assignToZone, removeAssignment } =
    securityCheckerStore();
  const { searchEvents, getEventZones } = eventStore();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState("");

  // Add-assignment flow
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventQuery, setEventQuery] = useState("");
  const [eventResults, setEventResults] = useState<any[]>([]);
  const [searchingEvents, setSearchingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const resetAddForm = () => {
    setEventQuery("");
    setEventResults([]);
    setSelectedEvent(null);
    setZones([]);
    setSelectedZoneId("");
    setShowAddForm(false);
  };

  const loadAssignments = async () => {
    if (!checker) return;
    setLoading(true);
    const result = await getCheckerAssignments(checker.id);
    setAssignments(result.items);
    setLoading(false);
  };

  useEffect(() => {
    if (open && checker) {
      loadAssignments();
      resetAddForm();
    }
  }, [open, checker?.id]);

  // Group flat assignment rows under their event, so a checker covering
  // several zones for the same event reads as one entry, not several.
  const groupedByEvent = useMemo(() => {
    const map = new Map<string, any>();

    for (const a of assignments) {
      if (!map.has(a.event_id)) {
        map.set(a.event_id, {
          event_id: a.event_id,
          event_title: a.event_title,
          event_date: a.event_date,
          city: a.city,
          zones: [] as any[],
        });
      }
      map.get(a.event_id).zones.push({
        assignment_id: a.id,
        zone_id: a.zone_id,
        zone_name: a.zone_name,
      });
    }

    return [...map.values()];
  }, [assignments]);

  const debouncedEventSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q) {
          setEventResults([]);
          return;
        }
        setSearchingEvents(true);
        const result = await searchEvents(q);
        setEventResults(result.items);
        setSearchingEvents(false);
      }, 400),
    [searchEvents]
  );

  const handleEventQueryChange = (value: string) => {
    setEventQuery(value);
    debouncedEventSearch(value);
  };

  const handleEventSelect = async (ev: any) => {
    setSelectedEvent(ev);
    setEventResults([]);
    setSelectedZoneId("");
    setLoadingZones(true);
    const result = await getEventZones(ev.id);
    setZones(result.items);
    setLoadingZones(false);
  };

  const handleAssign = async () => {
    if (!checker || !selectedEvent || !selectedZoneId) return;

    setAssigning(true);
    const result = await assignToZone(
      checker.id,
      selectedEvent.id,
      selectedZoneId
    );
    setAssigning(false);

    if (!result.status) {
      toast.error("Couldn't assign this zone. Try again.");
      return;
    }

    toast.success("Zone assigned");
    resetAddForm();
    loadAssignments();
  };

  const handleRemove = async (assignmentId: string) => {
    setRemovingId(assignmentId);
    const result = await removeAssignment(assignmentId);
    setRemovingId("");

    if (!result.status) {
      toast.error("Couldn't remove this assignment. Try again.");
      return;
    }

    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-b from-gray-50 to-white">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>
              <span className="block leading-tight">Coverage</span>
              <span className="block text-xs font-normal text-gray-500">
                {checker?.name}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto">
          {/* Coverage timeline */}
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : groupedByEvent.length === 0 ? (
              <div className="rounded-xl border border-dashed py-8 px-4 text-center">
                <RadioTower className="h-5 w-5 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No events assigned yet.
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assign a zone below to put {checker?.name ?? "this checker"} on
                  the schedule.
                </p>
              </div>
            ) : (
              <ul className="relative">
                {groupedByEvent.map((group, i) => (
                  <li key={group.event_id} className="relative pl-7 pb-6 last:pb-0">
                    {/* Timeline rail */}
                    {i !== groupedByEvent.length - 1 && (
                      <span className="absolute left-[9px] top-5 bottom-0 w-px bg-gray-200" />
                    )}
                    <span className="absolute left-0 top-1 h-[19px] w-[19px] rounded-full border-2 border-white bg-slate-900 ring-2 ring-slate-100" />

                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {group.event_title}
                        </p>
                      </div>

                      {(group.event_date || group.city) && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <CalendarDays className="h-3 w-3" />
                          {formatEventDate(group.event_date)}
                          {group.city ? ` · ${group.city}` : ""}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {group.zones.map((z: any) => {
                          const style = zoneStyle(z.zone_name);
                          return (
                            <span
                              key={z.assignment_id}
                              className={`group inline-flex items-center gap-1.5 rounded-full ${style.bg} ${style.text} ring-1 ${style.ring} pl-2.5 pr-1.5 py-1 text-xs font-medium`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                              {z.zone_name}
                              <button
                                type="button"
                                title="Remove assignment"
                                disabled={removingId === z.assignment_id}
                                onClick={() => handleRemove(z.assignment_id)}
                                className="ml-0.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-opacity"
                              >
                                {removingId === z.assignment_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add coverage */}
          <div className="border-t bg-gray-50/60 px-6 py-5">
            {!showAddForm ? (
              <Button
                variant="outline"
                className="w-full justify-center border-dashed"
                onClick={() => setShowAddForm(true)}
              >
                Assign a new zone
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    New assignment
                  </Label>
                  <button
                    type="button"
                    onClick={resetAddForm}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>

                {!selectedEvent ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="search"
                        autoFocus
                        placeholder="Search events by title..."
                        className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        value={eventQuery}
                        onChange={(e) =>
                          handleEventQueryChange(e.target.value)
                        }
                      />
                    </div>

                    {searchingEvents && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Searching...
                      </div>
                    )}

                    {eventResults.length > 0 && (
                      <div className="rounded-lg border bg-white divide-y overflow-hidden">
                        {eventResults.map((ev) => (
                          <button
                            key={ev.id}
                            type="button"
                            className="w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 text-sm hover:bg-gray-50"
                            onClick={() => handleEventSelect(ev)}
                          >
                            <span>
                              <span className="block font-medium text-gray-900">
                                {ev.title}
                              </span>
                              {ev.event_date && (
                                <span className="block text-xs text-gray-500">
                                  {formatEventDate(ev.event_date)}
                                </span>
                              )}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedEvent.title}
                        </p>
                        {selectedEvent.event_date && (
                          <p className="text-xs text-gray-500">
                            {formatEventDate(selectedEvent.event_date)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEvent(null);
                          setZones([]);
                          setSelectedZoneId("");
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">
                        Which zone?
                      </Label>

                      {loadingZones ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading zones...
                        </div>
                      ) : zones.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          This event has no zones set up yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {zones.map((zone) => {
                            const style = zoneStyle(zone.name);
                            const active = selectedZoneId === zone.id;
                            return (
                              <button
                                key={zone.id}
                                type="button"
                                onClick={() => setSelectedZoneId(zone.id)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                                  active
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : `border-transparent ${style.bg} ${style.text} ring-1 ${style.ring}`
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    active ? "bg-white" : style.dot
                                  }`}
                                />
                                {zone.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      disabled={!selectedZoneId || assigning}
                      onClick={handleAssign}
                    >
                      {assigning && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Assign zone
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};