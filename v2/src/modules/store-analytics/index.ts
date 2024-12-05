import StoreAnalyticsModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const STORE_ANALYTICS_MODULE = "storeAnalyticsModuleService"

export default Module(STORE_ANALYTICS_MODULE, {
  service: StoreAnalyticsModuleService,
})