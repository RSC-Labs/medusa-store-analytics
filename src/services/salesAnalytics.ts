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

import { OrderStatus, Refund, TransactionBaseService } from "@medusajs/medusa"
import { Order, OrderService } from "@medusajs/medusa"
import { DateResolutionType, calculateResolution, getTruncateFunction } from "./utils/dateTransformations"
import { In } from "typeorm"
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

type SalesHistoryResult = {
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

function groupPerDate(orders: Order[], resolution: DateResolutionType) {
  const funcTruncateDate = getTruncateFunction(resolution);
  return orders.reduce((accumulator, order) => {
    const truncatedDate = funcTruncateDate(order.created_at);
    if (!accumulator[truncatedDate.toISOString()]) {
      if (resolution == DateResolutionType.Day) {
        accumulator[truncatedDate.toISOString()] = { date: new Date(new Date(order.created_at).setHours(0,0,0,0)), total: 0 };
      } else {
        accumulator[truncatedDate.toISOString()] = { date: new Date(new Date(new Date(order.created_at).setDate(1)).setHours(0,0,0,0)), total: 0 };
      }
    }
    accumulator[truncatedDate.toISOString()].total += order.total;
    return accumulator;
  }, {});
}

export default class SalesAnalyticsService extends TransactionBaseService {

  private readonly orderService: OrderService;

  constructor(
    container,
  ) {
    super(container)
    this.orderService = container.orderService;
  }

  async getOrdersSales(orderStatuses: OrderStatus[], currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<SalesHistoryResult> {
    let startQueryFrom: Date | undefined;
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (!dateRangeFromCompareTo) {
        if (from) {
          startQueryFrom = from;
        } else {
          // All time
          const lastOrder = await this.activeManager_.getRepository(Order).find({
            skip: 0,
            take: 1,
            order: { created_at: "ASC"},
            where: { status: In(orderStatusesAsStrings) }
          })

          if (lastOrder.length > 0) {
            startQueryFrom = lastOrder[0].created_at;
          }
        }
      } else {
          startQueryFrom = dateRangeFromCompareTo;
      }

      const orders = await this.orderService.list({
        created_at: startQueryFrom ? { gte: startQueryFrom } : undefined,
        currency_code: currencyCode,
        status: In(orderStatusesAsStrings)
      }, {
        select: [
          "id",
          "total",
          "created_at",
          "updated_at"
        ],
        order: { created_at: "DESC" },
      })

      
      if (startQueryFrom) {
        if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
          const previousOrders = orders.filter(order => order.created_at < from);
          const currentOrders = orders.filter(order => order.created_at >= from);
          const resolution = calculateResolution(from);
          const groupedCurrentOrders = groupPerDate(currentOrders, resolution);
          const groupedPreviousOrders = groupPerDate(previousOrders, resolution);
          const currentSales: SalesHistory[] = Object.values(groupedCurrentOrders);
          const previousSales: SalesHistory[] = Object.values(groupedPreviousOrders);
          return {
            dateRangeFrom: from.getTime(),
            dateRangeTo: to.getTime(),
            dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
            dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
            currencyCode: currencyCode,
            currencyDecimalDigits: getDecimalDigits(currencyCode),
            current: currentSales.sort((a, b) => a.date.getTime() - b.date.getTime()),
            previous: previousSales.sort((a, b) => a.date.getTime() - b.date.getTime())
          }
        }
        const resolution = calculateResolution(startQueryFrom);
        const currentOrders = orders;
        const groupedCurrentOrders = groupPerDate(currentOrders, resolution);
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
        const query = this.activeManager_
        .getRepository(Order)
        .createQueryBuilder('order')
        .select(`
          CASE
            WHEN order.created_at < :from AND order.created_at >= :dateRangeFromCompareTo THEN 'previous'
            ELSE 'current'
          END AS type`)
        .addSelect(`date_trunc('${resolution}', order.created_at)`, 'date')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoinAndSelect('order.sales_channel', 'sales_channel')
        .where('order.created_at >= :dateRangeFromCompareTo', { dateRangeFromCompareTo })
        .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const ordersCountBySalesChannel = await query
        .groupBy('date, type, sales_channel.id')
        .orderBy('date', 'ASC')
        .setParameters({from, dateRangeFromCompareTo})
        .getRawMany()

        const finalOrders: OrdersSalesChannelPopularityResult = ordersCountBySalesChannel.reduce((acc, entry) => {
          const type = entry.type;
          const date = entry.date;
          const orderCount = entry.orderCount;
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
          // All time
          const lastOrder = await this.activeManager_.getRepository(Order).find({
            skip: 0,
            take: 1,
            order: { created_at: "ASC"},
            where: { status: In(orderStatusesAsStrings) }
          })

          if (lastOrder.length > 0) {
            startQueryFrom = lastOrder[0].created_at;
          }
        }
      } else {
          startQueryFrom = dateRangeFromCompareTo;
      }
      
      if (startQueryFrom) {
        const resolution = calculateResolution(startQueryFrom);
        const query = this.activeManager_
        .getRepository(Order)
        .createQueryBuilder('order')
        .select(`date_trunc('${resolution}', order.created_at)`, 'date')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoinAndSelect('order.sales_channel', 'sales_channel')
        .where('order.created_at >= :startQueryFrom', { startQueryFrom })
        .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const ordersCountBySalesChannel = await query
        .groupBy('date, sales_channel.id')
        .orderBy('date', 'ASC')
        .getRawMany()

        const finalOrders: OrdersSalesChannelPopularity[] = ordersCountBySalesChannel.map(order => {
          return {
            date: order.date,
            orderCount: order.orderCount,
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
        const query = this.activeManager_
        .getRepository(Order)
        .createQueryBuilder('order')
        .select(`
          CASE
            WHEN order.created_at < :from AND order.created_at >= :dateRangeFromCompareTo THEN 'previous'
            ELSE 'current'
          END AS type`)
        .addSelect(`date_trunc('${resolution}', order.created_at)`, 'date')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoinAndSelect('order.region', 'region')
        .where('order.created_at >= :dateRangeFromCompareTo', { dateRangeFromCompareTo })
        .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const ordersCountByRegion = await query
        .groupBy('date, type, region.id')
        .orderBy('date', 'ASC')
        .setParameters({from, dateRangeFromCompareTo})
        .getRawMany()

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
          // All time
          const lastOrder = await this.activeManager_.getRepository(Order).find({
            skip: 0,
            take: 1,
            order: { created_at: "ASC"},
            where: { status: In(orderStatusesAsStrings) }
          })

          if (lastOrder.length > 0) {
            startQueryFrom = lastOrder[0].created_at;
          }
        }
      } else {
          startQueryFrom = dateRangeFromCompareTo;
      }
      
      if (startQueryFrom) {
        const resolution = calculateResolution(startQueryFrom);
        const query = this.activeManager_
        .getRepository(Order)
        .createQueryBuilder('order')
        .select(`date_trunc('${resolution}', order.created_at)`, 'date')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoinAndSelect('order.region', 'region')
        .where('order.created_at >= :startQueryFrom', { startQueryFrom })
        .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const ordersCountByRegion = await query
        .groupBy('date, region.id')
        .orderBy('date', 'ASC')
        .getRawMany()

        const finalOrders: OrdersRegionsPopularity[] = ordersCountByRegion.map(order => {
          return {
            date: order.date,
            orderCount: order.orderCount,
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
        const query = this.activeManager_.getRepository(Refund)
        .createQueryBuilder('refund')
        .select(`
          CASE
            WHEN refund.created_at < :from AND refund.created_at >= :dateRangeFromCompareTo THEN 'previous'
            ELSE 'current'
          END AS type
        `)
        .setParameters({ from, dateRangeFromCompareTo })
        .addSelect("SUM(refund.amount)", "sum")
        .innerJoin('refund.order', 'order')
        .where(`refund.created_at >= :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
        .andWhere(`order.currency_code = :currencyCode`, { currencyCode })

        const refunds: {
          type: string
          sum: string
        }[] = await query.groupBy('type').getRawMany();

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
        const lastRefund = await this.activeManager_.getRepository(Refund).find({
          skip: 0,
          take: 1,
          order: { created_at: "ASC"},
        })

        if (lastRefund.length > 0) {
          startQueryFrom = lastRefund[0].created_at;
        }
      }
    } else {
      startQueryFrom = dateRangeFromCompareTo;
    }

    if (startQueryFrom) {
      const query = this.activeManager_.getRepository(Refund)
        .createQueryBuilder('refund')
        .select("SUM(refund.amount)", "sum")
        .innerJoin('refund.order', 'order')
        .where(`refund.created_at >= :startQueryFrom`, { startQueryFrom })
        .andWhere(`order.currency_code = :currencyCode`, { currencyCode })

      const refunds = await query.getRawOne();

      return {
        currencyCode: currencyCode,
        currencyDecimalDigits: getDecimalDigits(currencyCode),
        dateRangeFrom: startQueryFrom.getTime(),
        dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: refunds !== undefined ? refunds.sum : '0',
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

  // async getRefundsHistory(currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<RefundsHistoryResult> {
  //   if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
  //       const resolution = calculateResolution(from);
  //       const query = this.activeManager_.getRepository(Refund)
  //       .createQueryBuilder('refund')
  //       .select(`
  //         CASE
  //           WHEN refund.created_at < :from AND refund.created_at >= :dateRangeFromCompareTo THEN 'previous'
  //           ELSE 'current'
  //         END AS type,
  //         date_trunc('${resolution}', refund.created_at) AS date
  //       `)
  //       .setParameters({ from, dateRangeFromCompareTo })
  //       .addSelect("SUM(refund.amount)", "sum")
  //       .innerJoin('refund.order', 'order')
  //       .where(`refund.created_at >= :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
  //       .andWhere(`order.currency_code = :currencyCode`, { currencyCode })

  //       const refunds = await query
  //       .groupBy('type, date')
  //       .orderBy('date, type',  'ASC')
  //       .getRawMany();

  //       console.log(refunds);

  //       return {
  //         currencyCode: undefined,
  //         dateRangeFrom: undefined,
  //         dateRangeTo: undefined,
  //         dateRangeFromCompareTo: undefined,
  //         dateRangeToCompareTo: undefined,
  //         current: undefined,
  //         previous: undefined
  //       }
  //   }

    // let startQueryFrom: Date | undefined;
    // if (!dateRangeFromCompareTo) {
    //   if (from) {
    //     startQueryFrom = from;
    //   } else {
    //     // All time
    //     const lastCustomer = await this.activeManager_.getRepository(Customer).find({
    //       skip: 0,
    //       take: 1,
    //       order: { created_at: "ASC"},
    //     })

    //     if (lastCustomer.length > 0) {
    //       startQueryFrom = lastCustomer[0].created_at;
    //     }
    //   }
    // } else {
    //   startQueryFrom = dateRangeFromCompareTo;
    // }

    // if (startQueryFrom) {
    //   const resolution = calculateResolution(startQueryFrom);
    //   const allCustomers = await this.activeManager_.getRepository(Customer)
    //     .createQueryBuilder('customer')
    //     .select(`date_trunc('${resolution}', customer.created_at) AS date`)
    //     .addSelect(
    //       `SUM(COUNT(*)) OVER (ORDER BY date_trunc('${resolution}', customer.created_at) ASC) AS cumulative_count`
    //     )
    //     .setParameters({ startQueryFrom: startQueryFrom })
    //     .groupBy('date')
    //     .orderBy('date', 'ASC')
    //     .getRawMany();

    //   const finalCustomers: CustomersHistoryResult = {
    //       dateRangeFrom: startQueryFrom.getTime(),
    //       dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
    //       dateRangeFromCompareTo: undefined,
    //       dateRangeToCompareTo: undefined,
    //       current: allCustomers.map(currentCustomer => {
    //         return {
    //           date: currentCustomer.date,
    //           customerCount: currentCustomer.cumulative_count.toString()
    //         }
    //       }),
    //       previous: []
    //     }

    //     return finalCustomers;
    // }

  //   return {
  //     currencyCode: undefined,
  //     dateRangeFrom: undefined,
  //     dateRangeTo: undefined,
  //     dateRangeFromCompareTo: undefined,
  //     dateRangeToCompareTo: undefined,
  //     current: undefined,
  //     previous: undefined
  //   }
  // }
}