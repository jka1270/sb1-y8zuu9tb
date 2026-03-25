import ProductGrid from './ProductGrid';

interface AminoAcidChainCategoryPageProps {
  category: 'therapeutic' | 'cosmetic' | 'custom';
  onBack: () => void;
}

const categoryInfo = {
  therapeutic: {
    title: 'Therapeutic Amino Acid Chains',
    description: 'Explore our comprehensive collection of therapeutic Amino Acid Chains designed for advanced research and development in medical applications.',
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg',
    categoryName: 'Therapeutic Amino Acid Chains'
  },
  cosmetic: {
    title: 'Cosmetic Amino Acid Chains',
    description: 'Discover premium cosmetic Amino Acid Chains for anti-aging, skin rejuvenation, and beauty research applications.',
    image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg',
    categoryName: 'Cosmetic Amino Acid Chains'
  },
  custom: {
    title: 'Custom Synthesis',
    description: 'Custom Amino Acid Chain synthesis services tailored to your specific research needs with guaranteed purity and quality.',
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg',
    categoryName: 'Custom Synthesis'
  }
};

export default function AminoAcidChainCategoryPage({ category, onBack }: AminoAcidChainCategoryPageProps) {
  const info = categoryInfo[category];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <img
          src={info.image}
          alt={info.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
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
