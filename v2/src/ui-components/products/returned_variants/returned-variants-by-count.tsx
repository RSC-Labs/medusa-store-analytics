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
import type { DateRange } from "../../utils/types";
import { ReturnedVariantsTable, VariantsTopTableRow } from "./returned-variants-table";
import { deduceDateUrlParams } from "../../../ui-components/utils/helpers";
import { useEffect, useState } from "react";

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

const ReturnedVariantsByCount = ({dateRange, dateRangeCompareTo} : {
  dateRange?: DateRange, dateRangeCompareTo?: DateRange}) => {

  const [data, setData] = useState<VariantsCountPopularityResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/products-analytics/returned-by-count?${deduceDateUrlParams(dateRange, dateRangeCompareTo).toString()}`, {
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
    return <Heading level="h3">Cannot get orders or products</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return <ReturnedVariantsTable tableRows={transformToVariantTopTable(data.analytics)}/>
  } else {
    return <Heading level="h3">No products for selected orders</Heading>
  }
}

export const ReturnedVariantsByCountCard = ({dateRange, dateRangeCompareTo} :
  {dateRange?: DateRange, dateRangeCompareTo?: DateRange}) => {
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2} alignItems={'center'}>
            <Grid item>
              <ShoppingBag/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Top returned variants
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <ReturnedVariantsByCount dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo}/>
      </Grid>
    </Grid>
  )
}