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
import { PercentageComparison } from "../common/percentage-comparison";
import { IconComparison } from "../common/icon-comparison";
import { SalesHistoryResponse } from "./types";

export const SalesNumber = ({salesHistoryResponse, compareEnabled} : {salesHistoryResponse: SalesHistoryResponse, compareEnabled?: boolean}) => {
  const overallCurrentSum: number = salesHistoryResponse.analytics.current.reduce((sum, order) => sum + parseInt(order.total), 0) / 100;
  const overallPreviousSum: number | undefined  = salesHistoryResponse.analytics.previous.length > 0 ? 
  salesHistoryResponse.analytics.previous.reduce((sum, order) => sum + parseInt(order.total), 0) / 100 : 
    undefined;

  return (
    <Grid container alignItems={'center'} spacing={2}>
      <Grid item>
        <Heading level="h1">
          {overallCurrentSum.toFixed(2)} {salesHistoryResponse.analytics.currencyCode}
        </Heading>
      </Grid>
      {compareEnabled && salesHistoryResponse.analytics.dateRangeFromCompareTo && 
      <Grid item>
        <Grid container alignItems={'center'}>
          <Grid item>
            <IconComparison current={overallCurrentSum} previous={overallPreviousSum ? overallPreviousSum : undefined}/>
          </Grid>
          {overallPreviousSum !== undefined && <Grid item>
            <PercentageComparison current={overallCurrentSum.toFixed(2)} label={salesHistoryResponse.analytics.currencyCode} previous={overallPreviousSum.toFixed(2)}/>
          </Grid>}
        </Grid>
      </Grid>
      }
    </Grid>
  );
}