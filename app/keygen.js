import Elliptic from "elliptic";

const ec = new Elliptic.ec("secp256k1"); //This is also the basis of bitcoin wallets...

const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);

