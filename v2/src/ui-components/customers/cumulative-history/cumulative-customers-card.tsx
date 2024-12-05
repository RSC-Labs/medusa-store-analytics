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
import { Grid2 } from "@mui/material";
import type { DateRange } from "../../utils/types";
import { CumulativeCustomersChart } from "./cumulative-customers-chart";

export const CumulativeCustomersCard = ({dateRange, dateRangeCompareTo, compareEnabled} : 
  {dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid2 container paddingBottom={2} spacing={3}>
      <Grid2 size={12}>
          <Grid2 container alignItems={'center'} spacing={2}>
            <Grid2>
              <Users/>
            </Grid2>
            <Grid2>
              <Heading level="h2">
              Cumulative customers
              </Heading>
            </Grid2>
          </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <CumulativeCustomersChart dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid2>
    </Grid2>
  )
}