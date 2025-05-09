
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const AdminBookings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings Management</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search bookings..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>

      <div className="flex gap-2 pb-4">
        <Button variant="outline" className="bg-blue-50">All</Button>
        <Button variant="outline">Pending</Button>
        <Button variant="outline">Confirmed</Button>
        <Button variant="outline">Completed</Button>
        <Button variant="outline">Cancelled</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Customer</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Provider</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Package</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Amount</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    <td className="p-4">#{4000 + i}</td>
                    <td className="p-4">Customer {i + 1}</td>
                    <td className="p-4">Provider {i % 5 + 1}</td>
                    <td className="p-4">{i % 3 === 0 ? "Wedding Deluxe" : i % 3 === 1 ? "Corporate Event" : "Birthday Party"}</td>
                    <td className="p-4">{new Date(Date.now() + (i * 86400000)).toLocaleDateString()}</td>
                    <td className="p-4">${(i + 1) * 500}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        i % 4 === 0 ? 'bg-yellow-100 text-yellow-800' : 
                        i % 4 === 1 ? 'bg-green-100 text-green-800' : 
                        i % 4 === 2 ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {i % 4 === 0 ? 'Pending' : 
                         i % 4 === 1 ? 'Confirmed' : 
                         i % 4 === 2 ? 'Completed' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
