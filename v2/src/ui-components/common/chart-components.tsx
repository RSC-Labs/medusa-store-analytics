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

import { Heading, Container, Text } from "@medusajs/ui";
import { calculateResolution, getChartDateName, getChartTooltipDate, getLegendName, ChartResolutionType, compareDatesBasedOnResolutionType } from "./utils/chartUtils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import { useEffect, useState } from 'react';
import { Box, Grid } from "@mui/material";

type ChartDataPoint = {
  current: {
    date: Date,
    value: any
  },
  previous: {
    date: Date,
    value: any
  }
}

export type ChartDataType = {
  current: {
    date: Date,
    value: any
  }[],
  previous: {
    date: Date,
    value: any
  }[]
}

const incrementDate = (date: Date, resolutionType: ChartResolutionType) => {
  switch (resolutionType) {
    case ChartResolutionType.DayMonth:
      date.setDate(date.getDate() + 1);
      break;
    case ChartResolutionType.Month:
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      date.setDate(date.getDate() + 1);
  }
};

const generateChartData = (
  data: ChartDataType,
  fromDate: Date,
  toDate: Date,
  chartResolutionType: ChartResolutionType, 
  toCompareDate?: Date,
  connectEmptyPointsUsingPreviousValue?: boolean) 
  : ChartDataPoint[] => {

  const currentData = data.current;
  const previousData = data.previous;

  const startFromDate = new Date(fromDate);
  const offsetTime = toDate.getTime() - (toCompareDate ? toCompareDate.getTime() : fromDate.getTime());

  const dataPoints: ChartDataPoint[] = [];
  let currentDataValue: any;
  let previousDataValue: any;

  while (startFromDate.getTime() < toDate.getTime() || compareDatesBasedOnResolutionType(startFromDate, toDate, chartResolutionType)) {
    const currentOrder = currentData.find(order => compareDatesBasedOnResolutionType(new Date(order.date), startFromDate, chartResolutionType));
    const offsetDate = new Date(startFromDate);
    offsetDate.setTime(offsetDate.getTime() - offsetTime);
    const previousOrder = previousData.find(previous => compareDatesBasedOnResolutionType(new Date(previous.date), offsetDate, chartResolutionType));

    if (connectEmptyPointsUsingPreviousValue) {
      if (currentOrder) {
        currentDataValue = parseInt(currentOrder.value);
      }
      if (previousOrder) {
        previousDataValue = parseInt(previousOrder.value);
      }

      dataPoints.push({
        current: {
          date: new Date(startFromDate),
          value: currentOrder ? parseInt(currentOrder.value) : (currentDataValue ? currentDataValue : undefined),
        },
        previous: {
          date: new Date(offsetDate),
          value: previousOrder ? parseInt(previousOrder.value) : (previousDataValue ? previousDataValue : undefined),
        }
      });
    } else {
      dataPoints.push({
        current: {
          date: new Date(startFromDate),
          value: currentOrder ? parseInt(currentOrder.value) : 0
        },
        previous: {
          date: new Date(offsetDate),
          value: previousOrder ? parseInt(previousOrder.value) : 0,
        }
      });
    }

    incrementDate(startFromDate, chartResolutionType);
  }

  if (connectEmptyPointsUsingPreviousValue) {
    for (let i = dataPoints.length - 1; i >= 0; i--) {
      if (dataPoints[i].current.value === undefined) {
        if (dataPoints[dataPoints.length - 1].previous.value) {
          dataPoints[i].current.value = dataPoints[dataPoints.length - 1].previous.value
        } else {
          dataPoints[i].current.value = 0;
        }
      }
      if (dataPoints[i].previous.value) {
        previousDataValue = dataPoints[i].previous.value
      } else {
        dataPoints[i].previous.value = previousDataValue;
      }
    }
  }

  return dataPoints;
}

export const ChartCustomTooltip = ({ active, payload, label, resolutionType }) => {
  if (active && payload && payload.length) {
    switch (resolutionType) {
      case ChartResolutionType.DayMonth:
        return (
          <Container>
            <Heading level="h3" style={ { color: payload[0].color}}>
              {`${getChartTooltipDate(payload[0].payload.current.date, resolutionType)}`} : {payload[0].payload.current.value}
            </Heading>
            {payload[1] !== undefined && 
              <Heading level="h3" style={ { color: payload[1].color}}>
                {`${getChartTooltipDate(payload[1].payload.previous.date, resolutionType)}`} : {payload[1].payload.previous.value}
              </Heading>
            }
            </Container>
        )
      case ChartResolutionType.Month:
        return (
          <Container>
            <Heading level="h3" style={ { color: payload[0].color}}>
              {`${getChartTooltipDate(payload[0].payload.current.date, resolutionType)}`} : {payload[0].payload.current.value}
            </Heading>
            {payload[1] !== undefined && 
              <Heading level="h3" style={ { color: payload[1].color}}>
                {`${getChartTooltipDate(payload[1].payload.previous.date, resolutionType)}`} : {payload[1].payload.previous.value}
              </Heading>
            }
            </Container>
        )
    }
      
  }
  return null;
};

