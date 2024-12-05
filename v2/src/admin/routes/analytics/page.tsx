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

import { useEffect, useState } from 'react';
import { useMemo } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tabs } from "@medusajs/ui"
import { LightBulb } from "@medusajs/icons"
import { Box, CircularProgress, Grid2 } from "@mui/material";
import OverviewTab from "../../../ui-components/tabs/overview";
import OrdersTab from "../../../ui-components/tabs/orders";
import ProductsTab from '../../../ui-components/tabs/products';
import SalesTab from '../../../ui-components/tabs/sales';
import CustomersTab from '../../../ui-components/tabs/customers';
import { DateLasts, DropdownOrderStatus, OrderStatus, convertDateLastsToComparedDateRange, convertDateLastsToDateRange } from '../../../ui-components';
import { Grid } from "@mui/material";
import { ComparedDate, GenerateReportButton, SelectDateLasts, SwitchComparison } from '../../../ui-components/common/overview-components';
import ProTab from '../../../ui-components/tabs/pro';

const AnalyticsPage = () => {
  const [dateLast, setDateLasts] = useState<DateLasts>(DateLasts.LastWeek);
  const [compareEnabled, setCompare] = useState<boolean>(true)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([OrderStatus.COMPLETED, OrderStatus.PENDING])

  const dateRange = useMemo(() => convertDateLastsToDateRange(dateLast), [dateLast])
  const dateRangeComparedTo = useMemo(() => convertDateLastsToComparedDateRange(dateLast), [dateLast])

  function setDateLastsString(select: string) {
    switch (select) {
      case DateLasts.LastWeek:
        setDateLasts(DateLasts.LastWeek);
        break;
      case DateLasts.LastMonth:
        setDateLasts(DateLasts.LastMonth);
        break;
      case DateLasts.LastYear:
        setDateLasts(DateLasts.LastYear);
        break;
      case DateLasts.All:
        setDateLasts(DateLasts.All);
        break;
    }
  }
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          <Grid item>
            <DropdownOrderStatus onOrderStatusChange={setOrderStatuses} appliedStatuses={orderStatuses}/>
          </Grid>
          <Grid item>
            <SelectDateLasts dateLast={dateLast} onSelectChange={setDateLastsString}/>
          </Grid>
          <Grid item>
            <GenerateReportButton orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} xl={12}>
        <Grid container alignItems='center' columnSpacing={6}>
          <Grid item>
            <SwitchComparison compareEnabled={compareEnabled} onCheckChange={setCompare} allTime={dateLast == DateLasts.All}/>
          </Grid>
          <Grid item>
            <ComparedDate compare={compareEnabled} comparedToDateRange={dateRangeComparedTo}/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <Tabs defaultValue='overview'>
          <Tabs.List style={ { justifyContent: 'center' } }>
            <Tabs.Trigger value='overview'>Overview</Tabs.Trigger>
            <Tabs.Trigger value='sales'>Sales</Tabs.Trigger>
            <Tabs.Trigger value='orders'>Orders</Tabs.Trigger>
            <Tabs.Trigger value='customers'>Customers</Tabs.Trigger>
            <Tabs.Trigger value='products'>Products</Tabs.Trigger>
            {import.meta.env.VITE_MEDUSA_ADMIN_MEDUSA_STORE_ANALYTICS_HIDE_PRO === undefined && <Tabs.Trigger value='pro' style={ { color: 'purple' }}>Pro version</Tabs.Trigger>} 
         </Tabs.List>
          <Tabs.Content value='overview'>
            <Box height={20}></Box>
            <OverviewTab orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
          </Tabs.Content>
          <Tabs.Content value='sales'>
            <Box height={20}></Box>
            <SalesTab orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
          </Tabs.Content>
          <Tabs.Content value='orders'>
            <Box height={20}></Box>
            <OrdersTab orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
          </Tabs.Content>
          <Tabs.Content value='customers'>
            <Box height={20}></Box>
            <CustomersTab orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
          </Tabs.Content>
          <Tabs.Content value='products'>
            <Box height={20}></Box>
            <ProductsTab orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
          </Tabs.Content>
          {import.meta.env.VITE_MEDUSA_ADMIN_MEDUSA_STORE_ANALYTICS_HIDE_PRO === undefined && <Tabs.Content value='pro'>
            <Box height={20}></Box>
            <ProTab/>
          </Tabs.Content>}
        </Tabs>
      </Grid>
    </Grid>
  );
}

export default AnalyticsPage

export const config = defineRouteConfig({
  label: "Analytics",
  icon: LightBulb,
})
