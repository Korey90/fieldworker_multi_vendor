import React, { useState } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
  error?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Wybierz datę i godzinę",
  disabled,
  className,
  id,
  label,
  error,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState('12:00');

  // Parse the datetime-local string to Date object
  const selectedDate = value ? new Date(value) : undefined;
  
  // Extract time from the datetime value
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      setTimeValue(`${hours}:${minutes}`);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Combine selected date with current time
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      
      // Format as datetime-local string (YYYY-MM-DDTHH:mm)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      
      const datetimeValue = `${year}-${month}-${day}T${hour}:${minute}`;
      onChange(datetimeValue);
    }
    setIsOpen(false);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    
    if (selectedDate && onChange) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      
      // Format as datetime-local string
      const year = newDate.getFullYear();
      const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
      const day = newDate.getDate().toString().padStart(2, '0');
      const hour = newDate.getHours().toString().padStart(2, '0');
      const minute = newDate.getMinutes().toString().padStart(2, '0');
      
      const datetimeValue = `${year}-${month}-${day}T${hour}:${minute}`;
      onChange(datetimeValue);
    }
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    return format(selectedDate, 'PPP p', { locale: pl });
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium mb-1">
          {label}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2" />
            {value ? formatDisplayValue() : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="time-input" className="text-sm font-medium">
                Godzina:
              </Label>
              <Input
                id="time-input"
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-24 h-8"
              />
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabled}
            className='w-full'
            initialFocus
            locale={pl}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}