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

import { ArrowUpMini, ArrowDownMini, MinusMini } from "@medusajs/icons"

export const IconComparison = ({current, previous, switchArrow} : {current: number, previous?: number, switchArrow?: boolean}) => {
  if (current == previous) {
    return <MinusMini color="black"/>
  }
  if (current > previous) {
    return <ArrowUpMini color={switchArrow ? "red" : "green"}/>
  }
  if (current < previous) {
    return <ArrowDownMini color={switchArrow ? "green" : "red"}/>
  }
}