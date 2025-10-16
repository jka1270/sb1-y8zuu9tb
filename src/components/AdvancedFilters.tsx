import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export interface FilterState {
  category: string;
  purityRange: [number, number];
  priceRange: [number, number];
  molecularWeightRange: [number, number];
  inStockOnly: boolean;
  applications: string[];
  storageTemp: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const applications = [
  'Therapeutic Research',
  'Cosmetic Research', 
  'Cellular Studies',
  'Biochemical Assays',
  'Protein Interaction',
  'Pharmacological Research',
  'Anti-aging Studies',
  'Metabolic Research',
  'Neuroprotection',
  'Wound Healing'
];

const storageTemperatures = [
  '-20°C',
  '2-8°C',
  'Room Temperature',
  'Dry Conditions'
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'purity', label: 'Purity' },
  { value: 'molecularWeight', label: 'Molecular Weight' },
  { value: 'category', label: 'Category' }
];

export default function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleApplication = (app: string) => {
    const newApplications = filters.applications.includes(app)
      ? filters.applications.filter(a => a !== app)
      : [...filters.applications, app];
    updateFilter('applications', newApplications);
  };

  const toggleStorageTemp = (temp: string) => {
    const newTemps = filters.storageTemp.includes(temp)
      ? filters.storageTemp.filter(t => t !== temp)
      : [...filters.storageTemp, temp];
    updateFilter('storageTemp', newTemps);
  };

  const hasActiveFilters = () => {
    return filters.category !== '' ||
           filters.purityRange[0] > 90 || filters.purityRange[1] < 100 ||
           filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ||
           filters.molecularWeightRange[0] > 0 || filters.molecularWeightRange[1] < 10000 ||
           filters.inStockOnly ||
           filters.applications.length > 0 ||
           filters.storageTemp.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mx-4 sm:mx-0">
      {/* Filter Header */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters() && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 sm:py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={onClearFilters}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center touch-manipulation"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Purity Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purity Range (%)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="90"
                  max="100"
                  step="0.1"
                  value={filters.purityRange[0]}
                  onChange={(e) => updateFilter('purityRange', [parseFloat(e.target.value), filters.purityRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="90"
                  max="100"
                  step="0.1"
                  value={filters.purityRange[1]}
                  onChange={(e) => updateFilter('purityRange', [filters.purityRange[0], parseFloat(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="text-xs sm:text-sm">{filters.purityRange[0]}%</span>
                  <span className="text-xs sm:text-sm">{filters.purityRange[1]}%</span>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range ($)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="text-xs sm:text-sm">${filters.priceRange[0]}</span>
                  <span className="text-xs sm:text-sm">${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Molecular Weight Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Molecular Weight (Da)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.molecularWeightRange[0]}
                  onChange={(e) => updateFilter('molecularWeightRange', [parseInt(e.target.value), filters.molecularWeightRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.molecularWeightRange[1]}
                  onChange={(e) => updateFilter('molecularWeightRange', [filters.molecularWeightRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="text-xs sm:text-sm">{filters.molecularWeightRange[0]} Da</span>
                  <span className="text-xs sm:text-sm">{filters.molecularWeightRange[1]} Da</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">In Stock Only</span>
            </label>
          </div>

          {/* Research Applications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Research Applications
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {applications.map((app) => (
                <label key={app} className="flex items-center text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={filters.applications.includes(app)}
                    onChange={() => toggleApplication(app)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{app}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Storage Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Storage Temperature
            </label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {storageTemperatures.map((temp) => (
                <label key={temp} className="flex items-center text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={filters.storageTemp.includes(temp)}
                    onChange={() => toggleStorageTemp(temp)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{temp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}