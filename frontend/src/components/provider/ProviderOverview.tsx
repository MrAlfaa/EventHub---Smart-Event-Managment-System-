  import React, { useEffect, useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { CalendarCheck, DollarSign, Package, Users } from "lucide-react";
  import { useApp } from "@/providers/AppProvider";
  import providerStatsService from "@/services/providerStatsService";
  import { formatCurrency } from "@/lib/utils";
  import { Skeleton } from "@/components/ui/skeleton";
  import { formatDate } from "@/utils/dateUtils";
  import { toast } from "sonner";

  // Define types for our dashboard stats
  interface DashboardStats {
    total_packages: number;
    active_bookings: number;
    total_customers: number;
    total_revenue: number;
    recent_bookings: Array<{
      id: string;
      customerName: string;
      packageName: string;
      date: string;
      status: string;
    }>;
  }

  const ProviderOverview = () => {
    const { user } = useApp();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const MOCK_DASHBOARD_DATA = {
      total_packages: 12,
      active_bookings: 28,
      total_customers: 145, 
      total_revenue: 12450,
      recent_bookings: [
        { id: "bk1001", customerName: "John Doe", packageName: "Wedding Deluxe", date: new Date().toISOString(), status: "pending" },
        { id: "bk1002", customerName: "Jane Smith", packageName: "Birthday Basic", date: new Date().toISOString(), status: "confirmed" },
        { id: "bk1003", customerName: "Robert Johnson", packageName: "Corporate Event", date: new Date().toISOString(), status: "completed" }
      ]
    };

    useEffect(() => {
      const fetchStats = async () => {
        try {
          setLoading(true);
          const data = await providerStatsService.getDashboardStats();
          console.log('Received stats data:', data);
          setStats(data);
          setError(null);
        } catch (err) {
          console.error("Error fetching dashboard stats:", err);
          // Use mock data if API fails
          console.log("Using mock data as fallback");
          setStats(MOCK_DASHBOARD_DATA);
          // setError("Could not load real data - showing sample data instead");
        
          // Show a toast notification for better UX
          toast.error("Could not load dashboard statistics - showing sample data");
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, []);

    // Dashboard stat cards configuration
    const statCards = [
      { 
        title: "Total Packages", 
        value: stats?.total_packages || 0, 
        icon: Package, 
        color: "bg-blue-500",
        loading 
      },
      { 
        title: "Active Bookings", 
        value: stats?.active_bookings || 0, 
        icon: CalendarCheck, 
        color: "bg-green-500",
        loading 
      },
      { 
        title: "Total Customers", 
        value: stats?.total_customers || 0, 
        icon: Users, 
        color: "bg-orange-500",
        loading 
      },
      { 
        title: "Total Revenue", 
        value: formatCurrency(stats?.total_revenue || 0), 
        icon: DollarSign, 
        color: "bg-purple-500",
        loading 
      },
    ];

    // Function to get status badge color
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Provider"}</h1>
      
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-md`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
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
                  {loading ? (
                    // Skeleton loader for bookings
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      </tr>
                    ))
                  ) : stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
                    stats.recent_bookings.map((booking, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="p-4">#{booking.id.slice(-5)}</td>
                        <td className="p-4">{booking.customerName}</td>
                        <td className="p-4">{booking.packageName}</td>
                        <td className="p-4">{formatDate(booking.date)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  export default ProviderOverview;
