import { Heading } from "@medusajs/ui";
import { Users } from "@medusajs/icons";
import { Grid } from "@mui/material";
import { DateRange } from "../utils/types";
import { TabValueCard } from "./tab-value";
import { TabValueByNewChart } from "./tab-value-new-chart";
import { OrderStatus } from "../utils/types";

export const TabOverviewCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses?: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item>
              <Users/>
            </Grid>
            <Grid item>
              <Heading level="h2">
                Tabs Created
              </Heading>
            </Grid>
          </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <TabValueCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
      <Grid item xs={12} md={12}>
        <TabValueByNewChart orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
      </Grid>
    </Grid>
  )
}