import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import crewStore from "@/store/crewStore";
import eventStore from "@/store/eventStore";  
import authStore from "@/store/authStore";
import { CrewMemberAssignmentTable } from "@/components/Tables/CrewMemberAssignmentTable";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

const CrewMembersAssignmentPage = () => {
  const { id: eventId } = useParams();
  const { profile } = authStore();

  const {
    items: crewItems,
    loading: crewLoading,
    fetchError,
    fetchRecords,
  } = crewStore();

  const {
    fetchOne,
    getEventMembers,
    getEventZones,
    assignMembers,
    deassignMembers,
  } = eventStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [event, setEvent] = useState<any>(null);

  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);

  // memberId -> zones currently assigned to that member
  const [assignedZoneMap, setAssignedZoneMap] = useState<
    Map<string, { id: string; name: string }[]>
  >(new Map());

  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);
  const [togglingId, setTogglingId] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!eventId || !profile?.id) return;

      setMembersLoading(true);
      setMembersError(false);

      const [eventRes, membersRes, zonesRes] = await Promise.all([
        fetchOne(eventId),
        getEventMembers(eventId),
        getEventZones(eventId),
        fetchRecords(profile.id),
      ]);

      if (eventRes.status) {
        setEvent(eventRes.record);
      } else {
        setMembersError(true);
      }

      if (zonesRes.status) {
        setZones(zonesRes.items);
      } else {
        setZones([]);
      }

      if (membersRes.status) {
        // getEventMembers now returns one entry per member with a
        // `zones` array (a member can cover several zones).
        const map = new Map(
          membersRes.items.map((m: any) => [m.id, m.zones || []]),
        );
        setAssignedZoneMap(map);
      } else {
        setMembersError(true);
      }

      setMembersLoading(false);
    };

    load();
  }, [eventId, profile?.id]);

  const approvedCrew = useMemo(() => {
    return crewItems
      .filter((c: any) => c.status === "approved")
      .filter((c: any) =>
        search
          ? `${c.name} ${c.last_name} ${c.email}`
              .toLowerCase()
              .includes(search.toLowerCase())
          : true,
      );
  }, [crewItems, search]);

  const handleToggle = async (memberId: string, nextChecked: boolean) => {
    if (!eventId) return;

    if (selectedZoneIds.length === 0) {
      return toast.error("Select at least one zone first");
    }

    setTogglingId(memberId);

    if (!event?.is_active) {
      setTogglingId("");
      return toast.error("Failed event is not active or removed");
    }

    const result = nextChecked
      ? await assignMembers(eventId, [memberId], selectedZoneIds)
      : await deassignMembers(eventId, [memberId], selectedZoneIds);

    if (!result.status) {
      toast.error(
        nextChecked ? "Failed to assign member" : "Failed to unassign member",
      );
    } else {
      setAssignedZoneMap((prev) => {
        const next = new Map(prev);
        const existing = next.get(memberId) || [];

        if (nextChecked) {
          const zonesToAdd = zones.filter(
            (z) =>
              selectedZoneIds.includes(z.id) &&
              !existing.some((e) => e.id === z.id),
          );
          next.set(memberId, [...existing, ...zonesToAdd]);
        } else {
          next.set(
            memberId,
            existing.filter((z) => !selectedZoneIds.includes(z.id)),
          );
        }

        return next;
      });

      toast.success(nextChecked ? "Member assigned" : "Member unassigned");
    }

    setTogglingId("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentActive="Crews"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

        <div className="max-h-screen overflow-y-auto">
          <CrewMemberAssignmentTable
            profile={profile}
            event={event}
            items={approvedCrew}
            zones={zones}
            selectedZoneIds={selectedZoneIds}
            onZoneIdsChange={setSelectedZoneIds}
            assignedZoneMap={assignedZoneMap}
            loading={membersLoading || crewLoading}
            error={membersError || fetchError}
            togglingId={togglingId}
            profileType={profile?.type}
            onSearchChange={setSearch}
            onToggle={handleToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default CrewMembersAssignmentPage;