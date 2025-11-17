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

import { OrderStatus, TransactionBaseService } from "@medusajs/medusa"
import { Order, OrderService } from "@medusajs/medusa"
import { calculateResolution, getQueryEndDate } from "./utils/dateTransformations"
import { OrdersHistoryResult } from "./utils/types"
import { In } from "typeorm"

export type OrdersCounts = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: number,
  previous: number
}

type InitialOrdersPaymentProvider = {
  orderCount: string,
  paymentProviderId: string
}

type OrdersPaymentProvider = {
  orderCount: string,
  percentage: string,
  paymentProviderId: string
}

type OrdersPaymentProviderPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersPaymentProvider[]
  previous: OrdersPaymentProvider[]
}


export default class OrdersAnalyticsService extends TransactionBaseService {

  private readonly orderService: OrderService;

  constructor(
    container,
  ) {
    super(container)
    this.orderService = container.orderService;
  }

  async getOrdersHistory(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersHistoryResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from, to);
        const query = this.activeManager_.getRepository(Order)
        .createQueryBuilder('order')
        .select(`
          CASE
            WHEN order.created_at < :from AND order.created_at >= :dateRangeFromCompareTo THEN 'previous'
            ELSE 'current'
          END AS type,
          date_trunc('${resolution}', order.created_at) AS date
        `)
        .setParameters({ from, dateRangeFromCompareTo })
        .addSelect('COUNT(order.id)', 'orderCount')
        .where(`created_at >= :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
        .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });
  
        const orders = await query
        .groupBy('type, date')
        .orderBy('date, type',  'ASC')
        .getRawMany();
  
        const finalOrders: OrdersHistoryResult = orders.reduce((acc, entry) => {
          const type = entry.type;
          const date = entry.date;
          const orderCount = entry.orderCount;
          if (!acc[type]) {
            acc[type] = [];
          }
  
          acc[type].push({date, orderCount})
  
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
        const endQuery = getQueryEndDate(to);
        const resolution = calculateResolution(startQueryFrom, endQuery);
        const query = this.activeManager_.getRepository(Order)
          .createQueryBuilder('order')
          .select(`date_trunc('${resolution}', order.created_at)`, 'date')
          .addSelect('COUNT(order.id)', 'orderCount')
          .where(`created_at >= :startQueryFrom`, { startQueryFrom })
          .andWhere(`created_at <= :endQuery`, { endQuery })
          .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });
  
        const orders = await query
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany();
  
        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: orders,
          previous: []
        };
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

  async getOrdersCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersCounts> {
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
      const endQuery = getQueryEndDate(to);
      const orders = await this.orderService.listAndCount({
        created_at: startQueryFrom ? { gte: startQueryFrom, lte: endQuery } : undefined,
        status: In(orderStatusesAsStrings)
      }, {
        select: [
          "id",
          "created_at",
          "updated_at"
        ],
        order: { created_at: "DESC" },
      })

      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const previousOrders = orders[0].filter(order => order.created_at < from);
        const currentOrders = orders[0].filter(order => order.created_at >= from);
        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: currentOrders.length,
          previous: previousOrders.length
        }
      }
      
      if (startQueryFrom) {
        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: orders[1],
          previous: 0
        }
      }
    }
    
    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: 0,
      previous: 0
    }
  }

  async getPaymentProviderPopularity(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersPaymentProviderPopularityResult> {
    function calculateSumAndPercentageOfResults(results: InitialOrdersPaymentProvider[]): OrdersPaymentProvider[] {

        const orderMap: Map<string, string> = new Map();

        let allSum: number = 0;

        results.forEach(result => {
            const { orderCount, paymentProviderId } = result;
            if (orderMap.has(paymentProviderId)) {
              const sum: number = parseInt(orderMap.get(paymentProviderId)) + parseInt(orderCount);
              orderMap.set(paymentProviderId, sum.toFixed());
            } else {
              orderMap.set(paymentProviderId, orderCount);
            }
        });

        const newArray: OrdersPaymentProvider[] =  [];
        orderMap.forEach(( value: string) => {
          allSum += parseInt(value);
        })

        orderMap.forEach(( value: string, key: string) => {
          newArray.push({
            orderCount: value,
            percentage: (parseInt(value) * 100 / allSum).toFixed(2),
            paymentProviderId: key
          })
        })

        return newArray;
    }
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
      .leftJoinAndSelect('order.payments', 'payments')
      .where('order.created_at >= :dateRangeFromCompareTo', { dateRangeFromCompareTo })
      
      const ordersCountWithPayments = await query
      .groupBy('date, type, payments.id')
      .orderBy('date', 'ASC')
      .setParameters({from, dateRangeFromCompareTo})
      .getRawMany()

      const finalOrders: OrdersPaymentProviderPopularityResult = ordersCountWithPayments.reduce((acc, entry) => {
        const type = entry.type;
        const orderCount = entry.orderCount;
        const paymentProviderId = entry.payments_provider_id;
        if (!acc[type]) {
          acc[type] = [];
        }

        acc[type].push({
          orderCount,
          paymentProviderId,
        })

        return acc;
      }, {})

      const finalOrdersCurrentGrouped = calculateSumAndPercentageOfResults(finalOrders.current ? finalOrders.current : []);
      const finalOrdersPreviousGrouped = calculateSumAndPercentageOfResults(finalOrders.previous ? finalOrders.previous : []);

      return {
        dateRangeFrom: from.getTime(),
        dateRangeTo: to.getTime(),
        dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
        dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
        current: finalOrdersCurrentGrouped ? finalOrdersCurrentGrouped : [],
        previous: finalOrdersPreviousGrouped ? finalOrdersPreviousGrouped : [],
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
        })

        if (lastOrder.length > 0) {
          startQueryFrom = lastOrder[0].created_at;
        }
      }
    } else {
        startQueryFrom = dateRangeFromCompareTo;
    }
    
    if (startQueryFrom) {
      const endQuery = getQueryEndDate(to);
      const resolution = calculateResolution(startQueryFrom, endQuery);
      const query = this.activeManager_
      .getRepository(Order)
      .createQueryBuilder('order')
      .select(`date_trunc('${resolution}', order.created_at)`, 'date')
      .addSelect('COUNT(order.id)', 'orderCount')
      .leftJoinAndSelect('order.payments', 'payments')
      .where('order.created_at >= :startQueryFrom', { startQueryFrom })
      .andWhere('order.created_at <= :endQuery', { endQuery })

      const ordersCountWithPayments = await query
      .groupBy('date, payments.id')
      .orderBy('date', 'ASC')
      .getRawMany()

      const initialOrders: InitialOrdersPaymentProvider[] = ordersCountWithPayments.map(order => {
        return {
          orderCount: order.orderCount,
          paymentProviderId: order.payments_provider_id,
        }
      });

      const finalOrdersGrouped = calculateSumAndPercentageOfResults(initialOrders ? initialOrders : []);

      return {
        dateRangeFrom: startQueryFrom.getTime(),
        dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: finalOrdersGrouped,
        previous: []
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
}