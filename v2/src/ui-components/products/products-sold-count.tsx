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
import { CircularProgress, Grid } from "@mui/material";
import type { DateRange } from "../utils/types";
import { OrderStatus } from "../utils/types";
import { IconComparison } from "../common/icon-comparison";
import { PercentageComparison } from "../common/percentage-comparison";
import { useEffect, useState } from "react";
import { deduceDateUrlParams } from "../utils/helpers";

type ProductsSoldCountPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: string,
  previous: string | undefined
}

type ProductsSoldCountPopularityResponse = {
  analytics: ProductsSoldCountPopularityResult
}

const ProductsSoldCountNumbers = ({current, previous, compareEnabled} : {current: string, previous: string | undefined, compareEnabled: boolean}) => {
  return (
    <Grid container alignItems={'center'} spacing={2}>
      <Grid item>
        <Heading level="h1">
          {current}
        </Heading>
      </Grid>
      {previous && compareEnabled &&
      <Grid item>
        <Grid container alignItems={'center'}>
          <Grid item>
            <IconComparison current={parseInt(current)} previous={previous ? parseInt(previous) : undefined}/>
          </Grid>
          {previous !== undefined && <Grid item>
            <PercentageComparison current={current} label="" previous={previous}/>
          </Grid>}
        </Grid>
      </Grid>
      }
    </Grid>
  );
}

const ProductsSoldCount = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : {
  orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {

  const [data, setData] = useState<ProductsSoldCountPopularityResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo, orderStatuses])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/products-analytics/sold-count?${deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses).toString()}`, {
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

  if (data.analytics == undefined || data.analytics.current == undefined) {
    return <Heading level="h3">Cannot get orders or products</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return <ProductsSoldCountNumbers current={data.analytics.current} previous={data.analytics.previous} compareEnabled={compareEnabled}/>
  } else {
    return <Heading level="h3">No products for selected orders</Heading>
  }
}

export const ProductsSoldCountCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} :
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2} alignItems={'center'}>
            <Grid item>
              <ShoppingBag/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Products sold
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <ProductsSoldCount orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}