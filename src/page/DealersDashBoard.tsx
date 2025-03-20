import { useState } from "react";
import axios from "axios";
import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import contractAbi from "./../contractAbi.json";
import { toast } from "react-toastify";
import { useWriteContract } from "wagmi";
import DisplayDealersCar from "./DisplayDealersCar";

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
interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & { files: FileList };
}
interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}
interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

const DealerDashboard: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<"inventory" | "mint">("inventory");
  const [dealerCars, _setDealerCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [mintStatus, setMintStatus] = useState("");
  const { writeContractAsync, isPending, error:isErrorWrite } = useWriteContract();
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    price: "",
    tokenURI: "",
  });

  // upload image on pinata
  const uploadImageToPinata = async () => {
    if (!file) return null;

    try {
      setMintStatus("Uploading image to IPFS via Pinata...");
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      const metadata = JSON.stringify({
        name: `${carData.make} ${carData.model} ${carData.year}`,
      });
      formData.append("pinataMetadata", metadata);
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data;`,
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
        }
      );

      const ipfsHash = res.data.IpfsHash;
      return ipfsHash;
    } catch (error) {
      console.error("Error uploading image to Pinata:", error);
      setMintStatus("Failed to upload image to IPFS");
      throw error;
    }
  };

  // Create and upload metadata to Pinata
  const uploadMetadataToPinata = async (imageHash: string): Promise<string> => {
    try {
      setMintStatus("Creating and uploading metadata to IPFS...");
      const metadata: Metadata = {
        name: `${carData.make} ${carData.model} ${carData.year}`,
        description: `VIN: ${carData.vin} | Make: ${carData.make} | Model: ${carData.model} | Year: ${carData.year}`,
        image: `https://ipfs.io/ipfs/${imageHash}`,
        attributes: [
          { trait_type: "Make", value: carData.make },
          { trait_type: "Model", value: carData.model },
          { trait_type: "Year", value: carData.year.toString() },
          { trait_type: "VIN", value: carData.vin },
          { trait_type: "Price", value: `${carData.price} ETH` },
        ],
      };

      // Make API request to Pinata
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
        }
      );

      const metadataHash: string = res.data.IpfsHash;
      console.log(metadata);
      return metadataHash;
    } catch (error) {
      console.error("Error uploading metadata to Pinata:", error);
      setMintStatus("Failed to upload metadata to IPFS");
      throw error;
    }
  };

 
  const handleFileChange = (e: FileChangeEvent): void => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const imageHash = await uploadImageToPinata();
      if (!imageHash) {
        alert("Image upload failed");
        setIsLoading(false);
        return;
      }
      
      const metadataHash = await uploadMetadataToPinata(imageHash);
      if (!metadataHash) {
        alert("Metadata upload failed");
        setIsLoading(false);
        return;
      }
      const tokenURI = `https://ipfs.io/ipfs/${metadataHash}`;
      
      setMintStatus("Submitting transaction to blockchain...");
      const result = await writeContractAsync({
        address: CONTEACT_ADDRESS,
        abi: contractAbi,
        functionName: "mintNft",
        args: [
          "tesela",
          carData.model,
          carData.year,
          carData.vin,
          carData.price,
          tokenURI,
        ],
      });
      
      if (!result) {
        throw new Error("Transaction failed to submit");
      }
      
      toast.success("NFT Mint Transaction Submitted Successfully!");
      
      setCarData({
        make: "",
        model: "",
        year: "",
        vin: "",
        price: "",
        tokenURI: "",
      });
      setFile(null);
      setFilePreview("");
      toast.success("NFT mint transaction submitted successfully! Transaction hash: " + result);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Error minting NFT: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-3 px-6 ${
              activeTab === "inventory"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            My Inventory
          </button>
          <button
            className={`py-3 px-6 ${
              activeTab === "mint"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("mint")}
          >
            Mint New Car NFT
          </button>
        </div>

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <DisplayDealersCar setActiveTab={setActiveTab} />
        )}

        {/* Mint New Car NFT Tab */}
        {activeTab === "mint" && (
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Mint New Car NFT</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Car Details */}
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="make"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Make
                    </label>
                    <input
                      type="text"
                      id="make"
                      value={carData.make}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          make: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Tesla"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="model"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      value={carData.model}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          model: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Model S"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="year"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      value={carData.year}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 2023"
                      min="1886"
                      max="2025"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="vin"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      VIN
                    </label>
                    <input
                      type="text"
                      id="vin"
                      value={carData.vin}
                      onChange={(e) =>
                        setCarData((prev) => ({ ...prev, vin: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 1HGBH41JXMN109186"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Price (ETH)
                    </label>
                    <input
                      type="text"
                      id="price"
                      value={carData.price}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 12.5"
                      required
                    />
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div>
                  <div className="text-sm font-medium text-gray-300 mb-2">
                    Car Image
                  </div>

                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 min-h-64 flex flex-col items-center justify-center">
                    {filePreview ? (
                      <div className="w-full h-full">
                        <img
                          src={filePreview}
                          alt="Car preview"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setFilePreview("");
                              setFile(null);
                              setCarData((prev) => ({ ...prev, tokenURI: "" }));
                            }}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                          <span className="text-sm text-gray-400">
                            Image will be uploaded to IPFS
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-gray-400 mb-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                          Drag
                        </svg>
                        <p className="text-gray-400 text-center mb-4">
                          Drag and drop an image, or click to select a file
                        </p>
                        <input
                          type="file"
                          id="fileUpload"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="fileUpload"
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          Select Image
                        </label>
                      </>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-medium text-gray-300 mb-2">
                      Token URI (IPFS)
                    </div>
                    <input
                      type="text"
                      value={carData.tokenURI}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                      placeholder="Will be generated automatically upon minting"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      This IPFS URI will be generated automatically when you
                      mint the NFT.
                    </p>
                  </div>
                </div>
              </div>

              {mintStatus && (
                <div className="mt-4 p-3 rounded-lg bg-gray-700 border border-gray-600">
                  <p className="text-sm">{mintStatus}</p>
                </div>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className={`w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all ${
                    isLoading || !file ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Mint Car NFT"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;
