import { Container } from "@medusajs/ui"
import { 
  TabOverviewCard,
  TabValueCard,
  OrderStatus,
  DateRange
} from '..';
import { Grid } from "@mui/material";

const TabsTab = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <TabOverviewCard dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <TabValueCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
      </Grid> 
    )
}

export default TabsTab