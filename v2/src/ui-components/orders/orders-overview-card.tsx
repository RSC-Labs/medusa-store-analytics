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

import { Heading } from "@medusajs/ui";
import { ShoppingCart } from "@medusajs/icons";
import { Grid2 } from "@mui/material";
import { OrdersByNewChart } from "./orders-by-new-chart";
import type { DateRange } from "../utils/types";
import { OrdersNumber } from "./orders-number-overview";
import { OrderStatus } from "../utils/types";

export const OrdersOverviewCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid2 container paddingBottom={2} spacing={3}>
      <Grid2 size={12}>
          <Grid2 container alignItems={'center'} spacing={2}>
            <Grid2>
              <ShoppingCart/>
            </Grid2>
            <Grid2>
              <Heading level="h2">
                Orders
              </Heading>
            </Grid2>
          </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <OrdersNumber orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid2>
      <Grid2 size={12}>
        <OrdersByNewChart orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid2>
    </Grid2>
  )
}