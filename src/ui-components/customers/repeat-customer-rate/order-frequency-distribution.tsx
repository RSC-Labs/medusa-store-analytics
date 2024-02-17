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
import { Grid } from "@mui/material";
import { CustomersRepeatCustomerRateResponse } from "../types"
import { OrderFrequencyDistributionPieChart } from "./order-frequency-distribution-chart";

export const OrderFrequencyDistribution = ({repeatCustomerRateResponse, compareEnabled} : {repeatCustomerRateResponse: CustomersRepeatCustomerRateResponse, compareEnabled?: boolean}) => {
  return (
    <Grid container direction={'column'} alignItems={'center'} paddingTop={3}>
      <Grid item>
        <Heading level="h3">
          How orders were distributed?
        </Heading>
      </Grid>
      <Grid item>
        <OrderFrequencyDistributionPieChart repeatCustomerRateResponse={repeatCustomerRateResponse} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}