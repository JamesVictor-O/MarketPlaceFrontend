"use client";
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { publicClient } from "./../utils/publicClient";
import { formatEther } from "ethers";
import { useAccount } from "wagmi";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import contractAbi from "./../contractAbi.json";
import { Loader2, Filter, Search, Clock, Tag, CarFront, Zap } from "lucide-react";

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: string;
  forSale: boolean;
  imageUrl: string;
  metadata?: any;
  tokenURI?: string;
}

const BuyersPage: React.FC = () => {
  const [_allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const isCarDetails = location.pathname.includes("cardetails");

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const AllDealerCar = await publicClient.readContract({
          address: CONTEACT_ADDRESS,
          abi: contractAbi,
          functionName: "getAllMintedCars",
        });
        
        const enhancedCars = await Promise.all(
          (AllDealerCar as Car[]).map(async (car) => {
            try {
              const uri = await publicClient.readContract({
                address: CONTEACT_ADDRESS,
                abi: contractAbi,
                functionName: "getTokenURI",
                args: [car.id],
              });

              const response = await fetch(uri as string);
              const metadata = await response.json();

              return {
                ...car,
                tokenURI: uri as string,
                imageUrl: metadata.image,
                metadata: metadata,
              };
            } catch (error) {
              console.error(`Error fetching data for car:`, error);
              return car;
            }
          })
        );

        setAllCars(enhancedCars);
        setFilteredCars(enhancedCars);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  // useEffect(() => {
  //   // Filter and sort cars based on search term and sort selection
  //   let result = [...allCars];
    
  //   if (searchTerm) {
  //     result = result.filter(car => 
  //       car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       car.year.toString().includes(searchTerm)
  //     );
  //   }
    
  //   if (sortBy === "price") {
  //     result.sort((a, b) => parseFloat(formatEther(a.price)) - parseFloat(formatEther(b.price)));
  //   } else {
  //     // Sort by ID (assuming newer cars have higher IDs)
  //     result.sort((a, b) => b.id - a.id);
  //   }
    
  //   setFilteredCars(result);
  // }, [searchTerm, sortBy, allCars]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-center">
        <div className="max-w-md mx-auto bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          <CarFront className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            To browse and purchase NFT cars, you need to connect your Web3 wallet first.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-all duration-300 flex items-center justify-center gap-2">
            <Zap className="h-5 w-5" />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900">
      {isCarDetails ? (
        <Outlet />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with gradient */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-10"></div>
            <div className="relative py-8 px-6 rounded-xl bg-gray-800 border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-white text-3xl font-bold tracking-tight">NFT Car Marketplace</h1>
                  <p className="text-gray-400 mt-2">Browse and collect unique digital vehicles on the blockchain</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={toggleFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all duration-200"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search make, model..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 w-full md:w-64 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Expanded filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Sort by</label>
                    <select 
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "price" | "newest")}
                    >
                      <option value="newest">Newest First</option>
                      <option value="price">Price: Low to High</option>
                    </select>
                  </div>
                  {/* Additional filters can be added here */}
                </div>
              )}
            </div>
          </div>

          {/* Status info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400">
              {loading ? 'Loading cars...' : `Showing ${filteredCars.length} cars`}
            </p>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
              <CarFront className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl text-white font-medium mb-2">No cars found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCars.map((car) => (
                <Link
                  to={`cardetails/${car.id}`}
                  key={car.id}
                  className="group block bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-blue-900/20 hover:shadow-xl"
                >
                  {/* Car Image with background gradient */}
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-all duration-300"></div>
                    <img
                      src={car.imageUrl}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-contain z-10 transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-blue-400" />
                        <span className="text-xs font-medium text-white">#{car.id}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{formatEther(car.price)} ETH</span>
                      </div>
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {car.make} {car.model}
                      </h3>
                      <span className="text-gray-400 text-sm">{car.year}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-400 text-sm">
                        <CarFront className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="truncate">{car.vin}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Minted recently</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-sm text-gray-500">View Details</span>
                      <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                        <svg 
                          className="h-4 w-4 text-blue-400 group-hover:text-white transition-colors" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyersPage;