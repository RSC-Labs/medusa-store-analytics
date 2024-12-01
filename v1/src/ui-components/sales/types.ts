export type SalesHistory = {
  total: string,
  date: string
}

export type SalesHistoryResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    currencyCode: string,
    currencyDecimalDigits: number,
    current: SalesHistory[];
    previous: SalesHistory[];
  }
}

export type RefundsResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    currencyCode: string
    currencyDecimalDigits: number,
    current: string;
    previous: string;
  }
}