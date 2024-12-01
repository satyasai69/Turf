# TURF DEX Creator Platform

A decentralized platform built on Agoric that enables anyone to create their own DEX (Decentralized Exchange) with a single click, featuring automatic fee sharing and customizable trading pairs.

## Features
- One-click DEX creation
- Automatic fee sharing
- Customizable trading pairs
- Cross-chain compatibility
- Automated market maker (AMM)
- Liquidity pool management
- Auto-payment system

## Usage

```javascript
// Create a new DEX
const factory = await E(zoe).startInstance(crossChainDexInstallation);
const dex = await E(factory.publicFacet).createDex(myAddress);

// Add liquidity
const poolId = await E(dex).addLiquidity(tokenA, tokenB);

// Perform swap
const { amountOut } = await E(dex).swap(tokenIn, tokenOutBrand);

### Components

1. **Timer Contract**
   - Manages scheduled payments
   - Triggers automated swaps
   - Handles payment intervals

2. **DEX Integration**
   - Cross-chain asset swapping
   - Liquidity pool interactions
   - Price feed integration

3. **ICS-027 Implementation**
   - Interchain account management
   - Cross-chain message passing
   - State synchronization

4. **Payment Handler**
   - Payment execution logic
   - Token balance management
   - Transaction verification
```

## 🚀 Quick Start

1. **Install Dependencies**
```bash
agoric install
```

2. **Start Local Chain**
```bash
agoric start local-chain
```

3. **Deploy Contract**
```bash
agoric deploy contract/deploy.js
```

4. **Start Development Server**
```bash
agoric start local-solo
cd ui && yarn start
```

## 💰 Fee Structure

- Total swap fee: 0.3%
- Creator share: 10% of total fees (0.03%)
- Protocol share: 90% of total fees (0.27%)

## 🔒 Security

- Leverages Agoric's secure-by-design architecture
- ERTP-based asset handling
- Capability-based security
- Emergency pause functionality
- Multi-sig governance

## 🛠 Development

### Prerequisites

- Node.js >= 14
- Agoric SDK
- Agoric Wallet

### Testing

```bash
# Run contract tests
agoric test contract/test

# Run integration tests
agoric test integration
```

### Deployment

```bash
# Deploy to local chain
agoric deploy contract/deploy.js

# Deploy to testnet
agoric deploy --network=agorictest contract/deploy.js
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 🆘 Support

- Discord: N/A
- Twitter: N/A
- Email: N/A

## 🔗 Links

- [Documentation]() soon
- [Agoric Docs](https://docs.agoric.com)
- [Whitepaper]() soon
- [Audit Report]() soon
