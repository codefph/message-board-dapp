import { useEffect } from "react"
import { Alert, Button, Card, Empty, message, Spin } from "antd"
import {
  useConnection,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { sepolia } from "viem/chains"
import { NFT_CONTRACT } from "../../constant/config"
import nftContractAbi from "../../constant/nft_contract_abi.json"

type UserBadges = readonly [readonly bigint[], readonly string[]]

function decodeDataUri(uri: string): string | undefined {
  const separatorIndex = uri.indexOf(",")
  if (!uri.startsWith("data:") || separatorIndex === -1) return undefined

  const metadata = uri.slice(0, separatorIndex)
  const payload = uri.slice(separatorIndex + 1)

  try {
    if (metadata.toLowerCase().includes(";base64")) {
      const bytes = Uint8Array.from(atob(payload), (character) =>
        character.charCodeAt(0),
      )
      return new TextDecoder().decode(bytes)
    }

    return decodeURIComponent(payload)
  } catch {
    return undefined
  }
}

function getNftImageSource(uri: string): string | undefined {
  if (uri.startsWith("data:image/")) return uri

  if (uri.startsWith("data:application/json")) {
    const metadata = decodeDataUri(uri)
    if (!metadata) return undefined

    try {
      const parsed: unknown = JSON.parse(metadata)
      if (typeof parsed !== "object" || parsed === null) return undefined

      const image =
        "image" in parsed && typeof parsed.image === "string"
          ? parsed.image
          : "image_data" in parsed && typeof parsed.image_data === "string"
            ? parsed.image_data
            : undefined

      if (!image) return undefined
      if (image.startsWith("data:image/")) return image
      if (image.trimStart().startsWith("<svg")) {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(image)}`
      }

      const decodedImage = decodeDataUri(`data:image/svg+xml;base64,${image}`)
      if (decodedImage?.trimStart().startsWith("<svg")) {
        return `data:image/svg+xml;base64,${image}`
      }
    } catch {
      return undefined
    }

    return undefined
  }

  return uri
}

function isUserBadges(data: unknown): data is UserBadges {
  return (
    Array.isArray(data) &&
    Array.isArray(data[0]) &&
    data[0].every((tokenId: unknown) => typeof tokenId === "bigint") &&
    Array.isArray(data[1]) &&
    data[1].every((uri: unknown) => typeof uri === "string") &&
    data[0].length === data[1].length
  )
}

function NFT() {
  const { address, isConnected } = useConnection()
  const {
    data: badgesData,
    error: badgesError,
    isPending: badgesPending,
    refetch: refetchBadges,
  } = useReadContract({
    address: NFT_CONTRACT,
    abi: nftContractAbi,
    functionName: "getUserBadges",
    args: [address!],
    chainId: sepolia.id,
    query: { enabled: Boolean(address) },
  })
  const {
    data: remaining,
    error: remainingError,
    refetch: refetchRemaining,
  } = useReadContract({
    address: NFT_CONTRACT,
    abi: nftContractAbi,
    functionName: "getRemainingMintable",
    args: [address!],
    chainId: sepolia.id,
    query: { enabled: Boolean(address) },
  })

  const writeContract = useWriteContract()
  const { data: hash, error: writeError, isPending: isWriting } = writeContract
  const {
    error: receiptError,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash, chainId: sepolia.id })

  useEffect(() => {
    if (!isConfirmed) return

    message.success("NFT 铸造成功")
    void refetchBadges()
    void refetchRemaining()
  }, [isConfirmed, refetchBadges, refetchRemaining])

  function mint() {
    writeContract.mutate({
      address: NFT_CONTRACT,
      abi: nftContractAbi,
      functionName: "mint",
      args: [],
      chainId: sepolia.id,
    })
  }

  const badges = isUserBadges(badgesData)
    ? badgesData[0].map((tokenId, index) => ({
        tokenId,
        uri: badgesData[1][index],
      }))
    : []
  const readError = badgesError ?? remainingError
  const transactionError = writeError ?? receiptError
  const canMint = typeof remaining === "bigint" && remaining > 0n

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-violet-600">工作台 / NFT</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          NFT 徽章
        </h1>
        <p className="mt-2 text-slate-500">
          铸造并查看与你的钱包关联的徽章。
        </p>
      </div>

      {!isConnected ? (
        <Alert type="info" showIcon message="请先连接钱包，再查看或铸造 NFT。" />
      ) : (
        <>
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">铸造徽章</h2>
              <p className="mt-1 text-sm text-slate-500">
                {typeof remaining === "bigint"
                  ? `还可铸造 ${remaining.toString()} 枚`
                  : "正在查询可铸造数量..."}
              </p>
            </div>
            <Button
              type="primary"
              loading={isWriting || isConfirming}
              disabled={!canMint || isWriting || isConfirming}
              onClick={mint}
            >
              {isWriting ? "请在钱包确认..." : isConfirming ? "交易确认中..." : "铸造 NFT"}
            </Button>
          </section>

          {transactionError && (
            <Alert
              type="error"
              showIcon
              message="NFT 铸造失败"
              description={transactionError.message}
            />
          )}

          {readError && (
            <Alert
              type="error"
              showIcon
              message="读取 NFT 信息失败"
              description={readError.message}
            />
          )}

          {badgesData !== undefined && !isUserBadges(badgesData) && (
            <Alert type="error" showIcon message="NFT 列表数据格式异常" />
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">我的徽章</h2>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                {badges.length} 枚
              </span>
            </div>

            {badgesPending ? (
              <div className="flex justify-center py-12">
                <Spin tip="正在加载徽章..." />
              </div>
            ) : badges.length === 0 ? (
              <Empty description="还没有 NFT 徽章" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map(({ tokenId, uri }) => {
                  const imageSource = getNftImageSource(uri)

                  return (
                    <Card
                      key={tokenId.toString()}
                      hoverable
                      cover={
                        imageSource ? (
                          <img
                            alt={`NFT #${tokenId.toString()}`}
                            src={imageSource}
                            className="aspect-square object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center bg-slate-50 text-sm text-slate-500">
                            无法解析 NFT 图片
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={`NFT #${tokenId.toString()}`}
                        description={
                          <a
                            className="block truncate"
                            href={uri}
                            target="_blank"
                            rel="noreferrer"
                            title={uri}
                          >
                            查看 NFT 元数据
                          </a>
                        }
                      />
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default NFT
