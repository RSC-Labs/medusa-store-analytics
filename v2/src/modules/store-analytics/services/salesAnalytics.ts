/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PgConnectionType } from "../utils/types"
import { calculateResolution, DateResolutionType, getTruncateFunction } from "./utils/dateTransformations"
import { OrderStatus } from "@medusajs/framework/utils"
import { getDecimalDigits } from "./utils/currency"

type OrdersRegionsPopularity = {
  date: string,
  orderCount: number,
  regionId: string
  regionName: string,
}

type OrdersRegionsPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersRegionsPopularity[]
  previous: OrdersRegionsPopularity[]
}

type OrdersSalesChannelPopularity = {
  date: string,
  orderCount: number,
  salesChannelId: string
  salesChannelName: string,
}

type OrdersSalesChannelPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersSalesChannelPopularity[]
  previous: OrdersSalesChannelPopularity[]
}

type SalesHistory = {
  date: Date,
  total: string
}

export type SalesHistoryResult = {
  currencyCode: string,
  currencyDecimalDigits: number,
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: SalesHistory[]
  previous: SalesHistory[]
}

type RefundsResult = {
  currencyCode: string,
  currencyDecimalDigits: number,
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: string
  previous: string
}

function groupPerDate(orders: any[], resolution: DateResolutionType, decimalMultiplier: number) {
  const funcTruncateDate = getTruncateFunction(resolution);
  return orders.reduce((accumulator, order) => {
    const truncatedDate = funcTruncateDate(order.created_at as Date);
    if (!accumulator[truncatedDate.toISOString()]) {
      if (resolution == DateResolutionType.Day) {
        accumulator[truncatedDate.toISOString()] = { date: new Date(new Date(order.created_at).setHours(0,0,0,0)), total: 0 };
      } else {
        accumulator[truncatedDate.toISOString()] = { date: new Date(new Date(new Date(order.created_at).setDate(1)).setHours(0,0,0,0)), total: 0 };
      }
    }
    accumulator[truncatedDate.toISOString()].total += order.totals.original_order_total * Math.pow(10, decimalMultiplier);
    return accumulator;
  }, {});
}

type InjectedDependencies = {
  __pg_connection__: PgConnectionType,
}

export default class SalesAnalyticsService {

  protected pgConnection: PgConnectionType;

  constructor({ __pg_connection__ }: InjectedDependencies) {
    this.pgConnection = __pg_connection__
  }

