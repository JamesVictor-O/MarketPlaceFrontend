import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import useReadContract from "../utils/useReadContract";
import {CONTEACT_ADDRESS} from "./../utils/contactAddress"
import contractAbi from "./../contractAbi.json"

import { useWriteContract} from "wagmi";



const DealerRegistrationForm: React.FC = ({}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync} = useWriteContract();
  const navigate=useNavigate()

  
  const {data, loading}=useReadContract({
       functionName:"dealerRegistrationFee",
       format: (data) => ethers.formatEther(data as bigint), 
  });


  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      console.log("Submitting registration...");

     
      if (!data) {
        throw new Error("Registration fee data is not available.");
      }
      const registrationFeeWei = ethers.parseEther(data);

      const result = await writeContractAsync({
        address: CONTEACT_ADDRESS,
        abi: contractAbi,
        functionName: "registerDealer",
        args: [email, name],
        value: registrationFeeWei,
      });

      if (!result) {
        throw new Error("Transaction failed to submit");
      }
      setSuccess(true);
      toast.success("Registration successful!!!");
      
      setTimeout(() => {
        navigate("/dealersdashboard");
      }, 3000); 
    } catch (error) {
      toast.error("Error during registration: " + (error instanceof Error ? error.message : String(error)))
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setSuccess(false)
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="py-10">
      <div className="w-full max-w-md mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700 ">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Dealer Registration
        </h2>

        {/* Registration Fee Display */}
        <div className="mb-6 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Registration Fee:</span>
            <span className="text-blue-400 font-medium">
              {data} ETH
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            This fee is required to register as a dealer on our platform. The
            fee helps maintain the integrity of our marketplace.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={(e)=>handleSubmit(e)}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Dealership Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your dealership name"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-30 rounded-lg border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-800 text-green-200 text-sm">
              Registration successful! You are now a registered dealer.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "Register as Dealer"
            )}
          </button>
        </form>

        {/* Wallet Connection Warning */}
        <div className="mt-6 text-xs text-gray-400">
          <p>
            You will need to connect your wallet and approve the transaction to
            complete registration. The registration fee will be charged to your
            wallet.
          </p>
        </div>

      </div>
    </div>
  );
};

export default DealerRegistrationForm;
