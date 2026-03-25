const Booking = require('../models/Booking');

const PENDING_BOOKING_EXPIRY_MINUTES = 7;
const PENDING_BOOKING_EXPIRY_MS = PENDING_BOOKING_EXPIRY_MINUTES * 60 * 1000;

const getPendingExpiryDate = (from = new Date()) =>
  new Date(from.getTime() + PENDING_BOOKING_EXPIRY_MS);

const getLegacyPendingCutoffDate = (now = new Date()) =>
  new Date(now.getTime() - PENDING_BOOKING_EXPIRY_MS);

const isPendingBookingExpired = (booking, now = new Date()) => {
  if (!booking || booking.status !== 'pending') return false;
  if (booking.pendingExpiresAt) return booking.pendingExpiresAt <= now;
  if (!booking.createdAt) return false;
  return booking.createdAt <= getLegacyPendingCutoffDate(now);
};

const autoCancelExpiredPendingBookings = async (now = new Date()) => {
  const legacyCutoff = getLegacyPendingCutoffDate(now);
  return Booking.updateMany(
    {
      status: 'pending',
      $or: [
        { pendingExpiresAt: { $lte: now } },
        { pendingExpiresAt: { $exists: false }, createdAt: { $lte: legacyCutoff } },
      ],
    },
    {
      $set: {
        status: 'cancelled',
        paymentStatus: 'failed',
      },
    }
  );
};

const getBlockingStatusQueryForDateConflict = (now = new Date()) => {
  const legacyCutoff = getLegacyPendingCutoffDate(now);
  return {
    $or: [
      { status: { $in: ['confirmed', 'active', 'completed'] } },
      {
        status: 'pending',
        $or: [
          { pendingExpiresAt: { $gt: now } },
          { pendingExpiresAt: { $exists: false }, createdAt: { $gt: legacyCutoff } },
        ],
      },
    ],
  };
};

const getAvailabilityLockStatusQuery = (now = new Date()) => {
  const legacyCutoff = getLegacyPendingCutoffDate(now);
  return {
    $or: [
      { status: { $in: ['confirmed', 'active'] } },
      {
        status: 'pending',
        $or: [
          { pendingExpiresAt: { $gt: now } },
          { pendingExpiresAt: { $exists: false }, createdAt: { $gt: legacyCutoff } },
        ],
      },
    ],
  };
};

module.exports = {
  PENDING_BOOKING_EXPIRY_MINUTES,
  getPendingExpiryDate,
  isPendingBookingExpired,
  autoCancelExpiredPendingBookings,
  getBlockingStatusQueryForDateConflict,
  getAvailabilityLockStatusQuery,
};
