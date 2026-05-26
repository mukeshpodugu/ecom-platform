const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF invoice for a given order
 * @param {Object} order - Order document
 * @param {String} outputPath - Path to save the generated PDF
 * @returns {Promise} Resolves when PDF writing completes
 */
const generateInvoice = (order, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // 1. Header & Brand Info
      doc
        .fillColor('#0f172a') // Slate 900
        .fontSize(20)
        .text('APEX E-COMMERCE', 50, 50, { bold: true })
        .fontSize(10)
        .text('123 Innovation Way, Tech Hub', 50, 75)
        .text('support@apex-ecom.com | +1 (555) 0199', 50, 90);

      doc
        .fontSize(24)
        .fillColor('#2563eb') // Blue 600
        .text('INVOICE', 400, 50, { align: 'right' });

      doc
        .fontSize(10)
        .fillColor('#475569') // Slate 600
        .text(`Invoice No: INV-${order._id.toString().substring(0, 8).toUpperCase()}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 95, { align: 'right' })
        .text(`Status: ${order.paymentStatus.toUpperCase()}`, 400, 110, { align: 'right' });

      // Horizontal line
      doc
        .moveTo(50, 135)
        .lineTo(550, 135)
        .strokeColor('#cbd5e1') // Slate 300
        .stroke();

      // 2. Billing & Shipping Addresses
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .text('Billed To:', 50, 150, { bold: true })
        .fontSize(10)
        .fillColor('#475569')
        .text(order.user && order.user.name ? order.user.name : 'Valued Customer', 50, 165)
        .text(order.user && order.user.email ? order.user.email : '', 50, 180);

      const address = order.shippingAddress || {};
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .text('Shipped To:', 300, 150, { bold: true })
        .fontSize(10)
        .fillColor('#475569')
        .text(`${address.street || 'Address Street'}`, 300, 165)
        .text(`${address.city || 'City'}, ${address.state || 'State'} ${address.zip || 'Zip'}`, 300, 180)
        .text(`${address.country || 'Country'}`, 300, 195);

      // Horizontal line
      doc
        .moveTo(50, 220)
        .lineTo(550, 220)
        .strokeColor('#cbd5e1')
        .stroke();

      // 3. Table Header
      let y = 240;
      doc
        .fillColor('#0f172a')
        .fontSize(10)
        .text('Description', 50, y, { bold: true })
        .text('Qty', 300, y, { bold: true, align: 'center' })
        .text('Unit Price', 380, y, { bold: true, align: 'right' })
        .text('Amount', 480, y, { bold: true, align: 'right' });

      doc
        .moveTo(50, y + 15)
        .lineTo(550, y + 15)
        .strokeColor('#e2e8f0')
        .stroke();

      y += 25;

      // 4. Line Items
      (order.items || []).forEach(item => {
        const prodName = item.product && item.product.name ? item.product.name : 'E-commerce Item';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const total = qty * price;

        doc
          .fillColor('#475569')
          .fontSize(9)
          .text(prodName, 50, y, { width: 230, lineBreak: false })
          .text(qty.toString(), 300, y, { align: 'center' })
          .text(`$${price.toFixed(2)}`, 380, y, { align: 'right' })
          .text(`$${total.toFixed(2)}`, 480, y, { align: 'right' });

        y += 20;
      });

      // Horizontal line
      doc
        .moveTo(50, y + 5)
        .lineTo(550, y + 5)
        .strokeColor('#cbd5e1')
        .stroke();

      y += 20;

      // 5. Order Totals
      const subtotal = order.totalAmount || 0;
      const discount = order.discountAmount || 0;
      const tax = order.taxAmount || 0;
      const shipping = order.shippingAmount || 0;
      const grandTotal = order.grandTotal || 0;

      doc
        .fillColor('#475569')
        .fontSize(9)
        .text('Subtotal:', 380, y, { align: 'right' })
        .text(`$${subtotal.toFixed(2)}`, 480, y, { align: 'right' });

      y += 15;
      if (discount > 0) {
        doc
          .text('Discount:', 380, y, { align: 'right' })
          .text(`-$${discount.toFixed(2)}`, 480, y, { align: 'right' });
        y += 15;
      }
      doc
        .text('Tax (18%):', 380, y, { align: 'right' })
        .text(`$${tax.toFixed(2)}`, 480, y, { align: 'right' });
      
      y += 15;
      doc
        .text('Shipping:', 380, y, { align: 'right' })
        .text(`$${shipping.toFixed(2)}`, 480, y, { align: 'right' });

      y += 20;
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .text('Grand Total:', 360, y, { align: 'right', bold: true })
        .text(`$${grandTotal.toFixed(2)}`, 480, y, { align: 'right', bold: true });

      // 6. Footer Notes
      doc
        .fillColor('#94a3b8')
        .fontSize(8)
        .text('Thank you for shopping with Apex! If you have any questions regarding this invoice, contact our support team.', 50, 700, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
