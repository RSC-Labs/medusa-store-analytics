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

import { Container, Heading } from "@medusajs/ui"
import { Grid } from "@mui/material";

const OrdersTab = () => {
  return (
    <Grid container spacing={2} justifyContent={"center"} >
      <Grid item xs={6} md={6} xl={6}>
        <Container>
          <Heading level='h1'>Coming soon... Stay tuned.</Heading>
        </Container>
      </Grid>
    </Grid>
  )
}

export default OrdersTab