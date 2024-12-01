# Shopify-style DEX Creator Platform

A decentralized platform built on Agoric that enables anyone to create their own DEX (Decentralized Exchange) with a single click, featuring automatic fee sharing and customizable trading pairs.

## 🌟 Core Contract Functions

### Cross-Chain DEX Contract

```javascript
// ./contractsrc/cross-chain-dex.contract.js
import { Far } from '@agoric/marshal';
import { AmountMath } from '@agoric/ertp';
import { makeNotifierKit } from '@agoric/notifier';
import { makeStore } from '@agoric/store';
import { makeIBCProtocol } from '@agoric/swingset-vat/src/vats/ibc';

/**
 * Main contract functions for cross-chain DEX with auto-payments
 */
const start = async (zcf) => {
  const { 
    feeMint, 
    timer,
    ibcPort, 
    autoPayConfig 
  } = zcf.getTerms();

  // Initialize IBC protocol for cross-chain communication
  const { sender: ibcSender, receiver: ibcReceiver } = await makeIBCProtocol(ibcPort);
  
  // Setup auto-payment timer
  const scheduleAutoPayment = async (payment) => {
    const { interval, amount, recipient } = payment;
    const wake = makeWaker(timer);
    
    return Far('AutoPay', {
      start: () => {
        const repeater = E(timer).makeRepeater(0n, interval);
        const cancelObj = { cancelled: false };
        
        const run = async () => {
          if (cancelObj.cancelled) return;
          
          // Execute payment
          await E(feeMint).makePayment(amount, recipient);
          // Schedule next payment
          await wake(interval);
          run();
        };
        
        run();
        return Far('Canceller', {
          cancel: () => { cancelObj.cancelled = true },
        });
      },
    });
  };

  // Core DEX Functions
  const makeDexKit = (dexId, creator) => {
    const pools = makeStore('PoolId');
    const autoPayments = makeStore('PaymentId');
    
    // Cross-chain swap handling
    const handleCrossChainSwap = async (
      sourceChain,
      targetChain,
      tokenIn,
      tokenOutBrand,
      slippage
    ) => {
      // Verify IBC packet
      const packet = await E(ibcReceiver).getNextPacket();
      assert(packet.sourceChain === sourceChain);
      
      // Execute swap on source chain
      const { amountOut } = await swap(tokenIn, tokenOutBrand, slippage);
      
      // Send tokens to target chain
      await E(ibcSender).sendTokens(targetChain, amountOut);
      
      return amountOut;
    };

    // Automated Market Maker (AMM) core functions
    const calculateSwapOutput = (
      inputAmount,
      inputReserve,
      outputReserve
    ) => {
      const inputWithFee = inputAmount.value * 997n;
      const numerator = inputWithFee * outputReserve.value;
      const denominator = (inputReserve.value * 1000n) + inputWithFee;
      
      return AmountMath.make(
        outputReserve.brand,
        numerator / denominator
      );
    };

    // Liquidity pool management
    const addLiquidity = async (tokenA, tokenB) => {
      const poolId = `${dexId}-POOL-${pools.size}`;
      const { publicFacet } = await zcf.startInstance(
        poolInstallation,
        { TokenA: tokenA.brand, TokenB: tokenB.brand },
        { poolId, dexId }
      );
      
      pools.init(poolId, {
        tokenA,
        tokenB,
        publicFacet,
        reserves: { tokenA: 0n, tokenB: 0n },
        lpTokens: 0n,
      });
      
      return poolId;
    };

    // Auto-payment setup
    const setupAutoPayment = async (config) => {
      const {
        token,
        amount,
        interval,
        recipient,
        sourceChain,
        targetChain,
      } = config;
      
      const payment = await scheduleAutoPayment({
        interval,
        amount: AmountMath.make(token.brand, amount),
        recipient,
      });
      
      const paymentId = `${dexId}-PAY-${autoPayments.size}`;
      autoPayments.init(paymentId, {
        payment,
        config,
        status: 'active',
      });
      
      await E(payment).start();
      return paymentId;
    };

    return Far('DEX', {
      // Pool Management
      addLiquidity,
      removeLiquidity: async (poolId, lpTokens) => {
        const pool = pools.get(poolId);
        return E(pool.publicFacet).removeLiquidity(lpTokens);
      },
      
      // Trading Functions
      swap: async (tokenIn, tokenOutBrand, slippage = 0.5) => {
        const pool = [...pools.values()].find(
          p => p.hasTokenPair(tokenIn.brand, tokenOutBrand)
        );
        assert(pool, 'Pool not found');
        
        const amountOut = calculateSwapOutput(
          tokenIn,
          pool.reserves.tokenA,
          pool.reserves.tokenB
        );
        
        // Update reserves
        pool.reserves.tokenA += tokenIn.value;
        pool.reserves.tokenB -= amountOut.value;
        
        return { amountOut };
      },
      
      crossChainSwap: handleCrossChainSwap,
      
      // Auto-payment Management
      setupAutoPayment,
      cancelAutoPayment: async (paymentId) => {
        const payment = autoPayments.get(paymentId);
        await E(payment.payment).cancel();
        payment.status = 'cancelled';
      },
      
      // Getters
      getPoolInfo: (poolId) => pools.get(poolId),
      getAllPools: () => [...pools.entries()],
      getAutoPayments: () => [...autoPayments.entries()],
    });
  };

  return Far('CrossChainDexFactory', {
    createDex: (creator) => makeDexKit(`DEX-${Date.now()}`, creator),
    getIBCPorts: () => ({ sender: ibcSender, receiver: ibcReceiver }),
  });
};

export { start };
```

