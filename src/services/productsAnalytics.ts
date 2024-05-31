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

import { LineItem, OrderStatus, ProductVariant, Return, ReturnItem, TransactionBaseService } from "@medusajs/medusa"
import { Order } from "@medusajs/medusa"
import { In } from "typeorm"

type VariantsCountPopularity = {
  sum: string,
  productId: string,
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

type OutOfTheStockVariantsCount = {
  productId: string,
  variantId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

type OutOfTheStockVariantsCountResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OutOfTheStockVariantsCount[],
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
          .groupBy('lineitem.variant_id, variant.id, variant.product_id, lineitem.title, lineitem.thumbnail')
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
              productId: result.variant_product_id,
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
          .groupBy('lineitem.variant_id, variant.id, variant.product_id, lineitem.title, lineitem.thumbnail')
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
              productId: result.variant_product_id,
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
      .addSelect('variant.product_id', 'product_id')
      .addSelect('lineItem.thumbnail', 'thumbnail')
      .addSelect('SUM(returnItem.quantity)', 'sum')
      .where('return.created_at >= :from', { from })
      .groupBy('lineItem.title, variant_title, variant.product_id, lineItem.thumbnail, lineItem.variant_id')

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
            productId: result.product_id,
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
      .addSelect('variant.product_id', 'product_id')
      .addSelect('lineItem.thumbnail', 'thumbnail')
      .addSelect('SUM(returnItem.quantity)', 'sum')
      .where('return.created_at >= :startQueryFrom', { startQueryFrom })
      .groupBy('lineItem.title, variant_title, variant.product_id, lineItem.thumbnail, lineItem.variant_id')

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
            productId: result.product_id,
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

  async getOutOfTheStockVariants(limit?: number) : Promise<OutOfTheStockVariantsCountResult> {
    const productStatusesAsStrings = ['published']
    const query = this.activeManager_
      .getRepository(ProductVariant)
      .createQueryBuilder('productVariant')
      .select("productVariant.id", "variant_id")
      .addSelect("productVariant.updated_at", "updated_at")
      .addSelect("productVariant.title", "variant_title")
      .innerJoinAndSelect('productVariant.product', 'product')
      .addSelect("product.thumbnail", "thumbnail")
      .addSelect("product.title", "product_title")
      .where(`product.status IN(:...productStatusesAsStrings)`, { productStatusesAsStrings })
      .andWhere('productVariant.inventory_quantity = :expectedQuantity', { expectedQuantity: 0})
      .andWhere('product.is_giftcard = :isGiftCard', { isGiftCard: false});

    let outOfTheStockVariants;

    if (limit !== undefined && limit === 0) {
      outOfTheStockVariants = await query
        .groupBy('productVariant.id, variant_title,  product.id, product.thumbnail, product_title')
        .orderBy('productVariant.updated_at', 'DESC')
        .getRawMany()

    } else {
      outOfTheStockVariants = await query
      .groupBy('productVariant.id, variant_title,  product.id, product.thumbnail, product_title')
      .orderBy('productVariant.updated_at', 'DESC')
      .limit(limit !== undefined ? limit : this.TOP_LIMIT)
      .getRawMany()
    }

    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: outOfTheStockVariants.map(result => (
        {
          productId: result.product_id,
          variantId: result.variant_id,
          sum: result.sum,
          variantTitle: result.variant_title,
          productTitle: result.product_title,
          thumbnail: result.thumbnail
        }
      )),
    }
  }
}