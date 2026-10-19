function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-violet-600">工作台 / 概览</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">欢迎回来</h1>
        <p className="mt-2 text-slate-500">这里是你的 Message NFT 项目概览。</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="数据概览">
        <StatCard label="收到的消息" value="128" note="较上周增加 12%" />
        <StatCard label="已收藏" value="24" note="最近收藏于今天" />
        <StatCard label="账户状态" value="正常" note="钱包已连接" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">快速开始</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          使用左侧导航切换页面。此示例展示了 React Router 的嵌套路由和共享布局。
        </p>
      </section>
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </article>
  )
}

export default Overview
