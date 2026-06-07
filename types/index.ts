export type UserRole = 'client' | 'admin';

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  preferredLanguage?: 'en' | 'ru' | 'pt-BR';
  createdAt: string;
};

export type Vehicle = {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  plate?: string;
  vin?: string;
  color?: string;
};

export type ServiceType = 'repair' | 'wash';

export type ServiceCategory = {
  id: string;
  type: ServiceType;
  slug: string;
  nameKey: string;
  icon: string;
};

export type Service = {
  id: string;
  categoryId: string;
  type: ServiceType;
  name: string;
  description: string;
  priceFrom: number;
  durationMinutes: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
};

export type RentalCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  transmission: 'automatic' | 'manual';
  fuel: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  pricePerDay: number;
  depositAmount: number;
  imageUrl: string;
  available: boolean;
  rating: number;
  reviewsCount: number;
};

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type Booking = {
  id: string;
  clientId: string;
  serviceId: string;
  service?: Service;
  vehicleId?: string;
  scheduledAt: string;
  status: BookingStatus;
  notes?: string;
  totalAmount: number;
  paymentId?: string;
  createdAt: string;
};

export type Rental = {
  id: string;
  clientId: string;
  carId: string;
  car?: RentalCar;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  paymentId?: string;
  createdAt: string;
};

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type Payment = {
  id: string;
  clientId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  bookingId?: string;
  rentalId?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  clientId: string;
  clientName: string;
  serviceId?: string;
  carId?: string;
  rating: number;
  comment: string;
  createdAt: string;
};
