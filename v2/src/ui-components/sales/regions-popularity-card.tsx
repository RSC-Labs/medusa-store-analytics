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
import { ShoppingBag } from "@medusajs/icons";
import { CircularProgress, Grid2 } from "@mui/material";
import type { DateRange } from "../utils/types";
import { PopularityTable, PopularityTableRow } from "../common/popularity-table";
import { OrderStatus } from "../utils/types";
import { useEffect, useState } from "react";
import { deduceDateUrlParams } from "../utils/helpers";

type AdminRegionsStatisticsQuery = {
  orderStatuses: string[],
  dateRangeFrom: number,
  dateRangeTo: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

type OrdersRegionsPopularity = {
  date: string,
  orderCount: string,
  regionId: string
  regionName: string,
}

type OrdersRegionsPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersRegionsPopularity[]
  previous: OrdersRegionsPopularity[]
}

type OrdersRegionsPopularityResponse = {
  analytics: OrdersRegionsPopularityResult
}

function transformToPopularityTable(result: OrdersRegionsPopularityResult): PopularityTableRow[] {
  const currentMap = new Map<string, number>();
  const previousMap = new Map<string, number>();

  result.current.forEach(currentItem => {
    const currentCount = currentMap.get(currentItem.regionName) || 0;
    currentMap.set(currentItem.regionName, currentCount + parseInt(currentItem.orderCount));
  });

  result.previous.forEach(previousItem => {
    const previousCount = previousMap.get(previousItem.regionName) || 0;
    previousMap.set(previousItem.regionName, previousCount + parseInt(previousItem.orderCount));
  });

  return Array.from(currentMap.keys()).map(name => ({
    name,
    current: String(currentMap.get(name) || 0),
    previous: String(previousMap.get(name) || 0)
  }));
}

const RegionsPopularityDetails = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {

  const [data, setData] = useState<OrdersRegionsPopularityResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo, orderStatuses])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/sales-analytics/regions-popularity?${deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses).toString()}`, {
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

  if (data.analytics.dateRangeFrom) {
    return <PopularityTable valueColumnName="Orders" tableRows={transformToPopularityTable(data.analytics)} enableComparing={compareEnabled && dateRangeCompareTo !== undefined}/>
  } else {
    return <Heading level="h3">No orders</Heading>
  }
}

export const RegionsPopularityCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid2 container paddingBottom={2} spacing={3}>
      <Grid2 size={12}>
          <Grid2 container alignItems={'center'} spacing={2}>
            <Grid2>
              <ShoppingBag/>
            </Grid2>
            <Grid2>
              <Heading level="h2">
                Regions popularity
              </Heading>
            </Grid2>
          </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <RegionsPopularityDetails orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid2>
    </Grid2>
  )
}