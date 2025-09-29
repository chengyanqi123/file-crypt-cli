import fs from 'fs'
import { getCipher, encryptBuffer, decryptBuffer, finalizeCrypt } from './crypto-buffer.js'

/**
 * 加密文件
 * @param {string} inputPath  输入文件路径
 * @param {string} outputPath  输出文件路径
 * @param {string} password  密码
 * @param {function} onchange  进度回调函数
 * @returns {Promise} 加密 Promise
 */
export function encryptFile(inputPath, outputPath, password, onchange) {
  const { cipher } = getCipher(password, false)
  return streamHandler(inputPath, outputPath, {
    onchange: (writeStream, { chunk, progress, readSize, totalSize }) => {
      const crypted = encryptBuffer(cipher, chunk)
      writeStream.write(crypted)
      onchange?.({ progress, readSize, totalSize })
    },
    onend: (writeStream) => {
      // 调用finalizeCrypt获取最后一块加密数据
      const finalChunk = finalizeCrypt(cipher)
      if (finalChunk && finalChunk.length > 0) {
        writeStream.write(finalChunk)
      }
      writeStream.end()
    },
  })
}

/**
 * 解密文件
 * @param {string} inputPath  输入文件路径
 * @param {string} outputPath  输出文件路径
 * @param {string} password  密码
 * @param {function} onchange  进度回调函数
 * @returns {Promise} 解密 Promise
 */
export function decryptFile(inputPath, outputPath, password, onchange) {
  const { cipher } = getCipher(password, true)
  return streamHandler(inputPath, outputPath, {
    onchange: (writeStream, { chunk, progress, readSize, totalSize }) => {
      const decrypted = decryptBuffer(cipher, chunk)
      writeStream.write(decrypted)
      onchange?.({ progress, readSize, totalSize })
    },
    onend: (writeStream) => {
      // 调用finalizeCrypt获取最后一块解密数据
      const finalChunk = finalizeCrypt(cipher)
      if (finalChunk && finalChunk.length > 0) {
        writeStream.write(finalChunk)
      }
      writeStream.end()
    },
  })
}

/**
 * 流处理函数
 * @param {string} inputPath  输入文件路径
 * @param {string} outputPath  输出文件路径
 * @param {object} events  事件回调函数
 * @param {function} events.onchange  进度回调函数
 * @param {function} events.onend  结束回调函数
 * @returns {Promise} 流处理 Promise
 */
function streamHandler(inputPath, outputPath, events = {}) {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(inputPath)
    const totalSize = stats.size
    let readSize = 0
    const readStream = fs.createReadStream(inputPath)
    const writeStream = fs.createWriteStream(outputPath)
    // error
    readStream.on('error', (err) => reject(err))
    writeStream.on('error', (err) => reject(err))
    // read data chunk
    readStream.on('data', (chunk) => {
      readSize += chunk.length
      const progress = ((readSize / totalSize) * 100).toFixed(2)
      events.onchange?.(writeStream, { chunk, progress, readSize, totalSize })
    })
    readStream.on('end', () => {
      events.onend?.(writeStream)
    })
    writeStream.on('finish', () => resolve())
  })
}
