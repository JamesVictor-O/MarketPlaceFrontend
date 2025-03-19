import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import Tesla from "/10815910.png";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import contractAbi from "./../contractAbi.json";
import { publicClient } from "./../utils/publicClient";
import { ConnectButton } from "@rainbow-me/rainbowkit";


const LandingPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [carRotation, setCarRotation] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const carRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fee, registered] = await Promise.all([
          publicClient.readContract({
            address: CONTEACT_ADDRESS,
            abi: contractAbi,
            functionName: "dealerRegistrationFee",
          }),
          publicClient.readContract({
            address: CONTEACT_ADDRESS,
            abi: contractAbi,
            functionName: "isRegistered",
            args: [address],
          }),
        ]); 
        setIsRegistered(registered as boolean);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = (e: string) => {
    e == "Buyer" ? navigate("dealersignup") : navigate("");
  };

  useEffect(() => {
    if (isRegistered) {
      navigate("dealersdashboard");
    }
  }, [isRegistered]);

 
  useEffect(() => {
    const interval = setInterval(() => {
      setCarRotation((prev) => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
      {/* Hero Section */}
      <main className="relative z-10 px-16 py-8 md:py-12 lg:py-20 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl text-center md:text-left md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            Discover, find, and <span className="text-blue-400">sell</span>{" "}
            extraordinary <span className="text-blue-400">vehicles</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-300 text-center md:text-left text-lg md:text-xl"
          >
            The world's first and largest digital marketplace for crypto car
            ownership and decentralized vehicle trading.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-4"
          >
            {isConnected || address ? (
              <div>
                <button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                  onClick={() => handleNavigation("Buyer")}
                >
                  Buyer
                </button>
                <button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg ml-5"
                  onClick={() => handleNavigation("Seller")}
                >
                  Seller
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg ml-5 w-48">
                <ConnectButton.Custom>
                  {({
                    account,
                    openAccountModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const connected = mounted && account;

                    return (
                      <div>
                        {connected ? (
                          <button
                            onClick={openAccountModal}
                            className="flex items-center"
                          >
                            <span className="text-white font-medium">
                              {account.displayName}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={openConnectModal}
                            className="flex items-center"
                          >
                            <span className="text-white font-medium">
                              Connect Wallet
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8"
          >
            <p className="text-gray-400 text-sm mb-4">Featured Collections</p>
            <div className="flex space-x-4">
              <div className="group">
                <div className="text-sm text-blue-400 border border-blue-500 rounded-lg px-4 py-2 bg-blue-900/20 hover:bg-blue-900/40 transition-colors">
                  LUXURY
                </div>
              </div>
              <div className="group">
                <div className="text-sm text-gray-400 border border-gray-700 rounded-lg px-4 py-2 bg-gray-900/20 hover:bg-gray-900/40 transition-colors">
                  SPORTS
                </div>
              </div>
              <div className="group">
                <div className="text-sm text-gray-400 border border-gray-700 rounded-lg px-4 py-2 bg-gray-900/20 hover:bg-gray-900/40 transition-colors">
                  CLASSIC
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />

            <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full border border-blue-500/50 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-blue-400/30" />
              <div className="absolute inset-2 rounded-full border border-blue-400/20" />
              <div className="absolute inset-4 rounded-full border border-blue-400/10" />

              <div
                ref={carRef}
                className="w-52 h-32 md:w-64 md:h-48 relative"
                style={{
                  transform: `rotateY(${carRotation}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* <svg viewBox="0 0 1000 500" className="w-full h-full">
                      <g fill="#3B82F6">
                        <path d="M800,350 L900,350 C950,350 950,300 900,300 L800,300 L800,350 Z" />
                        <path d="M200,350 L100,350 C50,350 50,300 100,300 L200,300 L200,350 Z" />
                        <path d="M800,300 L800,250 L700,200 L300,200 L200,250 L200,300 L800,300 Z" />
                        <path d="M720,250 A40,40 0 1,1 720,251 Z" />
                        <path d="M280,250 A40,40 0 1,1 280,251 Z" />
                      </g>
                      <g fill="#1E3A8A">
                        <path d="M650,250 L450,250 L450,220 L650,220 Z" />
                        <path d="M350,250 L250,250 L250,220 L350,220 Z" />
                      </g>
                    </svg> */}
                    <img
                      src={Tesla}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute top-0 -mt-4 rounded-full bg-blue-900 px-4 py-1 text-xs text-blue-400 border border-blue-500/50">
                360°
              </div>
            </div>

            <div className="absolute bottom-0 right-0 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 w-64">
              <div className="text-lg font-medium">Genesis GV80</div>
              <div className="text-sm text-gray-400 mb-2">
                Luxury SUV with blockchain provenance
              </div>
              <div className="flex items-center text-sm text-blue-400">
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                ETH 45.8
              </div>
              <button className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 w-full rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                Buy
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
