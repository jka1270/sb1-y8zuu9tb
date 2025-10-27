import { ArrowRight, Play } from 'lucide-react';
import { Search } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Hero() {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // In a real implementation, this would trigger product filtering
  };

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
      <div className="text-center py-4 sm:py-6 border-b border-blue-500 border-opacity-30">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent drop-shadow-2xl px-4">ResearchRaws</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search peptides..."
            className="w-full"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 px-4">
              Premium Research Peptides for
              <span className="text-blue-200"> Scientific Excellence</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 leading-relaxed px-4">
              Discover our comprehensive collection of high-purity peptides, from therapeutic compounds to 
              cosmetic applications, designed to advance your research goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4">
              <button className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center text-sm sm:text-base">
                Browse Peptides
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center text-sm sm:text-base">
                <Play className="mr-2 h-4 w-4" />
                Research Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}