export interface PortfolioStats {
  totalCollected: number;
  expectedRent: number;
  growthPercent: number;
  occupancyRate: number;
  occupiedUnits: number;
  totalUnits: number;
  outstandingBalance: number;
}

export interface Tenant {
  id: string;
  name: string;
  initials: string;
  unit: string;
  property?: string;
  amount: number;
  daysLate?: number;
  avatar?: string;
}

export interface Payment {
  id: string;
  tenant: string;
  property?: string;
  unit?: string;
  date: string;
  time?: string;
  method?: string;
  status: "paid" | "pending" | "cleared";
  amount: number;
}

export interface Property {
  id: string;
  name: string;
  unit?: string;
  image: string;
  badge?: string;
  address?: string;
  unitsLeased?: string;
  avgRent?: string;
}

export interface LeaseInfo {
  progressPercent: number;
  startDate: string;
  endDate: string;
  monthsRemaining: number;
  securityDeposit: number;
  propertyId: string;
}

export interface RentInfo {
  amount: number;
  dueDate: string;
  currentBalance: number;
  previousPayment: number;
  previousPaymentDate: string;
  transactionId: string;
}

export interface ChartBar {
  value: number;
  label?: string;
  highlighted?: boolean;
  striped?: boolean;
  direction?: "up" | "down";
}

export type NavItem = {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  filled?: boolean;
  exact?: boolean;
};
