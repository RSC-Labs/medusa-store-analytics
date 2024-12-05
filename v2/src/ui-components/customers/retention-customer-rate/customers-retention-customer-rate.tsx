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
import { CircularProgress, Grid, Grid2 } from "@mui/material";
import type { DateRange } from "../../utils/types";
import { CustomersRetentionCustomerRateResponse } from "../types";
import { RetentionCustomerRateNumber } from "./customers-retention-customer-rate-number";
import { OrderStatus } from "../../utils/types";
import { deduceDateUrlParams } from "../../../ui-components/utils/helpers";
import { useEffect, useState } from "react";

const RetentionCustomerRateDetails = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {

  const [data, setData] = useState<CustomersRetentionCustomerRateResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo, orderStatuses])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/customers-analytics/retention-customer-rate?${deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses).toString()}`, {
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
    return <Heading level="h3">Cannot get orders or customers</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return (
      <Grid container>
        <Grid item xs={12} md={12}>
          <RetentionCustomerRateNumber retentionCustomerRateResponse={data} compareEnabled={compareEnabled}/>
        </Grid>
      </Grid>
    )
  } else {
    return <Heading level="h3">No orders or customers</Heading>
  }
}

export const CustomersRetentionCustomerRate = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
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
                Retention customer rate
              </Heading>
            </Grid2>
          </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <RetentionCustomerRateDetails orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid2>
    </Grid2>
  )
}