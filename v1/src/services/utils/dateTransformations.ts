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

export enum DateResolutionType {
  Day = 'day',
  Month = 'month'
}

export function calculateResolution(date?: Date, toDate?: Date) : DateResolutionType {
  if (!date) return DateResolutionType.Month;

  const weekAgoTruncated = new Date(new Date(Date.now() - 604800000).setHours(0,0,0,0)); 
  const monthAgoTruncated = new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0,0,0,0));
  const yearAgoTruncated = new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setHours(0,0,0,0));

  if (toDate) {
    const diffTime = toDate.getTime() - date.getTime();

    const weekTime = 604800000;
    const monthTime = weekTime * 4;
    const twoMonthsTime = monthTime * 2;
    if (diffTime <= twoMonthsTime) {

      return DateResolutionType.Day;
    }
    const yearTime = monthTime * 12;
  
    if (diffTime < yearTime) {
      return DateResolutionType.Month;
    }
  }

  if (date.getTime() >= weekAgoTruncated.getTime()) {
    return DateResolutionType.Day;
  }

  if (date.getTime() >= monthAgoTruncated.getTime()) {
    return DateResolutionType.Day;
  }

  if (date.getTime() > yearAgoTruncated.getTime()) {
    return DateResolutionType.Month;
  }
  return DateResolutionType.Month
}

export function getTruncateFunction(dateResolution: DateResolutionType) : (date: Date) => Date  {
  if (dateResolution == DateResolutionType.Day) {
    return (date: Date) => new Date(new Date(date).setHours(0,0,0,0));
  } else {
    return (date: Date) => new Date(new Date(new Date(date).setDate(0)).setHours(0,0,0,0))
  }
}