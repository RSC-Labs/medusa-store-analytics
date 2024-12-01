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
import { Order } from "@medusajs/medusa"
import { In } from "typeorm"

type DiscountsCountPopularity = {
  sum: string,
  discountId: string,
  discountCode: string,
}

type DiscountsCountPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: DiscountsCountPopularity[],
  previous: DiscountsCountPopularity[]
}

export default class MarketingAnalyticsService extends TransactionBaseService {

  private readonly TOP_LIMIT;

  constructor(
    container,
  ) {
    super(container)
    this.TOP_LIMIT = 5;
  }

  async getTopDiscountsByCount(orderStatuses: OrderStatus[], from?: Date, to?: Date) : Promise<DiscountsCountPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (from && to) {
        const query = this.activeManager_
        .getRepository(Order)
        .createQueryBuilder('order')
        .innerJoin("order.discounts", "discount")
        .select("discount.code", "code")
        .addSelect("discount.id", "discount_id")
        .addSelect("COUNT(discount.id)", "sum")
        .where('order.created_at >= :from', { from })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const topDiscounts = await query
        .groupBy('discount.code, discount.id')
        .orderBy('sum', 'DESC')
        .setParameters({from})
        .limit(this.TOP_LIMIT)
        .getRawMany()

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: topDiscounts.map(result => (
            {
              sum: result.sum,
              discountCode: result.code,
              discountId: result.discount_id
            }
          )),
          previous: undefined
        }
      }

      let startQueryFrom: Date | undefined;
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

      if (startQueryFrom) {
        const query = this.activeManager_
        .getRepository(Order)
        .createQueryBuilder('order')
        .innerJoin("order.discounts", "discount")
        .select("discount.code", "code")
        .addSelect("discount.id", "discount_id")
        .addSelect("COUNT(discount.id)", "sum")
        .where('order.created_at >= :startQueryFrom', { startQueryFrom })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const topDiscounts = await query
        .groupBy('discount.code, discount.id')
        .orderBy('sum', 'DESC')
        .setParameters({startQueryFrom})
        .limit(this.TOP_LIMIT)
        .getRawMany()

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: topDiscounts.map(result => (
            {
              sum: result.sum,
              discountCode: result.code,
              discountId: result.discount_id
            }
          )),
          previous: undefined
        }
      }
    }

    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: [],
      previous: undefined
    }
  }
}