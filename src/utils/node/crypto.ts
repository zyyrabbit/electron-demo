import {
  Cipher,
  Decipher,
  createCipheriv, 
  createCipher, 
  createDecipher, 
  createDecipheriv,
  createHash,
  HexBase64BinaryEncoding
} from 'crypto'
import fs from 'fs-extra'

function cipherCode (cipher: Cipher | Decipher, data: Buffer,) {
  const cipherChunks: Buffer[] = []
  cipher.setAutoPadding(true)
  cipherChunks.push(cipher.update(data))
  cipherChunks.push(cipher.final())
  return Buffer.concat(cipherChunks)
}

export function encode (algorithm: string, data: Buffer, key: string, iv: string) {
  const cipher = iv ? createCipheriv(algorithm, key, iv) : createCipher(algorithm, key)
  return cipherCode(cipher, data)
}

export function decode (algorithm: string, data: Buffer, key: string, iv: string) {
  const cipher = iv ? createDecipheriv(algorithm, key, iv) : createDecipher(algorithm, key)
  return cipherCode(cipher, data)
}

export function md5 (data: Buffer | string, type: HexBase64BinaryEncoding = 'hex') {
  return createHash('md5').update(data).digest(type as any)
}

export function sha256 (data: Buffer | string, type: HexBase64BinaryEncoding = 'hex') {
  return createHash('sha256').update(data).digest(type as any)
}

function hashFile(file: string, algorithm: string, type: HexBase64BinaryEncoding = 'hex') {
  return new Promise((resolve, reject):void => {
    let hash = createHash(algorithm)
    let stream = fs.createReadStream(file)
  
    stream.on('readable', () => {
      const data = stream.read()
      if (data) {
        hash.update(data)
      } else {
        resolve(hash.digest(type as any))
      }
    });
    stream.on('error', (e): void => {
      reject(e);
    }); 
  });
}

export async function md5File (file: string) {
  return hashFile(file, 'md5')
}

export async function sha256File (file: string) {
  return hashFile(file, 'sha256')
}

export async function sha512File (file: string) {
  return hashFile(file, 'sha512')
}

