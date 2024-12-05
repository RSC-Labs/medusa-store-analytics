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

import { Heading, Text, Tooltip } from "@medusajs/ui";
import { Divider, Grid } from "@mui/material";
import { IconComparison } from "./icon-comparison";

const ValueColumn = ({current, previous, enableComparing} : {current: string, previous: string, enableComparing?: boolean}) => {
  return (
    <Grid container alignItems={'center'}>
      {enableComparing ? 
        <Tooltip content={`Previously: ${previous}`}>
        <span>
            <Text style={ { textDecorationStyle: 'dotted', textDecorationLine: 'underline', textUnderlineOffset: '3px'}}>
              {current !== undefined ? `${current}` : `N/A`}
            </Text>
          </span>
        </Tooltip>
      :
      <Grid item>
        <Text>
          {current}
        </Text>
      </Grid>
      }
      {enableComparing && 
      <Grid item>
        <Grid container alignItems={'center'}>
          {parseInt(current) != parseInt(previous) && <Grid item>
            <IconComparison current={parseInt(current)} previous={previous ? parseInt(previous) : undefined}/>
          </Grid>
          }
        </Grid>
      </Grid>
      }
    </Grid>
  )
}

export type PopularityTableRow = {
  name: string,
  current: string
  previous: string | undefined
}

export const PopularityTable = ({valueColumnName, tableRows, enableComparing} : {valueColumnName: string, tableRows: PopularityTableRow[], enableComparing?: boolean}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Divider></Divider>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent={'space-between'}>
          <Grid item>
            <Heading level="h3"> 
              Name
            </Heading>
          </Grid>
          <Grid item>
            <Heading level="h3"> 
              {valueColumnName}
            </Heading>
          </Grid>
        </Grid>
      </Grid>
      {tableRows.length > 0 ? tableRows.map(tableRow => (
        <Grid item xs={12} key={tableRow.name}>
          <Grid container justifyContent={'space-between'}>
            <Grid item>
              <Text> 
                {tableRow.name}
              </Text>
            </Grid>
            <Grid item>
              <ValueColumn current={tableRow.current} previous={tableRow.previous} enableComparing={enableComparing}/>
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