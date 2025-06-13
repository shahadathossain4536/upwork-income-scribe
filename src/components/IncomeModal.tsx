import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; jobTitle: string; clientName: string; billAmount: number; workDate: string }) => void;
  editData?: { date: string; jobTitle: string; clientName: string; amount: number, workDate: string };
  isLoading?: boolean;
  currentReportDates?: { startDate: string; endDate: string };
}

const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onSubmit, editData, isLoading = false, currentReportDates }) => {
  const [formData, setFormData] = useState({
    date: '',
    jobTitle: '',
    clientName: '',
    billAmount: 0,
    workDate: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date,
        jobTitle: editData.jobTitle,
        clientName: editData.clientName,
        billAmount: editData.amount,
        workDate: editData.workDate
      });
    } else {
      const defaultDate = currentReportDates?.startDate || new Date().toISOString().split('T')[0];
      setFormData({
        date: defaultDate,
        jobTitle: '',
        clientName: '',
        billAmount: 0,
        workDate: defaultDate
      });
    }
  }, [editData, isOpen, currentReportDates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.clientName || formData.billAmount <= 0 || isLoading) {
      return;
    }

    onSubmit(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      jobTitle: '',
      clientName: '',
      billAmount: 0,
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
          <DialogTitle className="text-green-600">
            {editData ? 'Edit Income Entry' : 'Add Income Entry'}
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
            <Label htmlFor="jobTitle">💼 Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Website Development"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="clientName">🧑‍💼 Client Name / Company Name</Label>
            <Input
              id="clientName"
              placeholder="e.g., ABC Company"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="billAmount">💰 Bill Amount</Label>
            <Input
              id="billAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.billAmount || ''}
              onChange={(e) => handleInputChange('billAmount', parseFloat(e.target.value) || 0)}
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
              className="flex-1 bg-green-600 hover:bg-green-700"
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

export default IncomeModal;
