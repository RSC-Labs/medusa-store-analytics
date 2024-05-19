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

import { Heading, Text } from "@medusajs/ui";
import { Box, Divider, Grid } from "@mui/material";
import { Link } from "react-router-dom"

export type VariantsTopTableRow = {
  sum: string,
  productId: string,
  productTitle: string,
  variantTitle: string,
  thumbnail: string,
}

export const VariantsTopTable = ({tableRows} : {tableRows: VariantsTopTableRow[]}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Divider></Divider>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent={'space-between'}>
          <Grid item>
            <Heading level="h3"> 
              Variant
            </Heading>
          </Grid>
          <Grid item>
            <Heading level="h3"> 
              Count
            </Heading>
          </Grid>
        </Grid>
      </Grid>
      {tableRows.length > 0 ? tableRows.map(tableRow => (
        <Grid item xs={12} key={tableRow.productId}>
          <Grid container justifyContent={'space-between'}>
            <Grid item>
              <Link to={`../products/${tableRow.productId}`}>
                <Grid container alignItems={'center'} spacing={2}>
                  {tableRow.thumbnail && <Grid item>
                    <Box
                      sx={{
                        width: 30,
                        height: 40
                      }}
                      component="img"
                      alt={`Thumbnail for ${tableRow.productTitle}`}
                      src={tableRow.thumbnail}
                    />
                  </Grid>}
                  <Grid item>
                    {tableRow.productTitle} - {tableRow.variantTitle}
                  </Grid>
                </Grid>
              </Link>
            </Grid>
            <Grid item>
              <Text>
                {tableRow.sum}
              </Text>
            </Grid>
          </Grid>
        </Grid>
      )) : 
        <Grid item xs={12}>
          <Grid container justifyContent={'space-between'}>
            <Grid item>
              <Text> 
                None
              </Text>
            </Grid>
            <Grid item>
              <Text> 
                None
              </Text>
            </Grid>
          </Grid>
        </Grid>
      }
    </Grid>
  )
}