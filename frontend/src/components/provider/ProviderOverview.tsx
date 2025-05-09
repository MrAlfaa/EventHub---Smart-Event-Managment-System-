
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, DollarSign, Package, Users } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const ProviderOverview = () => {
  const { user } = useApp();
  
  // Mock data for dashboard stats - in a real app, this would come from an API
  const stats = [
    { title: "Total Packages", value: "12", icon: Package, color: "bg-blue-500" },
    { title: "Active Bookings", value: "28", icon: CalendarCheck, color: "bg-green-500" },
    { title: "Total Customers", value: "145", icon: Users, color: "bg-orange-500" },
    { title: "Total Revenue", value: "$12,450", icon: DollarSign, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Provider"}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-md`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-8">Recent Bookings</h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Customer</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Package</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    <td className="p-4">#BK-{1000 + i}</td>
                    <td className="p-4">Customer {i}</td>
                    <td className="p-4">Wedding Deluxe</td>
                    <td className="p-4">{new Date().toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        i % 3 === 0 ? 'bg-yellow-100 text-yellow-800' : 
                        i % 2 === 0 ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {i % 3 === 0 ? 'Pending' : i % 2 === 0 ? 'Confirmed' : 'In Progress'}
                      </span>
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

export default ProviderOverview;
