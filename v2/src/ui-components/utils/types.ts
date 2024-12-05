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

export enum OrderStatus {
  /**
   * The order is pending.
   */
  PENDING = "pending",
  /**
   * The order is completed, meaning that
   * the items have been fulfilled and the payment
   * has been captured.
   */
  COMPLETED = "completed",
  /**
   * The order is archived.
   */
  ARCHIVED = "archived",
  /**
   * The order is canceled.
   */
  CANCELED = "canceled",
  /**
   * The order requires action.
   */
  REQUIRES_ACTION = "requires_action"
}

export enum DateLasts {
  All = "All time",
  LastMonth = "Last 30 days",
  LastWeek = "Last 7 days",
  LastYear = "Last 365 days"
}
export type DateRange = {
  from: Date,
  to: Date
}