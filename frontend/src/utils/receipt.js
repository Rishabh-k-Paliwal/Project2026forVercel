const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const buildFallbackReceiptNumber = (bookingId) => {
  const tail = (bookingId || '').toString().slice(-6).toUpperCase() || 'BOOKING';
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `RCT-${datePart}-${tail}`;
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const buildReceiptData = ({
  booking,
  productName = 'Product',
  customerName = '',
  customerEmail = '',
}) => {
  const bookingId = booking?._id || '';
  const storedUser = getStoredUser();
  const resolvedName =
    customerName ||
    booking?.user?.name ||
    storedUser?.name ||
    'Customer';
  const resolvedEmail =
    customerEmail ||
    booking?.user?.email ||
    storedUser?.email ||
    'N/A';

  return {
    receiptNumber: booking?.receiptNumber || buildFallbackReceiptNumber(bookingId),
    receiptGeneratedAt: booking?.receiptGeneratedAt || new Date().toISOString(),
    bookingId,
    productName,
    customerName: resolvedName,
    customerEmail: resolvedEmail,
    startDate: booking?.startDate,
    endDate: booking?.endDate,
    address: booking?.location?.address || 'N/A',
    amount: booking?.totalPrice || 0,
    paymentTransactionId: booking?.paymentTransactionId || booking?.paymentId || 'N/A',
    status: booking?.status || 'confirmed',
  };
};

const buildReceiptHtml = (receipt) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${receipt.receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    .header { margin-bottom: 20px; }
    .title { font-size: 24px; margin: 0 0 6px 0; }
    .muted { color: #555; margin: 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 14px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; gap: 20px; }
    .row:last-child { border-bottom: 0; }
    .label { color: #444; font-weight: 700; }
    .amount { font-size: 20px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">ElectroRent Payment Receipt</h1>
    <p class="muted">Receipt No: ${receipt.receiptNumber}</p>
    <p class="muted">Generated: ${formatDate(receipt.receiptGeneratedAt)}</p>
  </div>

  <div class="card">
    <div class="row"><span class="label">Booking ID</span><span>${receipt.bookingId}</span></div>
    <div class="row"><span class="label">Product</span><span>${receipt.productName}</span></div>
    <div class="row"><span class="label">Customer</span><span>${receipt.customerName}</span></div>
    <div class="row"><span class="label">Email</span><span>${receipt.customerEmail}</span></div>
    <div class="row"><span class="label">Start Date</span><span>${formatDate(receipt.startDate)}</span></div>
    <div class="row"><span class="label">End Date</span><span>${formatDate(receipt.endDate)}</span></div>
    <div class="row"><span class="label">Address</span><span>${receipt.address}</span></div>
    <div class="row"><span class="label">Payment ID</span><span>${receipt.paymentTransactionId}</span></div>
    <div class="row"><span class="label">Status</span><span>${receipt.status}</span></div>
    <div class="row"><span class="label">Total Paid</span><span class="amount">Rs ${receipt.amount}</span></div>
  </div>
</body>
</html>`;

export const printReceipt = (receipt) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Unable to open print window. Please allow popups for this site.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildReceiptHtml(receipt));
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
};
