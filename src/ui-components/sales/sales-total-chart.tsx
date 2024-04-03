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
import { ChartCurrentPrevious } from "../common/chart-components";
import { SalesHistoryResponse } from "./types";
import { amountToDisplay } from "../utils/helpers";

export const SalesByNewChart = ({salesHistoryResponse, compareEnabled} : {salesHistoryResponse: SalesHistoryResponse, compareEnabled?: boolean}) => {
  const rawChartData = {
    current: salesHistoryResponse.analytics.current.map(currentData => {
      return {
        date: new Date(currentData.date),
        value: amountToDisplay(parseInt(currentData.total), salesHistoryResponse.analytics.currencyDecimalDigits)
      };
    }),
    previous: salesHistoryResponse.analytics.previous.map(previousData => {
      return {
        date: new Date(previousData.date),
        value: amountToDisplay(parseInt(previousData.total), salesHistoryResponse.analytics.currencyDecimalDigits)
      };
    }),
  };
  return (
    <>
      <Heading level="h3">Sales by time</Heading>
      <ChartCurrentPrevious          
         rawChartData={rawChartData} 
        fromDate={new Date(salesHistoryResponse.analytics.dateRangeFrom)} 
        toDate={new Date(salesHistoryResponse.analytics.dateRangeTo)}
        fromCompareDate={salesHistoryResponse.analytics.dateRangeFromCompareTo ? new Date(salesHistoryResponse.analytics.dateRangeFromCompareTo) : undefined}
        toCompareDate={salesHistoryResponse.analytics.dateRangeToCompareTo ? new Date(salesHistoryResponse.analytics.dateRangeToCompareTo) : undefined}
        compareEnabled={compareEnabled}
        />
    </>
  )
}