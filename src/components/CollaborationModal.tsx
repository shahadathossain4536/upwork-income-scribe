import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as Array<{
      user: string;
      role: 'admin' | 'member' | 'viewer';
      sharePercentage: number;
    }>,
    settings: {
      allowIncomeSharing: true,
      allowExpenseSharing: true,
      allowMemberInvites: true,
      requireApproval: false,
      visibility: 'invite-only' as 'public' | 'private' | 'invite-only'
    }
  });

  const [newMember, setNewMember] = useState({
    user: '',
    role: 'member' as 'admin' | 'member' | 'viewer',
    sharePercentage: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

    // Validate total share percentage
    const totalShare = formData.members.reduce((sum, member) => sum + member.sharePercentage, 0);
    if (totalShare > 100) {
      toast.error('Total share percentage cannot exceed 100%');
      return;
    }

    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      members: [],
      settings: {
        allowIncomeSharing: true,
        allowExpenseSharing: true,
        allowMemberInvites: true,
        requireApproval: false,
        visibility: 'invite-only'
      }
    });
  };

  const handleAddMember = () => {
    if (!newMember.user.trim()) {
      toast.error('Please enter a user email or ID');
      return;
    }

    const totalShare = formData.members.reduce((sum, member) => sum + member.sharePercentage, 0) + newMember.sharePercentage;
    if (totalShare > 100) {
      toast.error('Total share percentage cannot exceed 100%');
      return;
    }

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { ...newMember }]
    }));

    setNewMember({
      user: '',
      role: 'member',
      sharePercentage: 0
    });
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('settings.')) {
      const settingField = field.replace('settings.', '');
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const totalSharePercentage = formData.members.reduce((sum, member) => sum + member.sharePercentage, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-600">
            {editData ? 'Edit Collaboration' : 'Create New Collaboration'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">🤝 Collaboration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Web Development Team"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">📝 Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your collaboration..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Members Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">👥 Members & Share Percentage</Label>

            {formData.members.map((member, index) => (
              <div key={index} className="flex gap-2 items-center p-2 border rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.user}</p>
                  <p className="text-xs text-gray-500">{member.role} - {member.sharePercentage}%</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(index)}
                >
                  Remove
                </Button>
              </div>
            ))}

            {/* Add New Member */}
            <div className="space-y-2 p-3 border border-dashed rounded">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">User Email/ID</Label>
                  <Input
                    placeholder="user@example.com"
                    value={newMember.user}
                    onChange={(e) => setNewMember(prev => ({ ...prev, user: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Share %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={newMember.sharePercentage}
                    onChange={(e) => setNewMember(prev => ({ ...prev, sharePercentage: parseInt(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <Button
                type="button"
                onClick={handleAddMember}
                className="w-full text-sm"
              >
                Add Member
              </Button>
            </div>

            {/* Total Share Percentage */}
            <div className={`text-sm font-medium ${
              totalSharePercentage === 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              Total Share: {totalSharePercentage}%
              {totalSharePercentage !== 100 && (
                <span className="ml-2 text-orange-600">
                  (Should equal 100%)
                </span>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">⚙️ Settings</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowIncomeSharing" className="text-sm">Allow Income Sharing</Label>
              <Switch
                id="allowIncomeSharing"
                checked={formData.settings.allowIncomeSharing}
                onCheckedChange={(checked) => handleInputChange('settings.allowIncomeSharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowExpenseSharing" className="text-sm">Allow Expense Sharing</Label>
              <Switch
                id="allowExpenseSharing"
                checked={formData.settings.allowExpenseSharing}
                onCheckedChange={(checked) => handleInputChange('settings.allowExpenseSharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allowMemberInvites" className="text-sm">Allow Member Invites</Label>
              <Switch
                id="allowMemberInvites"
                checked={formData.settings.allowMemberInvites}
                onCheckedChange={(checked) => handleInputChange('settings.allowMemberInvites', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="requireApproval" className="text-sm">Require Approval</Label>
              <Switch
                id="requireApproval"
                checked={formData.settings.requireApproval}
                onCheckedChange={(checked) => handleInputChange('settings.requireApproval', checked)}
              />
            </div>

            <div>
              <Label htmlFor="visibility" className="text-sm">Visibility</Label>
              <select
                id="visibility"
                value={formData.settings.visibility}
                onChange={(e) => handleInputChange('settings.visibility', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="invite-only">Invite Only</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {editData ? 'Update' : 'Create'} Collaboration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationModal;