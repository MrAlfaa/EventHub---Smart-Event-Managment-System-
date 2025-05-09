
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

const AdminOverview = () => {
  const { user } = useApp();
  
  // Mock data for dashboard stats - in a real app, this would come from an API
  const stats = [
    { title: "Total Users", value: "1,245", icon: Users, color: "bg-blue-500" },
    { title: "Service Providers", value: "58", icon: Briefcase, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Admin"}</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
};

export default AdminOverview;
