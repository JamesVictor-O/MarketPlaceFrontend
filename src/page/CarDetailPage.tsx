import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { publicClient } from "./../utils/publicClient";
import {formatEther } from "ethers";
import { useAccount, useWriteContract } from "wagmi";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import contractAbi from "./../contractAbi.json";
import { motion } from "framer-motion";

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: string;
  forSale: boolean;
  dealer: string;
  imageUrl: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

interface OwnershipTransfer {
  from: string;
  to: string;
  timestamp: number;
  price: string;
}

const CarDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { address, isConnected } = useAccount();
  
  const { writeContract} = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        setTransactionStatus("pending");
        console.log("Transaction submitted:", hash);
      },
      onError: (error) => {
        setTransactionStatus("error");
        setErrorMessage(error.message.substring(0, 100) + "...");
        setIsPurchasing(false);
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const carId = parseInt(id, 10);

          // Fetch car details and ownership history
          const [carDetails, ownershipHistory] = await Promise.all([
            publicClient.readContract({
              address: CONTEACT_ADDRESS,
              abi: contractAbi,
              functionName: "getCarDetails",
              args: [carId],
            }),
            publicClient.readContract({
              address: CONTEACT_ADDRESS,
              abi: contractAbi,
              functionName: "getCarOwnershipHistory",
              args: [carId],
            }),
          ]);

          // Fetch token URI and metadata
          const uri = await publicClient.readContract({
            address: CONTEACT_ADDRESS,
            abi: contractAbi,
            functionName: "getTokenURI",
            args: [carId],
          });
          const response = await fetch(uri as string);
          const metadata = await response.json();

          // Combine car details and metadata
          const enhancedCar = {
            ...(carDetails as Car),
            imageUrl: metadata.image,
            metadata: metadata,
          };

          setCar(enhancedCar);
          setOwnershipHistory(ownershipHistory as OwnershipTransfer[]);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePurchase = () => {
    if (!car || !isConnected) return;
    
    setIsPurchasing(true);
    
    try {
      writeContract({
        address: CONTEACT_ADDRESS,
        abi: contractAbi,
        functionName: "buyCar",
        args: [car.id],
        
        value: BigInt(car.price),
      });
    } catch (error) {
      console.error("Purchase error:", error);
      setIsPurchasing(false);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // const formatDate = (timestamp: number): string => {
  //   // const date = new Date(timestamp * 1000); // Convert to milliseconds
  //   return date.toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  const TabButton = ({ name, label, icon }: { name: string; label: string; icon: string }) => (
    <button
      className={`px-6 py-3 font-medium rounded-lg flex items-center transition-all duration-200 ${
        activeTab === name
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
      }`}
      onClick={() => setActiveTab(name)}
    >
      <i className={`${icon} mr-2`}></i>
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-400 animate-pulse">Loading vehicle data from blockchain...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <svg
          className="w-20 h-20 text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-3xl font-bold mb-4 text-center">Vehicle Not Found</h2>
        <p className="mb-6 text-gray-400 text-center max-w-md">
          This vehicle doesn't exist on the blockchain or has been removed.
        </p>
        <Link 
          to="/" 
          className="px-8 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7"/>
          </svg>
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isUserOwner = address && car.dealer.toLowerCase() === address.toLowerCase();
  const isAvailableToBuy = car.forSale && !isUserOwner;
  
  const carAttributes = car.metadata.attributes.reduce((acc, attr) => {
    acc[attr.trait_type] = attr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-20">
      {/* Navbar with glassmorphism */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-gray-900/70 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center text-gray-300 hover:text-white transition">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Marketplace
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Vehicle #{car.id}</span>
              <div className="h-5 w-5 relative">
                <div className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-50"></div>
                <div className="rounded-full h-full w-full bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Image */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden bg-gray-800/50 border border-gray-700/50 shadow-xl shadow-blue-900/10"
            >
              <div className="relative">
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                  {car.forSale && (
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30 backdrop-blur-sm">
                      For Sale
                    </span>
                  )}
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30 backdrop-blur-sm">
                    NFT-Verified
                  </span>
                </div>
                <img
                  src={car.imageUrl}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover aspect-video"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-32"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                      {car.make} {car.model}
                    </h1>
                    <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700/50">
                      <p className="text-sm text-gray-400">Current Price</p>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-400 mr-1" viewBox="0 0 33 53" fill="none">
                          <path d="M16.3576 0.666687L16.0095 1.85009V36.1896L16.3576 36.5371L32.2976 27.115L16.3576 0.666687Z" fill="#343434"/>
                          <path d="M16.3578 0.666687L0.417816 27.115L16.3578 36.5372V19.8699V0.666687Z" fill="#8C8C8C"/>
                          <path d="M16.3575 39.5552L16.1613 39.7944V52.0268L16.3575 52.6L32.3064 30.1378L16.3575 39.5552Z" fill="#3C3C3B"/>
                          <path d="M16.3578 52.5998V39.5551L0.417816 30.1377L16.3578 52.5998Z" fill="#8C8C8C"/>
                          <path d="M16.3575 36.537L32.2973 27.1151L16.3575 19.8699V36.537Z" fill="#141414"/>
                          <path d="M0.417816 27.1151L16.3576 36.537V19.8699L0.417816 27.1151Z" fill="#393939"/>
                        </svg>
                        <p className="text-xl font-bold">{formatEther(car.price)} ETH</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center bg-gray-700/50 rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"></path>
                    </svg>
                    <span>{car.year.toString()}</span>
                  </div>
                  <div className="flex items-center bg-gray-700/50 rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 00.8-.4l3-4a1 1 0 00.2-.6V8a1 1 0 00-1-1h-3.9L11.1 3.6a1 1 0 00-.8-.4H4a1 1 0 00-1 1v.2z"></path>
                    </svg>
                    <span>{carAttributes["Body Type"] || "Sedan"}</span>
                  </div>
                  <div className="flex items-center bg-gray-700/50 rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                    </svg>
                    <span>{carAttributes["Mileage"] || "45,000"} mi</span>
                  </div>
                  <div className="flex items-center bg-gray-700/50 rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <span>{carAttributes["Interior Color"] || "Black"}</span>
                  </div>
                  <div className="flex items-center bg-gray-700/50 rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                    </svg>
                    <span>VIN: {car.vin.substring(0, 8)}...</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-300 leading-relaxed">{car.metadata.description}</p>
                </div>
                
                <div className="bg-blue-600/10 rounded-xl p-4 border border-blue-500/20 mb-6">
                  <div className="flex items-start">
                    <div className="rounded-full bg-blue-500/20 p-2 mr-3">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-400">Blockchain Verified</h3>
                      <p className="text-gray-300 text-sm mt-1">
                        This vehicle's information is immutably recorded on the blockchain, ensuring transparency and authenticity of its history and specifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Details and purchase */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24"
            >
              {/* Purchase card */}
              {isAvailableToBuy && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-blue-900/10 mb-6">
                  <h2 className="text-xl font-bold mb-4">Purchase this Vehicle</h2>
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Price</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-400 mr-1" viewBox="0 0 33 53" fill="none">
                          <path d="M16.3576 0.666687L16.0095 1.85009V36.1896L16.3576 36.5371L32.2976 27.115L16.3576 0.666687Z" fill="#343434"/>
                          <path d="M16.3578 0.666687L0.417816 27.115L16.3578 36.5372V19.8699V0.666687Z" fill="#8C8C8C"/>
                          <path d="M16.3575 39.5552L16.1613 39.7944V52.0268L16.3575 52.6L32.3064 30.1378L16.3575 39.5552Z" fill="#3C3C3B"/>
                          <path d="M16.3578 52.5998V39.5551L0.417816 30.1377L16.3578 52.5998Z" fill="#8C8C8C"/>
                          <path d="M16.3575 36.537L32.2973 27.1151L16.3575 19.8699V36.537Z" fill="#141414"/>
                          <path d="M0.417816 27.1151L16.3576 36.537V19.8699L0.417816 27.1151Z" fill="#393939"/>
                        </svg>
                        <span className="font-bold">{formatEther(car.price)} ETH</span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Gas fee (est.)</span>
                      <span>~ 0.005 ETH</span>
                    </div>
                    <div className="border-t border-gray-700 my-3"></div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-400 mr-1" viewBox="0 0 33 53" fill="none">
                          <path d="M16.3576 0.666687L16.0095 1.85009V36.1896L16.3576 36.5371L32.2976 27.115L16.3576 0.666687Z" fill="#343434"/>
                          <path d="M16.3578 0.666687L0.417816 27.115L16.3578 36.5372V19.8699V0.666687Z" fill="#8C8C8C"/>
                          <path d="M16.3575 39.5552L16.1613 39.7944V52.0268L16.3575 52.6L32.3064 30.1378L16.3575 39.5552Z" fill="#3C3C3B"/>
                          <path d="M16.3578 52.5998V39.5551L0.417816 30.1377L16.3578 52.5998Z" fill="#8C8C8C"/>
                          <path d="M16.3575 36.537L32.2973 27.1151L16.3575 19.8699V36.537Z" fill="#141414"/>
                          <path d="M0.417816 27.1151L16.3576 36.537V19.8699L0.417816 27.1151Z" fill="#393939"/>
                        </svg>
                        <span className="font-bold">{(parseFloat(formatEther(car.price)) + 0.005).toFixed(3)} ETH</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing || !isConnected}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                      isPurchasing || !isConnected
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : !isConnected ? (
                      "Connect Wallet to Purchase"
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Buy Now
                      </>
                    )}
                  </button>
                  
                  {transactionStatus === "error" && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-red-300">
                      <div className="font-semibold mb-1">Transaction failed</div>
                      <div>{errorMessage}</div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Secure blockchain transaction
                  </div>
                </div>
              )}
              
              {/* Owner information if user is owner */}
              {isUserOwner && (
                <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-800/30 shadow-xl shadow-blue-900/10 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">You own this vehicle</h3>
                      <p className="text-sm text-gray-400">Manage your asset</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4 text-sm transition-colors">
                      Update Listing
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4 text-sm transition-colors">
                      Transfer Ownership
                    </button>
                  </div>
                </div>
              )}
              
                       {/* Tab Navigation */}
              <div className="flex space-x-2 mb-6 bg-gray-800/50 rounded-xl p-1">
                <TabButton name="details" label="Details" icon="fas fa-info-circle" />
                <TabButton name="history" label="Ownership History" icon="fas fa-history" />
                <TabButton name="documents" label="Documents" icon="fas fa-file-alt" />
              </div>

              {/* Tab Content */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-blue-900/10">
                {activeTab === "details" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Vehicle Specifications</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Make</span>
                        <span className="font-medium">{car.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model</span>
                        <span className="font-medium">{car.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Year</span>
                        <span className="font-medium">{car.year.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">VIN</span>
                        <span className="font-medium">{car.vin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Body Type</span>
                        <span className="font-medium">{carAttributes["Body Type"] || "Sedan"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mileage</span>
                        <span className="font-medium">{carAttributes["Mileage"] || "45,000"} mi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Interior Color</span>
                        <span className="font-medium">{carAttributes["Interior Color"] || "Black"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exterior Color</span>
                        <span className="font-medium">{carAttributes["Exterior Color"] || "White"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ownership History</h3>
                    <div className="space-y-4">
                      {ownershipHistory.length > 0 ? (
                        ownershipHistory.map((transfer, index) => (
                          <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm text-gray-400">From</p>
                                <p className="font-medium">{formatAddress(transfer.from)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">To</p>
                                <p className="font-medium">{formatAddress(transfer.to)}</p>
                              </div>
                              {/* <div>
                                <p className="text-sm text-gray-400">Date</p>
                                <p className="font-medium">{formatDate(transfer.timestamp)}</p>
                              </div> */}
                              <div>
                                <p className="text-sm text-gray-400">Price</p>
                                <p className="font-medium">{formatEther(transfer.price)} ETH</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-400">No ownership history available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Vehicle Documents</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                            </svg>
                            <span className="font-medium">Vehicle Registration</span>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                            </svg>
                            <span className="font-medium">Service History</span>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                            </svg>
                            <span className="font-medium">Insurance Documents</span>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;