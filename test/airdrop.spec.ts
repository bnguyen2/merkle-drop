import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { Airdrop, ShipyardToken } from "../typechain";

const { parseEther, solidityKeccak256 } = ethers.utils;

let account1: SignerWithAddress;
let account2: SignerWithAddress;
let rest: SignerWithAddress[];

let shipToken: ShipyardToken;
let airdrop: Airdrop;
let merkleRoot: string;
let merkleTree: MerkleTree;

function hashAddressAndAmount(to: string, amount: BigNumber) {
  return Buffer.from(solidityKeccak256(["address", "uint256"], [to, amount]).slice(2), "hex");
}

describe("Airdrop", function () {
  before(async () => {
    [account1, account2, ...rest] = await ethers.getSigners();

    shipToken = (await (
      await ethers.getContractFactory("ShipyardToken")
    ).deploy("Shipyard Token", "$SHIP")) as ShipyardToken;
    await shipToken.deployed();

    const whitelistedAddrs = [
      { _to: account1.address, _amount: parseEther("1") },
      { _to: account2.address, _amount: parseEther("5") },
    ];

    const leaves = whitelistedAddrs.map((addr) => hashAddressAndAmount(addr._to, addr._amount));

    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getHexRoot();
  });

  beforeEach(async () => {
    airdrop = await (
      await ethers.getContractFactory("Airdrop")
    ).deploy(merkleRoot, account1.address, shipToken.address);

    shipToken.transfer(airdrop.address, parseEther("100000")); // send some tokens to airdrop contract

    await airdrop.deployed();
  });

  describe("setup and disabling ECDSA", () => {
    it("should deploy correctly", async () => {
      // if the beforeEach succeeded, then this succeeds
    });

    it("should disable ECDSA verification", async () => {
      // first try with non-owner user
      await expect(airdrop.connect(account2).disableECDSAVerification()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      // now try with owner
      await expect(airdrop.disableECDSAVerification()).to.emit(airdrop, "ECDSADisabled").withArgs(account1.address);
    });
  });

  describe("Merkle claiming", () => {
    it("allows users to claim $ship token through a merkle claim", async () => {
      const hashedAddr = hashAddressAndAmount(account2.address, parseEther("5"));
      const proof = merkleTree.getHexProof(hashedAddr);

      await expect(airdrop.connect(account2).merkleClaim(proof, account2.address, parseEther("5"))).to.emit(
        airdrop,
        "MerkleClaim"
      );
    });

    it("should only allow users to claim once", async () => {
      const hashedAddr = hashAddressAndAmount(account1.address, parseEther("1"));
      const proof = merkleTree.getHexProof(hashedAddr);

      await expect(airdrop.connect(account1).merkleClaim(proof, account1.address, parseEther("1"))).to.emit(
        airdrop,
        "MerkleClaim"
      );

      await expect(airdrop.connect(account1).merkleClaim(proof, account1.address, parseEther("1"))).to.be.revertedWith(
        "already claimed"
      );
    });
  });

  describe("Signature claiming", () => {
    it("allows users to claim $ship tokens by signature and only allows users to claim once", async () => {
      const domain = {
        name: "Airdrop",
        version: "v1",
        chainId: 1337, // hardhat
        verifyingContract: airdrop.address,
      };
      const types = {
        Claim: [
          { name: "claimer", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      };
      const value = {
        claimer: account2.address,
        amount: parseEther("1"),
      };

      const signature = await account2._signTypedData(domain, types, value);

      // happy path
      expect(await airdrop.connect(account2).signatureClaim(signature, account2.address, parseEther("1"))).to.emit(
        airdrop,
        "SignatureClaim"
      );

      // reverts if user tries to claim again
      await expect(
        airdrop.connect(account2).signatureClaim(signature, account2.address, parseEther("1"))
      ).to.be.revertedWith("already claimed");
    });
  });
});
