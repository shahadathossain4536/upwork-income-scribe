import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { collaborationService, Collaboration } from '@/lib/services/collaborationService';
import { toast } from 'sonner';
import CreateCollaborationModal from '@/components/CollaborationModal';

const Collaborations = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollaboration, setEditingCollaboration] = useState<Collaboration | null>(null);

  useEffect(() => {
    loadCollaborations();
  }, []);

  const loadCollaborations = async () => {
    setIsLoading(true);
    try {
      const response = await collaborationService.getCollaborations({
        search: searchTerm,
        limit: 50
      });

      if (response.success && response.data) {
        setCollaborations(response.data || []);
      }
    } catch (error) {
      console.error('Error loading collaborations:', error);
      toast.error('Failed to load collaborations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollaboration = async (data: any) => {
    try {
      const response = await collaborationService.createCollaboration(data);
      if (response.success) {
        toast.success('Collaboration created successfully');
        setIsCreateModalOpen(false);
        await loadCollaborations();
      }
    } catch (error) {
      console.error('Error creating collaboration:', error);
      toast.error('Failed to create collaboration');
    }
  };

  const handleEditCollaboration = async (data: any) => {
    if (!editingCollaboration) return;

    try {
      const response = await collaborationService.updateCollaboration(editingCollaboration._id, data);
      if (response.success) {
        toast.success('Collaboration updated successfully');
        setIsEditModalOpen(false);
        setEditingCollaboration(null);
        await loadCollaborations();
      }
    } catch (error) {
      console.error('Error updating collaboration:', error);
      toast.error('Failed to update collaboration');
    }
  };

  const handleDeleteCollaboration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collaboration?')) {
      return;
    }

    try {
      const response = await collaborationService.deleteCollaboration(id);
      if (response.success) {
        toast.success('Collaboration deleted successfully');
        await loadCollaborations();
      }
    } catch (error) {
      console.error('Error deleting collaboration:', error);
      toast.error('Failed to delete collaboration');
    }
  };

  const openEditModal = (collaboration: Collaboration) => {
    setEditingCollaboration(collaboration);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCollaboration(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Together</h1>
            <p className="text-gray-600">Manage your team collaborations and shared projects</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Collaboration
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collaborations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadCollaborations} variant="outline">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Collaborations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading collaborations...</p>
          </div>
        ) : collaborations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborations yet</h3>
              <p className="text-gray-600 mb-4">Create your first collaboration to start working together</p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Collaboration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collaboration) => (
              <Card key={collaboration._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{collaboration.name}</CardTitle>
                      {collaboration.description && (
                        <p className="text-sm text-gray-600 mt-1">{collaboration.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(collaboration)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteCollaboration(collaboration._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Owner */}
                    <div>
                      <Label className="text-sm text-gray-500">Owner</Label>
                      <p className="font-medium">{collaboration.owner.firstName} {collaboration.owner.lastName}</p>
                    </div>

                    {/* Members */}
                    <div>
                      <Label className="text-sm text-gray-500">Members ({collaboration.memberCount})</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {collaboration.members.slice(0, 3).map((member, index) => (
                          <span
                            key={member.user._id}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}
                          >
                            {member.user.firstName} {member.user.lastName} ({member.sharePercentage}%)
                          </span>
                        ))}
                        {collaboration.memberCount > 3 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{collaboration.memberCount - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        collaboration.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {collaboration.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(collaboration.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Collaboration Modal */}
        <CreateCollaborationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCollaboration}
        />

        {/* Edit Collaboration Modal */}
        <CreateCollaborationModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditCollaboration}
          editData={editingCollaboration}
        />
      </div>
    </div>
  );
};

export default Collaborations;