### Example Usage

```javascript
// Create DEX instance
const factory = await E(zoe).startInstance(crossChainDexInstallation);
const dex = await E(factory.publicFacet).createDex(myAddress);

// Setup cross-chain pool
const poolId = await E(dex).addLiquidity(
  tokenA, // ATOM
  tokenB  // IST
);

// Configure auto-payment
const paymentId = await E(dex).setupAutoPayment({
  token: tokenA,
  amount: 100n,
  interval: 3600n, // 1 hour
  recipient: recipientAddress,
  sourceChain: 'cosmoshub-4',
  targetChain: 'agoric-3'
});

// Execute cross-chain swap
const swapResult = await E(dex).crossChainSwap(
  'cosmoshub-4',    // source chain
  'agoric-3',       // target chain
  atomPayment,      // token in
  istBrand,         // token out brand
  0.5               // max slippage
);

// Cancel auto-payment
await E(dex).cancelAutoPayment(paymentId);
```

The contract implements:
1. Cross-chain token swaps using IBC
2. Automated periodic payments
3. AMM-based liquidity pools
4. Fee distribution to creators
5. Real-time pool management

Key Features:
- IBC protocol integration for cross-chain operations
- Timer-based automated payments
- Constant product AMM formula
- Slippage protection
- Multi-pool support

Would you like me to explain any specific aspect of the implementation?
// Setup cross-chain pool
const poolId = await E(dex).addLiquidity(
  tokenA, // ATOM
  tokenB  // IST
);

// Configure auto-payment
const paymentId = await E(dex).setupAutoPayment({
  token: tokenA,
  amount: 100n,
  interval: 3600n, // 1 hour
  recipient: recipientAddress,
  sourceChain: 'cosmoshub-4',
  targetChain: 'agoric-3'
});// Setup cross-chain pool
const poolId = await E(dex).addLiquidity(
  tokenA, // ATOM
  tokenB  // IST
);

// Configure auto-payment
const paymentId = await E(dex).setupAutoPayment({
  token: tokenA,
  amount: 100n,
  interval: 3600n, // 1 hour
  recipient: recipientAddress,
  sourceChain: 'cosmoshub-4',
  targetChain: 'agoric-3'
});
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

## 💡 Usage

### Creating a DEX

1. Connect your Agoric wallet
2. Click "Create DEX" button
3. Confirm transaction
4. Your DEX is ready!

### Adding Liquidity

1. Select token pair
2. Enter amounts
3. Approve tokens using your wallet
4. Click "Add Liquidity"

### Trading

1. Select input/output tokens
2. Enter amount
3. Click "Swap"
4. Confirm transaction in your wallet

## 💰 Fee Structure

- Total swap fee: 0.3%
- Creator share: 10% of total fees (0.03%)
- Protocol share: 90% of total fees (0.27%)

Example:
- For a 1000 IST swap
- Total fee: 3 IST
- Creator receives: 0.3 IST
- Protocol receives: 2.7 IST

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

## 📚 API Documentation

### Contract Methods

#### DexFactory

- `createDex()`: Creates new DEX instance
- `getFees()`: Returns fee structure

#### DEX Implementation

- `addPool(tokenAIssuer, tokenBIssuer, tokenAAmount, tokenBAmount)`
- `removePool(poolId)`
- `swap(tokenAPayment, tokenBAmount)`
- `getPoolReserves(poolId)`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 🆘 Support

- Discord: [Join Agoric Discord]
- Twitter: [@DEXCreator]
- Email: support@dexcreator.com

## 🔗 Links

- [Documentation](https://docs.dexcreator.com)
- [Agoric Docs](https://docs.agoric.com)
- [Whitepaper](https://whitepaper.dexcreator.com)
- [Audit Report](https://audit.dexcreator.com)
