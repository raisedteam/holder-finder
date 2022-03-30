const { ethers, BigNumber } = require("ethers");
const fs = require('fs')
 
const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax.network/ext/bc/C/rpc"
    // "https://rpc.ankr.com/avalanche"
);
 
const START_BLOCK = 9529897;
const POLL_INTERVAL = 2048;
const PROXY_ADDR = "0x5857019c749147EEE22b1Fe63500F237F3c1B692";
const abi = [
    "event Mint(address indexed beneficiary, uint256 value)",
    "event Burn(address indexed account, uint256 value)",
    "function balanceOf(address account) view returns (uint256)",
    "function totalSupply() view returns (uint256)"
  ];
const proxyContract = new ethers.Contract(PROXY_ADDR, abi, provider);
const mintFilter = proxyContract.filters.Mint();
const burnFilter = proxyContract.filters.Burn();
 
let balances = {};

async function processQuery(block, currentBlock) {
    const mintEvents = await proxyContract.queryFilter(
        mintFilter,
        block,
        block + POLL_INTERVAL > currentBlock
        ? currentBlock
        : block + POLL_INTERVAL
    );
    const burnEvents = await proxyContract.queryFilter(
        burnFilter,
        block,
        block + POLL_INTERVAL > currentBlock
        ? currentBlock
        : block + POLL_INTERVAL
    );
    for (const m of mintEvents) {
        if (!balances.hasOwnProperty(m.args.beneficiary)) {
            balances[m.args.beneficiary] = m.args.value;
        } else {
            balances[m.args.beneficiary] = balances[m.args.beneficiary].add(m.args.value);
        }
    }
    for (const b of burnEvents) {
        if (!balances.hasOwnProperty(b.args.account)) {
            balances[b.args.account] = BigNumber.from("0").sub(b.args.value);
        } else {
            balances[b.args.account] = balances[b.args.account].sub(b.args.value);
        }
    }
    console.log("Block processing: ", block);
}

async function processWithRetries(processFunction, retries, block) {
    let err;
    for (let i = 0; i <= retries; i++) {
        try {
            if (i != 0) console.log("retries: ", i)
            return await processFunction(block);
        } catch (e) {
            err = e;
        }
    }
    throw err;
}

const spaceArray = (start, end, interval) => {
  const r = [];
  const n = Math.floor((end - start) / interval);
  for (let i = 0; i < n; i++) {
    r.push(start + i * interval);
  }
  return r;
};
 
const main = async () => {
  const currentBlock = await provider.getBlockNumber();
  const startBlocks = spaceArray(START_BLOCK, currentBlock, POLL_INTERVAL);

  for(const block of startBlocks) {
    await processWithRetries(processQuery, 500, block);
  }
  const holders = Object.keys(balances).filter((e) => balances[e].gt(BigNumber.from("0")))
  console.log("Number of holders:", holders.length);
  let totalSupply = BigNumber.from("0");
  for(const key of holders) {
    totalSupply = totalSupply.add(balances[key]);
    fs.appendFile('./list_of_holders.txt', key + ": " + balances[key].toString() + "\n", err => {
        if (err) {
          console.error(err)
          return
        }
    })
  }
  console.log("totalSupply      = ", totalSupply.toString())
  console.log("real totalSupply = ", (await proxyContract.totalSupply()).toString())
  return;
};
 
main();
