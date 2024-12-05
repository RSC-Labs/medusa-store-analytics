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

export function calculateResolution(date?: Date) : DateResolutionType | undefined {
  if (!date) return undefined;

  const weekAgoTruncated = new Date(new Date(Date.now() - 604800000).setHours(0,0,0,0)); 
  if (date.getTime() >= weekAgoTruncated.getTime()) {
    return DateResolutionType.Day;
  }

  const monthAgoTruncated = new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0,0,0,0));
  if (date.getTime() >= monthAgoTruncated.getTime()) {
    return DateResolutionType.Day;
  }

  const yearAgoTruncated = new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setHours(0,0,0,0));
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