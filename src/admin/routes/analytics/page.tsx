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

import { RouteConfig } from "@medusajs/admin"
import { Tabs } from "@medusajs/ui"
import { LightBulb } from "@medusajs/icons"
import { Box } from "@mui/material";
import OverviewTab from "../../../ui-components/tabs/overview";
import OrdersTab from "../../../ui-components/tabs/orders";

const AnalyticsPage = () => {
  return (
    <Tabs defaultValue='overview'>
      <Tabs.List style={ { justifyContent: 'center' } }>
        <Tabs.Trigger value='overview'>Overview</Tabs.Trigger>
        <Tabs.Trigger value='orders'>Orders</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value='overview'>
        <Box height={20}></Box>
        <OverviewTab/>
      </Tabs.Content>
      <Tabs.Content value='orders'>
        <Box height={20}></Box>
        <OrdersTab/>
      </Tabs.Content>
    </Tabs>
  )
}
export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: LightBulb,
  },
}

export default AnalyticsPage