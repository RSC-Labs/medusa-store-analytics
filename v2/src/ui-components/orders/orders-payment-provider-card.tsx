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
import { Cash } from "@medusajs/icons";
import { OrdersPaymentProviderResponse } from "./types";
import { OrdersPaymentProviderPieChart } from "./orders-payment-provider-chart";
import { useEffect, useState } from "react";
import { deduceDateUrlParams } from "../utils/helpers";

const OrdersPaymentProviderDetails = ({dateRange, dateRangeCompareTo, compareEnabled} : 
  {dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {

    const [data, setData] = useState<OrdersPaymentProviderResponse | undefined>(undefined)

    const [error, setError] = useState<any>(undefined);
  
    const [isLoading, setLoading] = useState(true)
  
    useEffect(() => {
      setLoading(true);
    }, [dateRange, dateRangeCompareTo])
  
    useEffect(() => {
      if (!isLoading) {
        return;
      }
  
      fetch(`/admin/orders-analytics/payment-provider?${deduceDateUrlParams(dateRange, dateRangeCompareTo).toString()}`, {
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

  if (data && data.analytics == undefined) {
    return <Heading level="h3">Cannot get orders</Heading>
  }

  if (data && data.analytics.dateRangeFrom) {
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