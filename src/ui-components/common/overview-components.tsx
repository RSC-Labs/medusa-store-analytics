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
import { Text, Switch, Label, DropdownMenu, IconButton, Checkbox, Button, Heading, Select, Tooltip } from "@medusajs/ui";
import { Adjustments, ExclamationCircle } from "@medusajs/icons"
import { Grid } from "@mui/material";
import { DateLasts, DateRange, OrderStatus } from "../utils/types";

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