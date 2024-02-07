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

import { useAdminCustomQuery } from "medusa-react"
import { Heading } from "@medusajs/ui";
import { CircularProgress } from "@mui/material";
import { DateRange } from "../utils/types";
import { ChartCurrentPrevious } from "../common/chart-components";
import { OrderStatus } from "../utils/types";

type AdminOrdersStatisticsQuery = {
  orderStatuses: string[],
  dateRangeFrom?: number,
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

type OrdersHistory = {
  orderCount: string,
  date: string
}

type OrdersHistoryResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    current: OrdersHistory[];
    previous: OrdersHistory[];
  }
}

export const OrdersByNewChart = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {

  const { data, isLoading } = useAdminCustomQuery<
    AdminOrdersStatisticsQuery,
    OrdersHistoryResponse
  >(
    `/orders-analytics/history`,
    [orderStatuses, dateRange, dateRangeCompareTo],
    {
      orderStatuses: Object.values(orderStatuses),
      dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
      dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
      dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
      dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined
    }
  )

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (data.analytics == undefined) {
    return <Heading level="h3">Cannot get orders</Heading>
  }

  if (data.analytics.dateRangeFrom && data.analytics.dateRangeTo) {
    const rawChartData = {
      current: data.analytics.current.map(currentData => {
        return {
          date: new Date(currentData.date),
          value: currentData.orderCount
        };
      }),
      previous: data.analytics.previous.map(previousData => {
        return {
          date: new Date(previousData.date),
          value: previousData.orderCount
        };
      }),
    };
    return (
      <>
        <Heading level="h3">New orders by time</Heading>
        <ChartCurrentPrevious 
          rawChartData={rawChartData} 
          fromDate={new Date(data.analytics.dateRangeFrom)} 
          toDate={new Date(data.analytics.dateRangeTo)}
          fromCompareDate={data.analytics.dateRangeFromCompareTo ? new Date(data.analytics.dateRangeFromCompareTo) : undefined}
          toCompareDate={data.analytics.dateRangeToCompareTo ? new Date(data.analytics.dateRangeToCompareTo) : undefined}
          compareEnabled={compareEnabled}
        />
      </>
    )
  } else {
    return <Heading level="h3">No orders</Heading>
  }
}