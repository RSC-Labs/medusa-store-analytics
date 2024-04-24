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
import { DateRange } from "../utils/types";
import { useAdminCustomQuery } from "medusa-react"
import { OrderStatus } from "../utils/types";
import { VariantsTopTable, VariantsTopTableRow } from "./variants-top-table";

type AdminProductsStatisticsQuery = {
  orderStatuses: string[],
  dateRangeFrom: number
  dateRangeTo: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

type VariantsCountPopularity = {
  sum: string,
  productId: string,
  variantId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

type VariantsCountPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: VariantsCountPopularity[],
  previous: VariantsCountPopularity[] | undefined
}

type VariantsCountPopularityResponse = {
  analytics: VariantsCountPopularityResult
}

function transformToVariantTopTable(result: VariantsCountPopularityResult): VariantsTopTableRow[] {
  const currentMap = new Map<string, VariantsTopTableRow>();

  result.current.forEach(currentItem => {
    const currentCount = currentMap.get(currentItem.variantId) ? currentMap.get(currentItem.variantId).sum : '0';
    currentMap.set(currentItem.variantId, {
      productId: currentItem.productId,
      productTitle: currentItem.productTitle,
      variantTitle: currentItem.variantTitle,
      thumbnail: currentItem.thumbnail,
      sum: (parseInt(currentCount) + parseInt(currentItem.sum)).toString()
    });
  });

  return Array.from(currentMap.values());
}

const VariantsTopByCount = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : {
  orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {
  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminProductsStatisticsQuery,
    VariantsCountPopularityResponse
  >(
    `/products-analytics/popularity-by-count`,
    [orderStatuses, dateRange, dateRangeCompareTo],
    {
      orderStatuses: Object.values(orderStatuses),
      dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
      dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
      dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
      dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined,
    }
  )

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (isError) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return <Alert variant="error">{errorText}</Alert>
  }

  if (data.analytics == undefined) {
    return <Heading level="h3">Cannot get orders or products</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return <VariantsTopTable tableRows={transformToVariantTopTable(data.analytics)}/>
  } else {
    return <Heading level="h3">No products for selected orders</Heading>
  }
}

export const VariantsTopByCountCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} :
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
                Top variants
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <VariantsTopByCount orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}