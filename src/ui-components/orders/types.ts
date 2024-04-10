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


export type OrdersPaymentProvider = {
  orderCount: string,
  percentage: string,
  paymentProviderId: string
}

export type OrdersPaymentProviderPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersPaymentProvider[]
  previous: OrdersPaymentProvider[]
}

export type OrdersPaymentProviderResponse = {
  analytics: OrdersPaymentProviderPopularityResult
}