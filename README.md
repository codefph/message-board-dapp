# Message Board DApp

基于 React、TypeScript 和 Vite 的链上留言板前端，连接 Sepolia 测试网的留言与 ERC-721 纪念徽章合约。

## 功能

- 连接浏览器钱包并查看 Sepolia 钱包余额。
- 发布留言并分页浏览链上留言。每条留言需支付至少 `0.001 ETH`，内容长度为 1–200 字节。
- 查看当前钱包的纪念徽章及剩余可铸造数量；每累计 3 条留言可铸造一枚徽章。
- 提供设置页面入口。

## 环境要求

- Node.js
- npm

## 本地开发

```bash
npm install
npm run dev
```

Vite 启动后，在终端显示的本地地址打开应用。

## 检查与构建

```bash
npm run lint
npm run build
npm run preview
```

## 网络与合约

应用目前连接 Sepolia 测试网。请在钱包中切换到 Sepolia，并为链上交易准备测试 ETH。

| 合约 | 地址 |
| --- | --- |
| `MessageStorage` | `0x6B14dF3b13c866cE280c96dE98e2dDE9b9eCd420` |
| `CommemorativeBadge` | `0x8bFd9d2cE850fd116b58769E6c69764B7073c8d3` |

合约地址配置位于 `src/constant/config.ts`，调用接口所用 ABI 位于同目录下的 JSON 文件中。若部署了新合约，请同步更新地址与对应 ABI。

配套 Solidity 合约及部署说明见 [message-board-contract](https://github.com/codefph/message-board-contract/blob/main/README.md)。
