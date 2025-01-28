import CapsuleClient, { Environment } from "@usecapsule/react-sdk";

const capsuleClient = new CapsuleClient(Environment.BETA, process.env.NEXT_PUBLIC_CAPSULE_API_KEY);
capsuleClient.cosmosPrefix = "neutron";
console.log("one capsule client")

export default capsuleClient;
