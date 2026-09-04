import { useState, useRef } from "react";
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
  CreditCard,
  Download,
  Edit,
  Info,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Link, useParams } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BASE_URL, PATH_URL } from "@/utils/api";
import { ImageUpload } from "../ImageUpload";
import crewStore from "@/store/crewStore";
import authStore from "@/store/authStore";
import { DatePicker } from "../Forms/DatePicker";
import PDFUploadWithSignedUrl from "../PDFUploader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import bg from "@/assets/id_bg.jpeg";
import avatar from "@/assets/id_avatar.jpeg";
import { IdCard } from "../IDCard";
import { toPng } from "html-to-image";

type TableProps = {
  items: any[];
  onSearchChange: (value: string) => void;
  id: any;
  loading: Boolean;
  error: Boolean;
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_DOT: Record<string, string> = {
  approved: "bg-green-500",
  pending: "bg-yellow-500",
  rejected: "bg-red-500",
};

const StatusBadge = ({ status }: { status: string }) => {
  const key = status || "pending";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[key] ?? "bg-gray-400"}`}
      />
      {key}
    </span>
  );
};

export const CrewTable = React.memo(
  ({ items, loading, id, error, onSearchChange }: TableProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloadingCard, setDownloadingCard] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const { profile } = authStore();
    const canManageStatus =
      profile?.role === "admin" || profile?.role === "manager";
    const {
      deleteRecord: deleteRecordApi,
      saveRecord: createDataApi,
      updateRecord: updateDataApi,
      loadMore,
      page,
      totalItems,
      totalPages,
    } = crewStore();

    const [selectedPage, setSelectedPage] = useState(page);
    const [open, setOpen] = useState(false);
    const [cardDialogOpen, setCardDialogOpen] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState("");
    const [formData, setFormData] = useState({
      id: "",
      name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pin_code: "",
      gender: "male",
      dob: "",
      designation: "",
      category: "",
      zones: "",
      event_partner_id: id,
      image: "",
      identity_proof_doc: "",
      address_proof_doc: "",
      identity_proof: "",
      address_proof: "",
      status: "",
    });

    const downloadCard = async () => {
      if (!cardRef.current) return;

      try {
        setDownloadingCard(true);

        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 3,
        });

        const link = document.createElement("a");
        const fileNameSafe =
          `${formData.name || "crew"}-${formData.last_name || ""}`
            .trim()
            .replace(/\s+/g, "-")
            .toLowerCase();

        link.download = `${fileNameSafe || "id-card"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate ID card");
      } finally {
        setDownloadingCard(false);
      }
    };

    const pageSize = 5;
    const startIndex = (selectedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    const handleDelete = async (id: string) => {
      try {
        setDeleteLoadingId(id);

        const result = await deleteRecordApi(id);

        if (!result.status) {
          toast.error("Failed to delete record");
        } else {
          toast.success("Record deleted successfully!");
        }
      } finally {
        setDeleteLoadingId("");
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

    const openAddDialog = () => {
      setFormData({
        id: "",
        name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pin_code: "",
        gender: "male",
        dob: "",
        designation: "",
        category: "",
        zones: "",
        event_partner_id: id,
        image: "",
        identity_proof_doc: "",
        address_proof_doc: "",
        identity_proof: "",
        address_proof: "",
        status: "",
      });

      setOpen(true);
    };

    const openEditDialog = (item: any) => {
      setFormData({
        id: item.id,
        email: item.email || "",
        name: item.name || "",
        middle_name: item.middle_name || "",
        last_name: item.last_name || "",
        phone: item.phone || "",
        gender: item.gender || "",
        dob: item.dob || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        country: item.country || "",
        pin_code: item.pin_code || "",
        category: item.category || "",
        designation: item.designation || "",
        zones: item.zones || "",
        identity_proof: item.identity_proof || "",
        address_proof: item.address_proof || "",
        identity_proof_doc: item.identity_proof_doc || "",
        address_proof_doc: item.address_proof_doc || "",
        event_partner_id: item.event_partner_id || "",
        status: item.status || "",
        image: item.image || "",
      });

      setOpen(true);
    };


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        setSaveLoading(true);
        if (formData.id !== "") {
          const body = {
            email: formData.email,
            name: formData.name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            gender: formData.gender,
            dob: formData.dob,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pin_code: formData.pin_code,
            category: formData.category,
            designation: formData.designation,
            zones: formData.zones,
            identity_proof: formData.identity_proof,
            address_proof: formData.address_proof,
            identity_proof_doc: formData.identity_proof_doc,
            address_proof_doc: formData.address_proof_doc,
            event_partner_id: formData.event_partner_id,
            status: formData.status,
            image: formData.image,
          };

          const result = await updateDataApi({
            id: formData.id,
            ...body,
          });

          if (!result.status) {
            toast.error("Failed to update record");
          } else {
            toast.success("Record updated successfully!");

            setOpen(false);
          }

          return;
        }

        const body = {
          email: formData.email,
          name: formData.name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          gender: formData.gender,
          dob: formData.dob,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pin_code: formData.pin_code,
          category: formData.category,
          designation: formData.designation,
          zones: formData.zones,
          identity_proof: formData.identity_proof,
          address_proof: formData.address_proof,
          identity_proof_doc: formData.identity_proof_doc,
          address_proof_doc: formData.address_proof_doc,
          event_partner_id: formData.event_partner_id,
          image: formData.image,
        };

        const result = await createDataApi(body);

        if (!result.status) {
          toast.error("Failed to create record");
        } else {
          toast.success("Record added successfully!");
          setOpen(false);
          setFormData({
            id: "",
            name: "",
            middle_name: "",
            last_name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            country: "",
            pin_code: "",
            gender: "male",
            dob: "",
            designation: "",
            category: "",
            zones: "",
            event_partner_id: id,
            image: "",
            identity_proof_doc: "",
            address_proof_doc: "",
            identity_proof: "",
            address_proof: "",
            status: "",
          });
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

    const handlePageChange = async (page: number) => {
      const result = await loadMore(page, id);
      if (result.status) {
        setSelectedPage(page);
      }
    };

    const docs = {
      aadhaar: "Aadhaar",
      voter_card: "Voter Card",
      driving_license: "Driving License",
      passport: "Passport",
      visa: "Visa",
    };

    const InfoItem = ({
      label,
      value,
    }: {
      label: string;
      value: React.ReactNode;
    }) => (
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className="font-medium">{value || "-"}</p>
      </div>
    );

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
                  <BreadcrumbPage>Crew Members</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <CardTitle></CardTitle>

            {id != "null" && (
              <Button className="my-3" size="sm" onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            )}
          </div>

          <div className="flex items-center w-[60%] md:w-[30%] relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />

            <Input
              type="search"
              placeholder="Search..."
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

                    <TableHead>Email</TableHead>

                    <TableHead>Phone</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell>{item.email}</TableCell>

                        <TableCell>{item.phone}</TableCell>

                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>

                        <TableCell className="flex gap-2">
                          <DropdownMenu
                            open={openMenuId === item.id}
                            onOpenChange={(open) =>
                              setOpenMenuId(open ? item.id : null)
                            }
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
                                  openEditDialog(item);
                                }}
                              >
                                <Info className="h-4 w-4" />
                                Detail
                              </DropdownMenuItem>

                              {/* {item.status === "approved" && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => {
                                    openCardDialog(item);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4" />
                                  ID Card
                                </DropdownMenuItem>
                              )} */}

                              {id != "null" && (
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
                              )}
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

        {id != "null" ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="md:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {formData.id !== "" ? "Edit Record" : "Add Record"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 gap-4 max-h-[80vh] overflow-y-auto px-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-2 block">First Name</Label>

                    <Input
                      name="name"
                      placeholder="First Name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Middle Name</Label>

                    <Input
                      name="middle_name"
                      placeholder="Middle Name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Last Name</Label>

                    <Input
                      name="last_name"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Email</Label>

                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Phone</Label>

                    <Input
                      name="phone"
                      type="text"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Gender</Label>

                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleFormChange("gender", value)
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>

                        <SelectItem value="female">Female</SelectItem>

                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DatePicker
                    initialDate={
                      formData.dob != "" ? new Date(formData.dob) : null
                    }
                    onDateChange={(value) => {
                      handleFormChange("dob", value.toISOString());
                    }}
                    title="Date Of Birth"
                  />

                  <div>
                    <Label className="mb-2 block">Designation</Label>

                    <Input
                      name="designation"
                      type="text"
                      placeholder="Designation"
                      value={formData.designation}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Address</Label>

                    <Input
                      name="address"
                      type="text"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">City</Label>

                    <Input
                      name="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">State</Label>

                    <Input
                      name="state"
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Country</Label>

                    <Input
                      name="country"
                      type="text"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Pin Code</Label>

                    <Input
                      name="pin_code"
                      type="text"
                      placeholder="Pin Code"
                      value={formData.pin_code}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Category</Label>

                    <Input
                      name="category"
                      type="text"
                      placeholder="Category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={saveLoading}
                    />
                  </div>

                  {profile?.type === "vendors" && (
                    <div>
                      <Label className="mb-2 block">Zones</Label>

                      <Input
                        name="zones"
                        type="text"
                        placeholder="Zones"
                        value={formData.zones}
                        onChange={handleChange}
                        disabled={saveLoading}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block">Identity Proof Type</Label>

                    <Select
                      value={formData.identity_proof}
                      onValueChange={(value) =>
                        handleFormChange("identity_proof", value)
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="aadhaar">Aadhaar</SelectItem>

                        <SelectItem value="voter_card">Voter Card</SelectItem>

                        <SelectItem value="driving_license">
                          Driving License
                        </SelectItem>

                        <SelectItem value="passport">Passport</SelectItem>

                        <SelectItem value="visa">Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Address Proof Type</Label>

                    <Select
                      value={formData.address_proof}
                      onValueChange={(value) =>
                        handleFormChange("address_proof", value)
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="aadhaar">Aadhaar</SelectItem>

                        <SelectItem value="voter_card">Voter Card</SelectItem>

                        <SelectItem value="driving_license">
                          Driving License
                        </SelectItem>

                        <SelectItem value="passport">Passport</SelectItem>

                        <SelectItem value="visa">Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.identity_proof != "" &&
                    formData.address_proof != "" && (
                      <div className="col-span-2 grid md:grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>{docs[formData.identity_proof]}</Label>
                          <PDFUploadWithSignedUrl
                            apiEndpoint={`${BASE_URL}/api/files/upload`}
                            initialUrl={
                              formData.identity_proof_doc != ""
                                ? `${PATH_URL}/${formData.identity_proof_doc}`
                                : ""
                            }
                            collection={"organisations"}
                            onUploaded={(url, fileName) =>
                              handleFormChange("identity_proof_doc", fileName)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{docs[formData.address_proof]}</Label>
                          <PDFUploadWithSignedUrl
                            apiEndpoint={`${BASE_URL}/api/files/upload`}
                            initialUrl={
                              formData.address_proof_doc != ""
                                ? `${PATH_URL}/${formData.address_proof_doc}`
                                : ""
                            }
                            collection={"organisations"}
                            onUploaded={(url, fileName) =>
                              handleFormChange("address_proof_doc", fileName)
                            }
                          />
                        </div>
                      </div>
                    )}

                  <div className="col-span-2 grid md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Avatar Image</Label>
                      <ImageUpload
                        folder={"organisations"}
                        initialImage={
                          formData.image != ""
                            ? `${PATH_URL}/${formData.image}`
                            : ""
                        }
                        onUploadComplete={(url) =>
                          handleFormChange("image", url)
                        }
                        onRemoved={() => handleFormChange("image", "")}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saveLoading}>
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
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="md:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crew Details</DialogTitle>
              </DialogHeader>

              <div className="max-h-[80vh] overflow-y-auto space-y-6">
                <div className="flex items-center gap-4 border rounded-xl p-4">
                  {formData.image ? (
                    <div className="h-20 w-20 rounded-2xl overflow-hidden border bg-muted shrink-0">
                      <img
                        src={`${PATH_URL}/${formData.image}`}
                        alt={formData.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold shrink-0">
                      {`${formData.name?.[0] || ""}${formData.last_name?.[0] || ""}`}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {formData.name} {formData.middle_name}{" "}
                        {formData.last_name}
                      </h3>
                      <StatusBadge status={formData.status} />
                    </div>

                    <p className="text-muted-foreground">
                      {formData.designation}
                    </p>

                    <p className="text-sm">{formData.email}</p>
                    <p className="text-sm">{formData.phone}</p>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-4">Personal Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoItem label="Gender" value={formData.gender} />
                    <InfoItem
                      label="Date Of Birth"
                      value={
                        formData.dob
                          ? new Date(formData.dob).toLocaleDateString()
                          : "-"
                      }
                    />
                    <InfoItem label="Category" value={formData.category} />
                  </div>
                </div>

                {/* Address */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-4">Address</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoItem label="Address" value={formData.address} />
                    <InfoItem label="City" value={formData.city} />
                    <InfoItem label="State" value={formData.state} />
                    <InfoItem label="Country" value={formData.country} />
                    <InfoItem label="Pin Code" value={formData.pin_code} />
                  </div>
                </div>

                {/* Documents */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-4">Documents</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Identity Proof
                      </p>

                      <p className="font-medium">
                        {docs[formData.identity_proof]}
                      </p>

                      {formData.identity_proof_doc && (
                        <a
                          href={`${PATH_URL}/${formData.identity_proof_doc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-sm underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Address Proof
                      </p>

                      <p className="font-medium">
                        {docs[formData.address_proof]}
                      </p>

                      {formData.address_proof_doc && (
                        <a
                          href={`${PATH_URL}/${formData.address_proof_doc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-sm underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-4">Verification Status</h3>

                  {canManageStatus ? (
                    <form onSubmit={handleSubmit}>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleFormChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>

                          <SelectItem value="approved">Approved</SelectItem>

                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={saveLoading}>
                          {saveLoading && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Update Status
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <StatusBadge status={formData.status} />
                      {formData.status === "rejected" && (
                        <p className="text-sm text-muted-foreground">
                          This crew member was rejected. Contact your organizer
                          for details.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ID Card - only for approved crew members */}
                {formData.status === "approved" && (
                  <div className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Crew ID Card</h3>

                      <Button
                        size="sm"
                        onClick={downloadCard}
                        disabled={downloadingCard}
                      >
                        {downloadingCard ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {downloadingCard ? "Generating..." : "Download ID Card"}
                      </Button>
                    </div>

                    <div className="flex justify-center bg-muted/30 rounded-lg p-4 overflow-x-auto">
                      <div ref={cardRef}>
                        <IdCard
                          backgroundUrl={bg}
                          avatarUrl={
                            formData.image
                              ? `${PATH_URL}/${formData.image}`
                              : avatar
                          }
                          type={profile.type}
                          name={`${formData.name} ${formData.last_name}`.trim()}
                          organization="Skylark Sports"
                          role={formData.designation || "Crew"}
                          zones={
                            profile?.type === "vendors"
                              ? formData.zones || "-"
                              : "-"
                          }
                          location={formData.city || "-"}
                          category={formData.category || "-"}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Crew ID Card</DialogTitle>
            </DialogHeader>

            <div className="flex justify-center bg-muted/30 rounded-lg p-4 overflow-x-auto">
              <div ref={cardRef}>
                <IdCard
                  backgroundUrl={bg}
                  avatarUrl={
                    formData.image ? `${PATH_URL}/${formData.image}` : avatar
                  }
                  type={profile?.type}
                  name={`${formData.name} ${formData.last_name}`.trim()}
                  organization="Skylark Sports"
                  role={formData.designation || "Crew"}
                  zones={
                    profile?.type === "vendors"
                      ? formData.zones || "-"
                      : "-"
                  }
                  location={formData.city || "-"}
                  category={formData.category || "-"}
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