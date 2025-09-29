import crypto from 'crypto'

/**
 * 获取加密/解密容器
 * @param {string} password 密码
 * @param {boolean} isDecipher 是否为解密容器，默认 `false`
 * @param {Buffer} [iv] 解密时使用的IV，必须与加密时使用的IV相同
 * @returns {Object} 返回包含cipher/decipher对象和IV的对象
 */
export function getCipher(password, isDecipher, iv = null) {
  isDecipher ??= false
  iv ??= Buffer.from('Z1BVGG2j3WXLJPkY')

  const key = crypto.scryptSync(password, 'salt', 32) // 32字节密钥用于AES-256
  const cipher = crypto[isDecipher ? 'createDecipheriv' : 'createCipheriv']('aes-256-cbc', key, iv)
  return { cipher, key, iv }
}

/**
 * 加密 Buffer 数据
 * @param {*} cipher 加密容器，通过getCipher创建
 * @param {Buffer} data 要加密的buffer数据
 * @returns {Buffer} 加密后的 Buffer
 */
export function encryptBuffer(cipher, data) {
  return cipher.update(data)
}

/**
 * 解密 Buffer 数据
 * @param {*} cipher 解密容器，通过getCipher创建
 * @param {Buffer} encryptedData 要解密的buffer数据
 * @returns {Buffer} 解密后的 Buffer
 */
export function decryptBuffer(cipher, encryptedData) {
  return cipher.update(encryptedData)
}

/**
 * 结束加密/解密过程并获取最终数据
 * @param {*} cipher 加密/解密容器
 * @returns {Buffer} 最终的加密/解密数据
 */
export function finalizeCrypt(cipher) {
  return cipher.final()
}