  async getOrdersSales(orderStatuses: OrderStatus[], currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<SalesHistoryResult> {
    let startQueryFrom: Date | undefined;
    const orderStatusesAsStrings = Object.values(orderStatuses);
    const decimalDigits = getDecimalDigits(currencyCode);
    if (orderStatusesAsStrings.length) {
      if (!dateRangeFromCompareTo) {
        if (from) {
          startQueryFrom = from;
        } else {
          const lastOrder = await this.pgConnection('order')
            .select('created_at')
            .whereIn('status', orderStatusesAsStrings)
            .andWhere('currency_code', currencyCode)
            .orderBy('created_at', 'ASC')
            .limit(1)
            .then(result => result[0]);

          if (lastOrder) {
              startQueryFrom = lastOrder.created_at;
          }
        }
      } else {
        startQueryFrom = dateRangeFromCompareTo;
      }

      const ordersWithSummary  = await this.pgConnection('order')
        .select([
          'order.*',
          'order_summary.id as summary_id',
          'order_summary.totals',
          'order_summary.created_at as summary_created_at',
          'order_summary.updated_at as summary_updated_at'
        ])
        .leftJoin('order_summary', 'order.id', 'order_summary.order_id')
        .whereIn('order.status', orderStatusesAsStrings)
        .andWhere('order.currency_code', currencyCode)
        .andWhere('order.created_at', '>=', startQueryFrom) 
        .orderBy('order.created_at', 'DESC')
        .then(result => result);

      if (startQueryFrom) {
        if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
          const previousOrders = ordersWithSummary.filter(order => order.created_at < from);
          const currentOrders = ordersWithSummary.filter(order => order.created_at >= from);
          const resolution = calculateResolution(from);
          const groupedCurrentOrders = groupPerDate(currentOrders, resolution, decimalDigits);
          const groupedPreviousOrders = groupPerDate(previousOrders, resolution, decimalDigits);
          const currentSales: SalesHistory[] = Object.values(groupedCurrentOrders);
          const previousSales: SalesHistory[] = Object.values(groupedPreviousOrders);
          return {
            dateRangeFrom: from.getTime(),
            dateRangeTo: to.getTime(),
            dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
            dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
            currencyCode: currencyCode,
            currencyDecimalDigits: decimalDigits,
            current: currentSales.sort((a, b) => a.date.getTime() - b.date.getTime()),
            previous: previousSales.sort((a, b) => a.date.getTime() - b.date.getTime())
          }
        }
        const resolution = calculateResolution(startQueryFrom);
        const currentOrders = ordersWithSummary;
        const groupedCurrentOrders = groupPerDate(currentOrders, resolution, decimalDigits);
        const currentSales: SalesHistory[] = Object.values(groupedCurrentOrders);
    
        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          currencyCode: currencyCode,
          currencyDecimalDigits: getDecimalDigits(currencyCode),
          current: currentSales.sort((a, b) => a.date.getTime() - b.date.getTime()),
          previous: []
        }
      }
    }

    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      currencyCode: currencyCode,
      currencyDecimalDigits: getDecimalDigits(currencyCode),
      current: [],
      previous: []
    }
  }
  async getSalesChannelsPopularity(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersSalesChannelPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from);
        const rawOrdersCountBySalesChannel = await this.pgConnection('order')
          .select([
            this.pgConnection.raw(`
              CASE
                WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'previous'
                ELSE 'current'
              END AS type
            `, [from, dateRangeFromCompareTo]),
            this.pgConnection.raw(`date_trunc(?, "order".created_at) AS date`, [resolution]),
            'sales_channel.id as sales_channel_id',
            'sales_channel.name as sales_channel_name',
            this.pgConnection.raw(`COUNT("order".id) AS orderCount`)
          ])
          .leftJoin('sales_channel', 'sales_channel.id', '=', 'order.sales_channel_id')
          .where('order.created_at', '>=', dateRangeFromCompareTo)
          .whereIn('order.status', orderStatusesAsStrings)
          .groupByRaw('type, date, sales_channel.id')
          .orderBy('date', 'ASC');

        const ordersCountBySalesChannel = rawOrdersCountBySalesChannel as any;

        const finalOrders: OrdersSalesChannelPopularityResult = ordersCountBySalesChannel.reduce((acc, entry) => {
          const type = entry.type;
          const date = entry.date;
          const orderCount = entry.ordercount;
          const salesChannelId = entry.sales_channel_id;
          const salesChannelName = entry.sales_channel_name;
          if (!acc[type]) {
            acc[type] = [];
          }

          acc[type].push({
            date, 
            orderCount,
            salesChannelId,
            salesChannelName
          })

          return acc;
        }, {})

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: finalOrders.current ? finalOrders.current : [],
          previous: finalOrders.previous ? finalOrders.previous : [],
        } 
      }

      let startQueryFrom: Date | undefined;
      if (!dateRangeFromCompareTo) {
        if (from) {
          startQueryFrom = from;
        } else {
          const lastOrder = await this.pgConnection('order')
            .select('created_at')
            .whereIn('status', orderStatusesAsStrings)
            .orderBy('created_at', 'ASC')
            .limit(1)
            .then(result => result[0]);

          if (lastOrder) {
              startQueryFrom = lastOrder.created_at;
          }
        }
      } else {
        startQueryFrom = dateRangeFromCompareTo;
      }
      
      if (startQueryFrom) {
        const resolution = calculateResolution(startQueryFrom);
        const rawOrdersCountBySalesChannel = await this.pgConnection('order')
          .select([
            this.pgConnection.raw(`date_trunc(?, "order".created_at) AS date`, [resolution]),
            'sales_channel.id as sales_channel_id',
            'sales_channel.name as sales_channel_name',
            this.pgConnection.raw(`COUNT("order".id) AS orderCount`)
          ])
          .leftJoin('sales_channel', 'sales_channel.id', '=', 'order.sales_channel_id')
          .where('order.created_at', '>=', startQueryFrom)
          .whereIn('order.status', orderStatusesAsStrings)
          .groupByRaw('date, sales_channel.id')
          .orderBy('date', 'ASC');

        const ordersCountBySalesChannel = rawOrdersCountBySalesChannel as any;

        const finalOrders: OrdersSalesChannelPopularity[] = ordersCountBySalesChannel.map(order => {
          return {
            date: order.date,
            orderCount: order.ordercount,
            salesChannelId: order.sales_channel_id,
            salesChannelName: order.sales_channel_name
          }
        });

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: finalOrders,
          previous: []
        } 
      }
    }

    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: [],
      previous: []
    }
  }

  async getRegionsPopularity(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersRegionsPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from);
        const rawOrdersCountByRegion = await this.pgConnection('order')
          .select([
            this.pgConnection.raw(`
              CASE
                WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'previous'
                ELSE 'current'
              END AS type
            `, [from, dateRangeFromCompareTo]),
            this.pgConnection.raw(`date_trunc(?, "order".created_at) AS date`, [resolution]),
            this.pgConnection.raw(`COUNT("order".id) AS "orderCount"`),
            this.pgConnection.raw(`"region"."id" AS "region_id"`),
            this.pgConnection.raw(`"region"."name" AS "region_name"`)
          ])
          .leftJoin('region', 'region.id', 'order.region_id')
          .where('order.created_at', '>=', dateRangeFromCompareTo)
          .whereIn('order.status', orderStatusesAsStrings)
          .groupBy(['date', 'type', 'region.id'])
          .orderBy('date', 'ASC');

        const ordersCountByRegion = rawOrdersCountByRegion as any;

        const finalOrders: OrdersRegionsPopularityResult = ordersCountByRegion.reduce((acc, entry) => {
          const type = entry.type;
          const date = entry.date;
          const orderCount = entry.orderCount;
          const regionId = entry.region_id;
          const regionName = entry.region_name;
          if (!acc[type]) {
            acc[type] = [];
          }

          acc[type].push({
            date, 
            orderCount,
            regionId,
            regionName
          })

          return acc;
        }, {})

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: finalOrders.current ? finalOrders.current : [],
          previous: finalOrders.previous ? finalOrders.previous : [],
        } 
      }

      let startQueryFrom: Date | undefined;
      if (!dateRangeFromCompareTo) {
        if (from) {
          startQueryFrom = from;
        } else {
          const lastOrder = await this.pgConnection('order')
            .select('created_at')
            .whereIn('status', orderStatusesAsStrings)
            .orderBy('created_at', 'ASC')
            .limit(1)
            .then(result => result[0]);

          if (lastOrder) {
              startQueryFrom = lastOrder.created_at;
          }
        }
      } else {
        startQueryFrom = dateRangeFromCompareTo;
      }
      
      if (startQueryFrom) {
        const resolution = calculateResolution(startQueryFrom);
        const rawOrdersCountByRegion = await this.pgConnection('order')
          .select([
            this.pgConnection.raw(`date_trunc(?, "order".created_at) AS date`, [resolution]),
            'region.id as region_id',
            'region.name as region_name',
            this.pgConnection.raw(`COUNT("order".id) AS orderCount`)
          ])
          .leftJoin('region', 'region.id', '=', 'order.region_id')
          .where('order.created_at', '>=', startQueryFrom)
          .whereIn('order.status', orderStatusesAsStrings)
          .groupByRaw('date, region.id')
          .orderBy('date', 'ASC');

        const ordersCountByRegion = rawOrdersCountByRegion as any;

        const finalOrders: OrdersRegionsPopularity[] = ordersCountByRegion.map(order => {
          return {
            date: order.date,
            orderCount: order.ordercount,
            regionId: order.region_id,
            regionName: order.region_name
          }
        });

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: finalOrders,
          previous: []
        } 
      }
    }

    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: [],
      previous: []
    }
  }
  async getRefunds(currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<RefundsResult> {
    if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
      const rawRefunds = await this.pgConnection('refund')
        .select([
          this.pgConnection.raw(`
            CASE
              WHEN "refund"."created_at" < ? AND "refund"."created_at" >= ? THEN 'previous'
              ELSE 'current'
            END AS type
          `, [from, dateRangeFromCompareTo]), 
          this.pgConnection.raw('SUM("refund"."amount") AS "sum"') 
        ])
        .innerJoin('payment', 'refund.payment_id', 'payment.id')
        .where('refund.created_at', '>=', dateRangeFromCompareTo)
        .andWhere('payment.currency_code', currencyCode)
        .groupByRaw('type')

      const refunds = rawRefunds as any;

      const currentRefunds = refunds.find(refund => refund.type == 'current');
      const previousRefunds = refunds.find(refund => refund.type == 'previous');

      return {
        currencyCode: currencyCode,
        currencyDecimalDigits: getDecimalDigits(currencyCode),
        dateRangeFrom: from.getTime(),
        dateRangeTo: to.getTime(),
        dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
        dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
        current: currentRefunds !== undefined ? currentRefunds.sum : '0',
        previous: previousRefunds !== undefined ? previousRefunds.sum : '0'
      }
    }

    let startQueryFrom: Date | undefined;
    if (!dateRangeFromCompareTo) {
      if (from) {
        startQueryFrom = from;
      } else {
        // All time
        const lastRefund = await this.pgConnection('refund')
          .select('created_at')
          .orderBy('created_at', 'ASC')
          .limit(1)
        if (lastRefund.length > 0) {
          startQueryFrom = lastRefund[0].created_at;
        }
      }
    } else {
        startQueryFrom = dateRangeFromCompareTo;
    }

    if (startQueryFrom) {
      const totalRefundAmount = await this.pgConnection('refund')
        .join('payment', 'refund.payment_id', 'payment.id')
        .sum('refund.amount AS sum')
        .where('refund.created_at', '>=', startQueryFrom)
        .andWhere('payment.currency_code', '=', currencyCode)
        .first();


      return {
        currencyCode: currencyCode,
        currencyDecimalDigits: getDecimalDigits(currencyCode),
        dateRangeFrom: startQueryFrom.getTime(),
        dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: totalRefundAmount !== undefined ? totalRefundAmount.sum : '0',
        previous: undefined
      }
    }

    return {
      currencyCode: undefined,
      currencyDecimalDigits: getDecimalDigits(currencyCode),
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: undefined,
      previous: undefined
    }
  }
}