import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Plus,
  Receipt,
  Users as UsersIcon,
  UserPlus,
  Search,
} from "lucide-react";
import { groupAPI, expenseAPI, settlementAPI, userAPI } from "../services/api";
import { toast } from "../hooks/use-toast";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupSettlements, setGroupSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);
        const [groupRes, expensesRes, settlementsRes] = await Promise.all([
          groupAPI.getGroup(id),
          expenseAPI.getExpenses(id),
          settlementAPI.getSettlements(id),
        ]);

        setGroup(groupRes.data);
        setGroupExpenses(expensesRes.data);
        setGroupSettlements(settlementsRes.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load group details",
          variant: "destructive",
        });
        navigate("/groups");
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [id, navigate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const runUserSearch = async () => {
        if (!searchQuery.trim()) {
          setSearchResults([]);
          return;
        }

        setSearching(true);
        try {
          const response = await userAPI.searchUsers(searchQuery);
          const filtered = response.data.filter(
            (user) => !group?.members?.some((member) => member.id === user.id),
          );
          setSearchResults(filtered);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to search users",
            variant: "destructive",
          });
        } finally {
          setSearching(false);
        }
      };

      if (searchQuery && addMemberOpen) {
        runUserSearch();
      } else if (!searchQuery.trim()) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [addMemberOpen, group, searchQuery]);

  const handleAddMember = async (user) => {
    try {
      // Note: This requires a backend endpoint to add members to existing group
      // For now, we'll show a message that this feature needs backend support
      toast({
        title: "Feature Coming Soon",
        description:
          "Adding members to existing groups will be available soon. Create a new group with all members instead.",
        variant: "default",
      });
      setAddMemberOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };

  const getUserName = (userId) => {
    return userId;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate("/groups")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600 mt-1">{group.description}</p>
            </div>
            <Button
              onClick={() => navigate("/expenses/add")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={group.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">
                {group.members.length} members
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Group Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {groupExpenses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No expenses yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {expense.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              Paid by {getUserName(expense.paidBy)} •{" "}
                              {formatDate(expense.date)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Split {expense.splitType} among{" "}
                              {expense.splits.length} people
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            ₹{expense.amount}
                          </p>
                          <p className="text-sm text-gray-600">
                            {expense.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Group Members</CardTitle>
                  <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Member to Group</DialogTitle>
                        <DialogDescription>
                          Search for users by email to add them to this group
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            placeholder="Search by email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        {searching && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            Searching...
                          </p>
                        )}

                        {searchResults.length > 0 && (
                          <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                              <div
                                key={user.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleAddMember(user)}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>
                                      {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {user.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {user.email}
                                    </p>
                                  </div>
                                  <UserPlus className="w-5 h-5 text-emerald-600" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!searching &&
                          searchQuery &&
                          searchResults.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No users found
                            </p>
                          )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      {group.created_by === member.id && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {groupSettlements.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No settlements yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupSettlements.map((settlement) => (
                      <div
                        key={settlement.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getUserName(settlement.paidBy)} paid{" "}
                              {getUserName(settlement.paidTo)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(settlement.date)}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-lg text-blue-600">
                          ₹{settlement.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetail;
