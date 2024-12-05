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

import { Heading, Alert } from "@medusajs/ui";
import { CircularProgress } from "@mui/material";
import type { DateRange } from "../utils/types";
import { ChartCurrentPrevious } from "../common/chart-components";
import { OrderStatus } from "../utils/types";
import { deduceDateUrlParams } from "../utils/helpers";
import { useEffect, useState } from "react";

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

  const [data, setData] = useState<OrdersHistoryResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo, orderStatuses])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/orders-analytics/history?${deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses).toString()}`, {
      credentials: "include",
    })
    .then((res) => res.json())
    .then((result) => {
      setData(result)
      setLoading(false)
    })
    .catch((error) => {
      setError(error);
      console.error(error);
    }) 
  }, [isLoading])

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (error) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return <Alert variant="error">{errorText}</Alert>
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