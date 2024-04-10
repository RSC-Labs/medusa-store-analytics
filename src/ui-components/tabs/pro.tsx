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

import { Container, Heading, Text } from "@medusajs/ui"
import { Grid, Link } from "@mui/material";

const HEIGHT = 330;

const ProTab = () => {
  return (
    <Grid container spacing={2} justifyContent={"center"} >
      <Grid container justifyContent={"center"} marginTop={6}>
        <Grid item>
          <Heading level='h1' style={ { color: 'purple'}}>
            Take your store analytics to the next level
          </Heading>
        </Grid>
      </Grid>
      <Grid container justifyContent={"center"} marginTop={1} spacing={5}>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <Heading level='h1'>Customized dashboard</Heading>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Create your own dashboard with available statistics</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Add, delete or move any statistic</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Resize widgets for your needs</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <Heading level='h1'>Date range picker</Heading>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Forget about last week, last month, last year</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Choose whatever date range to see statistics exactly for this range</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Compare to any of date range, e.g. compare Decembers or Black Fridays</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <Heading level='h1'>Advanced statistics</Heading>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Over 15 professional statistics</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Check funnels related to carts and checkouts, how they change into purchases</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>See your analytics per sales channel</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Deep insights about discounts, gift cards and how they influence orders</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <Heading level='h1'>Professional support</Heading>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Priority for bugs</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Dedicated channel for your feature requests for evaluation</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Establish long-term cooperation also for other plugins</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
      </Grid>
      <Grid container spacing={3} direction={'column'} alignContent={"center"} marginTop={6}>
        <Grid container direction={'row'} justifyContent={'center'} columnSpacing={1}>
          <Grid item>
            <Heading level='h1' color="purple">
              Contact:
            </Heading>
          </Grid>
          <Grid item>
            <Link href="mailto:labs@rsoftcon.com">
              <Heading level='h1' color="purple">
                labs@rsoftcon.com
              </Heading>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ProTab