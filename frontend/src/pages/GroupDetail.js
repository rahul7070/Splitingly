import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Plus, Receipt, Users as UsersIcon } from 'lucide-react';
import { groups, expenses, settlements, friends, currentUser } from '../mock/mockData';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupSettlements, setGroupSettlements] = useState([]);

  useEffect(() => {
    const foundGroup = groups.find(g => g.id === id);
    setGroup(foundGroup);
    setGroupExpenses(expenses.filter(e => e.groupId === id));
    setGroupSettlements(settlements.filter(s => s.groupId === id));
  }, [id]);

  const getUserName = (userId) => {
    if (userId === currentUser.id) return 'You';
    const friend = friends.find(f => f.id === userId);
    return friend ? friend.name : 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!group) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/groups')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600 mt-1">{group.description}</p>
            </div>
            <Button 
              onClick={() => navigate('/expenses/add')}
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
              <span className="text-gray-600">{group.members.length} members</span>
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
                  <p className="text-gray-500 text-center py-8">No expenses yet</p>
                ) : (
                  <div className="space-y-3">
                    {groupExpenses.map(expense => (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{expense.description}</p>
                            <p className="text-sm text-gray-600">
                              Paid by {getUserName(expense.paidBy)} • {formatDate(expense.date)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Split {expense.splitType} among {expense.splits.length} people
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">₹{expense.amount}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
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
                <CardTitle>Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members.map(memberId => {
                    const member = memberId === currentUser.id ? currentUser : friends.find(f => f.id === memberId);
                    return (
                      <div key={memberId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member?.avatar} />
                          <AvatarFallback>{getUserName(memberId).substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{member?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{member?.email}</p>
                        </div>
                        {group.createdBy === memberId && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Admin</span>
                        )}
                      </div>
                    );
                  })}
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
                  <p className="text-gray-500 text-center py-8">No settlements yet</p>
                ) : (
                  <div className="space-y-3">
                    {groupSettlements.map(settlement => (
                      <div key={settlement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getUserName(settlement.paidBy)} paid {getUserName(settlement.paidTo)}
                            </p>
                            <p className="text-sm text-gray-600">{formatDate(settlement.date)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-lg text-blue-600">₹{settlement.amount}</p>
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