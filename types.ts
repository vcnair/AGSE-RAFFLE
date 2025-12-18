
export interface Employee {
  id: string;
  clientName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  manager: string;
}

export interface RaffleHistoryEntry {
  winner: Employee;
  timestamp: Date;
}
