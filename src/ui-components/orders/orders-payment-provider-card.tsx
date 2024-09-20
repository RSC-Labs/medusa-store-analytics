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
import { useAdminCustomQuery } from "medusa-react"
import type { DateRange } from "../utils/types";
import { Cash } from "@medusajs/icons";
import { OrdersPaymentProviderResponse } from "./types";
import { OrdersPaymentProviderPieChart } from "./orders-payment-provider-chart";

type AdminOrdersPaymentProviderQuery = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

const OrdersPaymentProviderDetails = ({dateRange, dateRangeCompareTo, compareEnabled} : 
  {dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminOrdersPaymentProviderQuery,
    OrdersPaymentProviderResponse
    >(
      `/orders-analytics/payment-provider`,
      [dateRange, dateRangeCompareTo],
      {
        dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
        dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
        dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
        dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined
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
    return <Heading level="h3">Cannot get orders</Heading>
  }

  if (data.analytics.dateRangeFrom) {
    return <OrdersPaymentProviderPieChart ordersPaymentProviderResponse={data} compareEnabled={compareEnabled}/>
  } else {
    return <Heading level="h3">No orders</Heading>
  }
}

export const OrdersPaymentProviderCard = ({ dateRange, dateRangeCompareTo, compareEnabled} : 
  {dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item>
              <Cash/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Payment provider popularity
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container direction={'column'} alignItems={'center'} paddingTop={3}>
          <Grid item>
            <OrdersPaymentProviderDetails dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}