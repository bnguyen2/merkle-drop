# Context

You've decided to tackle one of the Shipyard DAO's highest reward task bounties; implementing the smart contract for its upcoming airdrop of $SHIP, the DAO's ERC20 token. Another DAO member has already written some boilerplate contract and testing code for you to use, but the bulk of the work, the airdrop's claiming functionality, is up to you to design, implement, and test.

Instead of minting and distributing all the tokens in a single transaction (which might not be possible if the number of recipients is large), the DAO wants you to authenticate claimers using ECDSA signatures, for which you can assume there already exists some secure software for distributing these signatures to the correct recipients.

Using ECDSA signatures to valid claims is the DAO's preferred mechanism, because it means the airdrop can be extended to additional recipient addresses (by creating new signatures) without making any changes to the Airdrop.sol contract.

However, signature verification is not enough. The Shipyard DAO believes that ECDSA will be broken within the next 40 years, and so has asked in its bounty that your Aidrop.sol contract allow callers of Airdrop.merkleClaim to verify their inclusion in a Merkle tree. This way, when ECDSA eventually becomes obsolete due to quantum computers, there will be a secure mechanism for addresses to continue to claim their $SHIP token through the airdrop. The Airdrop.sol contract contains a simple function Airdrop.disableECDSAVerification() onlyOwner that the owner of Airdrop.sol will call when she believes ECDSA is not longer secure.

## Specs

Given two partially completed smart contracts, `Airdrop.sol` and `ShipyardToken.sol`, implement the `Airdrop.merkleClaim` and `Airdrop.signatureClaim` functions.

### Dev Notes

- Completed both `signatureClaim` and `merkleClaim` functions.
- Updated tests for `airdrop.specs.ts`
