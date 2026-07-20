const { sendEmail } = require('../utils/email');

const sendOrderConfirmation = (user, order, orderItems) => {
  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Order Confirmed!</h2>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for your order. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order Number:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.orderNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Items:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${orderItems.length}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subtotal:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">£${order.subtotal.toFixed(2)}</td></tr>
          ${order.discount > 0 ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Discount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">-£${order.discount.toFixed(2)}</td></tr>` : ''}
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Shipping:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.shippingCost === 0 ? 'FREE' : `£${order.shippingCost.toFixed(2)}`}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tax:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">£${order.tax.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px;"><strong>Total:</strong></td><td style="padding: 8px; font-size: 18px; color: #F59E0B;"><strong>£${order.total.toFixed(2)}</strong></td></tr>
        </table>
        <p>We'll notify you when your order ships.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">TK Concepts - Faith. Purpose. Identity.</p>
      </div>
    `,
  }).catch(() => {});
};

const sendShippingNotification = (user, order, trackingNumber) => {
  return sendEmail({
    to: user.email,
    subject: `Your Order ${order.orderNumber} Has Shipped!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Your Order is On Its Way!</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your order <strong>${order.orderNumber}</strong> has been shipped.</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p>We'll notify you when it's delivered.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">TK Concepts - Faith. Purpose. Identity.</p>
      </div>
    `,
  }).catch(() => {});
};

module.exports = { sendOrderConfirmation, sendShippingNotification };
