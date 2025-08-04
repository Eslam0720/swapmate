import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 
  | 'most-relevant'
  | 'highest-cost'
  | 'lowest-cost'
  | 'nearest-location'
  | 'verified-first';

interface SortOptionsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <SelectValue placeholder="Sort by" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="most-relevant">Most Relevant</SelectItem>
          <SelectItem value="highest-cost">Highest Cost</SelectItem>
          <SelectItem value="lowest-cost">Lowest Cost</SelectItem>
          <SelectItem value="nearest-location">Nearest Location</SelectItem>
          <SelectItem value="verified-first">Verified Accounts First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortOptions;