import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock function - replace with your actual contract interaction
interface CarDetails {
    id: string;
    title: string;
    image: string;
    currentOwner: string;
    description: string;
    specifications: {
        make: string;
        model: string;
        year: number;
        mileage: string;
        vin: string;
        engine: string;
        horsepower: string;
        transmission: string;
    };
    ownershipHistory: {
        owner: string;
        acquiredDate: string;
        price: string;
        transactionHash: string;
    }[];
    serviceRecords: {
        date: string;
        mileage: string;
        service: string;
        provider: string;
    }[];
    registrationNumber: string;
    registeredLocation: string;
    lastVerified: string;
}

const fetchCarDetails = async (id: string): Promise<CarDetails> => {
    // This would be replaced with your actual smart contract call
    return {
        id: id,
        title: "2023 Mercedes-Benz AMG GT",
        image: "/images/cars/mercedes-amg-gt.jpg",
        currentOwner: "0x7a23C4A9073eB67ac41D4C1B23C78162d8b72f79",
        description: "Limited Edition AMG GT with custom modifications and track history.",
        specifications: {
            make: "Mercedes-Benz",
            model: "AMG GT",
            year: 2023,
            mileage: "12,452 km",
            vin: "WDDYJ7JA3LA015812",
            engine: "4.0L V8 Biturbo",
            horsepower: "577 hp",
            transmission: "7-Speed Dual-Clutch"
        },
        ownershipHistory: [
            { 
                owner: "0x7a23C4A9073eB67ac41D4C1B23C78162d8b72f79", 
                acquiredDate: "2025-02-15T14:22:18Z",
                price: "3.85 ETH",
                transactionHash: "0x5d73e0330c8d5318e301add25dc28a5cc24b4c9cce452b2a983cf28ab415590d"
            },
            { 
                owner: "0x3aB46836Ca6708C5C5e93e5322f8Ee32783f05d9", 
                acquiredDate: "2024-11-10T09:45:12Z",
                price: "3.2 ETH",
                transactionHash: "0x8a34e7214b2b4e3a3c8df9b96218c019e490bd7fbe7c0b5cb599d71ddc09a2c1" 
            },
            { 
                owner: "0x8Fc8C91C5587af26Cc9D9115a3B8eA1022D809c7", 
                acquiredDate: "2024-04-22T16:30:45Z",
                price: "2.8 ETH",
                transactionHash: "0x1c2f4c6a7b97a1d8e3f0c5b9d1e2a3c4b5d6e7f8a9b8c7d6e5f4a3b2c1d0e9f8"
            }
        ],
        serviceRecords: [
            {
                date: "2024-09-15",
                mileage: "10,245 km",
                service: "Regular maintenance and brake replacement",
                provider: "Mercedes-Benz Certified Service Center"
            },
            {
                date: "2024-01-08",
                mileage: "5,120 km",
                service: "Oil change and tire rotation",
                provider: "AMG Performance Center"
            }
        ],
        registrationNumber: "WBA 1235",
        registeredLocation: "Berlin, Germany",
        lastVerified: "2025-01-28T12:45:00Z"
    };
};

