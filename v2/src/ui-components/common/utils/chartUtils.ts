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

export enum ChartResolutionType {
  DayMonth,
  Month
}

export function calculateResolution(fromDate?: Date, toDate?: Date) : ChartResolutionType {
  if (!fromDate) return undefined;

  const calculateToDate = toDate ? new Date(toDate) : new Date(Date.now());
  const diffTime = calculateToDate.getTime() - fromDate.getTime();

  const weekTime = 604800000;
  const monthTime = weekTime * 4;
  const twoMonthsTime = monthTime * 2;
  if (diffTime <= twoMonthsTime) {
    return ChartResolutionType.DayMonth;
  }

  const yearTime = monthTime * 12;
  if (diffTime < yearTime) {
    return ChartResolutionType.Month;
  }
  return ChartResolutionType.Month
}

export const compareDatesBasedOnResolutionType = (date1: Date, date2: Date, resolutionType: ChartResolutionType): boolean => {
  switch (resolutionType) {
    case ChartResolutionType.DayMonth:
      return new Date(new Date(date1).setHours(0,0,0,0)).getTime() == new Date(new Date(date2).setHours(0,0,0,0)).getTime();
    case ChartResolutionType.Month:
      return new Date(new Date(new Date(date1).setDate(0)).setHours(0,0,0,0)).getTime() == new Date(new Date(new Date(date2).setDate(0)).setHours(0,0,0,0)).getTime();
    default:
      return new Date(new Date(date1).setHours(0,0,0,0)).getTime() == new Date(new Date(date2).setHours(0,0,0,0)).getTime();
  }
}

export const getChartDateName = (date: Date, resolutionType: ChartResolutionType, startDate: Date, endDate: Date): string => {
  
  switch (resolutionType) {
    case ChartResolutionType.DayMonth:
      if (compareDatesBasedOnResolutionType(date, startDate, resolutionType) || compareDatesBasedOnResolutionType(date, endDate, resolutionType)) {
        return `${date.getDate().toString()} ${getShortMonthName(date)}`;
      }
      return date.getDate().toString();
    case ChartResolutionType.Month:
      if (compareDatesBasedOnResolutionType(date, startDate, resolutionType) || compareDatesBasedOnResolutionType(date, endDate, resolutionType)) {
        return `${getShortMonthName(date)} ${date.getFullYear().toString()}`;
      }
      return getShortMonthName(date);
    default:
      return date.getFullYear().toString()
  }
}

export const getChartTooltipDate = (date: Date, resolutionType: ChartResolutionType): string => {
  switch (resolutionType) {
    case ChartResolutionType.DayMonth:
      return `${date.getDate().toString()}-${getShortMonthName(date)}`;
    case ChartResolutionType.Month:
      return `${getShortMonthName(date)}-${date.getFullYear()}`;
    default:
      return date.getFullYear().toString()
  }
}

export const getLegendName = (current: boolean): string => {
  return current ? `Current` : `Preceding`;
}

const getShortMonthName = (date: Date) => {
  let days = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return days[date.getMonth()];
}