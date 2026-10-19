import { useCallback, useEffect, useRef, useState } from "react"
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { MESSAGE_CONTRACT } from "../../constant/config"
import messageContractAbi from "../../constant/message_contract_abi.json"
import { Alert, Button, message } from "antd"
import { parseEther } from "viem"
import { sepolia } from "viem/chains"
import dayjs from "dayjs"

type MessageListData = readonly [
  readonly { sender: string; content: string; timestamp: bigint }[],
  bigint,
]

const PAGE_SIZE = 10n

function isMessageListData(data: unknown): data is MessageListData {
  if (!Array.isArray(data) || !Array.isArray(data[0]) || typeof data[1] !== "bigint") {
    return false
  }

  return data[0].every(
    (item: unknown) =>
      typeof item === "object" &&
      item !== null &&
      "sender" in item &&
      typeof item.sender === "string" &&
      "content" in item &&
      typeof item.content === "string" &&
      "timestamp" in item &&
      typeof item.timestamp === "bigint",
  )
}

function Messages() {
  return (
    <div>
      <h1 className="my-2 text-3xl font-bold tracking-tight text-violet-600">消息</h1>
      <MessageList />
    </div>
  )
}

function MessageList() {
  const [offset, setOffset] = useState(0n)
  const [pages, setPages] = useState<Map<bigint, MessageListData[0]>>(
    () => new Map(),
  )
  const [total, setTotal] = useState(0n)
  const {
    data,
    error,
    isPending,
    isFetching,
    refetch,
  } = useReadContract({
    address: MESSAGE_CONTRACT,
    abi: messageContractAbi,
    functionName: "getMessages",
    args: [offset, PAGE_SIZE],
    query: {
      refetchOnMount: "always",
    },
  })

  useEffect(() => {
    if (!isMessageListData(data)) return

    const [page, pageTotal] = data
    setTotal(pageTotal)
    setPages((current) => {
      if (current.get(offset) === page) return current

      const next = new Map(current)
      next.set(offset, page)
      return next
    })
  }, [data, offset])

  const messages = [...pages.entries()]
    .sort(([leftOffset], [rightOffset]) =>
      leftOffset < rightOffset ? -1 : leftOffset > rightOffset ? 1 : 0,
    )
    .flatMap(([, page]) => page)

  const refreshList = useCallback(() => {
    setPages(new Map())
    setTotal(0n)

    if (offset === 0n) {
      void refetch()
    } else {
      setOffset(0n)
    }
  }, [offset, refetch])

  if (data !== undefined && !isMessageListData(data) && messages.length === 0) {
    return (
      <>
        <SubmitMessage onSubmitted={refreshList} />
        <Alert
          className="mt-8"
          type="error"
          showIcon
          title="留言数据格式异常"
        />
      </>
    )
  }

  const hasMore = BigInt(messages.length) < total

  function loadMore() {
    if (error) {
      void refetch()
      return
    }

    setOffset(BigInt(messages.length))
  }

  return (
    <>
      <SubmitMessage onSubmitted={refreshList} />
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">留言列表</h2>
            <p className="mt-1 text-sm text-slate-500">查看社区中的最新留言</p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            共 {total.toString()} 条
          </span>
        </header>

        {isPending && messages.length === 0 ? (
          <div className="space-y-4 p-6" aria-live="polite">
            <p className="text-sm text-slate-500">正在加载留言...</p>
            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : error && messages.length === 0 ? (
          <Alert
            className="m-6"
            type="error"
            showIcon
            message="留言加载失败"
            description={error.message}
            action={<Button onClick={() => void refetch()}>重试</Button>}
          />
        ) : messages.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-violet-50 text-xl text-violet-600">
              ✦
            </div>
            <h3 className="mt-4 font-medium text-slate-900">还没有留言</h3>
            <p className="mt-1 text-sm text-slate-500">提交一条留言，开启对话吧。</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {messages.map((item, index) => {
              const timestamp = Number(item.timestamp) * 1000
              const date = new Date(timestamp)

              return (
                <li
                  key={`${item.sender}-${item.timestamp}-${index}`}
                  className="px-6 py-5 transition-colors hover:bg-slate-50/70"
                >
                  <article className="flex gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold uppercase text-white">
                      {item.sender.slice(2, 4)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p
                          className="truncate text-sm font-medium text-slate-700"
                          title={item.sender}
                        >
                          {item.sender}
                        </p>
                        <time
                          className="text-xs text-slate-400"
                          dateTime={date.toISOString()}
                        >
                          {dayjs(timestamp).format("YYYY-MM-DD HH:mm")}
                        </time>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                        {item.content}
                      </p>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
        {error && messages.length > 0 && (
          <Alert
            className="mx-6 mt-4"
            type="error"
            showIcon
            message="加载更多留言失败"
            description={error.message}
          />
        )}
        {messages.length > 0 && (
          <footer className="border-t border-slate-100 px-6 py-5 text-center">
            {hasMore ? (
              <Button
                loading={isFetching}
                disabled={isFetching}
                onClick={loadMore}
              >
                {error ? "重试" : "加载更多"}
              </Button>
            ) : (
              <p className="text-sm text-slate-400">已经到底了</p>
            )}
          </footer>
        )}
      </section>
    </>
  )
}

function SubmitMessage({
  onSubmitted,
}: {
  onSubmitted: () => void
}) {
  const [text, setText] = useState("")
  const writeContract = useWriteContract()
  const { data: hash, isPending, error } = writeContract
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash, chainId: sepolia.id })
  const handledHash = useRef<`0x${string}` | undefined>(undefined)

  function leaveMessage() {
    writeContract.mutate({
      address: MESSAGE_CONTRACT,
      abi: messageContractAbi,
      functionName: "leaveMessage",
      args: [text],
      value: parseEther("0.001"),
    })
  }

  useEffect(() => {
    if (!isConfirmed || !hash || handledHash.current === hash) return

    handledHash.current = hash
    message.success("提交成功")
    setText("")
    onSubmitted()
  }, [hash, isConfirmed, onSubmitted])

  return (
    <>
      <textarea
        placeholder="请输入留言"
        className="p-5 w-full h-300px bg-white border border-slate-200 rounded-xl"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {error?.message && <Alert type="error" title={error.message} />}
      <Button
        loading={isConfirming || isPending}
        onClick={leaveMessage}
      >
        {isPending ? "请在钱包确认..." : isConfirming ? "确认中..." : "提交"}
      </Button>
    </>
  )
}

export default Messages
