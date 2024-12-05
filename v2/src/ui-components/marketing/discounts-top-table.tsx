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
import { Divider, Grid } from "@mui/material";

export type DiscountsTopTableRow = {
  sum: string,
  discountCode: string
}

export const DiscountsTopTable = ({tableRows} : {tableRows: DiscountsTopTableRow[]}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Divider></Divider>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent={'space-between'}>
          <Grid item>
            <Heading level="h3"> 
              Discount
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
        <Grid item xs={12}>
          <Grid container justifyContent={'space-between'}>
            <Grid item>
              <Text>
                {tableRow.discountCode}
              </Text>
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