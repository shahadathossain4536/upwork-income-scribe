import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePDF({
  month,
  year,
  incomeEntries,
  costEntries,
  collaborations,
  totalIncome,
  totalCosts,
  netProfit
}: any) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text('Income & Expense Report', 105, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Period: ${month} ${year}`, 105, 28, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' });

  // Summary Section
  doc.setFontSize(14);
  doc.text('Summary', 14, 50);
  doc.setFontSize(12);
  doc.text(`Total Income: $${totalIncome.toLocaleString()}`, 14, 58);
  doc.text(`Total Expenses: $${totalCosts.toLocaleString()}`, 14, 66);
  doc.text(`Net Profit: $${netProfit.toLocaleString()}`, 14, 74);

  // Income Table
  doc.setFontSize(14);
  doc.text('Income Entries', 14, 90);
  autoTable(doc, {
    startY: 95,
    head: [['Date', 'Job Title', 'Client Name', 'Amount ($)']],
    body: incomeEntries.map((entry: any) => [
      new Date(entry.date).toLocaleDateString(),
      entry.jobTitle,
      entry.clientName,
      entry.amount.toFixed(2)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [46, 204, 113] },
    styles: { fontSize: 10, cellPadding: 2 },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto'
  });

  // Expenses Table
  const finalY = (doc as any).lastAutoTable.finalY || 105;
  doc.setFontSize(14);
  doc.text('Expense Entries', 14, finalY + 14);
  autoTable(doc, {
    startY: finalY + 18,
    head: [['Date', 'Description', 'Amount ($)']],
    body: costEntries.map((entry: any) => [
      new Date(entry.date).toLocaleDateString(),
      entry.title,
      entry.amount.toFixed(2)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60] },
    styles: { fontSize: 10, cellPadding: 2 },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto'
  });

  // Work Together (Collaborations)
  const expensesTableFinalY = (doc as any).lastAutoTable.finalY || finalY + 18;
  let currentY = expensesTableFinalY + 14;
  doc.setFontSize(14);
  doc.text('Work Together (Collaborations)', 14, currentY);

  if (collaborations && collaborations.length > 0) {
    // Filter out collaborations with empty or whitespace-only names
    const validCollaborations = collaborations.filter(
      (collab: any) => collab.name && collab.name.trim() !== ''
    );

    validCollaborations.forEach((collab: any, idx: number) => {
      currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;
      // Only render the title if it is not empty
      if (collab.name && collab.name.trim() !== '') {
        doc.setFontSize(12);
        doc.text(
          `${collab.name}${collab.description ? ' - ' + collab.description : ''}`,
          16,
          currentY
        );
      }

      // Table for members
      autoTable(doc, {
        startY: currentY + 2,
        head: [['Member', 'Share (%)', 'Profit Share ($)']],
        body: collab.members.map((member: any) => [
          `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() ||
            member.user.email ||
            member.user._id,
          member.sharePercentage + '%',
          netProfit > 0
            ? ((netProfit * member.sharePercentage) / 100).toFixed(2)
            : '0.00'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182] },
        styles: { fontSize: 10, cellPadding: 2 },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto'
      });
    });
  } else {
    doc.setFontSize(12);
    doc.text(
      'No collaborations found for this period.',
      16,
      currentY + 8
    );
  }

  // Footer
  doc.setFontSize(10);
  doc.text('Generated by Upwork Income Scribe', 105, 285, { align: 'center' });

  doc.save(`Income_Expense_Report_${month}_${year}.pdf`);
}