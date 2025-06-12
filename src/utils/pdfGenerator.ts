
import jsPDF from 'jspdf';
import { IncomeEntry, CostEntry, Collaborator } from '@/pages/Index';

interface ReportData {
  month: string;
  year: number;
  incomeEntries: IncomeEntry[];
  costEntries: CostEntry[];
  collaborators: Collaborator[];
  totalIncome: number;
  totalCosts: number;
  netProfit: number;
}

export const generatePDF = (data: ReportData) => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Upwork Monthly Income Report', margin, yPosition);
  yPosition += 15;

  // Period
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${data.month} ${data.year}`, margin, yPosition);
  yPosition += 20;

  // Income Section
  checkPageBreak(30);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94); // Green color
  pdf.text('Income Entries', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');

  if (data.incomeEntries.length === 0) {
    pdf.text('No income entries recorded.', margin, yPosition);
    yPosition += 10;
  } else {
    // Income table headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date', margin, yPosition);
    pdf.text('Job Title', margin + 30, yPosition);
    pdf.text('Client Name', margin + 80, yPosition);
    pdf.text('Amount ($)', margin + 130, yPosition);
    yPosition += 8;

    // Income entries
    pdf.setFont('helvetica', 'normal');
    data.incomeEntries.forEach((entry) => {
      checkPageBreak(8);
      pdf.text(entry.date, margin, yPosition);
      pdf.text(entry.jobTitle.substring(0, 25), margin + 30, yPosition);
      pdf.text(entry.clientName.substring(0, 25), margin + 80, yPosition);
      pdf.text(entry.billAmount.toFixed(2), margin + 130, yPosition);
      yPosition += 8;
    });
  }

  yPosition += 10;

  // Cost Section
  checkPageBreak(30);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(239, 68, 68); // Red color
  pdf.text('Expense Entries', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');

  if (data.costEntries.length === 0) {
    pdf.text('No expense entries recorded.', margin, yPosition);
    yPosition += 10;
  } else {
    // Cost table headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date', margin, yPosition);
    pdf.text('Description', margin + 30, yPosition);
    pdf.text('Amount ($)', margin + 130, yPosition);
    yPosition += 8;

    // Cost entries
    pdf.setFont('helvetica', 'normal');
    data.costEntries.forEach((entry) => {
      checkPageBreak(8);
      pdf.text(entry.date, margin, yPosition);
      pdf.text(entry.costTitle.substring(0, 50), margin + 30, yPosition);
      pdf.text(entry.costAmount.toFixed(2), margin + 130, yPosition);
      yPosition += 8;
    });
  }

  yPosition += 15;

  // Financial Summary
  checkPageBreak(40);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235); // Blue color
  pdf.text('Financial Summary', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  pdf.setTextColor(34, 197, 94); // Green
  pdf.text(`Total Income: $${data.totalIncome.toFixed(2)}`, margin, yPosition);
  yPosition += 8;

  pdf.setTextColor(239, 68, 68); // Red
  pdf.text(`Total Expenses: $${data.totalCosts.toFixed(2)}`, margin, yPosition);
  yPosition += 8;

  pdf.setTextColor(data.netProfit >= 0 ? 37 : 234, data.netProfit >= 0 ? 99 : 88, data.netProfit >= 0 ? 235 : 58);
  pdf.text(`Net Profit: $${data.netProfit.toFixed(2)}`, margin, yPosition);
  yPosition += 15;

  // Collaborators Section
  if (data.collaborators.length > 0) {
    checkPageBreak(30);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(147, 51, 234); // Purple color
    pdf.text('Profit Sharing', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    data.collaborators.forEach((collaborator) => {
      if (collaborator.name) {
        checkPageBreak(8);
        const share = (data.netProfit * collaborator.sharePercentage / 100);
        pdf.text(`${collaborator.name}: ${collaborator.sharePercentage}% = $${share.toFixed(2)}`, margin, yPosition);
        yPosition += 8;
      }
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

  // Save the PDF
  pdf.save(`Upwork_Report_${data.month}_${data.year}.pdf`);
};
