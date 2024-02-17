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

import { Heading } from "@medusajs/ui";
import { ShoppingBag } from "@medusajs/icons";
import { CircularProgress, Grid } from "@mui/material";
import { useAdminCustomQuery } from "medusa-react"
import { DateRange } from "../../utils/types";
import { CustomersRepeatCustomerRateResponse } from "../types";
import { RepeatCustomerRateNummber } from "./customers-repeat-customer-rate-number";
import { OrderStatus } from "../../utils/types";
import { OrderFrequencyDistribution } from "./order-frequency-distribution";

type AdminCustomersStatisticsQuery = {
  orderStatuses: string[],
  dateRangeFrom: number,
  dateRangeTo: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

const RepeatCustomerRateDetails = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {
  const { data, isLoading } = useAdminCustomQuery<
    AdminCustomersStatisticsQuery,
    CustomersRepeatCustomerRateResponse
  >(
    `/customers-analytics/repeat-customer-rate`,
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

  if (data.analytics == undefined) {
    return <Heading level="h3">Cannot get orders or customers</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return (
      <Grid container>
        <Grid item xs={12} md={12}>
          <RepeatCustomerRateNummber repeatCustomerRateResponse={data} compareEnabled={compareEnabled}/>
        </Grid>
      </Grid>
    )
  } else {
    return <Heading level="h3">No orders or customers</Heading>
  }
}

export const CustomersRepeatCustomerRate = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
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
                Repeat customer rate
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <RepeatCustomerRateDetails orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}