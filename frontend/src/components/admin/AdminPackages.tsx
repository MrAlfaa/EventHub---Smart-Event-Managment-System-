
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock package data
const packagePlans = [
  { 
    id: "pkg-1",
    name: "Basic Plan", 
    adsAllowed: 5, 
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    status: "Active"
  },
  { 
    id: "pkg-2",
    name: "Standard Plan", 
    adsAllowed: 15, 
    monthlyPrice: 59.99,
    yearlyPrice: 599.99,
    status: "Active"
  },
  { 
    id: "pkg-3",
    name: "Premium Plan", 
    adsAllowed: 30, 
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    status: "Active"
  },
];

const AdminPackages = () => {
  const [packages, setPackages] = useState(packagePlans);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    adsAllowed: 0,
    monthlyPrice: 0,
    yearlyPrice: 0
  });

  const handleAddPackage = () => {
    if (!newPackage.name || newPackage.adsAllowed <= 0 || newPackage.monthlyPrice <= 0 || newPackage.yearlyPrice <= 0) {
      toast.error("Please fill in all package details");
      return;
    }

    const packageToAdd = {
      id: `pkg-${packages.length + 1}`,
      ...newPackage,
      status: "Active"
    };

    setPackages([...packages, packageToAdd]);
    setNewPackage({ name: "", adsAllowed: 0, monthlyPrice: 0, yearlyPrice: 0 });
    setIsAddDialogOpen(false);
    toast.success("Package added successfully");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Packages Management</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search packages..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Provider Package Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Package Name</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Ads Allowed</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Monthly Price</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Yearly Price</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{pkg.id}</td>
                    <td className="p-4">{pkg.name}</td>
                    <td className="p-4">{pkg.adsAllowed}</td>
                    <td className="p-4">${pkg.monthlyPrice}</td>
                    <td className="p-4">${pkg.yearlyPrice}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {pkg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline" className="text-red-600">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Package Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Package</DialogTitle>
            <DialogDescription>
              Create a new service provider package plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPackage.name}
                onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ads" className="text-right">
                Ads Allowed
              </Label>
              <Input
                id="ads"
                type="number"
                value={newPackage.adsAllowed || ""}
                onChange={(e) => setNewPackage({...newPackage, adsAllowed: parseInt(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly" className="text-right">
                Monthly Price
              </Label>
              <Input
                id="monthly"
                type="number"
                step="0.01"
                value={newPackage.monthlyPrice || ""}
                onChange={(e) => setNewPackage({...newPackage, monthlyPrice: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="yearly" className="text-right">
                Yearly Price
              </Label>
              <Input
                id="yearly"
                type="number"
                step="0.01"
                value={newPackage.yearlyPrice || ""}
                onChange={(e) => setNewPackage({...newPackage, yearlyPrice: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPackage}>Add Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages;
