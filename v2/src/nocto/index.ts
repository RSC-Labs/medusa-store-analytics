import { NoctoPluginDefinition } from "@rsc-labs/nocto-plugin-system"
import { ChartBar } from "@medusajs/icons"

export const storeAnalyticsPlugin: NoctoPluginDefinition = {
  id: "@rsc-labs/medusa-store-analytics-v2",
  routes: () => [
    {
      path: "/analytics",
      component: () => import("./../admin/routes/analytics/page.js")
    }
  ],
  sidebar: {
    label: "Analytics",
    icon: ChartBar,
    path: "/analytics",
  }
}

export default storeAnalyticsPlugin
