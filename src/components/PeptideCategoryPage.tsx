import { ArrowLeft } from 'lucide-react';
import ProductGrid from './ProductGrid';

interface PeptideCategoryPageProps {
  category: 'therapeutic' | 'cosmetic' | 'research' | 'custom';
  onBack: () => void;
}

const categoryInfo = {
  therapeutic: {
    title: 'Therapeutic Peptides',
    description: 'Explore our comprehensive collection of therapeutic peptides designed for advanced research and development in medical applications.',
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg',
    categoryName: 'Therapeutic Peptides'
  },
  cosmetic: {
    title: 'Cosmetic Peptides',
    description: 'Discover premium cosmetic peptides for anti-aging, skin rejuvenation, and beauty research applications.',
    image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg',
    categoryName: 'Cosmetic Peptides'
  },
  research: {
    title: 'Research Peptides',
    description: 'High-purity research peptides for cutting-edge scientific studies and laboratory applications.',
    image: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg',
    categoryName: 'Research Peptides'
  },
  custom: {
    title: 'Custom Synthesis',
    description: 'Custom peptide synthesis services tailored to your specific research needs with guaranteed purity and quality.',
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg',
    categoryName: 'Custom Synthesis'
  }
};

export default function PeptideCategoryPage({ category, onBack }: PeptideCategoryPageProps) {
  const info = categoryInfo[category];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <img
          src={info.image}
          alt={info.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {info.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            {info.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid initialCategory={info.categoryName} />
      </div>
    </div>
  );
}
