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
import { MedusaError, MedusaErrorTypes } from "@medusajs/utils"
import ReportsAnalyticsService from "../../../../services/reportsAnalytics";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {

  const kind = req.params.kind;
  const body: any = req.body as any;
  const dateRangeFrom = body.dateRangeFrom;
  const dateRangeTo = body.dateRangeTo;
  const dateRangeFromCompareTo = body.dateRangeFromCompareTo;
  const dateRangeToCompareTo = body.dateRangeToCompareTo;
  const orderStatusesFromQuery: string[] = body.orderStatuses as string[];

  const orderStatuses: OrderStatus[] = orderStatusesFromQuery !== undefined ? 
    orderStatusesFromQuery.map(status => OrderStatus[status.toUpperCase()]).filter(orderStatus => orderStatus !== undefined): [];

  let result: Buffer;
  const reportsAnalyticsService: ReportsAnalyticsService = req.scope.resolve('reportsAnalyticsService');

  try {
    switch (kind) {
      case 'general':
        result = await reportsAnalyticsService.generateReport(
          orderStatuses,
          dateRangeFrom ? new Date(Number(dateRangeFrom)) : undefined, 
          dateRangeTo ? new Date(Number(dateRangeTo)) : undefined, 
          dateRangeFromCompareTo ? new Date(Number(dateRangeFromCompareTo)) : undefined, 
          dateRangeToCompareTo ? new Date(Number(dateRangeToCompareTo)) : undefined, 
        );
        break;
    }
    res.status(201).json({
      buffer: result
    });
  } catch (error) {
    throw new MedusaError(
      MedusaErrorTypes.DB_ERROR,
      error.message
    )
  }
}