import { Package, Truck, Clock, CheckCircle } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export default function ShippingIntegration() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cold Chain Shipping & Storage</h2>
          <p className="text-xl text-gray-600">
            Temperature-controlled delivery with integrated ShipStation tracking for amino acid chain integrity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cold Chain Packaging</h3>
            <p className="text-gray-600">Temperature-controlled packaging designed for amino acid chain stability and integrity</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Express Delivery</h3>
            <p className="text-gray-600">FedEx, UPS overnight shipping with temperature monitoring</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="bg-orange-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Temperature Monitoring</h3>
            <p className="text-gray-600">Real-time temperature tracking throughout the shipping process</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
            <p className="text-gray-600">Amino acid chain integrity guarantee with full quality assurance</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cold Chain ShipStation Integration</h3>
              <p className="text-gray-600 mb-6">
                Our platform integrates seamlessly with ShipStation to provide temperature-controlled shipping
                solutions for amino acid chains. From automatic cold chain label generation to temperature monitoring,
                we ensure your amino acid chains arrive in perfect condition.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Automated cold chain shipping labels
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Real-time temperature monitoring
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Express carrier rate comparison
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Quality confirmation & COA delivery
                </li>
              </ul>
            </div>
            <div>
              <OptimizedImage
                src="https://images.pexels.com/photos/3735780/pexels-photo-3735780.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Amino acid chain cold chain shipping"
                className="rounded-lg shadow-md"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}