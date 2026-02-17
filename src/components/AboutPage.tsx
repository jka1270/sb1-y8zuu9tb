import { Award, Users, Globe, CheckCircle, Shield, Microscope, Building, Calendar, Target } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const milestones = [
    { year: '2018', title: 'Company Founded', description: 'Established ResearchRaws with focus on high-purity amino acid chains' },
    { year: '2019', title: 'GMP Certification', description: 'Achieved Good Manufacturing Practice certification' },
    { year: '2020', title: 'Research Partnerships', description: 'Formed partnerships with leading universities and research institutions' },
    { year: '2021', title: 'Quality Expansion', description: 'Expanded quality control laboratory and analytical capabilities' },
    { year: '2022', title: 'Global Reach', description: 'Extended shipping to over 50 countries worldwide' },
    { year: '2023', title: 'Innovation Center', description: 'Opened dedicated R&D facility for custom amino acid chain synthesis' },
    { year: '2024', title: 'AI Integration', description: 'Implemented AI-driven quality control and inventory management' },
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
            Leading the future of amino acid chain research with uncompromising quality, innovative solutions,
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
              amino acid chains, comprehensive documentation, and exceptional support services.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To be the global leader in amino acid chain research solutions, enabling breakthrough discoveries
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
                  Founded in 2018 by a team of passionate biochemists and entrepreneurs, ResearchRaws
                  emerged from a shared vision to bridge the gap between cutting-edge amino acid chain science and
                  practical research applications.
                </p>
                <p>
                  Our founders, having experienced firsthand the challenges researchers face in obtaining
                  high-quality amino acid chains with reliable documentation, set out to create a company that would
                  set new standards for quality, transparency, and customer service in the amino acid chain industry.
                </p>
                <p>
                  Today, we serve over 2,000 research institutions worldwide, from leading universities to 
                  innovative biotech companies, providing them with the tools they need to advance human health 
                  and scientific understanding.
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

        {/* Quality Assurance */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Quality Assurance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Our Quality Promise</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">98%+ Purity</h4>
                    <p className="text-gray-600 text-sm">Every product is tested and verified for quality</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Independent Testing</h4>
                    <p className="text-gray-600 text-sm">Third-party labs verify all products</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Full Documentation</h4>
                    <p className="text-gray-600 text-sm">Certificate of Analysis with every order</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Proper Storage</h4>
                    <p className="text-gray-600 text-sm">Temperature-controlled from start to finish</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Full Tracking</h4>
                    <p className="text-gray-600 text-sm">Track your product from production to delivery</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <OptimizedImage
                src="https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Quality control laboratory" 
                className="rounded-lg shadow-md"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* Manufacturing Process */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Manufacturing Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Production</h3>
              <p className="text-gray-600 text-sm">
                Advanced automated systems create amino acid chains
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Purification</h3>
              <p className="text-gray-600 text-sm">
                Products are refined to achieve 98%+ purity
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Testing</h3>
              <p className="text-gray-600 text-sm">
                Complete quality testing verifies every batch
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Packaging</h3>
              <p className="text-gray-600 text-sm">
                Sealed and packaged in controlled clean environments
              </p>
            </div>
          </div>
        </div>

        {/* Research Partnerships */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Research Partnerships</h2>
          <div className="text-center mb-8">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We collaborate with leading research institutions worldwide to advance amino acid chain science
              and support groundbreaking discoveries in medicine and biotechnology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Research Institutions</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2,000+</h3>
              <p className="text-gray-600">Active Researchers</p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">50+</h3>
              <p className="text-gray-600">Countries Served</p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">State-of-the-Art Facilities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">ResearchRaws Headquarters</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Microscope className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Research & Development</h4>
                    <p className="text-gray-600 text-sm">15,000 sq ft facility with advanced production systems</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Control Lab</h4>
                    <p className="text-gray-600 text-sm">Certified testing with professional equipment</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="h-6 w-6 text-orange-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Manufacturing</h4>
                    <p className="text-gray-600 text-sm">Clean, controlled production environments</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <OptimizedImage
                src="https://images.pexels.com/photos/3786164/pexels-photo-3786164.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Manufacturing facility" 
                className="rounded-lg shadow-md"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}