/* 

toDate is inclusive. It means that:
  fromDate: "2024-04-24"
  toDate: "2024-04-30"

  Analytics shall include `toDate` so it takes 7 days (including 2024-04-30)

  fromCompareDate: "2024-04-17"
  toCompareDate: "2024-04-24"

  Analytics shall compare to 7 days excluding 2024-04-24 (e.g. 2024-04-30 is compared to 2024-04-23, not 2024-04-24).

  toDate is inclusive to cover "today" date - so we need to cover situation when someone wants to see everything until now.
  We cannot use 2024-05-01 because then it is taken as day to show, while we want to show maximum 2024-04-30.

  toCompareDate is exclusive because backend is using fetches like created_at < toCompareDate, so it does not cover data at toCompareDate

  Comparison then we will have following algorithm:
  1) Take "toDate", remove "time" part and add whole day.
  2) Take times in milis from every date and compare.
*/

const areRangesTheSame = (fromDate: Date, toDate: Date, fromCompareDate?: Date, toCompareDate?: Date) : boolean => {
  if (fromCompareDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    if (toCompareDate) {
      // Math.ceil is used to round the day to larger value for taking the whole day for comparison - @deprecated
      // Because of day light saving time, sometimes happen that Math.ceil gives 31 days instead of 30 days (probably the same could happen in 7 days comparison)
      // Change to Math.round and testing for the future

      // const diffBase = Math.ceil(Math.abs((toDate.getTime() - fromDate.getTime()) / oneDay));
      const diffBase = Math.round((toDate.getTime() - fromDate.getTime()) / oneDay);
      // const diffCompare = Math.ceil(Math.abs((toCompareDate.getTime() - fromCompareDate.getTime()) / oneDay));
      const diffCompare = Math.round((toCompareDate.getTime() - fromCompareDate.getTime()) / oneDay);
      return (diffBase == diffCompare);
    }

    const diffBase = Math.ceil(Math.abs((toDate.getTime() - fromDate.getTime()) / oneDay));
    const diffCompare = Math.ceil(Math.abs((Date.now() - fromCompareDate.getTime()) / oneDay));

    return (diffBase == diffCompare);
  }
  return true;
};

export const ChartCurrentPrevious = ({rawChartData, fromDate, toDate, fromCompareDate, toCompareDate, compareEnabled, connectEmptyPointsUsingPreviousValue} : {
  rawChartData: ChartDataType, fromDate: Date, toDate: Date, fromCompareDate?: Date, toCompareDate?: Date, compareEnabled?: boolean, connectEmptyPointsUsingPreviousValue?: boolean}) => {

  const [chartDataPoints, setChartData] = useState<ChartDataPoint[]>([]);

  const resolutionType = calculateResolution(fromDate, toDate);

  useEffect(() => {
    const chartDataPoints: ChartDataPoint[] = generateChartData(
      rawChartData,
      fromDate, 
      toDate, 
      resolutionType,
      toCompareDate,
      connectEmptyPointsUsingPreviousValue
    );
    setChartData(chartDataPoints);

  }, [rawChartData, fromDate, toDate]);

  if (!areRangesTheSame(fromDate, toDate, fromCompareDate, toCompareDate)) {
    const currentPeriodInDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (24*60*60*1000));
    const precedingPeriodInDays = Math.ceil((toCompareDate.getTime() - fromCompareDate.getTime()) / (24*60*60*1000));
    return (
      <Box 
        width={500} 
        height={400}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Grid container direction={'column'} justifyContent={'center'} alignItems={'center'}>
          <Grid item>
            <Text>Chart can be shown only for the same length of ranges.</Text>
          </Grid>
          <Grid item>
            <Text>{`You are comparing ${currentPeriodInDays} days to ${precedingPeriodInDays} days`}</Text>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <AreaChart
      width={500}
      height={400}
      data={chartDataPoints}
      margin={{
        top: 20,
        right: 0,
        left: 0,
        bottom: 0,
      }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <defs>
          <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey={(value: ChartDataPoint) => getChartDateName(value.current.date, resolutionType, fromDate, toDate)} minTickGap={15} interval={'preserveStartEnd'}/>
        <YAxis/>
        <Tooltip content={<ChartCustomTooltip active={false} payload={[]} label={""} resolutionType={resolutionType}/>} />
        {<Area name={(compareEnabled && fromCompareDate) ? getLegendName(true) : undefined} type="monotone" dataKey="current.value" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCurrent)" />}
        {(compareEnabled && fromCompareDate) && <Area name={getLegendName(false)} type="monotone" dataKey="previous.value" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrevious)" />}
        {(compareEnabled && fromCompareDate) && <Legend verticalAlign="bottom" height={36} iconType="circle"/>}
    </AreaChart>
  )
}