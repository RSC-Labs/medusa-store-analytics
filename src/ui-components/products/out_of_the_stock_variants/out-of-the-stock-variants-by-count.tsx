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

import { Heading, Alert, Tooltip, Badge } from "@medusajs/ui";
import { ArrowRightOnRectangle, InformationCircle } from "@medusajs/icons";
import { CircularProgress, Grid } from "@mui/material";
import { useAdminCustomQuery } from "medusa-react"
import { OutOfTheStockVariantsTable, OutOfTheStockVariantsTableRow } from "./out-of-the-stock-variants-table";
import { AdminOutOfTheStockVariantsStatisticsQuery, OutOfTheStockVariantsCountResponse, OutOfTheStockVariantsCountResult } from "./types";

function transformToVariantTopTable(result: OutOfTheStockVariantsCountResult): OutOfTheStockVariantsTableRow[] {
  const currentMap = new Map<string, OutOfTheStockVariantsTableRow>();

  result.current.forEach(currentItem => {
    currentMap.set(currentItem.variantId, {
      productId: currentItem.productId,
      productTitle: currentItem.productTitle,
      variantTitle: currentItem.variantTitle,
      thumbnail: currentItem.thumbnail,
    });
  });

  return Array.from(currentMap.values());
}

const OutOfTheStockVariants = () => {
  const { data, isError, isLoading, error } = useAdminCustomQuery<
    AdminOutOfTheStockVariantsStatisticsQuery,
    OutOfTheStockVariantsCountResponse
  >(
    `/products-analytics/out-of-the-stock-variants`,
    [],
    {}
  )

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (isError) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return <Alert variant="error">{errorText}</Alert>
  }

  if (data.analytics == undefined) {
    return <Heading level="h3">Cannot get variants</Heading>
  }

  return <OutOfTheStockVariantsTable tableRows={transformToVariantTopTable(data.analytics)}/>
}

export const OutOfTheStockVariantsCard = () => {
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item>
          <Grid container spacing={2} alignItems={'center'}>
            <Grid item>
              <ArrowRightOnRectangle/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Out of the stock variants
              </Heading>
            </Grid>
            <Grid item>
              <Tooltip content='It includes only published products and not gift cards'>
                <InformationCircle />
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip content='This feature might be changed or improved in the future'>
                <Badge rounded="full" size="small" color="green">Beta</Badge>
              </Tooltip>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <Heading level="h3">
          Showing last 5 variants
        </Heading>
      </Grid>
      <Grid item xs={12} md={12}>
        <OutOfTheStockVariants/>
      </Grid>
    </Grid>
  )
}