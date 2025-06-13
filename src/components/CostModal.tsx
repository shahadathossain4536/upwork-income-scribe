import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; costTitle: string; costAmount: number; workDate: string }) => void;
  editData?: { date: string; title: string; amount: number, workDate: string };
  isLoading?: boolean;
  currentReportDates?: { startDate: string; endDate: string };
}

const CostModal: React.FC<CostModalProps> = ({ isOpen, onClose, onSubmit, editData, isLoading = false, currentReportDates }) => {
  const [formData, setFormData] = useState({
    date: '',
    costTitle: '',
    costAmount: 0,
    workDate: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date,
        costTitle: editData.title,
        costAmount: editData.amount,
        workDate: editData.workDate
      });
    } else {
      const defaultDate = currentReportDates?.startDate || new Date().toISOString().split('T')[0];
      setFormData({
        date: defaultDate,
        costTitle: '',
        costAmount: 0,
        workDate: defaultDate
      });
    }
  }, [editData, isOpen, currentReportDates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.costTitle || formData.costAmount <= 0 || isLoading) {
      return;
    }

    onSubmit(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      costTitle: '',
      costAmount: 0,
      workDate: ''
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
            <Label htmlFor="workDate">Work Date</Label>
            <Input
              id="workDate"
              type="date"
              value={formData.workDate}
              onChange={e => setFormData({ ...formData, workDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="date">📅 Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editData ? 'Updating...' : 'Saving...'}
                </div>
              ) : (
                <div className="flex items-center">
                  ✅ {editData ? 'Update' : 'Save'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CostModal;
