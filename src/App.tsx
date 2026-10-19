import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout'
import Messages from './components/messages'
// import Overview from './components/overview'
import Settings from './components/settings'
import Wallet from './components/wallet'
import NFT from './components/nft'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Wallet />} />
        {/* <Route index element={<Overview />} /> */}
        <Route path="messages" element={<Messages />} />
        <Route path="nft" element={<NFT />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
