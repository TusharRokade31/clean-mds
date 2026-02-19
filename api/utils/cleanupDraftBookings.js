// api/utils/cleanupDraftBookings.js
import Booking from '../models/BookingSchema.js';
import Payment from '../models/Payment.js';

export const cleanupStaleDrafts = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Find stale drafts older than 30 minutes
  const staleDrafts = await Booking.find({
    status: 'draft',
    createdAt: { $lt: thirtyMinutesAgo }
  });

  for (const booking of staleDrafts) {
    // Mark associated payment as failed
    await Payment.updateMany(
      { booking: booking._id, status: 'pending' },
      { status: 'failed', failureReason: 'Payment timeout' }
    );
    // Delete the draft
    await Booking.findByIdAndDelete(booking._id);
  }

  if (staleDrafts.length > 0) {
    console.log(`Cleaned up ${staleDrafts.length} stale draft bookings`);
  }
};