import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from '../hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { groupAPI, expenseAPI, userAPI } from '../services/api';

const AddExpense = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState('');
  const [category, setCategory] = useState('Food');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [friends, setFriends] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Entertainment', 'Accommodation', 'Transportation', 'Utilities', 'Shopping', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, friendsRes] = await Promise.all([
        groupAPI.getGroups(),
        userAPI.getFriends()
      ]);
      
      setGroups(groupsRes.data);
      
      const friendsMap = {};
      friendsRes.data.forEach(friend => {
        friendsMap[friend.id] = friend;
      });
      setFriends(friendsMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    }
  };

  const handleGroupChange = async (value) => {
    setGroupId(value);
    try {
      const response = await groupAPI.getGroup(value);
      setSelectedGroup(response.data);
      
      // Initialize splits
      const initialSplits = {};
      response.data.members.forEach(member => {
        initialSplits[member.id] = 0;
      });
      setCustomSplits(initialSplits);
      setPercentageSplits(initialSplits);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load group details',
        variant: 'destructive'
      });
    }
  };

  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits(prev => ({
      ...prev,
      [userId]: parseFloat(value) || 0
    }));
  };

  const handlePercentageSplitChange = (userId, value) => {
    setPercentageSplits(prev => ({
      ...prev,
      [userId]: parseFloat(value) || 0
    }));
  };

  const getTotalCustomSplit = () => {
    return Object.values(customSplits).reduce((sum, val) => sum + val, 0);
  };

  const getTotalPercentage = () => {
    return Object.values(percentageSplits).reduce((sum, val) => sum + val, 0);
  };

  const getUserName = (member) => {
    return member.name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupId) {
      toast({
        title: 'Error',
        description: 'Please select a group',
        variant: 'destructive'
      });
      return;
    }

    if (splitType === 'custom' && Math.abs(getTotalCustomSplit() - parseFloat(amount)) > 0.01) {
      toast({
        title: 'Error',
        description: `Custom splits must add up to ₹${amount}`,
        variant: 'destructive'
      });
      return;
    }

    if (splitType === 'percentage' && Math.abs(getTotalPercentage() - 100) > 0.01) {
      toast({
        title: 'Error',
        description: 'Percentages must add up to 100%',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare splits data
      const splits = selectedGroup.members.map(member => ({
        user_id: member.id,
        amount: splitType === 'equal' 
          ? parseFloat(amount) / selectedGroup.members.length 
          : splitType === 'custom'
          ? customSplits[member.id]
          : (parseFloat(amount) * percentageSplits[member.id]) / 100,
        percentage: splitType === 'percentage' ? percentageSplits[member.id] : undefined
      }));

      await expenseAPI.createExpense({
        group_id: groupId,
        description,
        amount: parseFloat(amount),
        split_type: splitType,
        splits,
        category,
        date: new Date().toISOString()
      });

      toast({
        title: 'Expense added!',
        description: `Added ₹${amount} to ${selectedGroup.name}`
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add expense',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
              <p className="text-gray-600 mt-1">Split a new expense with your group</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Dinner at restaurant"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <Select value={groupId} onValueChange={handleGroupChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Split Type</Label>
                <RadioGroup value={splitType} onValueChange={setSplitType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equal" id="equal" />
                    <Label htmlFor="equal" className="font-normal cursor-pointer">Split Equally</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="font-normal cursor-pointer">Custom Amounts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="font-normal cursor-pointer">By Percentage</Label>
                  </div>
                </RadioGroup>
              </div>

              {selectedGroup && (
                <div className="space-y-4">
                  <Label>Split Between Members</Label>
                  <div className="space-y-3">
                    {selectedGroup.members.map(member => (
                      <div key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getUserName(member).split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium">{getUserName(member)}</span>
                        
                        {splitType === 'equal' && amount && (
                          <span className="text-emerald-600 font-semibold">
                            ₹{(parseFloat(amount) / selectedGroup.members.length).toFixed(2)}
                          </span>
                        )}
                        
                        {splitType === 'custom' && (
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-32"
                            value={customSplits[member.id] || ''}
                            onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                          />
                        )}
                        
                        {splitType === 'percentage' && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              className="w-24"
                              value={percentageSplits[member.id] || ''}
                              onChange={(e) => handlePercentageSplitChange(member.id, e.target.value)}
                            />
                            <span>%</span>
                            {amount && percentageSplits[member.id] && (
                              <span className="text-emerald-600 font-semibold ml-2">
                                ₹{((parseFloat(amount) * percentageSplits[member.id]) / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {splitType === 'custom' && amount && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        Total: ₹{getTotalCustomSplit().toFixed(2)} / ₹{amount}
                        {Math.abs(getTotalCustomSplit() - parseFloat(amount)) > 0.01 && (
                          <span className="text-red-600 ml-2">(₹{Math.abs(getTotalCustomSplit() - parseFloat(amount)).toFixed(2)} {getTotalCustomSplit() > parseFloat(amount) ? 'over' : 'remaining'})</span>
                        )}
                      </p>
                    </div>
                  )}

                  {splitType === 'percentage' && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        Total: {getTotalPercentage().toFixed(2)}%
                        {Math.abs(getTotalPercentage() - 100) > 0.01 && (
                          <span className="text-red-600 ml-2">({Math.abs(getTotalPercentage() - 100).toFixed(2)}% {getTotalPercentage() > 100 ? 'over' : 'remaining'})</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;