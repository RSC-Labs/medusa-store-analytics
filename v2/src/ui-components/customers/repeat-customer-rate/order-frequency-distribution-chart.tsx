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

import { getLegendName } from "../../common/utils/chartUtils";
import { CustomersRepeatCustomerRateResponse, Distributions } from "../types"
import { Legend, Pie, PieChart, Tooltip } from "recharts";

const ONE_TIME_LABEL_NAME = 'One-time purchase';
const REPEAT_LABEL_NAME = 'Repeat purchase';

function convertToChartData(distributions: Distributions) {
  if (distributions) {
    if (distributions.orderOneTimeFrequency || distributions.orderRepeatFrequency) {
      const oneTimeValue = distributions.orderOneTimeFrequency ? parseInt(distributions.orderOneTimeFrequency) : 0;
      const repeatValue = distributions.orderRepeatFrequency ? parseInt(distributions.orderRepeatFrequency) : 0;
      return [
        {
          name: ONE_TIME_LABEL_NAME,
          value: oneTimeValue,
          displayValue: ONE_TIME_LABEL_NAME
        },
        {
          name: REPEAT_LABEL_NAME,
          value: repeatValue,
          displayValue: REPEAT_LABEL_NAME
        }
      ]
    }
  }
  return undefined;
}

export const OrderFrequencyDistributionPieChart = ({repeatCustomerRateResponse, compareEnabled} : {repeatCustomerRateResponse: CustomersRepeatCustomerRateResponse, compareEnabled?: boolean}) => {

  const currentData = convertToChartData(repeatCustomerRateResponse.analytics.current);
  const previousData = convertToChartData(repeatCustomerRateResponse.analytics.previous);

  const renderLabel = function(entry) {
    return entry.displayValue;
  }

  return (
    <PieChart width={500} height={300}>
      <Pie data={currentData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={90} fill="#82ca9d" label={renderLabel} />
      {compareEnabled && repeatCustomerRateResponse.analytics.dateRangeFromCompareTo && currentData !== undefined &&
        <Pie data={previousData} dataKey="value" cx="50%" cy="50%" outerRadius={30} fill="#8884d8"/>
      }
      {(compareEnabled && repeatCustomerRateResponse.analytics.dateRangeFromCompareTo) && <Legend payload={[
        {
          value: getLegendName(true),
          color: "#82ca9d"
        },
        {
          value: getLegendName(false),
          color: "#8884d8"
        }
      ]} iconType="circle"/>}
      <Tooltip formatter={(value) => `${value}%`}/>
    </PieChart>
  );
}