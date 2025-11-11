import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onAbout?: () => void;
  onContact?: () => void;
  onBlog?: () => void;
}

export default function Footer({ onAbout, onContact, onBlog }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">ResearchRaws</h3>
            <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
              Leading provider of high-purity research peptides for therapeutic, cosmetic, and scientific applications.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-gray-300 text-sm sm:text-base">
                <Phone className="h-4 w-4 mr-2" />
                <span>1-800-PEPTIDE</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm sm:text-base">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@researchraws.com</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm sm:text-base">
                <MapPin className="h-4 w-4 mr-2" />
                <span>San Diego, CA 92121</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Research Support</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li><button onClick={onBlog} className="hover:text-white text-left transition-colors touch-manipulation block py-1">Research Articles</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li><button onClick={onAbout} className="hover:text-white text-left transition-colors touch-manipulation block py-1">About Us</button></li>
              <li><button onClick={onContact} className="hover:text-white text-left transition-colors touch-manipulation block py-1">Contact Us</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <p className="text-gray-300 text-xs sm:text-sm text-center">
            © 2025 ResearchRaws. All rights reserved. For research use only.
          </p>
        </div>
      </div>
    </footer>
  );
}