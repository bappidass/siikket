import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Tag,
  Layers,
  FileBadge2,
  Calendar,
  Clock,
  Loader2,
  Pencil,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";
import { Link } from "react-router-dom";

import authStore from "../store/authStore";
import { PATH_URL } from "@/utils/api";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

const TYPE_STYLES: Record<string, string> = {
  organizers: "bg-blue-100 text-blue-700 border border-blue-200",
  organisers: "bg-blue-100 text-blue-700 border border-blue-200",
  vendors: "bg-purple-100 text-purple-700 border border-purple-200",
};

const TypeBadge = ({ type }: { type: string }) => {
  const key = (type || "").toLowerCase();
  const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
        TYPE_STYLES[key] ?? "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {label}
    </span>
  );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-3">
    <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value || "-"}</p>
    </div>
  </div>
);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Profile() {
  const { profile, fetchProfile } = authStore();
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const load = async () => {
      if (!profile) {
        setLoading(true);
        await fetchProfile();
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const avatarSrc = profile.image ? `${PATH_URL}/${profile.image}` : undefined;

  const bannerSrc = profile.bg_image
    ? `${PATH_URL}/${profile.bg_image}`
    : undefined;

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentActive={"Crews"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

        <div className="max-h-screen overflow-y-auto">
          <Card className="overflow-hidde w-full">
            <div className="px-6 pt-6">
              <Breadcrumb className="mb-5">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link to="/">Home</Link>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator />

                  <BreadcrumbItem>
                    <BreadcrumbPage>Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Banner */}
            {/* <div className="relative h-40 md:h-52 w-full bg-gradient-to-r from-primary/20 to-primary/5">
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}

        
        </div> */}

            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-14">
                <div className="relative shrink-0">
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl border-4 border-background overflow-hidden bg-muted shadow-sm">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-primary bg-primary/10">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold">
                      {profile.name}
                    </h1>
                    <TypeBadge type={profile.type} />
                  </div>

                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 mt-8">
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="divide-y">
                    <DetailRow
                      icon={Mail}
                      label="Email"
                      value={profile.email}
                    />
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={profile.phone}
                    />
                    <DetailRow
                      icon={MapPin}
                      label="Address"
                      value={profile.address}
                    />
                  </div>
                </div>

                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Business Information</h3>
                  <div className="divide-y">
                
                    <DetailRow
                      icon={FileBadge2}
                      label="GST Number"
                      value={profile.gst}
                    />
                  </div>
                </div>

                <div className="border rounded-xl p-4 md:col-span-2 mt-8">
                  <h3 className="font-semibold mb-2">Account Information</h3>
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0">
                    <DetailRow
                      icon={Calendar}
                      label="Created On"
                      value={formatDate(profile.created_at)}
                    />
                    <DetailRow
                      icon={Clock}
                      label="Last Updated"
                      value={formatDate(profile.updated_at)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
