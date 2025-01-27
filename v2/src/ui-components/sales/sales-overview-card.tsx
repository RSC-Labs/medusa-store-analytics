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

import { Heading, Select, Text, Alert } from "@medusajs/ui";
import { CurrencyDollar } from "@medusajs/icons";
import { CircularProgress, Grid } from "@mui/material";
import type { DateRange, OrderStatus } from "../utils/types";
import { SalesNumber } from "./sales-number-overview";
import { useEffect, useState } from 'react';
import { SalesByNewChart } from "./sales-total-chart";
import { SalesHistoryResponse } from "./types";
import { deduceDateUrlParams } from "../utils/helpers";
import { RegionDTO } from "@medusajs/framework/types";

const SalesDetails = ({orderStatuses, currencyCode, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], currencyCode: string, dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {

  const [data, setData] = useState<SalesHistoryResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
  }, [dateRange, dateRangeCompareTo, orderStatuses, currencyCode])

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const searchParams = deduceDateUrlParams(dateRange, dateRangeCompareTo, orderStatuses);
    searchParams.append('currencyCode', currencyCode)

    fetch(`/admin/sales-analytics/history?${searchParams.toString()}`, {
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
    return (
      <Grid item xs={12} md={12}> 
        <Heading level="h3">Cannot get orders</Heading>
      </Grid>
    )
  }

  if (data && data.analytics.dateRangeFrom && data.analytics.dateRangeTo) {
    return (
      <>
        <Grid item xs={12} md={12}>
          <SalesNumber salesHistoryResponse={data} compareEnabled={compareEnabled}/>
        </Grid>
        <Grid item xs={12} md={12}>
          <SalesByNewChart dateRangeFrom={new Date(data.analytics.dateRangeFrom)} dateRangeTo={new Date(data.analytics.dateRangeTo)} salesHistoryResponse={data} compareEnabled={compareEnabled}/> 
        </Grid>
      </>
    )
  } else {
    return (
      <Grid item xs={12} md={12}> 
        <Heading level="h3">No orders</Heading>
      </Grid>
    )
  }
}

export const SalesOverviewCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {

  const [ value , setValue ] = useState<string | undefined>();

  const [regions, setRegions] = useState<RegionDTO[] | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    fetch(`/admin/regions/`, {
      credentials: "include",
    })
    .then((res) => res.json())
    .then((result) => {
      setRegions(result.regions)
      setLoading(false)
    })
    .catch((error) => {
      setError(error);
      console.error(error);
    }) 
  }, [isLoading])
  
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item>
              <CurrencyDollar/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Total sales
              </Heading>
            </Grid>
            <Grid item>
              <div className="w-[256px]">
                <Select size="small" onValueChange={setValue} value={value}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a currency" />
                  </Select.Trigger>
                  <Select.Content>
                    {isLoading && <CircularProgress/>}
                    {regions && !regions.length && <Text>No regions</Text>}
                    {regions && regions.length > 0 && [...new Set(regions.map(region => region.currency_code))].map((currencyCode) => (
                      <Select.Item key={currencyCode} value={currencyCode}>
                        {currencyCode.toUpperCase()}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </Grid>
          </Grid>
      </Grid>
      {value ? <SalesDetails orderStatuses={orderStatuses} currencyCode={value} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/> : 
        <Grid item>
          <Heading level="h2">Please select a currency</Heading>
        </Grid>
      }
    </Grid>
  )
}