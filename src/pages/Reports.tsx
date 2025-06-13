import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Filter,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { incomeService, Income } from '@/lib/services/incomeService';
import { expenseService, Expense } from '@/lib/services/expenseService';
import { collaborationService, Collaboration } from '@/lib/services/collaborationService';
import { toast } from 'sonner';
import { generatePDF } from '@/utils/pdfGenerator';

interface ReportData {
  income: Income[];
  expenses: Expense[];
  collaborations: Collaboration[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface ChartData {
  name: string;
  value: number;
  income?: number;
  expenses?: number;
  profit?: number;
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    income: [],
    expenses: [],
    collaborations: [],
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly' | 'custom'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showExpenses, setShowExpenses] = useState(true);
  const [showCollaborations, setShowCollaborations] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ];

  // Load report data
  const loadReportData = async () => {
    setIsLoading(true);
    try {
      let startDate: string;
      let endDate: string;

      switch (reportType) {
        case 'monthly':
          startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
          endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
          break;
        case 'quarterly':
          const quarterStartMonth = (selectedQuarter - 1) * 3;
          startDate = new Date(selectedYear, quarterStartMonth, 1).toISOString().split('T')[0];
          endDate = new Date(selectedYear, quarterStartMonth + 3, 0).toISOString().split('T')[0];
          break;
        case 'yearly':
          startDate = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
          endDate = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
          break;
        case 'custom':
          startDate = customStartDate;
          endDate = customEndDate;
          break;
        default:
          startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
          endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
      }

      // Load income data
      const incomeResponse = await incomeService.getIncome({
        startDate,
        endDate,
        limit: 1000
      });

      // Load expense data
      const expenseResponse = await expenseService.getExpenses({
        startDate,
        endDate,
        limit: 1000
      });

      // Load collaboration data
      const collaborationResponse = await collaborationService.getCollaborations({
        limit: 100
      });

      setReportData({
        income: incomeResponse.success ? (incomeResponse.data || []) : [],
        expenses: expenseResponse.success ? (expenseResponse.data || []) : [],
        collaborations: collaborationResponse.success ? (collaborationResponse.data || []) : [],
        dateRange: { startDate, endDate }
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadReportData();
  }, [reportType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate]);

  // Calculate summary statistics
  const totalIncome = reportData.income.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = reportData.expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

  // Income by category
  const incomeByCategory = reportData.income.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const incomeCategoryData: ChartData[] = Object.entries(incomeByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Expenses by category
  const expensesByCategory = reportData.expenses.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseCategoryData: ChartData[] = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Monthly trend data
  const monthlyData: ChartData[] = [];
  const startDate = new Date(reportData.dateRange.startDate);
  const endDate = new Date(reportData.dateRange.endDate);

  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthName = months[month];

    const monthIncome = reportData.income.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    }).reduce((sum, entry) => sum + entry.amount, 0);

    const monthExpenses = reportData.expenses.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    }).reduce((sum, entry) => sum + entry.amount, 0);

    monthlyData.push({
      name: monthName,
      income: monthIncome,
      expenses: monthExpenses,
      profit: monthIncome - monthExpenses
    });
  }

  // Payment status breakdown
  const paymentStatusData = reportData.income.reduce((acc, entry) => {
    acc[entry.paymentStatus] = (acc[entry.paymentStatus] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  const handleExportPDF = () => {
    const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`;
    generatePDF({
      title: reportTitle,
      incomeEntries: reportData.income,
      costEntries: reportData.expenses,
      dateRange: reportData.dateRange
    });
    toast.success('PDF report generated successfully');
  };

  const handleExportCSV = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Status'],
      ...reportData.income.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        'Income',
        entry.category,
        entry.jobTitle,
        entry.amount.toString(),
        entry.paymentStatus
      ]),
      ...reportData.expenses.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        'Expense',
        entry.category,
        entry.title,
        (-entry.amount).toString(),
        'Paid'
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV report exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive analytics and insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadReportData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'monthly' && (
                <>
                  <div>
                    <Label>Year</Label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Month</Label>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {reportType === 'quarterly' && (
                <>
                  <div>
                    <Label>Year</Label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quarter</Label>
                    <Select value={selectedQuarter.toString()} onValueChange={(value) => setSelectedQuarter(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {quarters.map(quarter => (
                          <SelectItem key={quarter.value} value={quarter.value.toString()}>{quarter.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {reportType === 'yearly' && (
                <div>
                  <Label>Year</Label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === 'custom' && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">${totalIncome.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {reportData.income.length} entries
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
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
                  <p className="text-xs text-red-600 mt-1">
                    {reportData.expenses.length} entries
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    ${netProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {profitMargin.toFixed(1)}% margin
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}>
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Collaborations</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.collaborations.length}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Active projects
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="expenses" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Income by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Income by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={incomeCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          {showExpenses && (
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(paymentStatusData).map(([status, amount]) => ({ name: status, value: amount }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="value" fill="#8884D8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Details */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Income Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {reportData.income.slice(0, 10).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entry.jobTitle}</p>
                      <p className="text-sm text-gray-600">{entry.clientName}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${entry.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 capitalize">{entry.paymentStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Details */}
          {showExpenses && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Expense Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {reportData.expenses.slice(0, 10).map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{entry.title}</p>
                        <p className="text-sm text-gray-600">{entry.category}</p>
                        <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">${entry.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{entry.vendor || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Collaboration Summary */}
        {showCollaborations && reportData.collaborations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.collaborations.map((collab) => (
                  <div key={collab._id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-900">{collab.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{collab.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {collab.members?.length || 0} members
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {collab.settings?.visibility || 'Private'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;