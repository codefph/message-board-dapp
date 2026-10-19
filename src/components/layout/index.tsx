import { NavLink, Outlet } from 'react-router-dom'
import { useConnection } from 'wagmi';

function LayoutIndex() {

  function Connection(){
    const { connector,isConnected} = useConnection()
    return (
       <div className="hidden border-t border-slate-100 p-5 md:absolute md:bottom-0 md:block md:w-64">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="grid size-9 place-items-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {isConnected ? <img src={connector?.icon}/> : '--'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{connector?.name}</p>
              <p className="truncate text-xs text-slate-500">
                {isConnected?'已连接':'未连接'}
              </p>
            </div>
            {
              isConnected ?
              <span aria-label="在线" className="ml-auto size-2 rounded-full bg-emerald-500" />
              :
              <span aria-label="离线" className="ml-auto size-2 rounded-full bg-gray-300" />
            }
          </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="grid size-10 place-items-center rounded-xl bg-violet-600 text-lg font-bold text-white">
            M
          </div>
          <div>
            <p className="font-semibold text-slate-900">Message NFT</p>
            <p className="text-xs text-slate-500">管理工作台</p>
          </div>
        </div>

        <nav aria-label="主导航" className="flex gap-2 overflow-x-auto px-4 pb-4 md:block md:space-y-1 md:px-3">
          <NavItem to="/" label="钱包" icon="⌂" end />
          <NavItem to="/messages" label="留言" icon="✉" />
          <NavItem to="/nft" label="NFT" icon="✉" />
          <NavItem to="/settings" label="设置" icon="⚙" />
        </nav>

       <Connection></Connection>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 md:px-10 md:py-10">
        <div className="mx-auto w-full max-w-5xl h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItem({ to, label, icon, end = false }: { to: string; label: string; icon: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:w-full ${
          isActive
            ? 'bg-violet-50 text-violet-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <span aria-hidden="true" className="grid size-5 place-items-center text-base">{icon}</span>
      {label}
    </NavLink>
  )
}

export default LayoutIndex
