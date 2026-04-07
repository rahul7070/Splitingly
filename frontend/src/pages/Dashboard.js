import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { balanceAPI, userAPI } from '../services/api';
import { Users, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balances, setBalances] = useState({});
  const [activities, setActivities] = useState([]);
  const [friends, setFriends] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balancesRes, activitiesRes, friendsRes] = await Promise.all([
        balanceAPI.getBalances(),
        balanceAPI.getActivity('all'),
        userAPI.getFriends()
      ]);

      setBalances(balancesRes.data);
      setActivities(activitiesRes.data.slice(0, 10));
      
      // Create friends lookup
      const friendsMap = {};
      friendsRes.data.forEach(friend => {
        friendsMap[friend.id] = friend;
      });
      setFriends(friendsMap);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalOwed = () => {
    return Object.values(balances).reduce((sum, val) => sum + (val > 0 ? val : 0), 0);
  };

  const getTotalOwing = () => {
    return Object.values(balances).reduce((sum, val) => sum + (val < 0 ? Math.abs(val) : 0), 0);
  };

  const getNetBalance = () => {
    return getTotalOwed() - getTotalOwing();
  };

  const getUserName = (userId) => {
    return friends[userId]?.name || 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <Button 
              onClick={() => navigate('/expenses/add')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg transition-all duration-200 hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                You Are Owed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">₹{getTotalOwed().toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg transition-all duration-200 hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                You Owe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">₹{getTotalOwing().toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg transition-all duration-200 hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${getNetBalance() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₹{Math.abs(getNetBalance()).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Balances */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Your Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(balances).filter(([_, amount]) => amount !== 0).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">You're all settled up! 🎉</p>
                ) : (
                  Object.entries(balances)
                    .filter(([_, amount]) => amount !== 0)
                    .sort(([_, a], [__, b]) => Math.abs(b) - Math.abs(a))
                    .map(([userId, amount]) => (
                      <div key={userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={friends[userId]?.avatar} />
                              <AvatarFallback>{getUserName(userId).split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{getUserName(userId)}</p>
                              <p className="text-sm text-gray-600">
                                {amount > 0 ? 'owes you' : 'you owe'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {amount > 0 ? (
                              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`font-bold text-lg ${amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ₹{Math.abs(amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
              {Object.entries(balances).filter(([_, amount]) => amount !== 0).length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/balances')}
                >
                  View All Balances
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ 
                        activity.type === 'settlement' ? 'bg-blue-100' : 'bg-emerald-100'
                      }`}>
                        {activity.type === 'settlement' ? (
                          <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Plus className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activity.type === 'expense' ? (
                          <>
                            <p className="font-medium text-gray-900 truncate">{activity.description}</p>
                            <p className="text-sm text-gray-600">
                              {activity.paid_by_name} paid ₹{activity.amount} • {activity.group_name}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-gray-900">Payment recorded</p>
                            <p className="text-sm text-gray-600">
                              {activity.paid_by_name} paid {activity.paid_to_name} ₹{activity.amount}
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {activities.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/activity')}
                >
                  View All Activity
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;