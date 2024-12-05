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

import { ModulesSdkUtils } from "@medusajs/framework/utils"

type OrdersHistory = {
  orderCount: string,
  date: string
}

export type OrdersHistoryResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersHistory[];
  previous: OrdersHistory[];
}

export type PgConnectionType = ReturnType<typeof ModulesSdkUtils.createPgConnection>;