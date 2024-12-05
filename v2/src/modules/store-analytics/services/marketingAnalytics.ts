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
import { OrderStatus } from "@medusajs/framework/utils"

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

type InjectedDependencies = {
  __pg_connection__: PgConnectionType,
}

export default class MarketingAnalyticsService {

  protected pgConnection: PgConnectionType;
  private readonly TOP_LIMIT;


  constructor({ __pg_connection__ }: InjectedDependencies) {
    this.pgConnection = __pg_connection__
    this.TOP_LIMIT = 5;
  }

  async getTopDiscountsByCount(orderStatuses: OrderStatus[], from?: Date, to?: Date) : Promise<DiscountsCountPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (from && to) {
        const topDiscounts = await this.pgConnection('order')
          .join('order_cart', 'order.id', 'order_cart.order_id')
          .join('cart', 'order_cart.cart_id', 'cart.id')
          .join('cart_promotion', 'cart.id', 'cart_promotion.cart_id') 
          .join('promotion', 'cart_promotion.promotion_id', 'promotion.id') 
          .select(
            'promotion.code AS code',
            'promotion.id AS discount_id'
          )
          .count('promotion.id AS sum')
          .where('order.created_at', '>=', from)
          .whereIn('order.status', orderStatusesAsStrings)
          .groupBy(['promotion.code', 'promotion.id'])
          .orderBy('sum', 'DESC')
          .limit(this.TOP_LIMIT);

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
      if (!from) {
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
        startQueryFrom = from;
      }

      if (startQueryFrom) {
        const topDiscounts = await this.pgConnection('order')
          .join('order_cart', 'order.id', 'order_cart.order_id')
          .join('cart', 'order_cart.cart_id', 'cart.id') 
          .join('cart_promotion', 'cart.id', 'cart_promotion.cart_id')
          .join('promotion', 'cart_promotion.promotion_id', 'promotion.id') 
          .select(
            'promotion.code AS code',
            'promotion.id AS discount_id'
          )
          .count('promotion.id AS sum')
          .where('order.created_at', '>=', startQueryFrom)
          .whereIn('order.status', orderStatusesAsStrings)
          .groupBy(['promotion.code', 'promotion.id'])
          .orderBy('sum', 'DESC') 
          .limit(this.TOP_LIMIT);

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