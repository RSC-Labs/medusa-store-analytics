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
import { CircularProgress, Grid } from "@mui/material";
import type { DateRange } from "../utils/types";
import { IconComparison } from "../common/icon-comparison";
import { PercentageComparison } from "../common/percentage-comparison";
import { OrderStatus } from "../utils/types";
import { deduceDateUrlParams } from "../utils/helpers";
import { useEffect, useState } from "react";

export type OrdersCountResponse = {
  analytics: {
    dateRangeFrom: number
    dateRangeTo: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    current: string,
    previous: string
  }
}

export const OrdersNumber = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
 
    const [data, setData] = useState<OrdersCountResponse | undefined>(undefined)

    const [error, setError] = useState<any>(undefined);
  
    const [isLoading, setLoading] = useState(true)
  
    useEffect(() => {
      setLoading(true);
    }, [dateRange, dateRangeCompareTo, orderStatuses])
  
    useEffect(() => {
      if (!isLoading) {
        return;
      }
  
      fetch(`/admin/orders-analytics/count?${deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses).toString()}`, {
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

  return (
    <Grid container alignItems={'center'} spacing={2}>
      <Grid item>
        <Heading level="h1">
          {data.analytics.current}
        </Heading>
      </Grid>
      {compareEnabled && dateRangeCompareTo && 
      <Grid item>
        <Grid container alignItems={'center'}>
          <Grid item>
            <IconComparison current={parseInt(data.analytics.current)} previous={data.analytics.previous ? parseInt(data.analytics.previous) : undefined}/>
          </Grid>
          {data.analytics.previous !== undefined && <Grid item>
            <PercentageComparison current={data.analytics.current} label="" previous={data.analytics.previous}/>
          </Grid>}
        </Grid>
      </Grid>
      }
    </Grid>
  );
}