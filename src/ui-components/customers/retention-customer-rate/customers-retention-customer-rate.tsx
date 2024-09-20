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
import { useAdminCustomQuery } from "medusa-react"
import type { DateRange } from "../../utils/types";
import { CustomersRetentionCustomerRateResponse } from "../types";
import { RetentionCustomerRateNumber } from "./customers-retention-customer-rate-number";
import { OrderStatus } from "../../utils/types";

type AdminCustomersStatisticsQuery = {
  orderStatuses: string[],
  dateRangeFrom: number,
  dateRangeTo: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

const RetentionCustomerRateDetails = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {
  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminCustomersStatisticsQuery,
    CustomersRetentionCustomerRateResponse
  >(
    `/customers-analytics/retention-customer-rate`,
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
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item>
              <ShoppingBag/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Retention customer rate
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <RetentionCustomerRateDetails orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}