export type AdminOutOfTheStockVariantsStatisticsQuery = {}

export type OutOfTheStockVariantsCount = {
  productId: string,
  variantId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

export type OutOfTheStockVariantsCountResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OutOfTheStockVariantsCount[],
}

export type OutOfTheStockVariantsCountResponse = {
  analytics: OutOfTheStockVariantsCountResult
}