import { useState } from 'react';
import { X } from 'lucide-react';

interface AgeVerificationModalProps {
  onVerified: () => void;
}

export default function AgeVerificationModal({ onVerified }: AgeVerificationModalProps) {
  const [isOver21, setIsOver21] = useState(false);
  const [isResearchPurpose, setIsResearchPurpose] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const canProceed = isOver21 && isResearchPurpose && agreedToTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      localStorage.setItem('ageVerified', 'true');
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 relative">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Age Verification & Research Certification
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Please confirm the following to access ResearchRaws
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isOver21}
                onChange={(e) => setIsOver21(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 text-sm sm:text-base group-hover:text-gray-900 select-none">
                I certify that I am <strong>21 years of age or older</strong>
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isResearchPurpose}
                onChange={(e) => setIsResearchPurpose(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 text-sm sm:text-base group-hover:text-gray-900 select-none">
                I am using this website for <strong>research purposes only</strong>
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 text-sm sm:text-base group-hover:text-gray-900 select-none">
                I agree to the <strong>Terms of Service</strong> and understand that all products are for research use only and not for human consumption
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!canProceed}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                canProceed
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Enter Site
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By entering this site, you acknowledge that you meet all requirements and will use products solely for legitimate research purposes.
          </p>
        </form>
      </div>
    </div>
  );
}
