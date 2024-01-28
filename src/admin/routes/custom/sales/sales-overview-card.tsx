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

import { Heading, Select, Text } from "@medusajs/ui";
import { CurrencyDollar } from "@medusajs/icons";
import { CircularProgress, Grid } from "@mui/material";
import { DateRange } from "../utils/types";
import { SalesNumber } from "./sales-number-overview";
import { useState } from 'react';
import { useAdminRegions } from "medusa-react"
import { SalesByNewChart } from "./sales-total-chart";
import { useAdminCustomQuery } from "medusa-react"
import { SalesHistoryResponse } from "./types";
import { OrderStatus } from "../common/types";

type AdminSalesStatisticsQuery = {
  orderStatuses: string[],
  currencyCode: string,
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

const SalesDetails = ({orderStatuses, currencyCode, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], currencyCode: string, dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {
  const { data, isLoading } = useAdminCustomQuery<
    AdminSalesStatisticsQuery,
    SalesHistoryResponse
  >(
    `/sales-analytics/history`,
    [orderStatuses, currencyCode, dateRange, dateRangeCompareTo],
    {
      orderStatuses: Object.values(orderStatuses),
      dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
      dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
      dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
      dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined,
      currencyCode: currencyCode
    }
  )

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (data.analytics == undefined) {
    return (
      <Grid item xs={12} md={12}> 
        <Heading level="h3">Cannot get orders</Heading>
      </Grid>
    )
  }

  if (data.analytics.dateRangeFrom) {
    return (
      <>
        <Grid item xs={12} md={12}>
          <SalesNumber salesHistoryResponse={data} compareEnabled={compareEnabled}/>
        </Grid>
        <Grid item xs={12} md={12}>
          <SalesByNewChart salesHistoryResponse={data} compareEnabled={compareEnabled}/> 
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

  const { regions, isLoading } = useAdminRegions();
  const [ value , setValue ] = useState<string | undefined>();
  
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