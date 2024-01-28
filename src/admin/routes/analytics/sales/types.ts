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
    currencyCode: string
    current: SalesHistory[];
    previous: SalesHistory[];
  }
}
