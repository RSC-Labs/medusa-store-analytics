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

import { ChartResolutionType } from "../../utils/types";

export function calculateResolution(date?: Date) : ChartResolutionType {
  if (!date) return undefined;

  const weekAgoTruncated = new Date(new Date(Date.now() - 604800000).setHours(0,0,0,0)); 
  if (date >= weekAgoTruncated) {
    return ChartResolutionType.DayWeek;
  }

  const monthAgoTruncated = new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0,0,0,0));
  if (date >= monthAgoTruncated) {
    return ChartResolutionType.DayMonth;
  }

  const yearAgoTruncated = new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setHours(0,0,0,0));
  if (date > yearAgoTruncated) {
    return ChartResolutionType.Month;
  }
  return ChartResolutionType.Month
}

export const getChartDateName = (date: Date, resolutionType: ChartResolutionType): string => {
  switch (resolutionType) {
    case ChartResolutionType.DayWeek:
      return getShortDayName(date);
    case ChartResolutionType.DayMonth:
      return date.getDate().toString();
    case ChartResolutionType.Month:
      return getShortMonthName(date);
    default:
      return date.getFullYear().toString()
  }
}

export const getChartTooltipDate = (date: Date, resolutionType: ChartResolutionType): string => {
  switch (resolutionType) {
    case ChartResolutionType.DayWeek:
      return getFullDayName(date);
    case ChartResolutionType.DayMonth:
      return `${date.getDate().toString()}-${getShortMonthName(date)}`;
    case ChartResolutionType.Month:
      return `${getShortMonthName(date)}-${date.getFullYear()}`;
    default:
      return date.getFullYear().toString()
  }
}

export const getLegendName = (resolutionType: ChartResolutionType, current: boolean): string => {
  switch (resolutionType) {
    case ChartResolutionType.DayWeek:
      return current ? `Current week` : `Previous week`;
    case ChartResolutionType.DayMonth:
      return current ? `Current month` : `Previous month`;
    case ChartResolutionType.Month:
      return current ? `Current year` : `Previous year`;
  }
}

const getFullDayName = (date: Date) => {
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

const getShortDayName = (date: Date) => {
  let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

const getShortMonthName = (date: Date) => {
  let days = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return days[date.getMonth()];
}