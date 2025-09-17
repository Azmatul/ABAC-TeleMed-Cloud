import abi from './abi.json';
import addr from './contract-address.json';
import { createPublicClient, createWalletClient, http, custom, getContract, defineChain } from 'viem';
import { sepolia } from 'viem/chains';

export const CHAIN_NAME = (import.meta.env.VITE_CHAIN || 'localhost').toLowerCase();
const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || (addr && addr.address) || '').trim();

const hasWindow = typeof window !== 'undefined';
const hasMM = hasWindow && !!window.ethereum;

const sepoliaRpc = import.meta.env.VITE_SEPOLIA_RPC_URL || '';
const localRpc   = import.meta.env.VITE_LOCAL_RPC_URL || 'http://127.0.0.1:8545';
const localId    = Number(import.meta.env.VITE_CHAIN_ID || 31337); // Hardhat default

// Define localhost chain using your env (so it matches 31337)
const localhost = defineChain({
  id: localId,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [localRpc] }, public: { http: [localRpc] } },
});

export const CHAIN =
  CHAIN_NAME === 'sepolia' ? sepolia : localhost;

export const TRANSPORT =
  CHAIN_NAME === 'sepolia'
    ? (sepoliaRpc ? http(sepoliaRpc) : (hasMM ? custom(window.ethereum) : http('https://rpc.sepolia.org')))
    : http(localRpc);

export function makeClients() {
  const publicClient = createPublicClient({ chain: CHAIN, transport: TRANSPORT });
  const walletClient = hasMM
    ? createWalletClient({ chain: CHAIN, transport: custom(window.ethereum) })
    : null;
  return { publicClient, walletClient };
}

// ✅ Ensure wallet is on the same chain (auto switch/add)
export async function ensureCorrectChain(walletClient) {
  if (!walletClient || !hasMM) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + CHAIN.id.toString(16) }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      // Chain not added → add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x' + CHAIN.id.toString(16),
          chainName: CHAIN.name,
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: [localRpc],
          blockExplorerUrls: [],
        }],
      });
    } else {
      throw err;
    }
  }
}

export function getAbacContract(address, walletClient, publicClient) {
  const resolved = address || CONTRACT_ADDRESS;
  if (!resolved) throw new Error('Missing contract address (VITE_CONTRACT_ADDRESS or contract-address.json)');
  return getContract({
    address: resolved,
    abi,
    client: { public: publicClient, wallet: walletClient || undefined },
  });
}

export async function getRoleIds(contract) {
  const [adminId, patientId, doctorId] = await Promise.all([
    contract.read.DEFAULT_ADMIN_ROLE(),
    contract.read.PATIENT_ROLE(),
    contract.read.DOCTOR_ROLE(),
  ]);
  return { ADMIN: adminId, PATIENT: patientId, DOCTOR: doctorId };
}

export async function getRoleName(contract, account) {
  const ids = await getRoleIds(contract);
  const [isAdmin, isDoctor, isPatient] = await Promise.all([
    contract.read.hasRole([ids.ADMIN,  account]),
    contract.read.hasRole([ids.DOCTOR, account]),
    contract.read.hasRole([ids.PATIENT,account]),
  ]);
  if (isAdmin)  return 'ADMIN';
  if (isDoctor) return 'DOCTOR';
  if (isPatient)return 'PATIENT';
  return 'NONE';
}

export async function grantRoleByName(contract, roleName, to, options = {}) {
  const ids = await getRoleIds(contract);
  const roleId = ids[roleName];
  if (!roleId) throw new Error(`Unknown role: ${roleName}`);
  return contract.write.grantRole([roleId, to], options); // viem write supports { account }
}
