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

import { Heading, Container } from "@medusajs/ui";
import { calculateResolution, getChartDateName, getChartTooltipDate, getLegendName } from "./utils/chartUtils";
import { ChartResolutionType } from "./utils/chartUtils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';

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

const compareDatesBasedOnResolutionType = (date1: Date, date2: Date, resolutionType: ChartResolutionType): boolean => {
  switch (resolutionType) {
    case ChartResolutionType.DayWeek:
    case ChartResolutionType.DayMonth:
      return new Date(new Date(date1).setHours(0,0,0,0)).getTime() == new Date(new Date(date2).setHours(0,0,0,0)).getTime();
    case ChartResolutionType.Month:
      return new Date(new Date(new Date(date1).setDate(0)).setHours(0,0,0,0)).getTime() == new Date(new Date(new Date(date2).setDate(0)).setHours(0,0,0,0)).getTime();
    default:
      return new Date(new Date(date1).setHours(0,0,0,0)).getTime() == new Date(new Date(date2).setHours(0,0,0,0)).getTime();
  }
}

const incrementDate = (date: Date, resolutionType: ChartResolutionType) => {
  switch (resolutionType) {
    case ChartResolutionType.DayWeek:
      date.setDate(date.getDate() + 1);
      break;
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

export const generateChartData = (data: ChartDataType, startFrom: Date, endAt: Date, chartResolutionType: ChartResolutionType) => {

  const currentOrders = data.current;
  const previousOrders = data.previous;

  const currentDate = new Date(startFrom);
  const offsetTime = endAt.getTime() - startFrom.getTime() + 86400000;

  const dataPoints = [];

  while (currentDate.getTime() < endAt.getTime() || compareDatesBasedOnResolutionType(currentDate, endAt, chartResolutionType)) {
    const currentOrder = currentOrders.find(order => compareDatesBasedOnResolutionType(new Date(order.date), currentDate, chartResolutionType));
    const offsetDate = new Date(currentDate);
    offsetDate.setTime(offsetDate.getTime() - offsetTime);
    const previousOrder = previousOrders.find(previous => compareDatesBasedOnResolutionType(new Date(previous.date), offsetDate, chartResolutionType));
    
    dataPoints.push({
      date: new Date(currentDate),
      current: currentOrder ? parseInt(currentOrder.value) : 0,
      previous: previousOrder ? parseInt(previousOrder.value) : 0,
    });

    incrementDate(currentDate, chartResolutionType);
  }

  return dataPoints;
}

export const ChartCustomTooltip = ({ active, payload, label, resolutionType }) => {
  if (active && payload && payload.length) {
    switch (resolutionType) {
      case ChartResolutionType.DayWeek:
        return (
          <Container>
            <Heading level="h3" style={ { color: payload[0].color}}>
              {`Current ${getChartTooltipDate(payload[0].payload.date, resolutionType)}`} : {payload[0].value}
            </Heading>
            {payload[1] !== undefined && 
              <Heading level="h3" style={ { color: payload[1].color}}>
                {`Previous ${getChartTooltipDate(payload[1].payload.date, resolutionType)}`} : {payload[1].value}
              </Heading>
            }
          </Container>
        )
      case ChartResolutionType.DayMonth:
        return (
          <Container>
            <Heading level="h3" style={ { color: payload[0].color}}>
              {`${getChartTooltipDate(payload[0].payload.date, resolutionType)}`} : {payload[0].value}
            </Heading>
            {payload[1] !== undefined && 
              <Heading level="h3" style={ { color: payload[1].color}}>
                {`${getChartTooltipDate(new Date(new Date(payload[1].payload.date).setMonth(payload[1].payload.date.getMonth() - 1)), resolutionType)}`} : {payload[1].value}
              </Heading>
            }
            </Container>
        )
      case ChartResolutionType.Month:
        return (
          <Container>
            <Heading level="h3" style={ { color: payload[0].color}}>
              {`${getChartTooltipDate(payload[0].payload.date, resolutionType)}`} : {payload[0].value}
            </Heading>
            {payload[1] !== undefined && 
              <Heading level="h3" style={ { color: payload[1].color}}>
                {`${getChartTooltipDate(new Date(new Date(payload[1].payload.date).setFullYear(payload[1].payload.date.getFullYear() - 1)), resolutionType)}`} : {payload[1].value}
              </Heading>
            }
            </Container>
        )
    }
      
  }
  return null;
};

export const ChartCurrentPrevious = ({rawChartData, fromDate, toDate, fromCompareDate, toCompareDate, compareEnabled} : {
  rawChartData: ChartDataType, fromDate: Date, toDate: Date, fromCompareDate?: Date, toCompareDate?: Date, compareEnabled?: boolean}) => {

  const [chartData, setChartData] = useState([]);

  const resolutionType = calculateResolution(fromDate);

  useEffect(() => {
    const dataPoints =  generateChartData(
      rawChartData,
      fromDate, 
      toDate, 
      resolutionType);
    setChartData(dataPoints);
      
  }, [rawChartData, fromDate, toDate]);

  return (
    <AreaChart
      width={500}
      height={400}
      data={chartData}
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
        <XAxis dataKey={(value) => getChartDateName(value.date, resolutionType)}/>
        <YAxis/>
        <Tooltip content={<ChartCustomTooltip active={false} payload={[]} label={""} resolutionType={resolutionType}/>} />
        {<Area name={(compareEnabled && fromCompareDate) ? getLegendName(resolutionType, true) : undefined} type="monotone" dataKey="current" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCurrent)" />}
        {(compareEnabled && fromCompareDate) && <Area name={getLegendName(resolutionType, false)} type="monotone" dataKey="previous" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrevious)" />}
        {(compareEnabled && fromCompareDate) && <Legend verticalAlign="bottom" height={36} iconType="circle"/>}
    </AreaChart>
  )
}