const express = require('express');
const PDFDocument = require('pdfkit');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Settings = require('../models/Settings');

const router = express.Router();

// Generate PDF Report with Company Header (Kop Surat)
const generatePDFReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, companyHeader } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!reportType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Get company header from settings if not provided
    let headerData = companyHeader;
    if (!headerData) {
      // Get company settings if available
      let companySettings = {};
      try {
        const settings = await Settings.findByUserId(userId);
        if (settings && settings.length > 0) {
          companySettings = settings.reduce((acc, setting) => {
            acc[setting.setting_key] = setting.setting_value;
            return acc;
          }, {});
        }
      } catch (error) {
        console.log('No company settings found, using defaults');
      }
      
      // Use header settings if available, otherwise fall back to company settings
      headerData = {
        companyName: companySettings.header_company_name || companySettings.company_name || 'PT. Nama Perusahaan',
        address: companySettings.header_address || companySettings.company_address || 'Alamat Perusahaan',
        phone: companySettings.header_phone || companySettings.company_phone || 'Nomor Telepon',
        email: companySettings.header_email || companySettings.company_email || 'email@perusahaan.com'
      };
    }

    // Get transaction data for the report
    const transactions = await Transaction.findByUserId(userId, {
      startDate,
      endDate
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add company header (kop surat)
    if (headerData) {
      const companyName = headerData.companyName;
      const companyAddress = headerData.address;
      const companyPhone = headerData.phone;
      const companyEmail = headerData.email;

      // Company logo area (placeholder)
      doc.rect(50, 50, 80, 80).stroke();
      doc.fontSize(10).text('LOGO', 70, 85);

      // Company info
      doc.fontSize(18).font('Helvetica-Bold')
         .text(companyName, 150, 60);
      
      doc.fontSize(10).font('Helvetica')
         .text(companyAddress, 150, 85)
         .text(`Telp: ${companyPhone}`, 150, 100)
         .text(`Email: ${companyEmail}`, 150, 115);

      // Horizontal line
      doc.moveTo(50, 150).lineTo(550, 150).stroke();
      
      // Move cursor down
      doc.y = 170;
    }

    // Report title
    doc.fontSize(16).font('Helvetica-Bold')
       .text(getReportTitle(reportType), 50, doc.y, { align: 'center' });
    
    doc.moveDown();
    
    // Report period
    if (startDate && endDate) {
      doc.fontSize(12).font('Helvetica')
         .text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 50, doc.y, { align: 'center' });
    }
    
    doc.moveDown(2);

    // Generate report content based on type
    switch (reportType) {
      case 'Laporan Laba Rugi':
        generateProfitLossReport(doc, transactions);
        break;
      case 'Laporan Neraca':
        generateBalanceSheetReport(doc, transactions);
        break;
      case 'Laporan Arus Kas':
        generateCashFlowReport(doc, transactions);
        break;
      case 'Laporan Pajak PPh Final':
        generateTaxReport(doc, transactions);
        break;
      default:
        doc.text('Jenis laporan tidak dikenali');
    }

    // Add footer
    addFooter(doc, user.name);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      message: 'Gagal menggenerate PDF', 
      error: error.message 
    });
  }
};

