import { Award, Users, Globe, CheckCircle, Shield, Microscope, Building, Calendar, Target } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const milestones = [
    { year: '2018', title: 'Company Founded', description: 'Established ResearchRaws with focus on high-purity Amino Acid Chains' },
    { year: '2019', title: 'GMP Certification', description: 'Achieved Good Manufacturing Practice certification' },
    { year: '2020', title: 'Research Partnerships', description: 'Formed partnerships with leading universities and research institutions' },
    { year: '2021', title: 'Quality Expansion', description: 'Expanded quality control laboratory and analytical capabilities' },
    { year: '2022', title: 'Global Reach', description: 'Extended shipping to over 50 countries worldwide' },
    { year: '2023', title: 'Innovation Center', description: 'Opened dedicated R&D facility for custom Amino Acid Chain synthesis' },
    { year: '2025', title: 'Sustainability Initiative', description: 'Launched green chemistry and sustainable manufacturing practices' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About ResearchRaws</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Leading the future of Amino Acid Chain research with uncompromising quality, innovative solutions,
            and unwavering commitment to advancing scientific discovery worldwide.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To accelerate scientific discovery by providing researchers worldwide with the highest quality
              Amino Acid Chains, comprehensive documentation, and exceptional support services.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To be the global leader in Amino Acid Chain research solutions, enabling breakthrough discoveries
              in therapeutics, diagnostics, and biotechnology applications.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
            <p className="text-gray-600">
              Quality excellence, scientific integrity, customer partnership, innovation leadership, 
              and responsible research practices guide everything we do.
            </p>
          </div>
        </div>

        {/* Company Story */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2018 by a small team of passionate biochemists and entrepreneurs, ResearchRaws was
                  created from a shared belief that researchers deserve better access to high-quality amino acid
                  chain materials.
                </p>
                <p>
                  Our goal has always been simple: to make well-sourced, dependable raw peptide products more
                  accessible to the scientific community.
                </p>
                <p>
                  Having experienced the challenges of finding consistent quality and clear documentation firsthand,
                  our founders set out to build a company grounded in transparency, reliability, and respect for the
                  research process.
                </p>
                <p>
                  Rather than overcomplicating the mission, we focus on doing the fundamentals well—sourcing carefully,
                  maintaining high standards, and supporting those who share a genuine interest in peptide science.
                </p>
                <p>
                  ResearchRaws exists for researchers, biochemists, and entrepreneurs who are passionate about
                  advancing peptide research and who value quality, honesty, and thoughtful sourcing in the materials
                  they use.
                </p>
              </div>
            </div>
            <div>
              <OptimizedImage
                src="https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="ResearchRaws laboratory"
                className="rounded-lg shadow-md"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-blue-200"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Sourcing Process */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Sourcing Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier Selection</h3>
              <p className="text-gray-600 text-sm">
                Rigorous vetting of manufacturing partners with proven track records in peptide synthesis
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Verification</h3>
              <p className="text-gray-600 text-sm">
                Independent third-party testing and Certificate of Analysis verification for every batch
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chain of Custody</h3>
              <p className="text-gray-600 text-sm">
                Complete traceability from source to delivery with secure handling protocols
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Assurance</h3>
              <p className="text-gray-600 text-sm">
                Adherence to regulatory standards and GMP guidelines across the supply chain
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}