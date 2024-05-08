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

import { calculateResolution, getLegendName } from "../common/utils/chartUtils";
import { Legend, Pie, PieChart, Tooltip } from "recharts";
import { OrdersPaymentProvider, OrdersPaymentProviderResponse } from "./types";
import { Text, Container } from "@medusajs/ui";

function convertToChartData(ordersPaymentProviders: OrdersPaymentProvider[]) {
  if (ordersPaymentProviders.length) {
    return ordersPaymentProviders.map(ordersPaymentProvider => {
      return {
        name: ordersPaymentProvider.paymentProviderId,
        value: parseFloat(ordersPaymentProvider.percentage),
        displayValue: ordersPaymentProvider.paymentProviderId,
        orderCount: ordersPaymentProvider.orderCount,
      }
    })
  }
  return undefined;
}
const ChartCustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
        <Container>
          <Text>{`${payload[0].payload.value}%`}</Text>
          <Text>{`Provider: ${payload[0].payload.name}`}</Text>
          <Text>{`Order count: ${payload[0].payload.orderCount}`}</Text>
        </Container>
      )
  }
  return null;
};

export const OrdersPaymentProviderPieChart = ({ordersPaymentProviderResponse, compareEnabled} : {ordersPaymentProviderResponse: OrdersPaymentProviderResponse, compareEnabled?: boolean}) => {

  const currentData = convertToChartData(ordersPaymentProviderResponse.analytics.current);
  const previousData = convertToChartData(ordersPaymentProviderResponse.analytics.previous);

  const renderLabel = function(entry) {
    return entry.displayValue;
  }

  return (
    <PieChart width={500} height={300}>
      <Pie data={currentData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={90} fill="#82ca9d" label={renderLabel} />
      {compareEnabled && ordersPaymentProviderResponse.analytics.dateRangeFromCompareTo  &&
        <Pie data={previousData} dataKey="value" cx="50%" cy="50%" outerRadius={30} fill="#8884d8"/>
      }
      {(compareEnabled && ordersPaymentProviderResponse.analytics.dateRangeFromCompareTo) && <Legend payload={[
        {
          value: getLegendName(true),
          color: "#82ca9d"
        },
        {
          value: getLegendName(false),
          color: "#8884d8"
        }
      ]} iconType="circle"/>}
      <Tooltip content={<ChartCustomTooltip active={false} payload={[]} label={""}/>} />
    </PieChart>
  );
}