const CarDetailsPage = () => {
  const { id } = useParams();
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const getCarDetails = async () => {
      try {
        if (id) {
          const details = await fetchCarDetails(id);
          setCarDetails(details);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching car details:", error);
        setLoading(false);
      }
    };

    getCarDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // if (!carDetails) {
  //   return (
  //     <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
  //       <h2 className="text-2xl font-bold mb-4">NFT Not Found</h2>
  //       <p className="mb-6">This car NFT does not exist or has been removed.</p>
  //       <Link to="/" className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
  //         Return to Marketplace
  //       </Link>
  //     </div>
  //   );
  // }

const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

interface FormatDate {
    (dateString: string): string;
}

const formatDate: FormatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

  const TabButton = ({ name, label }: { name: string; label: string }) => (
    <button
      className={`px-4 py-2 font-medium ${
        activeTab === name 
          ? 'text-blue-400 border-b-2 border-blue-400' 
          : 'text-gray-400 hover:text-gray-200'
      }`}
      onClick={() => setActiveTab(name)}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      <div className="container mx-auto px-4 pt-6">
        <Link to="/" className="flex items-center text-gray-400 hover:text-white mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Image */}
          <div className="rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
            <div className="aspect-w-16 aspect-h-12">
              <img 
                src={carDetails?.image} 
                alt={carDetails?.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Current Owner</p>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mr-3"></div>
                    <a 
                      href={carDetails ? `https://etherscan.io/address/${carDetails.currentOwner}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {carDetails?.currentOwner ? formatAddress(carDetails.currentOwner) : 'N/A'}
                    </a>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-gray-400 text-sm">Last Verified</p>
                  <p className="text-white mt-1">{carDetails?.lastVerified ? formatDate(carDetails.lastVerified) : 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Blockchain Verified</span>
                  </div>
                  <a 
                    // href={`https://etherscan.io/tx/${carDetails.ownershipHistory[0].transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:underline"
                  >
                    View Transaction
                  </a>
                </div>
                <p className="text-gray-300 text-sm">
                  This vehicle's information has been verified by our network of trusted inspectors and permanently recorded on the blockchain.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Registration</p>
                  <p className="text-white font-medium mt-1">{carDetails?.registrationNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium mt-1">{carDetails?.registeredLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{carDetails?.title}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-6">
                <svg className="w-5 h-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                </svg>
                <span className="font-bold text-xl">{carDetails?.ownershipHistory[0].price}</span>
              </div>
              <div className="text-gray-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last sold {carDetails?.ownershipHistory[0].acquiredDate ? formatDate(carDetails.ownershipHistory[0].acquiredDate) : 'N/A'}</span>
              </div>
            </div>

            <p className="text-gray-300 mb-8">{carDetails?.description}</p>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <div className="flex space-x-4">
                <TabButton name="details" label="Vehicle Details" />
                <TabButton name="ownership" label="Ownership History" />
                <TabButton name="service" label="Service Records" />
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'details' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-gray-400 text-sm">Make</p>
                    <p className="text-white">{carDetails?.specifications.make}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Model</p>
                    <p className="text-white">{carDetails?.specifications.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Year</p>
                    <p className="text-white">{carDetails?.specifications.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mileage</p>
                    <p className="text-white">{carDetails?.specifications.mileage}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">VIN</p>
                    <p className="text-white">{carDetails?.specifications.vin}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Engine</p>
                    <p className="text-white">{carDetails?.specifications.engine}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Horsepower</p>
                    <p className="text-white">{carDetails?.specifications.horsepower}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Transmission</p>
                    <p className="text-white">{carDetails?.specifications.transmission}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ownership' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Ownership History</h3>
                <div className="space-y-6">
                  {carDetails?.ownershipHistory.map((record, index) => (
                    <div key={index} className="relative pl-8 pb-6">
                      {index !== carDetails.ownershipHistory.length - 1 && (
                        <div className="absolute left-3 top-3 h-full w-0.5 bg-gray-700"></div>
                      )}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        {index === 0 ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                        )}
                      </div>
                      <div className="mb-1 flex justify-between">
                        <a 
                          href={`https://etherscan.io/address/${record.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-medium"
                        >
                          {record.owner ? formatAddress(record.owner) : 'N/A'}
                        </a>
                        <span className="text-gray-400">{formatDate(record.acquiredDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-400 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                          </svg>
                          <span>{record.price}</span>
                        </div>
                        <a 
                          href={`https://etherscan.io/tx/${record.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-gray-300"
                        >
                          View Transaction
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Service Records</h3>
                {carDetails && carDetails.serviceRecords.length > 0 ? (
                  <div className="space-y-6">
                    {carDetails?.serviceRecords.map((record, index) => (
                      <div key={index} className="relative pl-8 pb-6">
                        {index !== carDetails.serviceRecords.length - 1 && (
                          <div className="absolute left-3 top-3 h-full w-0.5 bg-gray-700"></div>
                        )}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="mb-1 flex justify-between">
                          <span className="font-medium">{record.service}</span>
                          <span className="text-gray-400">{record.date}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>{record.provider}</span>
                          <span>Mileage: {record.mileage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No service records available for this vehicle.</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex-1 transition">
                Make Offer
              </button>
              <button className="px-8 py-3 bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-900 hover:bg-opacity-20 rounded-lg font-medium flex-1 transition">
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;