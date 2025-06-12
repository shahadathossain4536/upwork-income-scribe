
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CostEntry } from '@/pages/Index';

interface CostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CostEntry, 'id' | 'isEditing'>) => void;
  editData?: CostEntry;
}

const CostModal: React.FC<CostModalProps> = ({ isOpen, onClose, onSubmit, editData }) => {
  const [formData, setFormData] = useState({
    date: '',
    costTitle: '',
    costAmount: 0
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date,
        costTitle: editData.costTitle,
        costAmount: editData.costAmount
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        costTitle: '',
        costAmount: 0
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.costTitle || formData.costAmount <= 0) {
      return;
    }
    
    onSubmit(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      costTitle: '',
      costAmount: 0
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            {editData ? 'Edit Expense Entry' : 'Add Expense Entry'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">📅 Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="costTitle">🧾 Cost Title</Label>
            <Input
              id="costTitle"
              placeholder="e.g., Software Subscription"
              value={formData.costTitle}
              onChange={(e) => handleInputChange('costTitle', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="costAmount">💸 Cost Amount</Label>
            <Input
              id="costAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.costAmount || ''}
              onChange={(e) => handleInputChange('costAmount', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
              ✅ {editData ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CostModal;
