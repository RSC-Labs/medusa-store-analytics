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

export { ComparedDate, SwitchComparison, DropdownOrderStatus, SelectDateLasts } from './common/overview-components';

export { OrdersOverviewCard } from './orders/orders-overview-card'
export { OrdersPaymentProviderCard } from './orders/orders-payment-provider-card'

export { SalesOverviewCard } from './sales/sales-overview-card'
export { SalesChannelPopularityCard } from './sales/sales-channel-popularity-card'
export { RefundsOverviewCard } from './sales/refunds/refunds-overview-card'
export { RegionsPopularityCard } from './sales/regions-popularity-card'

export { CustomersOverviewCard } from './customers/customers-overview-card'
export { CustomersRepeatCustomerRate } from './customers/repeat-customer-rate/customers-repeat-customer-rate';
export { CustomersRetentionCustomerRate } from './customers/retention-customer-rate/customers-retention-customer-rate';
export { CumulativeCustomersCard } from './customers/cumulative-history/cumulative-customers-card';

export { VariantsTopByCountCard } from './products/variants-top-by-count';
export { ReturnedVariantsByCountCard } from './products/returned_variants/returned-variants-by-count';
export { ProductsSoldCountCard } from './products/products-sold-count';
export { OutOfTheStockVariantsCard } from './products/out_of_the_stock_variants/out-of-the-stock-variants-by-count';

export { DiscountsTopCard } from './marketing/discounts-top-by-count';

export { DateLasts, OrderStatus } from './utils/types'
export type { DateRange } from './utils/types'
export { convertDateLastsToComparedDateRange, convertDateLastsToDateRange, amountToDisplay, calculatePercentage } from './utils/helpers'