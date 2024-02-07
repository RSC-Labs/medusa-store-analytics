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

import { useState } from 'react';
import { useMemo } from "react"
import { RouteConfig } from "@medusajs/admin"
import { Button, Container, Tooltip, Text } from "@medusajs/ui"
import { LightBulb } from "@medusajs/icons"
import { ExclamationCircle } from "@medusajs/icons"
import { Box, Grid } from "@mui/material";
import { 
  ComparedDate, 
  DropdownOrderStatus, 
  SwitchComparison, 
  OrdersOverviewCard, 
  SalesOverviewCard, 
  CustomersOverviewCard, 
  CustomersRepeatCustomerRate, 
  SalesChannelPopularityCard, 
  RegionsPopularityCard, 
  VariantsTopByCountCard, 
  DateLasts, 
  OrderStatus, 
  convertDateLastsToDateRange, 
  convertDateLastsToComparedDateRange 
} from '../../../ui-components';

const OverviewPage = () => {

  const [dateLast, setDateLasts] = useState<DateLasts>(DateLasts.LastWeek);
  const [compareEnabled, setCompare] = useState<boolean>(true)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([OrderStatus.COMPLETED, OrderStatus.PENDING])

  const setLastWeek = () => setDateLasts(DateLasts.LastWeek); 
  const setLastMonth = () => setDateLasts(DateLasts.LastMonth); 
  const setLastYear = () => setDateLasts(DateLasts.LastYear); 
  const setAlltime = () => setDateLasts(DateLasts.All);

  const dateRange = useMemo(() => convertDateLastsToDateRange(dateLast), [dateLast])
  const dateRangeComparedTo = useMemo(() => convertDateLastsToComparedDateRange(dateLast), [dateLast])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant={dateLast == DateLasts.LastWeek ? 'primary' : 'secondary'} onClick={setLastWeek}>
              Last week
            </Button>
          </Grid>
          <Grid item>
            <Button variant={dateLast == DateLasts.LastMonth ? 'primary' : 'secondary'} onClick={setLastMonth}>
              Last month
            </Button>
          </Grid>
          <Grid item>
            <Button variant={dateLast == DateLasts.LastYear ? 'primary' : 'secondary'} onClick={setLastYear}>
              Last year
            </Button>
          </Grid>
          <Grid item>
            <Grid container alignItems={'center'} spacing={1}>
              <Grid item>
                <Button variant={dateLast == DateLasts.All ? 'primary' : 'secondary'} onClick={setAlltime}>
                  All time
                </Button>
              </Grid>
              <Grid item>
                <Tooltip content='If you have many orders, it might take a while to load statistics.'>
                    <ExclamationCircle />
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          {/* Workaround to have Tooltip working */}
          <Grid container>
            <Grid item>
              <Box minHeight={20}></Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} xl={12}>
        <Grid container alignItems='center' spacing={6}>
          <Grid item>
            <SwitchComparison compareEnabled={compareEnabled} onCheckChange={setCompare} allTime={dateLast == DateLasts.All}/>
          </Grid>
          <Grid item>
            <ComparedDate compare={compareEnabled} comparedToDateRange={dateRangeComparedTo}/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} xl={12}>
        <Grid container alignItems='center' spacing={1}>
          <Grid item>
            <DropdownOrderStatus onOrderStatusChange={setOrderStatuses} appliedStatuses={orderStatuses}/>
          </Grid>
          <Grid item>
            <Text>Choose Orders</Text>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <OrdersOverviewCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <SalesOverviewCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <CustomersOverviewCard dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} xl={12}>
            <Container>
              <CustomersRepeatCustomerRate orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
            </Container>
          </Grid>
          <Grid item xs={12} md={12} xl={12}>
            <Container>
              <SalesChannelPopularityCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
            </Container>
          </Grid>
          <Grid item xs={12} md={12} xl={12}>
            <Container>
              <RegionsPopularityCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
            </Container>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <VariantsTopByCountCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
    </Grid> 
  )
}

export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: LightBulb,
  },
}
  
export default OverviewPage