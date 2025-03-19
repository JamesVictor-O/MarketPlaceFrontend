import { useState,useEffect } from "react";
import { publicClient } from "./../utils/publicClient";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";

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
const DisplayDealersCar = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
      const [dealerCars, setDealerCars] = useState<Car[]>([]);
      const [isLoading, setIsLoading] = useState<boolean>(false);
      const [editingCarId, setEditingCarId] = useState<number | null>(null);
      const [newPrice, setNewPrice] = useState<string>("");
      const { address, isConnected } = useAccount();

      useEffect(() => {
        const fetchData = async () => {
          try {
            const [carNumber,AllDealerCar] = await Promise.all([
              publicClient.readContract({
                address: CONTEACT_ADDRESS,
                abi: contractAbi,
                functionName: "getDealerCarCount",
                args:[address]
              }),
              publicClient.readContract({
                address: CONTEACT_ADDRESS,
                abi: contractAbi,
                functionName: "getDealerCars",
                args: [address],
              }),
              publicClient.readContract({
                address: CONTEACT_ADDRESS,
                abi: contractAbi,
                functionName: "getTokenURI",
                args: [address],
              }),
            ]); 
             setDealerCars(AllDealerCar as Car[])
            console.log(carNumber,AllDealerCar)
            // setIsRegistered(registered as boolean);
          } catch (error) {
            console.log(error);
          }
        };
    
        fetchData();
      }, []);

      useEffect(()=>{
        dealerCars.map((car)=> console.log(car))
      },[dealerCars])
    
    
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
          {dealerCars.map((car,index) => (
            <div
              key={index}
              className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl overflow-hidden"
            >
              <div className="h-48 bg-gray-700 flex items-center justify-center">
                {car.imageUrl ? (
                  <img
                    src="/api/placeholder/400/320"
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500">No Image Available</div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">
                    {car.make} {car.model}
                  </h3>
                  <span className="text-sm bg-blue-900 px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>

                <div className="text-gray-400 text-sm mb-4">
                  <div>Year: {car.year.toString()}</div>
                  <div>VIN: {car.vin}</div>
                  <div className="flex items-center mt-2">
                    <svg
                      className="w-4 h-4 mr-1 text-blue-400"
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
                    <span className="text-blue-400 font-medium">
                      {ethers.formatEther(car.price)} ETH
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      car.forSale
                        ? "bg-green-900 text-green-300"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {car.forSale ? "Listed for Sale" : "Not Listed"}
                  </span>
                </div>

                {editingCarId === car.id ? (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="New price in ETH"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <button
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        disabled={isLoading}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setEditingCarId(null);
                          setNewPrice("");
                        }}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex space-x-2">
                    {car.forSale ? (
                      <button
                        onClick={() => {
                          setEditingCarId(car.id);
                          setNewPrice(car.price);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-900 text-blue-300 border border-blue-800 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                      >
                        Update Price
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCarId(car.id);
                          setNewPrice(car.price);
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm"
                      >
                        List for Sale
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DisplayDealersCar;
