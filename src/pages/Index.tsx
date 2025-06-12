
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Plus, Edit, FileText } from 'lucide-react';
import IncomeModal from '@/components/IncomeModal';
import CostModal from '@/components/CostModal';
import SummarySection from '@/components/SummarySection';
import CollaboratorSection from '@/components/CollaboratorSection';
import { generatePDF } from '@/utils/pdfGenerator';

export interface IncomeEntry {
  id: string;
  date: string;
  jobTitle: string;
  clientName: string;
  billAmount: number;
  isEditing: boolean;
}

export interface CostEntry {
  id: string;
  date: string;
  costTitle: string;
  costAmount: number;
  isEditing: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  sharePercentage: number;
}

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditingDate, setIsEditingDate] = useState(false);
  
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [numberOfCollaborators, setNumberOfCollaborators] = useState(1);
  
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.billAmount, 0);
  const totalCosts = costEntries.reduce((sum, entry) => sum + entry.costAmount, 0);
  const netProfit = totalIncome - totalCosts;

  const handleAddIncome = (incomeData: Omit<IncomeEntry, 'id' | 'isEditing'>) => {
    const newEntry: IncomeEntry = {
      ...incomeData,
      id: Date.now().toString(),
      isEditing: false
    };
    setIncomeEntries(prev => [...prev, newEntry]);
    setIsIncomeModalOpen(false);
  };

  const handleEditIncome = (id: string, incomeData: Omit<IncomeEntry, 'id' | 'isEditing'>) => {
    setIncomeEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...incomeData, isEditing: false }
          : entry
      )
    );
    setEditingIncomeId(null);
    setIsIncomeModalOpen(false);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleAddCost = (costData: Omit<CostEntry, 'id' | 'isEditing'>) => {
    const newEntry: CostEntry = {
      ...costData,
      id: Date.now().toString(),
      isEditing: false
    };
    setCostEntries(prev => [...prev, newEntry]);
    setIsCostModalOpen(false);
  };

  const handleEditCost = (id: string, costData: Omit<CostEntry, 'id' | 'isEditing'>) => {
    setCostEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...costData, isEditing: false }
          : entry
      )
    );
    setEditingCostId(null);
    setIsCostModalOpen(false);
  };

  const handleDeleteCost = (id: string) => {
    setCostEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const openEditIncomeModal = (entry: IncomeEntry) => {
    setEditingIncomeId(entry.id);
    setIsIncomeModalOpen(true);
  };

  const openEditCostModal = (entry: CostEntry) => {
    setEditingCostId(entry.id);
    setIsCostModalOpen(true);
  };

  const handleGeneratePDF = () => {
    const reportData = {
      month: months[selectedMonth],
      year: selectedYear,
      incomeEntries,
      costEntries,
      collaborators,
      totalIncome,
      totalCosts,
      netProfit
    };
    generatePDF(reportData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Upwork Monthly Income Report
          </h1>
          <p className="text-muted-foreground">
            Generate professional income reports for your freelance business
          </p>
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

        {/* Income Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-green-600">💰 Income</CardTitle>
              <Button onClick={() => setIsIncomeModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {incomeEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No income entries yet. Click "Add Income" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {incomeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
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
                        <p className="font-medium text-green-600">${entry.billAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEditIncomeModal(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteIncome(entry.id)}>
                        <FileText className="h-4 w-4" />
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
              <Button onClick={() => setIsCostModalOpen(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Cost
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {costEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expense entries yet. Click "Add Cost" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {costEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div>
                        <Label className="text-sm text-muted-foreground">Date</Label>
                        <p className="font-medium">{entry.date}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p className="font-medium">{entry.costTitle}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Amount</Label>
                        <p className="font-medium text-red-600">${entry.costAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEditCostModal(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteCost(entry.id)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Section */}
        <SummarySection 
          totalIncome={totalIncome}
          totalCosts={totalCosts}
          netProfit={netProfit}
        />

        {/* Collaborator Section */}
        <CollaboratorSection 
          numberOfCollaborators={numberOfCollaborators}
          setNumberOfCollaborators={setNumberOfCollaborators}
          collaborators={collaborators}
          setCollaborators={setCollaborators}
        />

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
          editData={editingIncomeId ? incomeEntries.find(e => e.id === editingIncomeId) : undefined}
        />

        <CostModal
          isOpen={isCostModalOpen}
          onClose={() => {
            setIsCostModalOpen(false);
            setEditingCostId(null);
          }}
          onSubmit={editingCostId ? (data) => handleEditCost(editingCostId, data) : handleAddCost}
          editData={editingCostId ? costEntries.find(e => e.id === editingCostId) : undefined}
        />
      </div>
    </div>
  );
};

export default Index;
