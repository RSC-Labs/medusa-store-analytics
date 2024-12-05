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

import { Heading, Tooltip } from "@medusajs/ui";
import { calculatePercentage } from "../utils/helpers";

export const PercentageComparison = ({current, label, previous, headingLevel = "h2" } : {current: string, label: string, previous: string, headingLevel?: any}) => {
  const percentage: number | undefined = calculatePercentage(parseInt(current), parseInt(previous));
  return (
    <Tooltip content={`Previously: ${previous} ${label}`}>
      <span>
          <Heading level={headingLevel} style={ { textDecorationStyle: 'dotted', textDecorationLine: 'underline', textUnderlineOffset: '3px'}}>
            {percentage !== undefined ? `${percentage}%` : `N/A`}
          </Heading>
      </span>
    </Tooltip>
  )
}