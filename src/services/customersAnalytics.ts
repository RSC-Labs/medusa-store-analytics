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

import { CustomerService, Order, OrderService, OrderStatus, TransactionBaseService } from "@medusajs/medusa"
import { Customer } from "@medusajs/medusa"
import { calculateResolution } from "./utils/dateTransformations"
import { In } from "typeorm"

type CustomersHistory = {
  customerCount: string,
  date: string
}

type CustomersHistoryResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: CustomersHistory[];
  previous: CustomersHistory[];
}

type CustomersCounts = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: number,
  previous: number
}

type Distributions = {
  returnCustomerRate?: number,
  orderOneTimeFrequency?: number,
  orderRepeatFrequency?: number
}

type CustomersOrdersDistribution = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: Distributions,
  previous: Distributions
}

export default class CustomersAnalyticsService extends TransactionBaseService {

  private readonly customerService: CustomerService;
  private readonly orderService: OrderService;

  constructor(container) {
    super(container)
    this.customerService = container.customerService;
    this.orderService = container.orderService;
  }

  async getHistory(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<CustomersHistoryResult> {
    if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from);
        const customers = await this.activeManager_.getRepository(Customer)
        .createQueryBuilder('customer')
        .select(`
          CASE
            WHEN customer.created_at < :from AND customer.created_at >= :dateRangeFromCompareTo THEN 'previous'
            ELSE 'current'
          END AS type,
          date_trunc('${resolution}', customer.created_at) AS date
        `)
        .setParameters({ from, dateRangeFromCompareTo })
        .addSelect('COUNT(customer.id)', 'customerCount')
        .where(`created_at >= :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
        .groupBy('type, date')
        .orderBy('date, type',  'ASC')
        .getRawMany();

        const finalCustomers: CustomersHistoryResult = customers.reduce((acc, entry) => {
          const type = entry.type;
          const date = entry.date;
          const customerCount = entry.customerCount;
          if (!acc[type]) {
            acc[type] = [];
          }

          acc[type].push({date, customerCount})

          return acc;
        }, {})

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: finalCustomers.current ? finalCustomers.current : [],
          previous: finalCustomers.previous ? finalCustomers.previous : [],
        } 
    }

    let startQueryFrom: Date | undefined;
    if (!dateRangeFromCompareTo) {
      if (from) {
        startQueryFrom = from;
      } else {
        // All time
        const lastCustomer = await this.activeManager_.getRepository(Customer).find({
          skip: 0,
          take: 1,
          order: { created_at: "ASC"},
        })

        if (lastCustomer.length > 0) {
          startQueryFrom = lastCustomer[0].created_at;
        }
      }
    } else {
      startQueryFrom = dateRangeFromCompareTo;
    }

    if (startQueryFrom) {
      const resolution = calculateResolution(startQueryFrom);
      const customers = await this.activeManager_.getRepository(Customer)
      .createQueryBuilder('customer')
      .select(`date_trunc('${resolution}', customer.created_at)`, 'date')
      .addSelect('COUNT(customer.id)', 'customerCount')
      .where(`created_at >= :startQueryFrom`, { startQueryFrom })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

      return {
        dateRangeFrom: startQueryFrom.getTime(),
        dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: customers,
        previous: []
      };
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

  async getNewCount(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<CustomersCounts> {
    let startQueryFrom: Date | undefined;
    if (!dateRangeFromCompareTo) {
      if (from) {
        startQueryFrom = from;
      } else {
        // All time
        const lastCustomer = await this.activeManager_.getRepository(Customer).find({
          skip: 0,
          take: 1,
          order: { created_at: "ASC"}
        })

        if (lastCustomer.length > 0) {
          startQueryFrom = lastCustomer[0].created_at;
        }
      }
    } else {
        startQueryFrom = dateRangeFromCompareTo;
    }
    const customers = await this.customerService.listAndCount({
      created_at: startQueryFrom ? { gte: startQueryFrom } : undefined,
    }, {
      select: [
        "id",
        "created_at",
        "updated_at"
      ],
      order: { created_at: "DESC" },
    })

    if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
      const previousCustomers = customers[0].filter(customer => customer.created_at < from);
      const currentCustomers = customers[0].filter(customer => customer.created_at >= from);
      return {
        dateRangeFrom: from.getTime(),
        dateRangeTo: to.getTime(),
        dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
        dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
        current: currentCustomers.length,
        previous: previousCustomers.length
      }
    }

    if (startQueryFrom && customers.length > 0) {
      return {
        dateRangeFrom: startQueryFrom.getTime(),
        dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: customers[1],
        previous: 0
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

  async getNumberOfReturningCustomers() : Promise<number> {
    const customers = await this.customerService.listAndCount({
      orders: { gt: 1 }
    })
    return customers[1];
  }

  async getRepeatCustomerRate(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<CustomersOrdersDistribution> {
    
    // Use the same query like finding for Orders, but include Customers
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
      const orders: Order[] = await this.orderService.list({
        created_at: startQueryFrom ? { gte: startQueryFrom } : undefined,
        status: In(orderStatusesAsStrings)
      }, {
        select: [
          "id",
          "created_at",
          "updated_at",
          "customer_id",
        ],
        order: { created_at: "DESC" },
      })

      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const previousOrders = orders.filter(order => order.created_at < from);
        const currentOrders = orders.filter(order => order.created_at >= from);

        const previousOrderCountByCustomer: Map<string, number> = previousOrders.reduce((acc, order) => {
          acc[order.customer_id] = (acc[order.customer_id] || 0) + 1;
          return acc;
        }, new Map<string, number>());

        const currentOrderCountByCustomer: Map<string, number> = currentOrders.reduce((acc, order) => {
          acc[order.customer_id] = (acc[order.customer_id] || 0) + 1;
          return acc;
        }, new Map<string, number>());

        const returningCustomersForCurrentOrders = Object.values(currentOrderCountByCustomer).filter(count => parseInt(count) > 1).length;
        const totalCustomersForCurrentOrders = Object.keys(currentOrderCountByCustomer).length;

        const returningCustomersForPreviousOrders = Object.values(previousOrderCountByCustomer).filter(count => parseInt(count) > 1).length;
        const totalCustomersForPreviousOrders = Object.keys(previousOrderCountByCustomer).length;

        // Return Customer Rate
        const returnCustomerRateCurrentValue = totalCustomersForCurrentOrders > 0 ? returningCustomersForCurrentOrders * 100 / totalCustomersForCurrentOrders : undefined;
        const returnCustomerRatePreviousValue = totalCustomersForPreviousOrders > 0 ? returningCustomersForPreviousOrders * 100 / totalCustomersForPreviousOrders : undefined;

        // Order frequency distribution
        let currentOneTimeOrders = 0;
        let currentRepeatOrders = 0;
        for (const count of Object.values(currentOrderCountByCustomer)) {
          if (parseInt(count) === 1) {
            currentOneTimeOrders += count; 
          } else if (parseInt(count) > 1) {
            currentRepeatOrders += count;
          }
        }

        let previousOneTimeOrders = 0;
        let previousRepeatOrders = 0;
        for (const count of Object.values(previousOrderCountByCustomer)) {
          if (parseInt(count) === 1) {
            previousOneTimeOrders += count; 
          } else if (parseInt(count) > 1) {
            previousRepeatOrders += count;
          }
        }
        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: {
            returnCustomerRate: returnCustomerRateCurrentValue,
            orderOneTimeFrequency: currentOneTimeOrders * 100 / currentOrders.length,
            orderRepeatFrequency: currentRepeatOrders * 100 / currentOrders.length
          },
          previous: {
            returnCustomerRate: returnCustomerRatePreviousValue, 
            orderOneTimeFrequency: previousOneTimeOrders * 100 / previousOrders.length,
            orderRepeatFrequency: previousRepeatOrders * 100 / previousOrders.length
          }
        }
      }

      if (startQueryFrom) {
        const orderCountByCustomer: Map<string, number> = orders.reduce((acc, order) => {
          acc[order.customer_id] = (acc[order.customer_id] || 0) + 1;
          return acc;
        }, new Map<string, number>());
    
        const returningCustomersForCurrentOrders = Object.values(orderCountByCustomer).filter(count => parseInt(count) > 1).length;
    
        const totalCustomersForCurrentOrders = Object.keys(orderCountByCustomer).length;
        // Return Customer Rate
        const returnCustomerRateCurrentValue = totalCustomersForCurrentOrders > 0 ? returningCustomersForCurrentOrders * 100 / totalCustomersForCurrentOrders : undefined;

        // Order frequency distribution
        let currentOneTimeOrders = 0;
        let currentRepeatOrders = 0;
        for (const count of Object.values(orderCountByCustomer)) {
          if (parseInt(count) === 1) {
            currentOneTimeOrders += count; 
          } else if (parseInt(count) > 1) {
            currentRepeatOrders += count;
          }
        }

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: {
            returnCustomerRate: returnCustomerRateCurrentValue,
            orderOneTimeFrequency: currentOneTimeOrders * 100 / orders.length,
            orderRepeatFrequency: currentRepeatOrders * 100 / orders.length
          },
          previous: undefined
        }
      }
    }
    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: {
        returnCustomerRate: 0
      },
      previous: {
        returnCustomerRate: 0
      }
    }
  }
  async getCumulativeHistory(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<CustomersHistoryResult> {
    if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from);
        const afterCustomers = await this.activeManager_.getRepository(Customer)
        .createQueryBuilder('customer')
        .select(`date_trunc('${resolution}', customer.created_at) AS date`)
        .addSelect(
          `SUM(COUNT(*)) OVER (ORDER BY date_trunc('${resolution}', customer.created_at) ASC) AS cumulative_count`
        )
        .where(`date_trunc('${resolution}', customer.created_at) >= :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
        .setParameters({ dateRangeFromCompareTo: dateRangeFromCompareTo })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany();

        const beforeCustomers = await this.activeManager_.getRepository(Customer)
          .createQueryBuilder('customer')
          .select(`COUNT(*) AS cumulative_count`)
          .where(`customer.created_at < :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
          .getRawOne(); 

        for (const afterCustomer of afterCustomers) {
          afterCustomer.cumulative_count = parseInt(afterCustomer.cumulative_count);
          afterCustomer.cumulative_count += parseInt(beforeCustomers.cumulative_count);
        }

        const previousCustomers = afterCustomers.filter(customer => customer.date < from);
        const currentCustomers = afterCustomers.filter(customer => customer.date >= from);

        const finalCustomers: CustomersHistoryResult = {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: currentCustomers.map(currentCustomer => {
            return {
              date: currentCustomer.date,
              customerCount: currentCustomer.cumulative_count.toString()
            }
          }),
          previous: previousCustomers.map(previousCustomers => {
            return {
              date: previousCustomers.date,
              customerCount: previousCustomers.cumulative_count.toString()
            }
          })
        }

        return finalCustomers;
    }

    let startQueryFrom: Date | undefined;
    if (!dateRangeFromCompareTo) {
      if (from) {
        startQueryFrom = from;
      } else {
        // All time
        const lastCustomer = await this.activeManager_.getRepository(Customer).find({
          skip: 0,
          take: 1,
          order: { created_at: "ASC"},
        })

        if (lastCustomer.length > 0) {
          startQueryFrom = lastCustomer[0].created_at;
        }
      }
    } else {
      startQueryFrom = dateRangeFromCompareTo;
    }

    if (startQueryFrom) {
      const resolution = calculateResolution(startQueryFrom);
      const allCustomers = await this.activeManager_.getRepository(Customer)
        .createQueryBuilder('customer')
        .select(`date_trunc('${resolution}', customer.created_at) AS date`)
        .addSelect(
          `SUM(COUNT(*)) OVER (ORDER BY date_trunc('${resolution}', customer.created_at) ASC) AS cumulative_count`
        )
        .setParameters({ startQueryFrom: startQueryFrom })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany();

      const finalCustomers: CustomersHistoryResult = {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: allCustomers.map(currentCustomer => {
            return {
              date: currentCustomer.date,
              customerCount: currentCustomer.cumulative_count.toString()
            }
          }),
          previous: []
        }

        return finalCustomers;
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