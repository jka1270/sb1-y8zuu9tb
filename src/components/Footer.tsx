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
<<<<<<< HEAD
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
=======
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
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
<<<<<<< HEAD
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Peptide Categories</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Therapeutic Peptides</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Cosmetic Peptides</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Research Peptides</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Custom Synthesis</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Peptide Libraries</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Research Support</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Technical Data Sheets</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Certificate of Analysis</a></li>
              <li><button onClick={onBlog} className="hover:text-white text-left transition-colors touch-manipulation block py-1">Research Articles</button></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Storage Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Research Protocols</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Safety Data Sheets</a></li>
=======
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Research Support</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li><button onClick={onBlog} className="hover:text-white text-left transition-colors touch-manipulation block py-1">Research Articles</button></li>
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li><button onClick={onAbout} className="hover:text-white text-left transition-colors touch-manipulation block py-1">About Us</button></li>
<<<<<<< HEAD
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Quality Assurance</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Research Publications</a></li>
              <li><a href="#" className="hover:text-white transition-colors touch-manipulation block py-1">Research Partnerships</a></li>
=======
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
              <li><button onClick={onContact} className="hover:text-white text-left transition-colors touch-manipulation block py-1">Contact Us</button></li>
            </ul>
          </div>
        </div>

<<<<<<< HEAD
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
            © 2025 ResearchRaws. All rights reserved. For research use only.
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-center">
            <a href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors touch-manipulation">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors touch-manipulation">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors touch-manipulation">Cold Chain Policy</a>
          </div>
=======
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <p className="text-gray-300 text-xs sm:text-sm text-center">
            © 2025 ResearchRaws. All rights reserved. For research use only.
          </p>
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
        </div>
      </div>
    </footer>
  );
}