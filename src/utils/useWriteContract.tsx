import { CONTEACT_ADDRESS } from "./../utils/contactAddress";
import contractAbi from "./../contractAbi.json";
import { publicClient,client } from "./../utils/publicClient";
import {useState} from "react";

interface WriteContractParams {
  functionName: string;
  args?: any[];
  value?: bigint;
}

const useWriteContract = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const write= async ({ functionName, args, value }:WriteContractParams)=>{
    setLoading(true);
    setError(null);
    setTransactionHash(null);
    try{
        const hash=await client.writeContract({
            address: CONTEACT_ADDRESS,
            abi: contractAbi,
            functionName,
            args,
            value,
            account: publicClient.account || null 
        })

        setTransactionHash(hash)

    }catch(err){
        setError(err as Error)
    }finally{
        setLoading(false)
    }
  }
  return { write, loading, error, transactionHash };
};

export default useWriteContract;