// Helper functions
function getReportTitle(reportType) {
  const titles = {
    'Laporan Laba Rugi': 'LAPORAN LABA RUGI',
    'Laporan Neraca': 'LAPORAN NERACA',
    'Laporan Arus Kas': 'LAPORAN ARUS KAS',
    'Laporan Pajak PPh Final': 'LAPORAN PAJAK PPh FINAL'
  };
  return titles[reportType] || 'LAPORAN KEUANGAN';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function generateProfitLossReport(doc, transactions) {
  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  doc.fontSize(12).font('Helvetica-Bold');
  
  // Income section
  doc.text('PENDAPATAN', 50, doc.y);
  doc.moveDown(0.5);
  
  doc.font('Helvetica');
  income.forEach(transaction => {
    doc.text(`${transaction.description}`, 70, doc.y);
    doc.text(formatCurrency(transaction.amount), 400, doc.y, { align: 'right' });
    doc.moveDown(0.3);
  });
  
  doc.font('Helvetica-Bold');
  doc.text('Total Pendapatan', 70, doc.y);
  doc.text(formatCurrency(totalIncome), 400, doc.y, { align: 'right' });
  doc.moveDown();
  
  // Expenses section
  doc.text('PENGELUARAN', 50, doc.y);
  doc.moveDown(0.5);
  
  doc.font('Helvetica');
  expenses.forEach(transaction => {
    doc.text(`${transaction.description}`, 70, doc.y);
    doc.text(formatCurrency(transaction.amount), 400, doc.y, { align: 'right' });
    doc.moveDown(0.3);
  });
  
  doc.font('Helvetica-Bold');
  doc.text('Total Pengeluaran', 70, doc.y);
  doc.text(formatCurrency(totalExpenses), 400, doc.y, { align: 'right' });
  doc.moveDown();
  
  // Net profit
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(14);
  doc.text('LABA BERSIH', 70, doc.y);
  doc.text(formatCurrency(netProfit), 400, doc.y, { align: 'right' });
}

function generateBalanceSheetReport(doc, transactions) {
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('ASET', 50, doc.y);
  doc.moveDown();
  
  doc.font('Helvetica');
  doc.text('Kas dan Bank', 70, doc.y);
  const totalCash = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
  }, 0);
  doc.text(formatCurrency(totalCash), 400, doc.y, { align: 'right' });
  doc.moveDown();
  
  doc.font('Helvetica-Bold');
  doc.text('Total Aset', 70, doc.y);
  doc.text(formatCurrency(totalCash), 400, doc.y, { align: 'right' });
}

function generateCashFlowReport(doc, transactions) {
  const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  let runningBalance = 0;
  
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('ARUS KAS', 50, doc.y);
  doc.moveDown();
  
  // Table headers
  doc.font('Helvetica-Bold');
  doc.text('Tanggal', 50, doc.y);
  doc.text('Deskripsi', 120, doc.y);
  doc.text('Masuk', 300, doc.y);
  doc.text('Keluar', 380, doc.y);
  doc.text('Saldo', 460, doc.y);
  doc.moveDown();
  
  doc.font('Helvetica');
  sortedTransactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount);
    runningBalance += transaction.type === 'income' ? amount : -amount;
    
    doc.text(formatDate(transaction.date), 50, doc.y);
    doc.text(transaction.description.substring(0, 20), 120, doc.y);
    
    if (transaction.type === 'income') {
      doc.text(formatCurrency(amount), 300, doc.y);
      doc.text('-', 380, doc.y);
    } else {
      doc.text('-', 300, doc.y);
      doc.text(formatCurrency(amount), 380, doc.y);
    }
    
    doc.text(formatCurrency(runningBalance), 460, doc.y);
    doc.moveDown(0.3);
  });
}

function generateTaxReport(doc, transactions) {
  const income = transactions.filter(t => t.type === 'income');
  const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const taxRate = 0.005; // 0.5% PPh Final
  const taxAmount = totalIncome * taxRate;
  
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('PERHITUNGAN PAJAK PPh FINAL', 50, doc.y);
  doc.moveDown();
  
  doc.font('Helvetica');
  doc.text('Total Omzet', 70, doc.y);
  doc.text(formatCurrency(totalIncome), 400, doc.y, { align: 'right' });
  doc.moveDown();
  
  doc.text('Tarif Pajak (0.5%)', 70, doc.y);
  doc.text('0.5%', 400, doc.y, { align: 'right' });
  doc.moveDown();
  
  doc.font('Helvetica-Bold');
  doc.text('Pajak Terutang', 70, doc.y);
  doc.text(formatCurrency(taxAmount), 400, doc.y, { align: 'right' });
}

function addFooter(doc, userName) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  doc.fontSize(10).font('Helvetica');
  
  // Move to bottom of page
  doc.y = 700;
  
  doc.text(`Dicetak pada: ${currentDate}`, 50, doc.y);
  doc.text(`Oleh: ${userName}`, 400, doc.y, { align: 'right' });
}

// Routes
router.post('/generate-pdf', protect, generatePDFReport);

module.exports = router;