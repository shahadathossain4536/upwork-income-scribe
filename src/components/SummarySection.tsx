
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { MdAttachMoney, MdTrendingDown } from 'react-icons/md';

interface SummarySectionProps {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  totalIncome = 0,
  totalExpenses = 0,
  netProfit = 0
}) => {
  // Ensure all values are numbers and have fallbacks
  const income = typeof totalIncome === 'number' ? totalIncome : 0;
  const expenses = typeof totalExpenses === 'number' ? totalExpenses : 0;
  const profit = typeof netProfit === 'number' ? netProfit : 0;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-800">
          <FaChartLine className="text-blue-600" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MdAttachMoney className="text-white text-2xl" />
              </div>
            </div>
            <div className="text-4xl font-bold text-emerald-700 mb-2">
              ${income.toLocaleString()}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-semibold">
              <FaArrowUp className="text-xs" />
              Total Income
            </div>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MdTrendingDown className="text-white text-2xl" />
              </div>
            </div>
            <div className="text-4xl font-bold text-red-700 mb-2">
              ${expenses.toLocaleString()}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 font-semibold">
              <FaArrowDown className="text-xs" />
              Total Expenses
            </div>
          </div>

          <div className={`text-center p-8 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 ${
            profit >= 0
              ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
              : 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                profit >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
                <FaChartLine className="text-white text-xl" />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-2 ${
              profit >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              ${profit.toLocaleString()}
            </div>
            <div className={`flex items-center justify-center gap-2 text-sm font-semibold ${
              profit >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {profit >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
              Net Profit
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarySection;
