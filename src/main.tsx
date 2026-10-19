import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import {createConfig, http , WagmiProvider} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia } from 'wagmi/chains';

const infuraProjectId = import.meta.env.VITE_INFURA_PROJECT_ID?.trim()
if (!infuraProjectId) {
  throw new Error('Missing VITE_INFURA_PROJECT_ID. Set it in your local .env file.')
}

const queryCliet = new QueryClient()
const config = createConfig({
  chains:[ sepolia],
  transports:{
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${infuraProjectId}`)
  }
})
createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryCliet}>
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    </QueryClientProvider>
  </WagmiProvider>
  ,
)
