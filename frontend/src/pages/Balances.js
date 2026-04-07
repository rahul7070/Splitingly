import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { balanceAPI, userAPI, settlementAPI, groupAPI } from "../services/api";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "../hooks/use-toast";

const Balances = () => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState({});
  const [friends, setFriends] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balancesRes, friendsRes, groupsRes] = await Promise.all([
        balanceAPI.getBalances(),
        userAPI.getFriends(),
        groupAPI.getGroups(),
      ]);

      setBalances(balancesRes.data);

      const friendsMap = {};
      friendsRes.data.forEach((friend) => {
        friendsMap[friend.id] = friend;
      });
      setFriends(friendsMap);

      // Store groups for settlement
      setGroups(groupsRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    return friends[userId]?.name || "Unknown";
  };

  const openSettleDialog = (userId, amount) => {
    setSelectedUserId(userId);
    setSelectedAmount(Math.abs(amount));

    // Filter groups that include both current user and the selected user
    const commonGroups = groups.filter((group) =>
      group.members.includes(userId),
    );

    if (commonGroups.length > 0) {
      setSelectedGroupId(commonGroups[0].id);
    }

    setSettleDialogOpen(true);
  };

  const handleSettle = async () => {
    if (!selectedGroupId) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return;
    }

    setSettling(true);
    try {
      await settlementAPI.createSettlement({
        group_id: selectedGroupId,
        paid_to: selectedUserId,
        amount: selectedAmount,
      });

      toast({
        title: "Settlement recorded",
        description: `Recorded payment of ₹${selectedAmount.toFixed(2)} to ${getUserName(selectedUserId)}`,
      });

      setSettleDialogOpen(false);
      // Refresh balances
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to record settlement",
        variant: "destructive",
      });
    } finally {
      setSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading balances...</p>
        </div>
      </div>
    );
  }

  const owedToYou = Object.entries(balances).filter(
    ([_, amount]) => amount > 0,
  );
  const youOwe = Object.entries(balances).filter(([_, amount]) => amount < 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Balances</h1>
            <p className="text-gray-600 mt-1">
              Overview of all your settlements
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* You Are Owed */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <ArrowDownLeft className="w-5 h-5" />
                You Are Owed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owedToYou.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No one owes you money
                </p>
              ) : (
                <div className="space-y-4">
                  {owedToYou.map(([userId, amount]) => (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friends[userId]?.avatar} />
                          <AvatarFallback>
                            {getUserName(userId)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {getUserName(userId)}
                          </p>
                          <p className="text-sm text-gray-600">owes you</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-emerald-600">
                          ₹{amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* You Owe */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <ArrowUpRight className="w-5 h-5" />
                You Owe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {youOwe.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  You don't owe anyone money
                </p>
              ) : (
                <div className="space-y-4">
                  {youOwe.map(([userId, amount]) => (
                    <div key={userId} className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friends[userId]?.avatar} />
                            <AvatarFallback>
                              {getUserName(userId)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getUserName(userId)}
                            </p>
                            <p className="text-sm text-gray-600">you owe</p>
                          </div>
                        </div>
                        <p className="font-bold text-xl text-red-600">
                          ₹{Math.abs(amount).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        onClick={() => openSettleDialog(userId, amount)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        Settle Up
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settle Up Dialog */}
      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Up</DialogTitle>
            <DialogDescription>
              Record a payment of ₹{selectedAmount.toFixed(2)} to{" "}
              {getUserName(selectedUserId)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Group</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups
                    .filter((group) => group.members.includes(selectedUserId))
                    .map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select the group where this settlement should be recorded
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSettleDialogOpen(false)}
                className="flex-1"
                disabled={settling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSettle}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={settling || !selectedGroupId}
              >
                {settling ? "Recording..." : "Confirm Settlement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Balances;
