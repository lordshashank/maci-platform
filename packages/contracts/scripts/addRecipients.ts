import "dotenv/config";
import { ethers } from "hardhat";
import simpleRegistryArtifact from "../artifacts/contracts/registry/SimpleRegistry.sol/SimpleRegistry.json";
import registryManagerArtifact from "../artifacts/contracts/registryManager/RegistryManager.sol/RegistryManager.json";

async function main() {
  const [deployer, s1, s2, s3] = await ethers.getSigners();

  const registryAddress = process.env.REGISTRY_ADDRESS || "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  const registryManagerAddress = process.env.REGISTRY_MANAGER_ADDRESS || "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";

  if (!registryAddress) throw new Error("Missing REGISTRY_ADDRESS env var");
  if (!registryManagerAddress) throw new Error("Missing REGISTRY_MANAGER_ADDRESS env var");

  const registry = new ethers.Contract(registryAddress, (simpleRegistryArtifact as any).abi, deployer);
  const registryManager = new ethers.Contract(
    registryManagerAddress,
    (registryManagerArtifact as any).abi,
    deployer,
  );

  // Validate ownership requirement for isValidRequest
  const owner = await registry.owner();
  if (owner.toLowerCase() !== registryManagerAddress.toLowerCase()) {
    throw new Error(`Registry owner ${owner} is not RegistryManager ${registryManagerAddress}`);
  }

  const before = await registry.recipientCount();
  console.log("recipientCount before:", before.toString());
  // make 15 recipients
  const recipients: { id: string; metadataUrl: string; recipient: string }[] = [
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-1")),
      metadataUrl: "ipfs://example1",
      recipient: s1?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-2")),
      metadataUrl: "ipfs://example2",
      recipient: s2?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-3")),
      metadataUrl: "ipfs://example3",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-4")),
      metadataUrl: "ipfs://example4",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-5")),
      metadataUrl: "ipfs://example5",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-6")),
      metadataUrl: "ipfs://example6",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-7")),
      metadataUrl: "ipfs://example7",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-8")),
      metadataUrl: "ipfs://example8",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-9")),
      metadataUrl: "ipfs://example9",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-10")),
      metadataUrl: "ipfs://example10",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-11")),
      metadataUrl: "ipfs://example11",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-12")),
      metadataUrl: "ipfs://example12",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-13")),
      metadataUrl: "ipfs://example13",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-14")),
      metadataUrl: "ipfs://example14",
      recipient: s3?.address ?? deployer.address,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("recipient-15")),
      metadataUrl: "ipfs://example15",
      recipient: s3?.address ?? deployer.address,
    },
  ];
  for (let i = 0; i < 15; i++) {
    const request = {
      index: 0n, // ignored for Add
      registry: registryAddress,
      requestType: 0, // Add
      status: 0, // Pending
      recipient: recipients[i],
    };

    const prevReqCount: bigint = await registryManager.requestCount();
    const tx1 = await registryManager.process(request);
    await tx1.wait(1);

    const requestIndex = prevReqCount; // index of the just-created request
    const tx2 = await registryManager.approve(requestIndex);
    await tx2.wait(1);

    console.log("Processed and approved recipient", i, "requestIndex:", requestIndex.toString());
  }
  console.log("Added recipients via RegistryManager");

  const after = await registry.recipientCount();
  console.log("recipientCount after:", after.toString());
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
