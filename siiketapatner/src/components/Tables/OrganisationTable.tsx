import { useCallback, useMemo, useState } from "react";
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

import organisationStore from "@/store/organisationStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { PATH_URL } from "@/utils/api";
import { ImageUpload } from "../ImageUpload";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

type TableProps = {
  items: any[];
  onSearchChange: (value: string) => void;
  loading: Boolean;
  error: Boolean;
};

export const OrganisationTable = React.memo(
  ({ items, loading, error, onSearchChange }: TableProps) => {
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const {
      deleteRecord: deleteRecordApi,
      saveRecord: createDataApi,
      updateRecord: updateDataApi,
      loadMore,
      page, totalItems, totalPages,
    } = organisationStore();

    const [selectedPage, setSelectedPage] = useState(page);

    const [open, setOpen] = useState(false);

    const [saveLoading, setSaveLoading] = useState(false);

    const [deleteLoadingId, setDeleteLoadingId] =
      useState("");

    const [formData, setFormData] = useState({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      sub_category: "",
      gst: "",
      type: "",
      image: "",
      bg_image: "",
      password: "",
    });

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

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

    const openAddDialog = () => {
      setFormData({
        id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        sub_category: "",
        gst: "",
        type: "",
        image: "",
        bg_image: "",
        password: "",
      });

      setOpen(true);
    };

    const openEditDialog = (item: any) => {
      setFormData({
        id: item.id,
        email: item.email || "",
        name: item.name || "",
        phone: item.phone || "",
        address: item.address || "",
        category: item.category || "",
        sub_category: item.sub_category || "",
        gst: item.gst || "",
        type: item.type || "",
        image: item.image || "",
        bg_image: item.bg_image || "",
        password: "",
      });

      setOpen(true);
    };

    const handleSubmit = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        setSaveLoading(true);
        if (formData.id !== "") {
          const body = {
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            category: formData.category,
            sub_category: formData.sub_category,
            gst: formData.gst,
            type: formData.type,
            image: formData.image,
            bg_image: formData.bg_image,
            password: formData.password,
          };

          const result = await updateDataApi(
            {
              id: formData.id,
              ...body
            }
          );

          if (!result.status) {
            toast.error("Failed to update record");
          } else {
            toast.success(
              "Record updated successfully!"
            );

            setOpen(false);
          }

          return;
        }

        const body = {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          category: formData.category,
          sub_category: formData.sub_category,
          gst: formData.gst,
          type: formData.type,
          image: formData.image,
          bg_image: formData.bg_image,
          password: formData.password,
        };

        const result = await createDataApi(body);

        if (!result.status) {
          toast.error("Failed to create record");
        } else {
          toast.success(
            "Record added successfully!"
          );
          setOpen(false);
          setFormData({
            id: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            category: "",
            sub_category: "",
            gst: "",
            type: "",
            image: "",
            bg_image: "",
            password: "",
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
      const result = await loadMore(page);
      if (result.status) {
        setSelectedPage(page);
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
                    Organizations
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <CardTitle></CardTitle>

            <Button
              className="my-3"
              size="sm"
              onClick={openAddDialog}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
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
                      Name
                    </TableHead>

                    <TableHead>
                      Email
                    </TableHead>

                    <TableHead>
                      Phone
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
                          {item.name}
                        </TableCell>

                        <TableCell>
                          {item.email}
                        </TableCell>

                        <TableCell>
                          {item.phone}
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
                                onClick={() => navigate(`/crew-members/${item.id}`)}
                              >
                                <Users2 className="h-4 w-4" />
                                Crew Members
                              </DropdownMenuItem>

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
          <DialogContent className="md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {formData.id !== ""
                  ? "Edit Record"
                  : "Add Record"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 gap-4 max-h-[80vh] overflow-y-auto px-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label className="mb-2 block">
                    Name
                  </Label>

                  <Input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Email
                  </Label>

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
                  <Label className="mb-2 block">
                    Phone
                  </Label>

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
                  <Label className="mb-2 block">
                    Address
                  </Label>

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
                  <Label className="mb-2 block">
                    Category
                  </Label>

                  <Input
                    name="category"
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>


                <div>
                  <Label className="mb-2 block">
                    Sub Category
                  </Label>

                  <Input
                    name="sub_category"
                    type="text"
                    placeholder="Sub Category"
                    value={formData.sub_category}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    GST Number
                  </Label>

                  <Input
                    name="gst"
                    type="text"
                    placeholder="GST Number"
                    value={formData.gst}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Type</Label>

                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      handleFormChange('type', value)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="organizers">
                        Organizers
                      </SelectItem>

                      <SelectItem value="vendors">
                        Vendors
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Password
                  </Label>

                  <Input
                    name="password"
                    type="text"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div className="col-span-2 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <ImageUpload
                      folder={"organisations"}
                      initialImage={formData.image != '' ? `${PATH_URL}/${formData.image}` : ''}
                      onUploadComplete={(url) => handleFormChange("image", url)}
                      onRemoved={() => handleFormChange("image", "")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <ImageUpload
                      folder={"organisations"}
                      initialImage={formData.bg_image != '' ? `${PATH_URL}/${formData.bg_image}` : ''}
                      onUploadComplete={(url) => handleFormChange("bg_image", url)}
                      onRemoved={() => handleFormChange("bg_image", "")}
                    />
                  </div>
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
      </Card>
    );
  }
);