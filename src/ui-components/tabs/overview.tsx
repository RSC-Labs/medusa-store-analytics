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
import { Container } from "@medusajs/ui"
import { Grid } from "@mui/material";
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
  convertDateLastsToComparedDateRange,
  ReturnedVariantsByCountCard,
  DiscountsTopCard
} from '..';
import { SelectDateLasts } from '../common/overview-components';
// import { RefundsOverviewCard } from '../sales/refunds/refunds-overview-card';
// import { ProductsSoldCountCard } from '../products/products-sold-count';
// import { CumulativeCustomersCard } from '../customers/cumulative-history/cumulative-customers-card';

const OverviewTab = () => {

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
        <Container>
          <CustomersRepeatCustomerRate orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <SalesChannelPopularityCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <RegionsPopularityCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <VariantsTopByCountCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <ReturnedVariantsByCountCard dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <DiscountsTopCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeComparedTo}/>
        </Container>
      </Grid>
    </Grid> 
  )
}

export default OverviewTab