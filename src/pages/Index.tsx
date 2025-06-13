import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Plus, Edit, FileText, DollarSign, TrendingUp, Users, BarChart3, UserPlus } from 'lucide-react';
import IncomeModal from '@/components/IncomeModal';
import CostModal from '@/components/CostModal';
import SummarySection from '@/components/SummarySection';
import { generatePDF } from '@/utils/pdfGenerator';
import { incomeService } from '@/lib/services/incomeService';
import { expenseService } from '@/lib/services/expenseService';
import { collaborationService, Collaboration } from '@/lib/services/collaborationService';
import { toast } from 'sonner';
import { reportsService } from '@/lib/services/reportsService';

export interface IncomeEntry {
  _id: string;
  date: string;
  jobTitle: string;
  clientName: string;
  amount: number;
  category: string;
  paymentStatus: string;
}

export interface CostEntry {
  _id: string;
  date: string;
  title: string;
  amount: number;
  category: string;
  vendor?: string;
}

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('reportPeriod');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.month ?? new Date().getMonth();
      } catch {
        return new Date().getMonth();
      }
    }
    return new Date().getMonth();
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('reportPeriod');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.year ?? new Date().getFullYear();
      } catch {
        return new Date().getFullYear();
      }
    }
    return new Date().getFullYear();
  });

  const [isEditingDate, setIsEditingDate] = useState(false);

  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  console.log('incomeEntries', incomeEntries);
  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Add state for totals from backend
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    localStorage.setItem('reportPeriod', JSON.stringify({
      month: selectedMonth,
      year: selectedYear
    }));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getCurrentReportDates();

      // Load dashboard data from backend
      const dashboardResponse = await reportsService.getDashboard({
        startDate,
        endDate
      });

      if (dashboardResponse.success && dashboardResponse.data) {
        // Use the aggregated data from backend
        const { overview } = dashboardResponse.data;
        setTotalIncome(overview.totalIncome);
        setTotalExpenses(overview.totalExpenses);
        setNetProfit(overview.netProfit);
      }

      console.log('dashboardResponse', dashboardResponse);

      // Load income entries for the list
      const incomeResponse = await incomeService.getIncome({
        startDate,
        endDate,
        limit: 100
      });

      if (incomeResponse.success && incomeResponse.data) {
        setIncomeEntries(incomeResponse.data || []);
      }
      console.log('incomeResponse', incomeResponse.data);

      // Load expense entries for the list
      const expenseResponse = await expenseService.getExpenses({
        startDate,
        endDate,
        limit: 100
      });

      if (expenseResponse.success && expenseResponse.data) {
        setCostEntries(expenseResponse.data || []);
      }

      // Load collaborations
      const collaborationResponse = await collaborationService.getCollaborations({
        limit: 50
      });

      if (collaborationResponse.success && collaborationResponse.data) {
        setCollaborations(collaborationResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIncome = async (incomeData: { date: string; jobTitle: string; clientName: string; billAmount: number; workDate: string }) => {
    setIsAddingIncome(true);
    try {
      const response = await incomeService.createIncome({
        jobTitle: incomeData.jobTitle,
        clientName: incomeData.clientName,
        amount: incomeData.billAmount,
        category: 'Web Development',
        paymentStatus: 'paid',
        date: incomeData.date,
        currency: 'USD',
        workDate: incomeData.workDate
      });

      if (response.success && response.data) {
        toast.success('Income entry added successfully');
        await loadData();
        setIsIncomeModalOpen(false);
      } else {
        toast.error('Failed to add income entry');
      }
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income entry');
    } finally {
      setIsAddingIncome(false);
    }
  };

  const handleEditIncome = async (id: string, incomeData: { date: string; jobTitle: string; clientName: string; billAmount: number; workDate: string }) => {
    setIsLoading(true);
    try {
      const response = await incomeService.updateIncome(id, {
        jobTitle: incomeData.jobTitle,
        clientName: incomeData.clientName,
        amount: incomeData.billAmount,
        date: incomeData.date,
        workDate: incomeData.workDate
      });

      if (response.success && response.data) {
        toast.success('Income entry updated successfully');
        await loadData();
        setEditingIncomeId(null);
        setIsIncomeModalOpen(false);
      } else {
        toast.error('Failed to update income entry');
      }
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Failed to update income entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    setDeletingIncomeId(id);
    try {
      const response = await incomeService.deleteIncome(id);
      if (response.success) {
        toast.success('Income entry deleted successfully');
        await loadData();
      } else {
        toast.error('Failed to delete income entry');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income entry');
    } finally {
      setDeletingIncomeId(null);
    }
  };

  const handleAddCost = async (costData: { date: string; costTitle: string; costAmount: number, workDate: string }) => {
    setIsAddingExpense(true);
    try {
      const response = await expenseService.createExpense({
        title: costData.costTitle,
        amount: costData.costAmount,
        category: 'Other',
        date: costData.date,
        currency: 'USD',
        isTaxDeductible: true,
        workDate: costData.workDate
      });

      if (response.success && response.data) {
        toast.success('Expense entry added successfully');
        await loadData();
        setIsCostModalOpen(false);
      } else {
        toast.error('Failed to add expense entry');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense entry');
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleEditCost = async (id: string, costData: { date: string; costTitle: string; costAmount: number, workDate: string }) => {
    setIsLoading(true);
    try {
      const response = await expenseService.updateExpense(id, {
        title: costData.costTitle,
        amount: costData.costAmount,
        date: costData.date,
        workDate: costData.workDate
      });

      if (response.success && response.data) {
        toast.success('Expense entry updated successfully');
        await loadData();
        setEditingCostId(null);
        setIsCostModalOpen(false);
      } else {
        toast.error('Failed to update expense entry');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) {
      return;
    }

    setDeletingExpenseId(id);
    try {
      const response = await expenseService.deleteExpense(id);
      if (response.success) {
        toast.success('Expense entry deleted successfully');
        await loadData();
      } else {
        toast.error('Failed to delete expense entry');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense entry');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const openEditIncomeModal = (entry: IncomeEntry) => {
    setEditingIncomeId(entry._id);
    setIsIncomeModalOpen(true);
  };

  const openEditCostModal = (entry: CostEntry) => {
    setEditingCostId(entry._id);
    setIsCostModalOpen(true);
  };

  const handleGeneratePDF = () => {
    const reportData = {
      month: months[selectedMonth],
      year: selectedYear,
      incomeEntries,
      costEntries,
      collaborations,
      totalIncome,
      totalCosts: totalExpenses,
      netProfit
    };
    generatePDF(reportData);
  };

  const activeCollaborations = collaborations.filter(collab => collab.status === 'active');

  const getCurrentReportDates = () => {
    // Format dates as YYYY-MM-DD without timezone issues
    const formatDate = (year: number, month: number, day: number) => {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    };

    const startDate = formatDate(selectedYear, selectedMonth, 1);
    const endDate = formatDate(selectedYear, selectedMonth + 1, 0);

    return { startDate, endDate };
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
 {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Financial Overview
          </h1>

        </div>
            {/* Summary Section */}
        <SummarySection
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
        />
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's your financial overview for {months[selectedMonth]} {selectedYear}
          </p>
        </div>

        {/* Quick Stats */}



        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-900">${netProfit.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Active Collaborations</p>
                  <p className="text-2xl font-bold text-purple-900">{activeCollaborations.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month/Year Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingDate ? (
              <div className="flex gap-4 items-end">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
                <Button onClick={() => setIsEditingDate(false)}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {months[selectedMonth]} {selectedYear}
                </h2>
                <Button variant="outline" onClick={() => setIsEditingDate(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Period
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Together Section - Always Show */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-purple-600">🤝 Work Together</CardTitle>
              <Button
                onClick={() => window.location.href = '/collaborations'}
                variant="outline"
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Collaborations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading collaborations...</p>
              </div>
            ) : activeCollaborations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active collaborations</h3>
                <p className="text-gray-600 mb-4">Create your first collaboration to start working together</p>
                <Button
                  onClick={() => window.location.href = '/collaborations'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Collaboration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCollaborations.map((collaboration) => (
                  <div key={collaboration._id} className="p-4 border border-border rounded-lg bg-card hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{collaboration.name}</h3>
                        {collaboration.description && (
                          <p className="text-sm text-gray-600">{collaboration.description}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm text-gray-500">Owner</Label>
                        <p className="font-medium">{collaboration.owner.firstName} {collaboration.owner.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Members ({collaboration.memberCount})</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {collaboration.members.slice(0, 3).map((member) => (
                            <span
                              key={member.user._id}
                              className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
                    </div>

                    {/* Net Profit Sharing Breakdown - Based on Net Profit */}
                    {netProfit > 0 && (
                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm text-gray-500 font-medium">💰 Net Profit Sharing Breakdown</Label>
                          <span className="text-xs text-gray-500">Based on Net Profit: ${netProfit.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {collaboration.members.map((member) => (
                            <div key={member.user._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">
                                {member.user.firstName} {member.user.lastName}
                              </span>
                              <span className="text-sm text-green-600 font-bold">
                                ${((netProfit * member.sharePercentage) / 100).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Additional Info */}
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <p className="font-medium">💡 Note:</p>
                          <p>• Profit sharing is calculated from net profit (${netProfit.toLocaleString()})</p>
                          <p>• Net profit = Total Income (${totalIncome.toLocaleString()}) - Total Expenses (${totalExpenses.toLocaleString()})</p>
                          <p>• Each member gets their share percentage of the net profit</p>
                        </div>
                      </div>
                    )}

                    {/* Show message when no net profit */}
                    {netProfit <= 0 && totalIncome > 0 && (
                      <div className="pt-4 border-t border-border">
                        <div className="p-3 bg-yellow-50 rounded text-xs text-yellow-700">
                          <p className="font-medium">⚠️ No Net Profit Available</p>
                          <p>• Total Income: ${totalIncome.toLocaleString()}</p>
                          <p>• Total Expenses: ${totalExpenses.toLocaleString()}</p>
                          <p>• Net Profit: ${netProfit.toLocaleString()}</p>
                          <p>• Profit sharing will be available when net profit is positive</p>
                        </div>
                      </div>
                    )}

                    {/* Show message when no income */}
                    {totalIncome === 0 && (
                      <div className="pt-4 border-t border-border">
                        <div className="p-3 bg-gray-50 rounded text-xs text-gray-600">
                          <p className="font-medium">📊 No Income Data</p>
                          <p>• Add income entries to see profit sharing calculations</p>
                        </div>
                      </div>
                    )}

                    {/* Financial Summary */}
                    {totalIncome > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <p className="font-medium">📊 Financial Summary:</p>
                        <p>• Total Income: ${totalIncome.toLocaleString()}</p>
                        <p>• Total Expenses: ${totalExpenses.toLocaleString()}</p>
                        <p>• Net Profit: ${netProfit.toLocaleString()}</p>
                        <p>• Profit Sharing Base: ${netProfit > 0 ? netProfit.toLocaleString() : '0'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-green-600">💰 Income</CardTitle>
              <Button
                onClick={() => setIsIncomeModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading income entries...</p>
              </div>
            ) : incomeEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-500">No income entries yet</p>
                <p className="text-gray-400">Click "Add Income" to get started tracking your earnings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomeEntries.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <Label className="text-sm text-muted-foreground">Date</Label>
                        <p className="font-medium">{entry.date}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Job Title</Label>
                        <p className="font-medium">{entry.jobTitle}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Client</Label>
                        <p className="font-medium">{entry.clientName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Amount</Label>
                        <p className="font-medium text-green-600">${entry.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditIncomeModal(entry)}
                        disabled={deletingIncomeId === entry._id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteIncome(entry._id)}
                        disabled={deletingIncomeId === entry._id}
                      >
                        {deletingIncomeId === entry._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-600">💸 Expenses</CardTitle>
              <Button
                onClick={() => setIsCostModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cost
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading expense entries...</p>
              </div>
            ) : costEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expense entries yet. Click "Add Cost" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {costEntries.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div>
                        <Label className="text-sm text-muted-foreground">Date</Label>
                        <p className="font-medium">{entry.date}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p className="font-medium">{entry.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Amount</Label>
                        <p className="font-medium text-red-600">${entry.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditCostModal(entry)}
                        disabled={deletingExpenseId === entry._id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCost(entry._id)}
                        disabled={deletingExpenseId === entry._id}
                      >
                        {deletingExpenseId === entry._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>



        {/* Generate PDF Button */}
        <div className="text-center">
          <Button
            onClick={handleGeneratePDF}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            <FileText className="h-5 w-5 mr-2" />
            Generate PDF Report
          </Button>
        </div>

        {/* Modals */}
        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => {
            setIsIncomeModalOpen(false);
            setEditingIncomeId(null);
          }}
          onSubmit={editingIncomeId ? (data) => handleEditIncome(editingIncomeId, data) : handleAddIncome}
          editData={editingIncomeId ? incomeEntries.find(e => e._id === editingIncomeId) : undefined}
          isLoading={isAddingIncome}
          currentReportDates={getCurrentReportDates()}
        />

        <CostModal
          isOpen={isCostModalOpen}
          onClose={() => {
            setIsCostModalOpen(false);
            setEditingCostId(null);
          }}
          onSubmit={editingCostId ? (data) => handleEditCost(editingCostId, data) : handleAddCost}
          editData={editingCostId ? costEntries.find(e => e._id === editingCostId) : undefined}
          isLoading={isAddingExpense}
          currentReportDates={getCurrentReportDates()}
        />
      </div>
    </div>
  );
};

export default Index;
