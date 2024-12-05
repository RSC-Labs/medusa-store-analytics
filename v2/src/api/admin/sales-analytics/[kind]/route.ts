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

import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, MedusaErrorTypes, OrderStatus } from "@medusajs/utils"
import { STORE_ANALYTICS_MODULE } from "../../../../modules/store-analytics";
import StoreAnalyticsModuleService from "../../../../modules/store-analytics/service";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {

  const kind = req.params.kind;
  const dateRangeFrom = req.query.dateRangeFrom;
  const dateRangeTo = req.query.dateRangeTo;
  const dateRangeFromCompareTo = req.query.dateRangeFromCompareTo;
  const dateRangeToCompareTo = req.query.dateRangeToCompareTo;
  const orderStatusesFromQuery: string[] = req.query.orderStatuses as string[];

  const orderStatuses: OrderStatus[] = orderStatusesFromQuery !== undefined ? 
    orderStatusesFromQuery.map(status => OrderStatus[status.toUpperCase()]).filter(orderStatus => orderStatus !== undefined): [];

  let result;
  const storeAnalyticsModuleService: StoreAnalyticsModuleService = req.scope.resolve(STORE_ANALYTICS_MODULE)

  try {
    switch (kind) {
      case 'history':
        const currencyCode = req.query.currencyCode;
        if (currencyCode as string) {
          result = await storeAnalyticsModuleService.getOrdersSales(
            orderStatuses,
            currencyCode as string, 
            dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
            dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
            dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
            dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
          );
        }
        break;
      case 'sales-channels-popularity':
        result = await storeAnalyticsModuleService.getSalesChannelsPopularity(
          orderStatuses,
          dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
          dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
          dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
          dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
        );
        break;
      case 'regions-popularity':
        result = await storeAnalyticsModuleService.getSalesRegionsPopularity(
          orderStatuses,
          dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
          dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
          dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
          dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
        );
        break;
      case 'refunds':
        const refundsCurrencyCode = req.query.currencyCode;
        if (refundsCurrencyCode as string) {
          result = await storeAnalyticsModuleService.getSalesRefunds(
            refundsCurrencyCode as string, 
            dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
            dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
            dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
            dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
          );
        }
        break;
    }
    res.status(200).json({
      analytics: result
    });
  } catch (error) {
    throw new MedusaError(
      MedusaErrorTypes.DB_ERROR,
      error.message
    )
  }
}