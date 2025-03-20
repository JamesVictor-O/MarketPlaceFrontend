import { useState, useEffect } from "react";
import { publicClient } from "./../utils/publicClient";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import contractAbi from "./../contractAbi.json";

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: string;
  forSale: boolean;
  imageUrl: string;
}

interface HandleListingParams {
  id: number;
  price: string;
}

const DisplayDealersCar = ({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) => {
  const [dealerCars, setDealerCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Fetch dealer cars
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [AllDealerCar] = await Promise.all([
          publicClient.readContract({
            address: CONTEACT_ADDRESS,
            abi: contractAbi,
            functionName: "getCarsByDealer",
            args: [address],
          }),
        ]);

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

        setDealerCars(enhancedCars);
        console.log(enhancedCars);
      } catch (error) {
        console.log(error);
      }
    };

    if (address) {
      fetchData();
    }
  }, [address, isConfirmed]); 

  // Handle listing a car
  const handleListing = async ({ id, price }: HandleListingParams): Promise<void> => {
    try {
     
      writeContract({
        address: CONTEACT_ADDRESS,
        abi: contractAbi,
        functionName: "listCar",
        args: [id, price],
      });
    } catch (error) {
      console.error("Error listing car:", error);
    }
  };
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Car Inventory</h2>
        <button className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
          <svg
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : dealerCars.length === 0 ? (
        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">
            You haven't minted any car NFTs yet
          </p>
          <button
            onClick={() => setActiveTab("mint")}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Mint Your First Car NFT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealerCars.map((car, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 flex flex-col"
            >
              {/* Image Container with better aspect ratio and styling */}
              <div className="relative h-64 overflow-hidden">
                {car.imageUrl ? (
                  <img
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                    <span className="absolute text-gray-500 mt-20">
                      No Image Available
                    </span>
                  </div>
                )}

                {/* Car number badge - repositioned and restyled */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg font-medium shadow-lg">
                  #{index + 1}
                </div>

                {/* Sale status - moved to top-right for better visibility */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-block text-sm px-3 py-1 rounded-lg font-medium shadow-lg ${
                      car.forSale
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {car.forSale ? "Listed for Sale" : "Not Listed"}
                  </span>
                </div>
              </div>

              {/* Content Section - improved spacing and hierarchy */}
              <div className="p-5 flex-grow flex flex-col">
                {/* Car Make and Model - enhanced typography */}
                <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                  {car.make} <span className="mx-2 text-blue-400">•</span>{" "}
                  {car.model}
                </h3>

                {/* Year as subtitle */}
                <p className="text-blue-300 text-lg mb-3">
                  {car.year.toString()}
                </p>

                {/* Car Details - better organized */}
                <div className="text-gray-300 text-sm space-y-3 mb-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                        />
                      </svg>
                    </div>
                    <span>
                      <span className="text-gray-500">VIN:</span>{" "}
                      <span className="font-medium">{car.vin}</span>
                    </span>
                  </div>

                  {/* Price with enhanced styling */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-blue-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-blue-400">
                      {ethers.formatEther(car.price)} ETH
                    </span>
                  </div>
                </div>

                {/* Action Button - improved styling and positioning */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleListing({ id: 1, price: car.price })}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all font-medium shadow-lg transform hover:-translate-y-1"
                  >
                    {car.forSale ? "Update Listing" : "List for Sale"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DisplayDealersCar;
