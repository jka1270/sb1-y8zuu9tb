import { Product } from '../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  products: Product[];
}

const categoryNames = [
  'Therapeutic Peptides',
  'Cosmetic Peptides',
  'Research Peptides',
  'Custom Synthesis',
  'Peptide Libraries'
];

export default function CategoryFilter({ selectedCategory, onCategoryChange, products }: CategoryFilterProps) {
  // Calculate category counts dynamically from products
  const getCategoryCount = (categoryName: string) => {
    return products.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 mx-4 sm:mx-0">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={() => onCategoryChange('')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Peptides
        </button>
        {categoryNames.map((categoryName, index) => {
          const count = getCategoryCount(categoryName);
          return (
            <button
              key={index}
              onClick={() => onCategoryChange(categoryName)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation ${
                selectedCategory === categoryName
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryName} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}