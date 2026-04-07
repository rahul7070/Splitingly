import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";
import { ArrowLeft, Search, X, UserPlus } from "lucide-react";
import { groupAPI, userAPI } from "../services/api";

const CreateGroup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await userAPI.searchUsers(searchQuery);
      setSearchResults(response.data);
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

  const handleAddMember = (user) => {
    if (!selectedMembers.find((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const memberIds = selectedMembers.map((m) => m.id);

      await groupAPI.createGroup({
        name: name.trim(),
        description: description.trim(),
        member_ids: memberIds,
      });

      toast({
        title: "Success!",
        description: `Group "${name}" created successfully`,
      });

      navigate("/groups");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/groups")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Group</h1>
              <p className="text-gray-600 mt-1">Start a new expense group</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekend Trip, Apartment 301"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this group for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Add Members */}
              <div className="space-y-4">
                <Label>Add Members</Label>

                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
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

                {searching && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Searching...
                  </p>
                )}

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Members ({selectedMembers.length})
                    </p>
                    <div className="space-y-2">
                      {selectedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMembers.length === 0 && !searchQuery && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Search and add members to your group
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      You can also add members later
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateGroup;
