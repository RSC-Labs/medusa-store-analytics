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
import { Button, Container, Tooltip, Text, Label, Switch, DropdownMenu, IconButton, Checkbox } from "@medusajs/ui"
import { EllipsisHorizontal, InformationCircleSolid, LightBulb } from "@medusajs/icons"
import { ExclamationCircle } from "@medusajs/icons"
import { OrdersOverviewCard } from "./orders/orders-overview-card";
import { Box, Grid } from "@mui/material";
import { DateLasts, DateRange, convertDateLastsToComparedDateRange, convertDateLastsToDateRange } from './utils/types';
import { OrderStatus } from './common/types';
import { SalesOverviewCard } from './sales/sales-overview-card';
import { CustomersOverviewCard } from './customers/customers-overview-card';
import { CustomersRepeatCustomerRate } from './customers/customers-repeat-customer-rate';
import { SalesChannelPopularityCard } from './sales/sales-channel-popularity-card';
import { RegionsPopularityCard } from './sales/regions-popularity-card';
import { VariantsTopByCountCard } from './products/variants-top-by-count';

const ComparedDate = ({compare, comparedToDateRange} : {compare: boolean, comparedToDateRange?: DateRange}) => {
  if (comparedToDateRange && compare) {
    return (
      <Text>
        {`Compared to ${comparedToDateRange.from.toLocaleDateString()} - ${comparedToDateRange.to.toLocaleDateString()}`}
      </Text>
    );
  }
  return (
    <Text>
      {`No comparison`}
    </Text>
  ); 
}

type BooleanCallback = (value: boolean) => any;

const SwitchComparison = ({compareEnabled, onCheckChange, allTime} : {compareEnabled: boolean, onCheckChange: BooleanCallback, allTime: boolean}) => {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory" onCheckedChange={onCheckChange} disabled={allTime} checked={compareEnabled && !allTime}/>
      <Label htmlFor="manage-inventory">Compare</Label>
    </div>
  )
}

type OrderStatusCallback = (value: OrderStatus[]) => any;

const DropdownOrderStatus = ({onOrderStatusChange, appliedStatuses} : {onOrderStatusChange: OrderStatusCallback, appliedStatuses: OrderStatus[]}) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleStatusToggle = (status) => {
    setSelectedStatuses((prevSelectedStatuses) =>
      prevSelectedStatuses.includes(status)
        ? prevSelectedStatuses.filter((selected) => selected !== status)
        : [...prevSelectedStatuses, status]
    );
  };


  const handleApplyClick = () => {
    // Close the dropdown when Apply is clicked
    setIsDropdownOpen(false);
    onOrderStatusChange(selectedStatuses.map(selectedStatus => OrderStatus[selectedStatus.toUpperCase()]));
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={(isOpen) => {
      if (isOpen) {
        setSelectedStatuses(Object.values(appliedStatuses));
      }
      setIsDropdownOpen(isOpen)
    }}>
    <DropdownMenu.Trigger asChild>
      <IconButton>
        <EllipsisHorizontal />
      </IconButton>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      {Object.values(OrderStatus).map(orderStatus => (
        <DropdownMenu.Item className="gap-x-2" onSelect={event => event.preventDefault()}>
          <Checkbox 
            id={`order-status-${orderStatus}`}
            checked={selectedStatuses.includes(orderStatus)}
            onCheckedChange={() => handleStatusToggle(orderStatus)}
          />
          <Label htmlFor={`order-status-${orderStatus}`}>{orderStatus}</Label>
        </DropdownMenu.Item>
      ))}
      <DropdownMenu.Label className="gap-x-2">
          <Button onClick={handleApplyClick}>
            Apply
          </Button>
      </DropdownMenu.Label>
    </DropdownMenu.Content> 
    </DropdownMenu>
  )
}

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