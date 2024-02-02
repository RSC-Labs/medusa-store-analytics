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
import { calculateResolution } from "./utils/dateTransformations"
import { OrdersHistoryResult } from "./utils/types"
import { In } from "typeorm"

type OrdersCounts = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: number,
  previous: number
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
        const resolution = calculateResolution(from);
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
        const resolution = calculateResolution(startQueryFrom);
        const query = this.activeManager_.getRepository(Order)
          .createQueryBuilder('order')
          .select(`date_trunc('${resolution}', order.created_at)`, 'date')
          .addSelect('COUNT(order.id)', 'orderCount')
          .where(`created_at >= :startQueryFrom`, { startQueryFrom })
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
      const orders = await this.orderService.listAndCount({
        created_at: startQueryFrom ? { gte: startQueryFrom } : undefined,
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
}