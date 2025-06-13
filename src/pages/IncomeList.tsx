import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Download,
  Upload,
  BarChart3,
  PieChart,
  FileText,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { incomeService, Income, CreateIncomeData, UpdateIncomeData } from '@/lib/services/incomeService';
import { toast } from 'sonner';

const IncomeList = () => {
  const [incomeEntries, setIncomeEntries] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [formData, setFormData] = useState<CreateIncomeData>({
    jobTitle: '',
    clientName: '',
    amount: 0,
    category: 'Web Development',
    paymentStatus: 'pending',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    description: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories = ['Web Development', 'Design', 'Mobile Development', 'Backend Development', 'Consulting', 'Content Writing', 'SEO', 'Marketing', 'Data Analysis', 'Other'];

  // Load income data from API
  const loadIncomeData = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      const response = await incomeService.getIncome({
        startDate,
        endDate,
        limit: 100,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory as any : undefined,
        paymentStatus: selectedStatus !== 'all' ? selectedStatus as any : undefined
      });

      if (response.success && response.data) {
        setIncomeEntries(response.data || []);
      }
    } catch (error) {
      console.error('Error loading income data:', error);
      toast.error('Failed to load income data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadIncomeData();
  }, [selectedMonth, selectedYear, searchTerm, selectedCategory, selectedStatus]);

  const filteredEntries = incomeEntries;

  const totalIncome = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const paidIncome = filteredEntries.filter(entry => entry.paymentStatus === 'paid')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const pendingIncome = filteredEntries.filter(entry => entry.paymentStatus === 'pending')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Web Development': 'bg-blue-100 text-blue-800',
      'Design': 'bg-purple-100 text-purple-800',
      'Mobile Development': 'bg-green-100 text-green-800',
      'Backend Development': 'bg-orange-100 text-orange-800',
      'Consulting': 'bg-pink-100 text-pink-800',
      'Content Writing': 'bg-indigo-100 text-indigo-800',
      'SEO': 'bg-teal-100 text-teal-800',
      'Marketing': 'bg-cyan-100 text-cyan-800',
      'Data Analysis': 'bg-violet-100 text-violet-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const chartData = categories.map(category => ({
    name: category,
    value: filteredEntries.filter(entry => entry.category === category)
      .reduce((sum, entry) => sum + entry.amount, 0)
  })).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  const handleDeleteIncome = async (id: string) => {
    setDeletingIncomeId(id);
    try {
      await incomeService.deleteIncome(id);
      toast.success('Income entry deleted successfully');
      loadIncomeData(); // Reload data
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income entry');
    } finally {
      setDeletingIncomeId(null);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      jobTitle: income.jobTitle,
      clientName: income.clientName,
      amount: income.amount,
      category: income.category,
      paymentStatus: income.paymentStatus,
      date: income.date.split('T')[0],
      currency: income.currency,
      description: income.description || ''
    });
    setIsAddIncomeDialogOpen(true);
  };

  const handleSubmitIncome = async () => {
    setIsAddingIncome(true);
    try {
      if (editingIncome) {
        // Update existing income
        await incomeService.updateIncome(editingIncome._id, formData);
        toast.success('Income entry updated successfully');
      } else {
        // Create new income
        await incomeService.createIncome(formData);
        toast.success('Income entry created successfully');
      }

      setIsAddIncomeDialogOpen(false);
      setEditingIncome(null);
      setFormData({
        jobTitle: '',
        clientName: '',
        amount: 0,
        category: 'Web Development',
        paymentStatus: 'pending',
        date: new Date().toISOString().split('T')[0],
        currency: 'USD',
        description: ''
      });
      loadIncomeData(); // Reload data
    } catch (error) {
      console.error('Error saving income:', error);
      toast.error(editingIncome ? 'Failed to update income entry' : 'Failed to create income entry');
    } finally {
      setIsAddingIncome(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income Tracker</h1>
            <p className="text-gray-600 mt-1">Monitor and manage your freelance income</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingIncome(null);
                setFormData({
                  jobTitle: '',
                  clientName: '',
                  amount: 0,
                  category: 'Web Development',
                  paymentStatus: 'pending',
                  date: new Date().toISOString().split('T')[0],
                  currency: 'USD',
                  description: ''
                });
                setIsAddIncomeDialogOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Paid</p>
                  <p className="text-2xl font-bold text-blue-900">${paidIncome.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">${pendingIncome.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by job title or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {months[selectedMonth]} {selectedYear} Income
          </h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('chart')}
            >
              <PieChart className="h-4 w-4 mr-2" />
              Chart
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading income data...</span>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'table' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Income Entries ({filteredEntries.length})</span>
                <div className="text-sm text-gray-500">
                  Total: ${totalIncome.toLocaleString()}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{formatDate(entry.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{entry.jobTitle}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{entry.clientName}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                            {entry.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">
                            ${entry.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.paymentStatus)}`}>
                            {entry.paymentStatus.charAt(0).toUpperCase() + entry.paymentStatus.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 font-medium">
                            {entry.currency}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditIncome(entry)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteIncome(entry._id)}
                                disabled={deletingIncomeId === entry._id}
                              >
                                {deletingIncomeId === entry._id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredEntries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jobTitle" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add/Edit Income Dialog */}
        <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Edit Income Entry' : 'Add New Income'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="React Development"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="TechCorp Inc"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="2500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <select
                  id="paymentStatus"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({...formData, paymentStatus: e.target.value as any})}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value as any})}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Additional details..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddIncomeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleSubmitIncome}
                  disabled={isAddingIncome}
                >
                  {isAddingIncome ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingIncome ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingIncome ? 'Update Entry' : 'Add Entry'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default IncomeList;