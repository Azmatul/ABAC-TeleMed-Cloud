// Wallet-derived AES-GCM encryption helpers
// Uses EIP-191 personal_sign to derive a deterministic key via HKDF.
// If a password is provided, we use that instead (for backward compatibility).

import { makeClients } from './contract';

// --- small utils ---
const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromBase64(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}
async function sha256(data) {
  return crypto.subtle.digest('SHA-256', data);
}

// HKDF (RFC 5869) using SHA-256
async function hkdf(ikm, salt, info, length = 32) {
  const key = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

// Derive a 32-byte AES key from a wallet signature (deterministic for (addr, app, salt))
async function deriveKeyFromWallet(address, appId = 'telemed-abac', saltB64=null) {
  const { walletClient } = makeClients();
  if (!walletClient) throw new Error('Wallet not connected');

  // Get a fixed, app-scoped message so the signature is deterministic but domain-separated
  const salt = saltB64 ? fromBase64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const msg =
    `Telemedicine Data Encryption Key\n` +
    `Address: ${address}\n` +
    `App: ${appId}\n` +
    `Salt: ${toBase64(salt)}\n` +
    `v1`;

  // personal_sign wants hex data typically; viem handles string -> bytes automatically with signMessage
  const sig = await walletClient.signMessage({ account: address, message: msg });

  // Convert signature hex -> bytes
  const sigBytes = Uint8Array.from(sig.slice(2).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  // IKMs straight from signature are OK, but HKDF with an explicit info string keeps things tidy
  const info = enc.encode('aes-gcm:content-key:v1');
  const keyMaterial = await hkdf(sigBytes, salt, info, 32);

  // Import as AES-GCM key
  const cryptoKey = await crypto.subtle.importKey('raw', keyMaterial, 'AES-GCM', false, ['encrypt','decrypt']);
  return { cryptoKey, saltB64: toBase64(salt) };
}

// Derive from password (PBKDF2) – kept for compatibility
async function deriveKeyFromPassword(password, saltB64=null, rounds=150000) {
  const salt = saltB64 ? fromBase64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const cryptoKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: rounds, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
  return { cryptoKey, saltB64: toBase64(salt) };
}

// ---- Public API you already use ----
export async function encryptFile(file, passwordOrNull) {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Decide which derivation to use
  let cryptoKey, saltB64, keyOrigin;
  if (passwordOrNull && passwordOrNull.length > 0) {
    ({ cryptoKey, saltB64 } = await deriveKeyFromPassword(passwordOrNull, null));
    keyOrigin = 'pwd';
  } else {
    // Wallet-derived: get current address and derive
    const { walletClient } = makeClients();
    const [addr] = await walletClient.getAddresses();
    if (!addr) throw new Error('No wallet address for key derivation');
    ({ cryptoKey, saltB64 } = await deriveKeyFromWallet(addr));
    keyOrigin = 'wallet';
  }

  const plain = new Uint8Array(await file.arrayBuffer());
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plain);

  // For sharing, we keep ONLY the key origin and salt; we DO NOT store the raw key.
  // For password mode, user can re-enter password. For wallet mode, we re-sign.
  const idBytes = await sha256(new Uint8Array(cipher));
  const id = Array.from(new Uint8Array(idBytes)).slice(0, 16).map(b => b.toString(16).padStart(2,'0')).join('');

  return {
    id,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    ivB64: toBase64(iv),
    saltB64,
    cipherB64: toBase64(cipher),
    keyOrigin,       // 'wallet' | 'pwd'
    // DEPRECATED: keyB64 was previously stored. We no longer include a raw key here.
    keyB64: undefined
  };
}

export async function decryptToBlob(rec, passwordMaybeNull) {
  const iv = fromBase64(rec.ivB64);
  const cipher = fromBase64(rec.cipherB64);

  let cryptoKey;
  if (rec.keyOrigin === 'pwd') {
    if (!passwordMaybeNull) throw new Error('Password required for this record');
    ({ cryptoKey } = await deriveKeyFromPassword(passwordMaybeNull, rec.saltB64));
  } else if (rec.keyOrigin === 'wallet') {
    // Wallet-derived: re-derive via signing the same structured message (salt embedded in rec.saltB64)
    const { walletClient } = makeClients();
    const [addr] = await walletClient.getAddresses();
    if (!addr) throw new Error('Connect the same wallet used to encrypt');
    ({ cryptoKey } = await deriveKeyFromWallet(addr, 'telemed-abac', rec.saltB64));
  } else {
    // Backward compatibility: fall back to legacy stored keyB64 if present
    if (rec.keyB64) {
      cryptoKey = await crypto.subtle.importKey('raw', fromBase64(rec.keyB64), 'AES-GCM', false, ['decrypt']);
    } else {
      throw new Error('Unknown key origin and no legacy key present');
    }
  }

  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, cipher);
  return new Blob([plain], { type: rec.type || 'application/octet-stream' });
}
