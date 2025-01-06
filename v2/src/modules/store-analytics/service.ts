import { Logger, RegionDTO } from "@medusajs/framework/types"
import { 
  CustomersAnalyticsService, 
  ReportsAnalyticsService, 
  SalesAnalyticsService, 
  ProductsAnalyticsService,
  MarketingAnalyticsService,
  OrdersAnalyticsService,
  SalesHistoryResult
} from "./services";
import { PgConnectionType } from "./utils/types";
import { OrderStatus } from "@medusajs/framework/utils";

type ModuleOptions = {
  hideProTab: boolean
}

type InjectedDependencies = {
  __pg_connection__: PgConnectionType,
  customersAnalyticsService: CustomersAnalyticsService,
  reportsAnalyticsService: ReportsAnalyticsService,
  salesAnalyticsService: SalesAnalyticsService,
  productsAnalyticsService: ProductsAnalyticsService,
  marketingAnalyticsService: MarketingAnalyticsService,
  ordersAnalyticsService: OrdersAnalyticsService
}

export default class StoreAnalyticsModuleService {

  protected options_: ModuleOptions
  protected customersAnalyticsService_: CustomersAnalyticsService;
  protected reportsAnalyticsService_: ReportsAnalyticsService;
  protected salesAnalyticsService_: SalesAnalyticsService
  protected productsAnalyticsService_: ProductsAnalyticsService
  protected marketingAnalyticsService_: MarketingAnalyticsService
  protected ordersAnalyticsService_: OrdersAnalyticsService
  protected logger_: Logger;
  protected pgConnection: PgConnectionType;

  constructor({  
      __pg_connection__, 
      customersAnalyticsService, 
      reportsAnalyticsService, 
      salesAnalyticsService, 
      productsAnalyticsService, 
      marketingAnalyticsService,
      ordersAnalyticsService 
    } : InjectedDependencies, options?: ModuleOptions) {
    this.customersAnalyticsService_ = customersAnalyticsService;
    this.reportsAnalyticsService_ = reportsAnalyticsService;
    this.salesAnalyticsService_ = salesAnalyticsService;
    this.productsAnalyticsService_ = productsAnalyticsService;
    this.marketingAnalyticsService_ = marketingAnalyticsService;
    this.ordersAnalyticsService_ = ordersAnalyticsService;
    this.pgConnection = __pg_connection__;

    this.options_ = options || {
      hideProTab: false,
    }
  }

  // Customers
  async getCustomersHistory(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.customersAnalyticsService_.getHistory(from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }
  async getCustomersNewCount(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.customersAnalyticsService_.getNewCount(from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }
  async getCustomersCumulativeHistory(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.customersAnalyticsService_.getCumulativeHistory(from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }
  async getCustomersRetentionRate(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.customersAnalyticsService_.getRetentionRate(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }
  async getCustomersRepeatRate(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.customersAnalyticsService_.getRepeatCustomerRate(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }

  // Sales
  async getOrdersSales(orderStatuses: OrderStatus[], currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.salesAnalyticsService_.getOrdersSales(orderStatuses, currencyCode, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }
  async getSalesChannelsPopularity(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.salesAnalyticsService_.getSalesChannelsPopularity(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }
  async getSalesRegionsPopularity(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.salesAnalyticsService_.getRegionsPopularity(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }
  async getSalesRefunds(currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.salesAnalyticsService_.getRefunds(currencyCode, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }

  // Products
  async getProductsTopVariantsByCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.productsAnalyticsService_.getTopVariantsByCount(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }
  async getProductsSoldCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.productsAnalyticsService_.getProductsSoldCount(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }
  async getProductsOutOfTheStockVariants(limit?: number) {
    return this.productsAnalyticsService_.getOutOfTheStockVariants(limit)
  }
  async getProductsTopReturnedVariantsByCount(from?: Date, to?: Date) {
    return this.productsAnalyticsService_.getTopReturnedVariantsByCount(from, to)
  }

  // Marketing
  async getMarketingTopDiscounts(orderStatuses: OrderStatus[], from?: Date, to?: Date) {
    return this.marketingAnalyticsService_.getTopDiscountsByCount(orderStatuses, from, to)
  }

  // Orders
  async getOrdersHistory(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.ordersAnalyticsService_.getOrdersHistory(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }
  async getOrdersCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.ordersAnalyticsService_.getOrdersCount(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }
  async getOrdersPaymentProviderPopularity(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    return this.ordersAnalyticsService_.getPaymentProviderPopularity(from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
  }

  // Report
  async generateReport(regions: RegionDTO[], orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    const ordersHistory = await this.ordersAnalyticsService_.getOrdersHistory(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
    const customerHistory = await this.customersAnalyticsService_.getHistory(from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
    const variantsCountPopularityResult = await this.productsAnalyticsService_.getTopVariantsByCount(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
    const salesAnalyticsResults: SalesHistoryResult[] = [];
    for (const region of regions) {
      salesAnalyticsResults.push(await this.salesAnalyticsService_.getOrdersSales(orderStatuses, region.currency_code, from, to, dateRangeFromCompareTo, dateRangeToCompareTo))
    }
    return this.reportsAnalyticsService_.generateReport(orderStatuses, {
      ordersHistory: ordersHistory,
      customersHistory: customerHistory,
      variantsCountPopularityResult: variantsCountPopularityResult,
      salesHistories: salesAnalyticsResults,
      regions: regions
    }, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
  }

  // Helpers
  getHideProSetting() : boolean {
    return this.options_.hideProTab;
  }
}