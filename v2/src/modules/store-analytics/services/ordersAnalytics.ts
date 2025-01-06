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
import { calculateResolution } from "./../utils/dateTransformations"
import { OrderStatus } from "@medusajs/framework/utils"

export type OrdersCounts = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: number,
  previous: number
}

type OrdersHistory = {
  orderCount: string,
  date: string
}

export type OrdersHistoryResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersHistory[];
  previous: OrdersHistory[];
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


type InjectedDependencies = {
  __pg_connection__: PgConnectionType,
}

export class OrdersAnalyticsService {

  protected pgConnection: PgConnectionType;

  constructor({ __pg_connection__ }: InjectedDependencies) {
    this.pgConnection = __pg_connection__
  }

  async getOrdersHistory(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersHistoryResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from);
        const orders = await this.pgConnection('order')
          .select(
            this.pgConnection.raw(`
              CASE
                WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'previous'
                WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'current'
              END AS type,
              date_trunc(?, "order".created_at) AS date
            `, [dateRangeToCompareTo, dateRangeFromCompareTo, to, from, resolution])
          )
          .count('order.id AS orderCount')
          .where('order.created_at', '>=', dateRangeFromCompareTo)
          .andWhere('order.status', 'IN', orderStatusesAsStrings)
          .groupBy(['type', 'date'])
          .orderByRaw('"date" ASC, "type" ASC');

        const finalOrders: OrdersHistoryResult = orders.reduce((acc, entry) => {
          const { type, date, orderCount } = entry;
          if (!acc[type]) {
            acc[type] = [];
          }

          acc[type].push({ date, orderCount });
          return acc;
        }, {});
  
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
        const endQuery = to ? to : new Date(Date.now());
        const resolution = calculateResolution(startQueryFrom, endQuery);
        const rawOrders = await this.pgConnection('order')
          .select(
            this.pgConnection.raw(`date_trunc(?, "order".created_at) AS date`, [resolution])
          )
          .count('order.id AS orderCount')
          .where('order.created_at', '>=', startQueryFrom)
          .andWhere('order.created_at', '<=', endQuery)
          .andWhere('order.status', 'IN', orderStatusesAsStrings)
          .groupBy('date')
          .orderBy('date', 'ASC');

        const orders = rawOrders as any;

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: endQuery.getTime(),
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
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const orders = await this.pgConnection
          .select([
            'id',
            'created_at',
            'updated_at',
            'customer_id',
          ])
          .select(
            this.pgConnection.raw(`CASE
                WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'previous'
                WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'current'
              END AS type
            `, [dateRangeToCompareTo, dateRangeFromCompareTo, to, from])
          )
          .from('order')
          .whereIn('status', orderStatusesAsStrings)
          .andWhere('order.created_at', '>=', dateRangeFromCompareTo)
          .groupBy(['type', 'id'])
          .orderBy([{ column: 'type', order: 'ASC' }])
          .then(result => result);

        const previousOrders = orders.filter(order => order.type == 'previous');
        const currentOrders = orders.filter(order => order.type == 'current');

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: currentOrders.length,
          previous: previousOrders.length
        } 
      }
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
        const endQuery = to ? to : new Date(Date.now());
        const orders = await this.pgConnection('order')
          .select([
            'id',
            'created_at',
            'updated_at',
            'customer_id',
          ])
          .whereIn('status', orderStatusesAsStrings)
          .andWhere('created_at', '>=', startQueryFrom) 
          .andWhere('created_at', '<=', endQuery)
          .orderBy('created_at', 'DESC')
          .then(result => result);


        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: orders.length,
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
      const rawOrdersCountWithPayments = await this.pgConnection('order')
        .select(
          this.pgConnection.raw(`
            CASE
              WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'previous'
              WHEN "order".created_at < ? AND "order".created_at >= ? THEN 'current'
            END AS type,
            date_trunc(?, "order".created_at) AS date
          `, [dateRangeToCompareTo, dateRangeFromCompareTo, to, from, resolution])
        )
        .count('order.id AS orderCount')
        .select('payment.provider_id AS paymentProviderId')
        .innerJoin('order_payment_collection', 'order.id', 'order_payment_collection.order_id')
        .innerJoin('payment_collection', 'order_payment_collection.payment_collection_id', 'payment_collection.id')
        .innerJoin('payment', 'payment.payment_collection_id', 'payment_collection.id')
        .where('order.created_at', '>=', dateRangeFromCompareTo)
        .groupByRaw(`date, type, payment.provider_id`)
        .orderBy('date', 'ASC');

      const ordersCountWithPayments = rawOrdersCountWithPayments as any;

      const finalOrders: OrdersPaymentProviderPopularityResult = ordersCountWithPayments.reduce((acc, entry) => {
        const type = entry.type;
        const orderCount = entry.orderCount;
        const paymentProviderId = entry.paymentProviderId;
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
        const lastOrder = await this.pgConnection('order')
          .select('created_at')
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
      const endQuery = to ? to : new Date(Date.now());
      const resolution = calculateResolution(startQueryFrom, endQuery);
      const rawOrdersCountWithPayments = await this.pgConnection('order')
        .select(
          this.pgConnection.raw(`date_trunc(?, "order".created_at) AS date`, [resolution])
        )
        .count('order.id AS orderCount')
        .select('payment.provider_id AS paymentProviderId')
        .innerJoin('order_payment_collection', 'order.id', 'order_payment_collection.order_id')
        .innerJoin('payment_collection', 'order_payment_collection.payment_collection_id', 'payment_collection.id')
        .innerJoin('payment', 'payment.payment_collection_id', 'payment_collection.id')
        .where('order.created_at', '>=', startQueryFrom)
        .andWhere('order.created_at', '<=', endQuery)
        .groupByRaw(`date, payment.provider_id`)
        .orderBy('date', 'ASC');

      const ordersCountWithPayments = rawOrdersCountWithPayments as any;

      const initialOrders: InitialOrdersPaymentProvider[] = ordersCountWithPayments.map(order => {
        return {
          orderCount: order.orderCount,
          paymentProviderId: order.paymentProviderId,
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