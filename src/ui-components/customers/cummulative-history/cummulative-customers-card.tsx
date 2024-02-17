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
import { Users } from "@medusajs/icons";
import { Grid } from "@mui/material";
import { DateRange } from "../../utils/types";
import { CummulativeCustomersChart } from "./cummulative-customers-chart";

export const CummulativeCustomersCard = ({dateRange, dateRangeCompareTo, compareEnabled} : 
  {dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item>
              <Users/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Cummulative customers
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <CummulativeCustomersChart dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}