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

import { LineItem, OrderStatus, Return, ReturnItem, TransactionBaseService } from "@medusajs/medusa"
import { Order } from "@medusajs/medusa"
import { In } from "typeorm"

type VariantsCountPopularity = {
  sum: string,
  variantId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

type VariantsCountPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: VariantsCountPopularity[],
  previous: VariantsCountPopularity[]
}

export default class ProductsAnalyticsService extends TransactionBaseService {

  private readonly TOP_LIMIT;

  constructor(
    container,
  ) {
    super(container)
    this.TOP_LIMIT = 5;
  }

  async getTopVariantsByCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<VariantsCountPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (from && to) {
        const query = this.activeManager_
        .getRepository(LineItem)
        .createQueryBuilder('lineitem')
        .select("lineItem.variant_id", "variantId")
        .addSelect("lineItem.title", "title")
        .addSelect("lineItem.thumbnail", "thumbnail")
        .addSelect("SUM(lineItem.quantity)", "sum")
        .innerJoin('lineitem.order', 'order')
        .innerJoinAndSelect('lineitem.variant', 'variant')
        .where('order.created_at >= :from', { from })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const variantsSumInLinteItemsInOrders = await query
        .groupBy('lineitem.variant_id, variant.id, lineitem.title, lineitem.thumbnail')
        .orderBy('sum', 'DESC')
        .setParameters({from, dateRangeFromCompareTo})
        .limit(this.TOP_LIMIT)
        .getRawMany()

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: variantsSumInLinteItemsInOrders.map(result => (
            {
              variantId: result.variant_id,
              sum: result.sum,
              variantTitle: result.variant_title,
              productTitle: result.title,
              thumbnail: result.thumbnail
            }
          )),
          previous: undefined
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
        const query = this.activeManager_
        .getRepository(LineItem)
        .createQueryBuilder('lineitem')
        .select("lineItem.variant_id", "variantId")
        .addSelect("lineItem.title", "title")
        .addSelect("lineItem.thumbnail", "thumbnail")
        .addSelect("SUM(lineitem.quantity)", "sum")
        .innerJoin('lineitem.order', 'order')
        .innerJoinAndSelect('lineitem.variant', 'variant')
        .where('order.created_at >= :startQueryFrom', { startQueryFrom })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });

        const variantsSumInLinteItemsInOrders = await query
        .groupBy('lineitem.variant_id, variant.id, lineitem.title, lineitem.thumbnail')
        .orderBy('sum', 'DESC')
        .setParameters({startQueryFrom, dateRangeFromCompareTo})
        .limit(this.TOP_LIMIT)
        .getRawMany()

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: variantsSumInLinteItemsInOrders.map(result => (
            {
              variantId: result.variant_id,
              sum: result.sum,
              variantTitle: result.variant_title,
              productTitle: result.title,
              thumbnail: result.thumbnail
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

  async getTopReturnedVariantsByCount(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<VariantsCountPopularityResult> {
    if (from && to) {
      const query = this.activeManager_.getRepository(ReturnItem)
      .createQueryBuilder('returnItem')
      .leftJoinAndMapOne(
        'returnItem.lineItem',
        LineItem,
        'lineItem',
        'lineItem.id = returnItem.item_id'
      )
      .leftJoinAndMapOne(
        'lineItem.variant', 
        'ProductVariant', 
        'variant', 
        'variant.id = lineItem.variant_id'
      )
      .leftJoinAndMapOne(
        'lineItem.return_order',
        Return,
        'return',
        'return.id = returnItem.return_id'
      )
      .select('lineItem.variant_id', 'variant_id')
      .addSelect('lineItem.title', 'title')
      .addSelect('variant.title', 'variant_title')
      .addSelect('lineItem.thumbnail', 'thumbnail')
      .addSelect('SUM(returnItem.quantity)', 'sum')
      .where('return.created_at >= :from', { from })
      .groupBy('lineItem.title, variant_title, lineItem.thumbnail, lineItem.variant_id')

      const variantsReturnedSum = await query
      .orderBy('sum', 'DESC')
      .setParameters({from})
      .limit(this.TOP_LIMIT)
      .getRawMany()

      return {
        dateRangeFrom: from.getTime(),
        dateRangeTo: to.getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: variantsReturnedSum.map(result => (
          {
            variantId: result.variant_id,
            sum: result.sum,
            variantTitle: result.variant_title,
            productTitle: result.title,
            thumbnail: result.thumbnail
          }
        )),
        previous: undefined
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
      const query = this.activeManager_.getRepository(ReturnItem)
      .createQueryBuilder('returnItem')
      .leftJoinAndMapOne(
        'returnItem.lineItem',
        LineItem,
        'lineItem',
        'lineItem.id = returnItem.item_id'
      )
      .leftJoinAndMapOne(
        'lineItem.variant', 
        'ProductVariant', 
        'variant', 
        'variant.id = lineItem.variant_id'
      )
      .leftJoinAndMapOne(
        'lineItem.return_order',
        Return,
        'return',
        'return.id = returnItem.return_id'
      )
      .select('lineItem.variant_id', 'variant_id')
      .addSelect('lineItem.title', 'title')
      .addSelect('variant.title', 'variant_title')
      .addSelect('lineItem.thumbnail', 'thumbnail')
      .addSelect('SUM(returnItem.quantity)', 'sum')
      .where('return.created_at >= :startQueryFrom', { startQueryFrom })
      .groupBy('lineItem.title, variant_title, lineItem.thumbnail, lineItem.variant_id')

      const variantsReturnedSum = await query
      .orderBy('sum', 'DESC')
      .setParameters({startQueryFrom})
      .limit(this.TOP_LIMIT)
      .getRawMany()

      return {
        dateRangeFrom: startQueryFrom.getTime(),
        dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
        dateRangeFromCompareTo: undefined,
        dateRangeToCompareTo: undefined,
        current: variantsReturnedSum.map(result => (
          {
            variantId: result.variant_id,
            sum: result.sum,
            variantTitle: result.variant_title,
            productTitle: result.title,
            thumbnail: result.thumbnail
          }
        )),
        previous: undefined
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

  async getProductsSoldCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<VariantsCountPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const productsSoldCurrently = await this.activeManager_
        .getRepository(LineItem)
        .createQueryBuilder('lineitem')
        .select("SUM(lineItem.quantity)")
        .innerJoin('lineitem.order', 'order')
        .where('order.created_at >= :from', { from })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings })
        .getRawOne()

        const productsSoldPreviously = await this.activeManager_
        .getRepository(LineItem)
        .createQueryBuilder('lineitem')
        .select("SUM(lineItem.quantity)")
        .innerJoin('lineitem.order', 'order')
        .where('order.created_at >= :dateRangeFromCompareTo', { dateRangeFromCompareTo })
        .andWhere('order.created_at < :from', { from })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings })
        .getRawOne()

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: productsSoldCurrently.sum,
          previous: productsSoldPreviously.sum
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
        const productsSoldCurrently = await this.activeManager_
        .getRepository(LineItem)
        .createQueryBuilder('lineitem')
        .select("SUM(lineItem.quantity)")
        .innerJoin('lineitem.order', 'order')
        .where('order.created_at >= :startQueryFrom', { startQueryFrom })
        .andWhere(`order.status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings })
        .getRawOne()

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: productsSoldCurrently.sum,
          previous: undefined
        }
      }
    }
    
    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: undefined,
      previous: undefined
    }
  }
}