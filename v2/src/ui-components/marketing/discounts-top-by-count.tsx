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
import { OrderStatus } from "../utils/types";
import { DiscountsTopTable, DiscountsTopTableRow } from "./discounts-top-table";
import { useEffect, useState } from "react";
import { deduceDateUrlParams } from "../utils/helpers";

type DiscountsCountPopularity = {
  sum: string,
  discountId: string,
  discountCode: string,
}

type DiscountsCountPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: DiscountsCountPopularity[],
  previous: DiscountsCountPopularity[] | undefined
}

type DiscountsCountPopularityResponse = {
  analytics: DiscountsCountPopularityResult
}

function transformToDiscountsTopTable(result: DiscountsCountPopularityResult): DiscountsTopTableRow[] {
  const currentMap = new Map<string, DiscountsTopTableRow>();

  result.current.forEach(currentItem => {
    const currentCount = currentMap.get(currentItem.discountId) ? currentMap.get(currentItem.discountId).sum : '0';
    currentMap.set(currentItem.discountId, {
      discountCode: currentItem.discountCode,
      sum: (parseInt(currentCount) + parseInt(currentItem.sum)).toString()
    });
  });

  return Array.from(currentMap.values());
}

const DiscountsTopByCount = ({orderStatuses, dateRange, dateRangeCompareTo} : {
  orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange}) => {

  const [data, setData] = useState<DiscountsCountPopularityResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo, orderStatuses])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/marketing-analytics/discounts-by-count?${deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses).toString()}`, {
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
    return <Heading level="h3">Cannot get orders or discounts</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return <DiscountsTopTable tableRows={transformToDiscountsTopTable(data.analytics)}/>
  } else {
    return <Heading level="h3">No discounts for selected orders</Heading>
  }
}

export const DiscountsTopCard = ({orderStatuses, dateRange, dateRangeCompareTo} :
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange}) => {
  return (
    <Grid2 container paddingBottom={2} spacing={3}>
      <Grid2 size={12}>
          <Grid2 container alignItems={'center'} spacing={2}>
            <Grid2>
              <ShoppingBag/>
            </Grid2>
            <Grid2>
              <Heading level="h2">
              Top discounts
              </Heading>
            </Grid2>
          </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <DiscountsTopByCount orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo}/>
      </Grid2>
    </Grid2>
  )
}