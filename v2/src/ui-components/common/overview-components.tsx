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

import { useState } from 'react';
import { Text, Switch, Label, Button, IconButton, Checkbox, Heading, Select, Tooltip, Badge } from "@medusajs/ui";
import { Adjustments, ExclamationCircle } from "@medusajs/icons"
import { Grid } from "@mui/material";
import { DateLasts, OrderStatus } from "../utils/types";
import type { DateRange } from "../utils/types";
import { DropdownMenu, toast } from "@medusajs/ui"

export const GenerateReportButton = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {

  const [ loadingButton, setLoadingStatus ]= useState(false);

  const generate = async () => {
    const id = toast.loading("Report", {
      description: "Generating report...",
      duration: Infinity
    })

    setLoadingStatus(true);

    fetch(`/admin/reports-analytics/general`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderStatuses: Object.values(orderStatuses),
        dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
        dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
        dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
        dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined,
      })
    }).then((res) => res.json())
    .then((responseJson) => {
      if (responseJson.buffer) {
        const anyBuffer = responseJson.buffer as any;
        const blob = new Blob([ new Uint8Array(anyBuffer.data)  ], { type : 'application/pdf'});
        toast.dismiss();
        setLoadingStatus(false);
        const pdfURL = URL.createObjectURL(blob);
        window.open(pdfURL, '_blank');
      } else {
        toast.dismiss();
        setLoadingStatus(false);
        toast.error("Report", {
          description: 'Problem happened when generating report',
        })
      }
      setLoadingStatus(false);
    })
    .catch((error) => {
      toast.dismiss();
      setLoadingStatus(false);
      const trueError = error as any;
      toast.error("Report", {
        description: trueError?.response?.data?.message,
      })
    }) 
  };

  return (
    <>
      {loadingButton && <Button variant="secondary" disabled={true} style={{ width: 180 }}>
        Generating
      </Button>}
      {!loadingButton && <Button variant="secondary" onClick={generate} style={{ width: 180 }}>
        Generate report
        <Badge rounded="full" size="2xsmall" color="green">Beta</Badge>
      </Button>}
    </>
  )
}

export const ComparedDate = ({compare, comparedToDateRange} : {compare: boolean, comparedToDateRange?: DateRange}) => {
  if (comparedToDateRange && compare) {
    return (
      <Text>
        {`Compared to ${comparedToDateRange.from.toLocaleDateString()} - ${comparedToDateRange.to.toLocaleDateString()}`}
      </Text>
    );
  }
  return (
    <Text>
      {`No comparison`}
    </Text>
  ); 
}

type BooleanCallback = (value: boolean) => any;

export const SwitchComparison = ({compareEnabled, onCheckChange, allTime} : {compareEnabled: boolean, onCheckChange: BooleanCallback, allTime: boolean}) => {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory" onCheckedChange={onCheckChange} disabled={allTime} checked={compareEnabled && !allTime}/>
      <Label htmlFor="manage-inventory">Compare</Label>
    </div>
  )
}

type OrderStatusCallback = (value: OrderStatus[]) => any;

export const DropdownOrderStatus = ({onOrderStatusChange, appliedStatuses} : {onOrderStatusChange: OrderStatusCallback, appliedStatuses: OrderStatus[]}) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleStatusToggle = (status) => {
    setSelectedStatuses((prevSelectedStatuses) =>
      prevSelectedStatuses.includes(status)
        ? prevSelectedStatuses.filter((selected) => selected !== status)
        : [...prevSelectedStatuses, status]
    );
  };


  const handleApplyClick = () => {
    // Close the dropdown when Apply is clicked
    setIsDropdownOpen(false);
    onOrderStatusChange(selectedStatuses.map(selectedStatus => OrderStatus[selectedStatus.toUpperCase()]));
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={(isOpen) => {
      if (isOpen) {
        setSelectedStatuses(Object.values(appliedStatuses));
      }
      setIsDropdownOpen(isOpen)
    }}>
    <DropdownMenu.Trigger asChild>
      <IconButton>
        <Adjustments />
      </IconButton>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Label className="gap-x-2" style={ { paddingLeft: 8, paddingBottom: 8}}>
        <Heading level='h3'>
          Choose orders
        </Heading>
      </DropdownMenu.Label>
      {Object.values(OrderStatus).map(orderStatus => (
        <DropdownMenu.Item className="gap-x-2" onSelect={event => event.preventDefault()} key={orderStatus.toString()}>
          <Checkbox 
            id={`order-status-${orderStatus}`}
            checked={selectedStatuses.includes(orderStatus)}
            onCheckedChange={() => handleStatusToggle(orderStatus)}
          />
          <Label htmlFor={`order-status-${orderStatus}`}>{orderStatus}</Label>
        </DropdownMenu.Item>
      ))}
      <DropdownMenu.Label className="gap-x-2">
          <Button onClick={handleApplyClick}>
            Apply
          </Button>
      </DropdownMenu.Label>
    </DropdownMenu.Content> 
    </DropdownMenu>
  )
}

type StringCallback = (value: string) => void;

export const SelectDateLasts = ({dateLast, onSelectChange} : {dateLast: DateLasts, onSelectChange: StringCallback}) => {

  const dateLastsToSelect: DateLasts[] = [
    DateLasts.LastWeek,
    DateLasts.LastMonth,
    DateLasts.LastYear,
    DateLasts.All
  ]

  return (
    <div className="w-[170px]">
      <Select size="small" onValueChange={onSelectChange} value={dateLast}>
        <Select.Trigger style={ { height: '2rem'}}>
          <Select.Value placeholder="Select a date range" />
        </Select.Trigger>
        <Select.Content>
          {dateLastsToSelect.map((dateToSelect) => (
            <Select.Item key={dateToSelect} value={dateToSelect}>
              {dateToSelect == DateLasts.All ? (
                <Grid container spacing={1}>
                  <Grid item>
                    {dateToSelect}
                  </Grid>
                  <Grid item>
                    <Tooltip content='If you have many orders, it might take a while to load statistics.'>
                      <ExclamationCircle />
                    </Tooltip>
                  </Grid>
                </Grid>
              ) : dateToSelect}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  )
}