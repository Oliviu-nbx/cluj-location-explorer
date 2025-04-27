
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LocationCategory, CATEGORY_LABELS } from "@/types/location";
import AnalyticsService from "@/services/AnalyticsService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: LocationCategory | '') => void;
  selectedCategory: LocationCategory | '';
}

const SearchBar = ({ onSearch, onCategoryChange, selectedCategory }: SearchBarProps) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSearch(query);
    if (query.length > 2) {
      AnalyticsService.trackEvent('Search', 'query', query);
    }
  };

  const handleCategoryChange = (value: LocationCategory | '') => {
    onCategoryChange(value);
    AnalyticsService.trackEvent('Category', 'select', value || 'all');
  };

  return (
    <div className="flex gap-4 w-full max-w-3xl mx-auto mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search locations..."
          className="pl-10"
          onChange={handleSearch}
          data-analytics="search"
        />
      </div>
      <Select 
        value={selectedCategory} 
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[180px]" data-analytics="category">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchBar;
