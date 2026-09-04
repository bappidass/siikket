import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import eventStore from "@/store/eventStore";
import authStore from "@/store/authStore";
import { CrewMemberAssignmentTable } from "@/components/Tables/CrewMemberAssignmentTable";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

const CrewMembersAssignmentPage = () => {
  const { id: eventId } = useParams();
  const { profile } = authStore();

  const { getEventMembers } = eventStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!eventId || !profile?.id) return;

      setMembersLoading(true);
      setMembersError(false);

      const membersRes = await getEventMembers(eventId);

      if (membersRes?.status) {
        setMembers(membersRes.items || []);
      } else {
        setMembersError(true);
      }

      setMembersLoading(false);
    };

    load();
  }, [eventId, profile?.id]);

  // Simple client-side filter across the fields shown in the table plus
  // the partner name, so the search box in the table header actually does
  // something now that there's no separate assign/toggle flow to filter.
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;

    const q = search.trim().toLowerCase();

    return members.filter((m: any) => {
      const haystack = [
        m.name,
        m.last_name,
        m.middle_name,
        m.designation,
        m.category,
        m.event_partner_name,
        m.email,
        m.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [members, search]);

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
            event={event}
            items={filteredMembers}
            loading={membersLoading}
            error={membersError}
            profileType={profile?.type}
            onSearchChange={setSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default CrewMembersAssignmentPage;