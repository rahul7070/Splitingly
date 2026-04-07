import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { balanceAPI } from "../services/api";
import { Plus, ArrowUpRight, Receipt, Calendar, Users } from "lucide-react";
import { toast } from "../hooks/use-toast";

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await balanceAPI.getActivity(filter);
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast({
        title: "Error",
        description: "Failed to load activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
            <p className="text-gray-600 mt-1">
              All your recent transactions and settlements
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Feed</CardTitle>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="expense">Expenses</TabsTrigger>
                  <TabsTrigger value="settlement">Settlements</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                No activity found
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === "settlement"
                          ? "bg-blue-100"
                          : "bg-emerald-100"
                      }`}
                    >
                      {activity.type === "settlement" ? (
                        <ArrowUpRight className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Receipt className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {activity.type === "expense" ? (
                        <>
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-lg">
                                {activity.description}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.paid_by_name} paid ₹{activity.amount}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-xl text-gray-900">
                                ₹{activity.amount}
                              </p>
                              {activity.category && (
                                <Badge variant="secondary" className="mt-1">
                                  {activity.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {activity.group_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(activity.date)}
                            </span>
                            {activity.split_type && (
                              <Badge variant="outline" className="text-xs">
                                Split {activity.split_type}
                              </Badge>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg">
                                Payment Recorded
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.paid_by_name} paid{" "}
                                {activity.paid_to_name} ₹{activity.amount}
                              </p>
                            </div>
                            <p className="font-bold text-xl text-blue-600">
                              ₹{activity.amount}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {activity.group_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(activity.date)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activity;
