"use client";
import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from 'react-router-dom';
import Image1 from "/tesla-fans-schweiz-2swaWy4Xhb0-unsplash.jpg";
import { publicClient } from "./../utils/publicClient";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import { useWriteContract } from "wagmi";
import contractAbi from "./../contractAbi.json";

interface TrendGam {
  id: string;
  title: string;
  floorPrice: number;
  totalVolume: number;
  image: StaticImageData;
}

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
const BuyersPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sales, setSales] = useState<TrendGam[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
   const [dealerCars, setDealerCars] = useState<Car[]>([]);
  const location = useLocation();
   const { address } = useAccount();
  const isCarDetails = location.pathname.includes('cardetails');

  // Initialize sales data
  useEffect(() => {
    const originalCollections = [
      {
        id: "1",
        title: "Daki Da",
        floorPrice: 0.12,
        totalVolume: 207,
        image: Image1,
      },
      {
        id: "2",
        title: "Birds of Damascus",
        floorPrice: 0.12,
        totalVolume: 207,
        image: Image1,
      },
      {
        id: "3",
        title: "Birds of Damascus",
        floorPrice: 0.12,
        totalVolume: 207,
        image: Image1,
      },
      {
        id: "4",
        title: "Birds of Damascus",
        floorPrice: 0.12,
        totalVolume: 207,
        image: Image1,
      },
      {
        id: "5",
        title: "Birds of Damascus",
        floorPrice: 0.12,
        totalVolume: 207,
        image: Image1,
      },
      {
        id: "6",
        title: "Birds of Damascus",
        floorPrice: 0.12,
        totalVolume: 207,
        image: Image1,
      },
    ];

    setSales([
      ...originalCollections,
      ...originalCollections,
      ...originalCollections,
    ]);
    setCurrentIndex(originalCollections.length);
  }, []);

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
  }, [address]);


  
  return (
    <div className="w-full min-h-screen p-8 bg-transparent">
      <div className="w-full h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-2xl font-medium">Cars For Sale</h1>
        </div>

        {isCarDetails ? (
          <Outlet />
        ) : (
          /* Carousel Container */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-900">
            {sales.map((sale, index) => (
              <div
                key={`${sale.id}-${index}`}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700 hover:border-gray-500 transition-all duration-300"
              >
                <div className="aspect-square w-full overflow-hidden relative">
                  <img
                    src={sale.image}
                    alt={sale.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 px-2 py-1 rounded-md">
                    <span className="text-xs font-medium text-white">
                      # {index + 1}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-white text-lg font-semibold mb-4 truncate">
                    {sale.title}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm">Floor Price</p>
                      <div className="flex items-center text-white font-medium">
                        <svg
                          className="w-4 h-4 mr-1 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                        </svg>
                        {sale.floorPrice}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm">Volume</p>
                      <div className="flex items-center text-white font-medium">
                        <svg
                          className="w-4 h-4 mr-1 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                        </svg>
                        {sale.totalVolume}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 px-5 py-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Last updated 2h ago
                  </span>
                  <Link to={`cardetails/${sale.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyersPage;
