import { formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useConnectors, useConnection, useConnect, useBalance } from 'wagmi'
function Wallet() {

  const { isConnected } = useConnection();
  const connect = useConnect();
  function Connectors() {
    const connectors = useConnectors();
    return (
      <div className='text-center flex flex-col justify-center h-full'>
        <p className='mb-[30px] text-[24px]'>请选择一个钱包进行连接</p>
        <div className='mx-auto w-[300px] flex flex-col gap-5 text-white'>
          {
            connectors.map((connector) => (
              <div
                className='flex justify-between items-center h-[50px] bg-blue-500 px-5 rounded-xl'
                key={connector.uid}>
                <img src={connector.icon} className='w-[30px] h-[30px]' />
                <span>{connector.name}</span>
                <button
                  className='transition rounded-xl p-2  hover:bg-gray-100 hover:text-black cursor-pointer'
                  onClick={() => connect.mutate({ connector })}
                  disabled={connect.isPending}
                >
                  连接
                  {/* { connect.isPending ? '连接...': '连接'} */}
                </button>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  function Dashboard() {
    const { address } = useConnection()
    const { data: balance } = useBalance({ address, chainId: sepolia.id })
    return (
      <div>
        {/* <p className='text-[18px] mb-[20px]'>已连接至:{address}</p> */}
        <div className='grid grid-cols-3 gap-5'>
          {/* 余额 */}
          <div className='flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'>
            <span>余额</span>
            <span>
              {balance ?
                <>
                  <span>{Number(formatUnits(balance.value, balance?.decimals)).toFixed(3)}</span>
                  <span>{balance?.symbol}</span>
                </>
                : 0}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isConnected ? <Connectors></Connectors> : <Dashboard></Dashboard>}
    </>
  )
}
export default Wallet