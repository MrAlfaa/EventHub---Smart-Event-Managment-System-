  import React, { useEffect, useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Briefcase, Users, Clock, AlertCircle, Loader2 } from "lucide-react";
  import { useApp } from "@/providers/AppProvider";
  import adminService, { AdminStats } from "@/services/adminService";
  import { toast } from "sonner";

  const AdminOverview = () => {
    const { user } = useApp();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          setLoading(true);
          const adminStats = await adminService.getAdminStats();
          setStats(adminStats);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch admin stats:", err);
          setError("Failed to load dashboard statistics. Please try again.");
          toast.error("Could not load dashboard data");
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, []);

    // Prepare stats cards data based on fetched stats
    const getStatsCards = () => {
      if (loading) {
        return [
          { 
            title: "Loading...", 
            value: <Loader2 className="h-5 w-5 animate-spin mx-auto" />, 
            icon: Users, 
            color: "bg-blue-500" 
          },
          { 
            title: "Loading...", 
            value: <Loader2 className="h-5 w-5 animate-spin mx-auto" />, 
            icon: Briefcase, 
            color: "bg-purple-500" 
          },
        ];
      }

      if (error) {
        return [
          { 
            title: "Error", 
            value: "Failed to load data", 
            icon: AlertCircle, 
            color: "bg-red-500" 
          },
        ];
      }

      if (!stats) {
        return [
          { 
            title: "No Data", 
            value: "No data available", 
            icon: AlertCircle, 
            color: "bg-gray-500" 
          },
        ];
      }

      return [
        { 
          title: "Total Users", 
          value: stats.users_count.toString(), 
          icon: Users, 
          color: "bg-blue-500" 
        },
        { 
          title: "Service Providers", 
          value: stats.service_providers_count.toString(), 
          icon: Briefcase, 
          color: "bg-purple-500" 
        },
        // Optional: Add a third card for pending providers
        { 
          title: "Pending Approvals", 
          value: stats.pending_providers_count.toString(), 
          icon: Clock, 
          color: "bg-amber-500" 
        },
      ];
    };

    const statsCards = getStatsCards();

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Admin"}</h1>
      
        <div className="grid gap-4 md:grid-cols-3">
          {statsCards.map((stat, index) => (
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

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {/* Here you would map through recent activities, when you add that functionality */}
                    <li className="flex items-start space-x-4 border-b pb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">New user registered</p>
                        <p className="text-sm text-muted-foreground">A new user has joined the platform</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">New service provider application</p>
                        <p className="text-sm text-muted-foreground">A new service provider has applied for approval</p>
                        <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                      </div>
                    </li>
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  export default AdminOverview;
