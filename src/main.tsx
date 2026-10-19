import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import {createConfig, http , WagmiProvider} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia } from 'wagmi/chains';

const queryCliet = new QueryClient()
const config = createConfig({
  chains:[ sepolia],
  transports:{
    [sepolia.id]: http('https://sepolia.infura.io/v3/86c692862e2147368831097e507b3920')
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
