
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummarySectionProps {
  totalIncome: number;
  totalCosts: number;
  netProfit: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({ totalIncome, totalCosts, netProfit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-600">📊 Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${totalIncome.toFixed(2)}
            </div>
            <div className="text-sm text-green-700 font-medium">
              ✅ Total Income
            </div>
          </div>
          
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">
              ${totalCosts.toFixed(2)}
            </div>
            <div className="text-sm text-red-700 font-medium">
              ❌ Total Expenses
            </div>
          </div>
          
          <div className={`text-center p-6 rounded-lg border ${
            netProfit >= 0 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              ${netProfit.toFixed(2)}
            </div>
            <div className={`text-sm font-medium ${
              netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              📈 Net Profit
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarySection;
