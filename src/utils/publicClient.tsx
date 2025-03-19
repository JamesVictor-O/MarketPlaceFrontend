import { createPublicClient, http,createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'

 
export const client = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!)
})
 
export const publicClient = createPublicClient({ 
  chain: sepolia,
  transport: http()
})

