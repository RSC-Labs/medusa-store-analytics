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
import { PercentageComparison } from "../../common/percentage-comparison";
import { IconComparison } from "../../common/icon-comparison";
import { RefundsResponse } from "../types";

export const RefundsNumber = ({refundsResponse, compareEnabled} : {refundsResponse: RefundsResponse, compareEnabled?: boolean}) => {
  const overallCurrentSum: number = parseInt(refundsResponse.analytics.current) / 100;
  const overallPreviousSum: number | undefined  = refundsResponse.analytics.previous !== undefined ? 
    parseInt(refundsResponse.analytics.previous) / 100 : undefined;

  return (
    <Grid container alignItems={'center'} spacing={2}>
      <Grid item>
        <Heading level="h1">
          {overallCurrentSum.toFixed(2)} {refundsResponse.analytics.currencyCode.toUpperCase()}
        </Heading>
      </Grid>
      {compareEnabled && refundsResponse.analytics.dateRangeFromCompareTo && 
      <Grid item>
        <Grid container alignItems={'center'}>
          <Grid item>
            <IconComparison current={overallCurrentSum} previous={overallPreviousSum ? overallPreviousSum : undefined}/>
          </Grid>
          {overallPreviousSum !== undefined && <Grid item>
            <PercentageComparison current={overallCurrentSum.toFixed(2)} label={refundsResponse.analytics.currencyCode.toUpperCase()} previous={overallPreviousSum.toFixed(2)}/>
          </Grid>}
        </Grid>
      </Grid>
      }
    </Grid>
  );
}