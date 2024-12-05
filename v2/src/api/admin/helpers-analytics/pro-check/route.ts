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

import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, MedusaErrorTypes } from "@medusajs/utils"
import { STORE_ANALYTICS_MODULE } from "../../../../modules/store-analytics";
import StoreAnalyticsModuleService from "../../../../modules/store-analytics/service";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {

  const storeAnalyticsModuleService: StoreAnalyticsModuleService = req.scope.resolve(STORE_ANALYTICS_MODULE)
  try {
    res.status(200).json({
      hideProTab: storeAnalyticsModuleService.getHideProSetting()
    });
  } catch (error) {
    throw new MedusaError(
      MedusaErrorTypes.DB_ERROR,
      error.message
    )
  }
}