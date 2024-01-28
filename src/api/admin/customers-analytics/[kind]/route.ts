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
} from "@medusajs/medusa"
import { OrderStatus } from "@medusajs/medusa";
import CustomersAnalyticsService from "../../../../services/customersAnalytics";

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
  const customersAnalyticsService: CustomersAnalyticsService = req.scope.resolve('customersAnalyticsService');

  switch (kind) {
    case 'history':
      if (dateRangeFrom) {
        result = await customersAnalyticsService.getHistory(
          dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
          dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
          dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
          dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
        );
      } else {
        result = await customersAnalyticsService.getHistory();
      }
      break;
    case 'count':
      result = await customersAnalyticsService.getNewCount(
        dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
        dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
        dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
        dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
      );
      break;
    case 'repeat-customer-rate':
      result = await customersAnalyticsService.getRepeatCustomerRate(
        orderStatuses,
        dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
        dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
        dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
        dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
      );
      break;
  }
  res.status(200).json({
    analytics: result
  });
}