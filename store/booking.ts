import { create } from 'zustand';
import type { Booking, Rental, Service, RentalCar, Vehicle } from '@/types';
import { mockBookings, mockRentals } from '@/lib/mock-data';

type BookingDraft = {
  service?: Service;
  vehicle?: Vehicle;
  date?: string;
  time?: string;
  notes?: string;
};

type RentalDraft = {
  car?: RentalCar;
  startDate?: string;
  endDate?: string;
};

type Store = {
  bookings: Booking[];
  rentals: Rental[];
  bookingDraft: BookingDraft;
  rentalDraft: RentalDraft;
  setBookingDraft: (draft: Partial<BookingDraft>) => void;
  clearBookingDraft: () => void;
  setRentalDraft: (draft: Partial<RentalDraft>) => void;
  clearRentalDraft: () => void;
  addBooking: (b: Booking) => void;
  addRental: (r: Rental) => void;
  cancelBooking: (id: string) => void;
};

export const useBookingStore = create<Store>((set) => ({
  bookings: mockBookings,
  rentals: mockRentals,
  bookingDraft: {},
  rentalDraft: {},
  setBookingDraft: (d) =>
    set((s) => ({ bookingDraft: { ...s.bookingDraft, ...d } })),
  clearBookingDraft: () => set({ bookingDraft: {} }),
  setRentalDraft: (d) =>
    set((s) => ({ rentalDraft: { ...s.rentalDraft, ...d } })),
  clearRentalDraft: () => set({ rentalDraft: {} }),
  addBooking: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),
  addRental: (r) => set((s) => ({ rentals: [r, ...s.rentals] })),
  cancelBooking: (id) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' } : b,
      ),
    })),
}));
