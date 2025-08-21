
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager'
};

export const TimeRecordStatus = {
  ON_TIME: 'on_time',
  LATE: 'late',
  EARLY: 'early',
  ADJUSTED: 'adjusted'
};

export const StatusColors = {
  [TimeRecordStatus.ON_TIME]: '#22c55e',
  [TimeRecordStatus.LATE]: '#ef4444',
  [TimeRecordStatus.EARLY]: '#3b82f6',
  [TimeRecordStatus.ADJUSTED]: '#f59e0b'
};

export const mockTimeRecords = [];

export const mockUsers = [];
