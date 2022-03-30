Installation: npm i

Preparation:
  1. Copy .env.sample to the same directory and rename file to .env
  2. Enter valid addresses, keys and parameters
  3. Change TEST config to 'false'
Configuration overview:
  - ALCHEMY_KEY An Alchemy key for the node access.
  - WALLET_PRIVATE_KEY The private key for the "normal" wallet
  - WALLET_ADDRESS The address of the "normal" wallet
  - COMPROMISED_WALLET_ADDRESS The address of the compromised wallet
  - COMPROMISED_WALLET_PRIVATE_KEY The private key for the compromised wallet
  - ETH_TO_SEND_AT_THE_BEGINNING Initial amount of ETH to be send for all operations 
  - ETH_TO_SEND_WITH_CLAIMALL Amount of ETH to be send with claimAll() call (if needed). Function claimAll() is called for claiming STRONG reward
  - ETH_TO_SEND_WITH_PAYALL Amount of ETH to be send with payAll() call (if payAll is called). Function payAll() is called for paying fees
  - GAS_PRICE_ETH Gas price in wei for all operations
  - ONLY_PAYFEE Chooses if script claims the reward(false) or just pays fees(true)
  - SCRIPT_STEP Specifies the initial step for the script (By default it is 1). It is usefull if script is suddenly reverted on some step, so it can be started not from the very beginning. There are four steps:
    - 1 - send ether to compromised wallet
    - 2 - claim rewards or pay fees
    - 3 - send rewards 
    - 4 - return ETH
  - TEST The indicator if it is a test or not (testnet or mainnet)
  - NODE_COUNT The current number of nodes in the STRONG protocol (for payAll() function call)

Run Script:
  npx hardhat run scripts/sweeper.js
