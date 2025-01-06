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

import { OrderStatus } from "@medusajs/framework/types"
import { PgConnectionType } from "../utils/types"

type VariantsCountPopularity = {
  sum: string,
  productId: string,
  variantId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

export type VariantsCountPopularityResult = {
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



type InjectedDependencies = {
  __pg_connection__: PgConnectionType,
}

export class ProductsAnalyticsService {

  protected pgConnection: PgConnectionType;
  private readonly TOP_LIMIT;

  constructor({ __pg_connection__ }: InjectedDependencies) {
    this.pgConnection = __pg_connection__;
    this.TOP_LIMIT = 5;
  }

  async getTopVariantsByCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<VariantsCountPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (from && to) {
        const rawVariantsSumInLineItemsInOrders = await this.pgConnection('order')
          .join('order_item', 'order.id', 'order_item.order_id')
          .join('order_line_item', 'order_item.item_id', 'order_line_item.id')
          .select(
            'order_line_item.variant_id AS variantId',
            'order_line_item.variant_title AS variantTitle',
            'order_line_item.product_title AS productTitle',
            'order_line_item.thumbnail AS thumbnail',
            'order_line_item.product_id AS productId'
          )
          .sum('order_item.quantity AS sum')
          .where('order.created_at', '>=', from)
          .whereIn('order.status', orderStatusesAsStrings) 
          .groupBy([
            'order_line_item.variant_id',
            'order_line_item.product_id',
            'order_line_item.product_title',
            'order_line_item.variant_title',
            'order_line_item.thumbnail',
          ]) 
          .orderBy('sum', 'DESC')
          .limit(this.TOP_LIMIT);

        const variantsSumInLinteItemsInOrders = rawVariantsSumInLineItemsInOrders as any;

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: variantsSumInLinteItemsInOrders.map(result => (
            {
              productId: result.productId,
              variantId: result.variantId,
              sum: result.sum,
              variantTitle: result.variantTitle,
              productTitle: result.productTitle,
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
        const rawVariantsSumInLineItemsInOrders = await this.pgConnection('order')
          .join('order_item', 'order.id', 'order_item.order_id')
          .join('order_line_item', 'order_item.item_id', 'order_line_item.id')
          .select(
            'order_line_item.variant_id AS variantId',
            'order_line_item.variant_title AS variantTitle',
            'order_line_item.product_title AS productTitle',
            'order_line_item.thumbnail AS thumbnail',
            'order_line_item.product_id AS productId'
          )
          .sum('order_item.quantity AS sum')
          .where('order.created_at', '>=', startQueryFrom)
          .whereIn('order.status', orderStatusesAsStrings) 
          .groupBy([
            'order_line_item.variant_id',
            'order_line_item.product_id',
            'order_line_item.product_title',
            'order_line_item.variant_title',
            'order_line_item.thumbnail',
          ]) 
          .orderBy('sum', 'DESC')
          .limit(this.TOP_LIMIT);

        const variantsSumInLinteItemsInOrders = rawVariantsSumInLineItemsInOrders as any;

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: variantsSumInLinteItemsInOrders.map(result => (
            {
              productId: result.productId,
              variantId: result.variantId,
              sum: result.sum,
              variantTitle: result.variantTitle,
              productTitle: result.productTitle,
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

  async getProductsSoldCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<VariantsCountPopularityResult> {
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const productsSoldCurrently = await this.pgConnection('order')
          .join('order_item', 'order.id', 'order_item.order_id')
          .sum('order_item.quantity AS total_quantity')
          .where('order.created_at', '>=', from)
          .whereIn('order.status', orderStatusesAsStrings)
          .first();

        const productsSoldPreviously = await this.pgConnection('order')
          .join('order_item', 'order.id', 'order_item.order_id')
          .sum('order_item.quantity AS total_quantity')
          .where('order.created_at', '>=', dateRangeFromCompareTo) 
          .andWhere('order.created_at', '<', from)
          .whereIn('order.status', orderStatusesAsStrings)
          .first();

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: productsSoldCurrently.total_quantity,
          previous: productsSoldPreviously.total_quantity
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
        const productsSoldCurrently = await this.pgConnection('order')
          .join('order_item', 'order.id', 'order_item.order_id')
          .sum('order_item.quantity AS total_quantity')
          .where('order.created_at', '>=', startQueryFrom)
          .whereIn('order.status', orderStatusesAsStrings)
          .first();

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: productsSoldCurrently.total_quantity,
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

    const query = this.pgConnection('product')
      .join('product_variant', 'product.id', 'product_variant.product_id')
      .join('product_variant_inventory_item', 'product_variant.id', 'product_variant_inventory_item.variant_id')
      .join('inventory_item', 'product_variant_inventory_item.inventory_item_id', 'inventory_item.id') 
      .join('inventory_level', 'inventory_item.id', 'inventory_level.inventory_item_id')
      .select(
        'product.id AS product_id',
        'product_variant.id AS variant_id',
        'product_variant.updated_at AS updated_at',
        'product_variant.title AS variant_title',
        'product.thumbnail AS thumbnail',
        'product.title AS product_title'
      )
      .whereIn('product.status', productStatusesAsStrings) 
      .andWhere('inventory_level.stocked_quantity', '=', 0) 
      .andWhere('product.is_giftcard', '=', false);

    let outOfTheStockVariants;

    if (limit !== undefined && limit === 0) {
      outOfTheStockVariants = await query
        .groupBy([
          'product.id',
          'product_variant.id',
          'product_variant.updated_at',
          'product_variant.title',
          'product.id',
          'product.thumbnail',
          'product.title',
        ]) 
        .orderBy('product_variant.updated_at', 'DESC')
        .then(rows => rows); 
    } else {
      outOfTheStockVariants = await query
        .groupBy([
          'product.id',
          'product_variant.id',
          'product_variant.updated_at',
          'product_variant.title',
          'product.id',
          'product.thumbnail',
          'product.title',
        ])
        .orderBy('product_variant.updated_at', 'DESC')
        .limit(limit !== undefined ? limit : this.TOP_LIMIT)
        .then(rows => rows);
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
  async getTopReturnedVariantsByCount(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<VariantsCountPopularityResult> {
    if (from && to) {
      const variantsReturnedSum = await this.pgConnection('return_item')
        .join('order_line_item', 'return_item.item_id', 'order_line_item.id')
        .join('return', 'return_item.return_id', 'return.id')
        .select(
          'order_line_item.variant_id AS variant_id',
          'order_line_item.variant_title AS variant_title',
          'order_line_item.product_id AS product_id',
          'order_line_item.thumbnail AS thumbnail',
          'order_line_item.product_title AS product_title'
        )
        .sum('return_item.quantity AS sum')
        .where('return.created_at', '>=', from)
        .groupBy([
          'order_line_item.variant_id',
          'order_line_item.variant_title',
          'order_line_item.product_id',
          'order_line_item.thumbnail',
          'order_line_item.product_title',
        ])
        .orderBy('sum', 'DESC')
        .limit(this.TOP_LIMIT)
        .then(rows => rows);


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
            productTitle: result.product_title,
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
        const lastReturn = await this.pgConnection('return')
          .select('created_at')
          .orderBy('created_at', 'ASC')
          .limit(1)
        if (lastReturn.length > 0) {
          startQueryFrom = lastReturn[0].created_at;
        }
      }
    } else {
        startQueryFrom = dateRangeFromCompareTo;
    }

    if (startQueryFrom) {
      const variantsReturnedSum = await this.pgConnection('return_item')
        .join('order_line_item', 'return_item.item_id', 'order_line_item.id')
        .join('return', 'return_item.return_id', 'return.id')
        .select(
          'order_line_item.variant_id AS variant_id',
          'order_line_item.variant_title AS variant_title',
          'order_line_item.product_id AS product_id',
          'order_line_item.thumbnail AS thumbnail',
          'order_line_item.product_title AS product_title'
        )
        .sum('return_item.quantity AS sum')
        .where('return.created_at', '>=', startQueryFrom)
        .groupBy([
          'order_line_item.variant_id',
          'order_line_item.variant_title',
          'order_line_item.product_id',
          'order_line_item.thumbnail',
          'order_line_item.product_title',
        ])
        .orderBy('sum', 'DESC')
        .limit(this.TOP_LIMIT)
        .then(rows => rows);

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
            productTitle: result.product_title,
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
}