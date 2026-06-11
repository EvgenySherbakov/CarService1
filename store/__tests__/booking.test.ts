import { useBookingStore } from '../booking';
import { mockBookings, mockRentalCars, mockRentals, mockServices } from '@/lib/mock-data';
import type { Booking, Rental } from '@/types';

describe('useBookingStore', () => {
  beforeEach(() => {
    useBookingStore.setState({
      bookings: mockBookings,
      rentals: mockRentals,
      bookingDraft: {},
      rentalDraft: {},
    });
  });

  it('initialises with the mock catalogue', () => {
    const s = useBookingStore.getState();
    expect(s.bookings).toEqual(mockBookings);
    expect(s.rentals).toEqual(mockRentals);
    expect(s.bookingDraft).toEqual({});
    expect(s.rentalDraft).toEqual({});
  });

  it('addBooking puts the new entry at the head', () => {
    const next: Booking = {
      id: 'b_new',
      clientId: 'demo',
      serviceId: mockServices[0].id,
      service: mockServices[0],
      scheduledAt: new Date().toISOString(),
      status: 'pending',
      totalAmount: 100,
      createdAt: new Date().toISOString(),
    };
    useBookingStore.getState().addBooking(next);
    const bookings = useBookingStore.getState().bookings;
    expect(bookings).toHaveLength(mockBookings.length + 1);
    expect(bookings[0].id).toBe('b_new');
  });

  it('cancelBooking sets the status to cancelled and leaves others alone', () => {
    const target = mockBookings[0].id;
    useBookingStore.getState().cancelBooking(target);
    const updated = useBookingStore
      .getState()
      .bookings.find((b) => b.id === target);
    expect(updated?.status).toBe('cancelled');
    // other booking untouched
    if (mockBookings.length > 1) {
      const other = useBookingStore
        .getState()
        .bookings.find((b) => b.id === mockBookings[1].id);
      expect(other?.status).toBe(mockBookings[1].status);
    }
  });

  it('addRental prepends a rental', () => {
    const next: Rental = {
      id: 'r_new',
      clientId: 'demo',
      carId: mockRentalCars[0].id,
      car: mockRentalCars[0],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'pending',
      totalAmount: 500,
      depositAmount: 200,
      createdAt: new Date().toISOString(),
    };
    useBookingStore.getState().addRental(next);
    const rentals = useBookingStore.getState().rentals;
    expect(rentals[0].id).toBe('r_new');
    expect(rentals).toHaveLength(mockRentals.length + 1);
  });

  it('setBookingDraft merges partial updates', () => {
    useBookingStore.getState().setBookingDraft({ date: '2026-12-31' });
    useBookingStore.getState().setBookingDraft({ time: '10:00' });
    const d = useBookingStore.getState().bookingDraft;
    expect(d.date).toBe('2026-12-31');
    expect(d.time).toBe('10:00');
  });

  it('clearBookingDraft wipes the draft', () => {
    useBookingStore.getState().setBookingDraft({ date: '2026-12-31', time: '10:00' });
    useBookingStore.getState().clearBookingDraft();
    expect(useBookingStore.getState().bookingDraft).toEqual({});
  });

  it('setRentalDraft / clearRentalDraft work analogously', () => {
    useBookingStore.getState().setRentalDraft({ startDate: '2026-12-31' });
    expect(useBookingStore.getState().rentalDraft.startDate).toBe('2026-12-31');
    useBookingStore.getState().clearRentalDraft();
    expect(useBookingStore.getState().rentalDraft).toEqual({});
  });
});
