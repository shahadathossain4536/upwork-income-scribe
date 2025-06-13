import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaFilePdf, 
  FaDollarSign, 
  FaTrendingUp, 
  FaUsers, 
  FaChartBar,
  FaUserPlus,
  FaUpload,
  FaTrashAlt,
  FaMoney,
  FaReceipt,
  FaHandshake
} from 'react-icons/fa';
import { MdAttachMoney, MdTrendingDown } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import IncomeModal from '@/components/IncomeModal';
import CostModal from '@/components/CostModal';
import SummarySection from '@/components/SummarySection';
import { generatePDF } from '@/utils/pdfGenerator';
import { incomeService } from '@/lib/services/incomeService';
import { expenseService } from '@/lib/services/expenseService';
import { collaborationService, Collaboration } from '@/lib/services/collaborationService';
import { toast } from 'sonner';
import { reportsService } from '@/lib/services/reportsService';
import CSVUploadModal from '@/components/CSVUploadModal';

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

  const [isCSVUploadModalOpen, setIsCSVUploadModalOpen] = useState(false);
  const [csvUploadType, setCsvUploadType] = useState<'income' | 'expense'>('income');

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

  const handleCSVUpload = async (file: File) => {
    try {
      if (csvUploadType === 'income') {
        return await incomeService.uploadCSV(file);
      } else {
        return await expenseService.uploadCSV(file);
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      throw error;
    }
  };

  const openCSVUploadModal = (type: 'income' | 'expense') => {
    setCsvUploadType(type);
    setIsCSVUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Professional Header */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <FaChartBar className="text-white text-2xl" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Financial Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Professional income and expense tracking for {months[selectedMonth]} {selectedYear}
            </p>
          </div>

          {/* Enhanced Summary Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <SummarySection
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              netProfit={netProfit}
            />
          </div>

          {/* Professional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Total Income</p>
                    <p className="text-3xl font-bold text-emerald-900">${totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MdAttachMoney className="text-white text-2xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-900">${totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MdTrendingDown className="text-white text-2xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">Net Profit</p>
                    <p className="text-3xl font-bold text-blue-900">${netProfit.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaChartBar className="text-white text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-700 mb-1">Active Collaborations</p>
                    <p className="text-3xl font-bold text-purple-900">{activeCollaborations.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaUsers className="text-white text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Month/Year Selection */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <FaCalendarAlt className="text-blue-600" />
                Report Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingDate ? (
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="month" className="text-sm font-medium text-gray-700">Month</Label>
                    <select
                      id="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="year" className="text-sm font-medium text-gray-700">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    onClick={() => setIsEditingDate(false)}
                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {months[selectedMonth]} {selectedYear}
                  </h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingDate(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50"
                  >
                    <FaEdit className="text-sm" />
                    Edit Period
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Collaborations Section */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-3">
                  <FaHandshake className="text-purple-600" />
                  Work Together
                </CardTitle>
                <Button
                  onClick={() => window.location.href = '/collaborations'}
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3 text-purple-600 border-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  <FaUserPlus />
                  Manage Collaborations
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* ... keep existing collaboration logic the same */}
            </CardContent>
          </Card>

          {/* Enhanced Income Section */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-3">
                  <FaMoney className="text-emerald-600" />
                  Income {incomeEntries.length > 0 ? `(${incomeEntries.length})` : ''}
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    onClick={() => openCSVUploadModal('income')}
                    variant="outline"
                    className="flex items-center gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl px-6"
                    disabled={isLoading}
                  >
                    <FaUpload />
                    Upload CSV
                  </Button>
                  <Button
                    onClick={() => setIsIncomeModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6"
                    disabled={isLoading}
                  >
                    <FaPlus />
                    Add Income
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* ... keep existing income entries logic the same but update icons */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading income entries...</p>
                </div>
              ) : incomeEntries.length === 0 ? (
                <div className="text-center py-16">
                  <FaDollarSign className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                  <p className="text-xl font-medium text-gray-500 mb-2">No income entries yet</p>
                  <p className="text-gray-400">Click "Add Income" to get started tracking your earnings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomeEntries.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Date</Label>
                          <p className="font-semibold text-gray-900">{entry.date}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Job Title</Label>
                          <p className="font-semibold text-gray-900">{entry.jobTitle}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Client</Label>
                          <p className="font-semibold text-gray-900">{entry.clientName}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Amount</Label>
                          <p className="font-bold text-emerald-600 text-lg">${entry.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditIncomeModal(entry)}
                          disabled={deletingIncomeId === entry._id}
                          className="rounded-lg border-gray-300 hover:bg-gray-50"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteIncome(entry._id)}
                          disabled={deletingIncomeId === entry._id}
                          className="rounded-lg"
                        >
                          {deletingIncomeId === entry._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <FaTrashAlt />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Expenses Section */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-3">
                  <FaReceipt className="text-red-600" />
                  Expenses
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    onClick={() => openCSVUploadModal('expense')}
                    variant="outline"
                    className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50 rounded-xl px-6"
                    disabled={isLoading}
                  >
                    <FaUpload />
                    Upload CSV
                  </Button>
                  <Button
                    onClick={() => setIsCostModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 rounded-xl px-6"
                    disabled={isLoading}
                  >
                    <FaPlus />
                    Add Expense
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* ... keep existing cost entries logic the same but update styling */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading expense entries...</p>
                </div>
              ) : costEntries.length === 0 ? (
                <div className="text-center py-16">
                  <FaReceipt className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                  <p className="text-xl font-medium text-gray-500 mb-2">No expense entries yet</p>
                  <p className="text-gray-400">Click "Add Expense" to get started tracking your costs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {costEntries.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Date</Label>
                          <p className="font-semibold text-gray-900">{entry.date}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Description</Label>
                          <p className="font-semibold text-gray-900">{entry.title}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 font-medium">Amount</Label>
                          <p className="font-bold text-red-600 text-lg">${entry.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditCostModal(entry)}
                          disabled={deletingExpenseId === entry._id}
                          className="rounded-lg border-gray-300 hover:bg-gray-50"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCost(entry._id)}
                          disabled={deletingExpenseId === entry._id}
                          className="rounded-lg"
                        >
                          {deletingExpenseId === entry._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <FaTrashAlt />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced PDF Generation */}
          <div className="text-center py-8">
            <Button
              onClick={handleGeneratePDF}
              size="lg"
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <FaFilePdf className="text-xl" />
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

          {/* CSV Upload Modal */}
          <CSVUploadModal
            isOpen={isCSVUploadModalOpen}
            onClose={() => setIsCSVUploadModalOpen(false)}
            onUpload={handleCSVUpload}
            type={csvUploadType}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
