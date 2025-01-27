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

import { OrderStatus } from "@medusajs/framework/types";
import { DateLasts } from "./types";
import type { DateRange } from "./types"

export function amountToDisplay(amount: number, decimalDigits: number) : string {
  return (amount / Math.pow(10, decimalDigits)).toFixed(decimalDigits);
}

export function calculatePercentage(current: number, previous: number) : number | undefined {
  if (current == previous) {
    return 0;
  }
  if (current == 0) {
    return 100;
  }

  if (previous == 0) {
    return undefined;
  }

  const percentage: number = Number((((current) - previous) / previous).toFixed(2)) * 100;
  if (percentage > 0) {
    return Math.round(percentage * 100) / 100;
  }
  return Math.round((percentage - percentage - percentage) * 100) / 100;
}

export function convertDateLastsToDateRange(dateLasts: DateLasts): DateRange | undefined {
  let result: DateRange | undefined;
  switch (dateLasts) {
    case DateLasts.LastMonth:
      result = {
        // 86400000 - alignment for taking last 29 days, as the current day is 30
        from: new Date(new Date(new Date().setDate(new Date().getDate() - 29)).setHours(0,0,0,0)),
        to: new Date(Date.now())
      }
      break;
    case DateLasts.LastWeek: 
      result = {
        // 86400000 - alignment for taking last 6 days, as the current day is 7th
        from: new Date(new Date(new Date(Date.now() - 604800000 + 86400000)).setHours(0,0,0,0)),
        to: new Date(Date.now())
      }
      break;
    case DateLasts.LastYear: 
      const lastYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      result = {
        // + 1 - alignment for taking last 11 months, as the current month is 12th
        from: new Date(new Date(new Date().setDate(new Date().getDate() - 364)).setHours(0,0,0,0)),
        to: new Date(Date.now())
      }
      break;
  }
  return result;
}

export function convertDateLastsToComparedDateRange(dateLasts: DateLasts): DateRange | undefined {
  let result: DateRange | undefined;
  switch (dateLasts) {
    case DateLasts.LastMonth: 
      result = {
        from: new Date(new Date(new Date().setDate(new Date().getDate() - 59)).setHours(0,0,0,0)),
        to: new Date(new Date(new Date().setDate(new Date().getDate() - 29)).setHours(0,0,0,0)),
      }
      break;
    case DateLasts.LastWeek: 
      result = {
        from: new Date(new Date(Date.now() - 604800000 * 2 + 86400000).setHours(0,0,0,0)),
        to: new Date(new Date(Date.now() - 604800000 + 86400000).setHours(0,0,0,0)),
      }
      break;
    case DateLasts.LastYear:
      result = {
        from: new Date(new Date(new Date().setDate(new Date().getDate() - 729)).setHours(0,0,0,0)),
        to: new Date(new Date(new Date().setDate(new Date().getDate() - 364)).setHours(0,0,0,0)),
      }
      break;
  }
  return result;
}

export function deduceDateUrlParams(dateRange?: DateRange, dateRangeCompareTo?: DateRange, orderStatuses?: OrderStatus[]): URLSearchParams {

  let dateRangeParams: Record<string, string> = {};
  let dateRangeCompareToParams: Record<string, string> = {};

  if (dateRange) {
    dateRangeParams = {
      dateRangeFrom: dateRange.from.getTime().toString(),
      dateRangeTo: dateRange.to.getTime().toString()
    }
  }
  if (dateRangeCompareTo) {
    dateRangeCompareToParams = {
      dateRangeFromCompareTo: dateRangeCompareTo.from.getTime().toString(),
      dateRangeToCompareTo: dateRangeCompareTo.to.getTime().toString()
    }
  }
  
  const result: URLSearchParams = new URLSearchParams({
    ...dateRangeParams,
    ...dateRangeCompareToParams,
  })
  if (orderStatuses) {
    for (const orderStatus of orderStatuses) {
      result.append('orderStatuses', orderStatus.toString())
    }
  }
  return result;
}