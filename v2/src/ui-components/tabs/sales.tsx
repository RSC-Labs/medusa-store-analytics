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

import { Container } from "@medusajs/ui"
import { 
  DiscountsTopCard,
  SalesChannelPopularityCard,
  OrderStatus,
  SalesOverviewCard,
  RefundsOverviewCard
} from '..';
import type { DateRange } from '..';
import { Grid } from "@mui/material";

const SalesTab = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesOverviewCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesChannelPopularityCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <RefundsOverviewCard dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <DiscountsTopCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo}/>
          </Container>
        </Grid>
      </Grid> 
    )
}

export default SalesTab