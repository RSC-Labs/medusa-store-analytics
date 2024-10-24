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

import { useAdminCustomQuery } from "medusa-react"
import { Heading, Alert } from "@medusajs/ui";
import { CircularProgress } from "@mui/material";
import { DateRange } from "../utils/types";
import { ChartCurrentPrevious } from "../common/chart-components";

type AdminCustomersStatisticsQuery = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

type CustomersHistory = {
  customerCount: string,
  date: string
}

type CustomersHistoryResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    current: CustomersHistory[];
    previous: CustomersHistory[];
  }
}

export const TabByNewChart = ({dateRange, dateRangeCompareTo, compareEnabled} : {dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {

  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminCustomersStatisticsQuery,
    CustomersHistoryResponse
  >(
    `/tab-analytics/history`,
    [dateRange, dateRangeCompareTo],
    {
      dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
      dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
      dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
      dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined
    }
  )

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (isError) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return <Alert variant="error">{errorText}</Alert>
  }

  if (data.analytics == undefined) {
    return <Heading level="h3">Cannot get tabs</Heading>
  }

  if (data.analytics.dateRangeFrom && data.analytics.dateRangeTo) {
    const rawChartData = {
      current: data.analytics.current.map(currentData => {
        return {
          date: new Date(currentData.date),
          value: currentData.customerCount
        };
      }),
      previous: data.analytics.previous.map(previousData => {
        return {
          date: new Date(previousData.date),
          value: previousData.customerCount
        };
      }),
    };
    return (
      <>
        <Heading level="h3">Tabs created over time</Heading>
        <ChartCurrentPrevious 
          rawChartData={rawChartData} 
          fromDate={new Date(data.analytics.dateRangeFrom)} 
          toDate={new Date(data.analytics.dateRangeTo)}
          fromCompareDate={data.analytics.dateRangeFromCompareTo ? new Date(data.analytics.dateRangeFromCompareTo) : undefined}
          toCompareDate={data.analytics.dateRangeToCompareTo ? new Date(data.analytics.dateRangeToCompareTo) : undefined}
          compareEnabled={compareEnabled}
        />
      </>
    )
  } else {
    return <Heading level="h3">No tabs</Heading>
  }
}