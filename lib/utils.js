import Progress from 'progress'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * 导出 _root 和 __dirname
 */
export const _root = path.resolve(fileURLToPath(import.meta.url), '../')
export const __dirname = path.dirname(_root)

/**
 * 创建进度条
 * @param {string} title  进度条标题
 * @returns {Progress} 进度条实例
 */
export function createProgressBar(title) {
  return new Progress(title + ' [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: 100,
  })
}

/**
 * 格式化字节数
 * @param {number} bytes  字节数
 * @param {number} decimals  小数位数
 * @returns {string} 格式化后的字节数
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 是否是文件夹
 * @param {string} path  路径
 * @returns {boolean} 是否是文件夹
 */
export function isDirectory(path) {
  return fs.statSync(path).isDirectory()
}

/**
 * 获取指定路径下的所有文件
 * @param {string} directoryPath  目录路径
 * @param {RegExp} pattern  匹配模式
 * @returns {string[]} 文件列表
 */
export function getFiles(directoryPath, pattern) {
  pattern &&= new RegExp(pattern)
  return fs.readdirSync(directoryPath).filter((file) => !pattern || pattern.test(file))
}

/**
 * 递归获取文件树
 * @param {string} rootPath  根路径
 * @param {RegExp} pattern  匹配模式
 * @returns {object} { tree, totalFiles }
 */
export function getFileTree(rootPath, pattern) {
  pattern &&= new RegExp(pattern)
  let totalFiles = 0
  const getTree = (filepath) => {
    const files = getFiles(filepath)
    const tree = {}
    files.forEach((file) => {
      const filePath = path.join(filepath, file)
      if (isDirectory(filePath)) {
        tree[file] = getTree(filePath)
      } else if (!pattern || pattern.test(file)) {
        tree[file] = filePath
        totalFiles++
      }
    })
    return tree
  }
  const tree = getTree(rootPath)
  return { tree, totalFiles }
}
