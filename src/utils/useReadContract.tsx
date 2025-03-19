import {CONTEACT_ADDRESS} from "./../utils/contactAddress"
import contractAbi from "./../contractAbi.json"
import { publicClient } from "./../utils/publicClient";
import { useEffect, useState, useCallback } from "react";
interface  ReadContractParams{
    functionName:string,
    args?:any[],
    format?: (data: any) => any;
}

const useReadContract = ({functionName, args, format}: ReadContractParams) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading]=useState<boolean>(true);
    const [error, setError]=useState<Error | null>(null)
    
    const fetchData=useCallback(async ()=>{
       try{
         const result=await publicClient.readContract({
             address:CONTEACT_ADDRESS,
             abi:contractAbi,
             functionName,
             args,
         })
         setData(format ? format(result) : result)
       } catch(error){
          setError(error as Error)
       } finally{
         setLoading(false)
       }
    },[functionName, args, format])

    useEffect(()=>{
        fetchData()
    },[fetchData])
  return{data, loading, error, refetch:fetchData}
}

export default useReadContract
