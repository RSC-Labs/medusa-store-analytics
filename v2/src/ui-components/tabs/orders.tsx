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
  OrdersOverviewCard,
  OrderStatus,
} from '..';
import type { DateRange } from '..';
import { Grid } from "@mui/material";
import { OrdersPaymentProviderCard } from "../orders/orders-payment-provider-card";

const OrdersTab = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <OrdersOverviewCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <OrdersPaymentProviderCard dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
        </Container>
      </Grid>
    </Grid> 
  )
}

export default OrdersTab