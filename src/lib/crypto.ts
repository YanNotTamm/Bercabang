/**
 * Web Crypto utilities for encrypting/decrypting API key client-side.
 * Uses AES-GCM 256-bit with PBKDF2 key derivation (100,000 iterations).
 * The raw API key is NEVER stored unencrypted in localStorage or IndexedDB.
 */

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a string (e.g. API key) using user's passphrase.
 * Returns a serialized bundle: salt (16 bytes) + iv (12 bytes) + ciphertext as base64.
 */
export async function encryptSecret(plainText: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await deriveKey(passphrase, salt)
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  )

  const combined = new Uint8Array(salt.length + iv.length + ciphertextBuffer.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(ciphertextBuffer), salt.length + iv.length)

  return bufferToBase64(combined.buffer)
}

/**
 * Decrypts a previously encrypted secret bundle with the user's passphrase.
 * Throws an Error if the passphrase is incorrect or data is corrupted.
 */
export async function decryptSecret(encryptedBundle: string, passphrase: string): Promise<string> {
  const combinedBuffer = base64ToBuffer(encryptedBundle)
  const combined = new Uint8Array(combinedBuffer)

  if (combined.length < 28) {
    throw new Error('Data enkripsi tidak valid.')
  }

  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const ciphertext = combined.slice(28)

  const key = await deriveKey(passphrase, salt)
  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    const dec = new TextDecoder()
    return dec.decode(decryptedBuffer)
  } catch {
    throw new Error('Sandi salah atau data terenkripsi rusak.')
  }
}
