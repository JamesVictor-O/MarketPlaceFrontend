import { useState, useEffect } from "react";
import { publicClient } from "./../utils/publicClient";
import { useAccount } from "wagmi";
import { formatEther } from "ethers";
import { toast } from "react-toastify";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import contractAbi from "./../contractAbi.json";
import { Car, Tag, Clock, Loader2, Plus, RefreshCw } from "lucide-react";

interface CarItem {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: string;
  forSale: boolean;
  imageUrl: string;
  tokenURI?: string;
  metadata?: any;
}

interface HandleListingParams {
  id: number;
  price: string;
  make: string;
}
type Tab = "mint" | "inventory";
const DisplayDealersCar = ({
  setActiveTab,
}: {
  setActiveTab: (tab: Tab) => void; 
}) => {
  const [dealerCars, setDealerCars] = useState<CarItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { address } = useAccount();
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Fetch dealer cars
  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        const AllDealerCar = await publicClient.readContract({
          address: CONTEACT_ADDRESS,
          abi: contractAbi,
          functionName: "getCarsByDealer",
          args: [address],
        });

        const enhancedCars = await Promise.all(
          (AllDealerCar as CarItem[]).map(async (car) => {
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
      } catch (error) {
        console.error("Error fetching dealer cars:", error);
        toast.error("Failed to load your car inventory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address, isConfirmed]);

  const refreshInventory = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const AllDealerCar = await publicClient.readContract({
        address: CONTEACT_ADDRESS,
        abi: contractAbi,
        functionName: "getCarsByDealer",
        args: [address],
      });

      const enhancedCars = await Promise.all(
        (AllDealerCar as CarItem[]).map(async (car) => {
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
      toast.success("Inventory refreshed successfully");
    } catch (error) {
      console.error("Error refreshing dealer cars:", error);
      toast.error("Failed to refresh your car inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle listing a car
  const handleListing = async ({ id, price, make }: HandleListingParams): Promise<void> => {
    try {
      const result = await writeContractAsync({
        address: CONTEACT_ADDRESS,
        abi: contractAbi,
        functionName: "listCar",
        args: [id, price],
      });

      if (!result) {
        throw new Error("Transaction failed to submit");
      }
      
      toast.success(`${make} with ID #${id} has been successfully listed`);
    } catch (error) {
      toast.error("Error listing car: " + (error instanceof Error ? error.message : String(error)));
      console.error("Error listing car:", error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with subtle gradient background */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40"></div>
          <div className="relative p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">My Vehicle Collection</h2>
                <p className="text-blue-300 mt-1">Manage your minted car NFTs</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshInventory}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-white transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                <button
                  onClick={() => setActiveTab("mint")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Mint New
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory stats/info panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Cars</p>
            <p className="text-white text-2xl font-bold">{dealerCars.length}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Listed For Sale</p>
            <p className="text-white text-2xl font-bold">
              {dealerCars.filter(car => car.forSale).length}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Vault Value</p>
            <p className="text-white text-2xl font-bold flex items-center">
              <svg 
                className="h-5 w-5 mr-1 text-blue-400" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
              </svg>
              {dealerCars.reduce((total, car) => total + parseFloat(formatEther(car.price)), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Main content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-300">Loading your car inventory...</p>
          </div>
        ) : dealerCars.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Car className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Garage is Empty</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              You haven't minted any car NFTs yet. Start building your collection by minting your first car.
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
            {dealerCars.map((car) => (
              <div
                key={car.id}
                className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-900/20"
              >
                {/* Card Header with Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-all duration-300"></div>
                  {car.imageUrl ? (
                    <img
                      src={car.imageUrl}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-gray-600" />
                      <span className="absolute text-gray-500 mt-20">No Image Available</span>
                    </div>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="h-3 w-3 text-blue-400" />
                      <span className="text-xs font-bold text-white">#{car.id}</span>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <div className={`px-3 py-1 rounded-full backdrop-blur-sm text-xs font-bold
                      ${car.forSale 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-gray-700/90 text-gray-300'}`
                    }>
                      {car.forSale ? 'LISTED' : 'NOT LISTED'}
                    </div>
                  </div>

                  {/* Price overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{car.make} {car.model}</h3>
                      <div className="flex items-center text-blue-300 font-medium">
                        <svg 
                          className="h-4 w-4 mr-1" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                        </svg>
                        {formatEther(car.price)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body with Details */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">{car.year}</span>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Minted</span>
                    </div>
                  </div>

                  {/* VIN with nicer styling */}
                  <div className="mb-5 py-3 px-4 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">Vehicle Identification</p>
                    <p className="text-sm font-mono text-gray-300">{car.vin}</p>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleListing({ id: car.id, price: car.price, make: car.make })}
                    disabled={isConfirming}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-all
                      ${car.forSale 
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800'} 
                      ${isConfirming ? 'opacity-70 cursor-not-allowed' : ''}`
                    }
                  >
                    {isConfirming ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      car.forSale ? "Update Listing" : "List for Sale"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayDealersCar;
