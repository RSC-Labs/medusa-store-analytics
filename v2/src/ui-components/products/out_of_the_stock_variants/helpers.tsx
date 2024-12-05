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
export type OutOfTheStockVariantsTableRow = {
  variantId: string,
  productId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

export function transformToVariantTopTable(result: OutOfTheStockVariantsCountResult): OutOfTheStockVariantsTableRow[] {
  const currentMap = new Map<string, OutOfTheStockVariantsTableRow>();

  result.current.forEach(currentItem => {
    currentMap.set(currentItem.variantId, {
      variantId: currentItem.variantId,
      productId: currentItem.productId,
      productTitle: currentItem.productTitle,
      variantTitle: currentItem.variantTitle,
      thumbnail: currentItem.thumbnail,
    });
  });

  return Array.from(currentMap.values());
}