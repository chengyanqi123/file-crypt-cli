import path from "path";
import fs from "fs";
import { encryptFile, decryptFile } from "./crypto-file.js";
import { createProgressBar, isDirectory, getFileTree, getFiles } from "./utils.js";
const pwd = process.cwd();

/**
 * 核心函数
 * @param {string} inputPath - 输入路径
 * @param {string} outputPath - 输出路径
 * @param {string} password - 密码
 * @param {object} options - 选项
 * @param {boolean} options.deep - 是否递归目录下的所有文件
 * @param {string} options.reg - 仅匹配满足正则规则的文件
 */
export default function (inputPath, outputPath, password, options) {
  const TEXT = {
    COMPLETE: "完成",
    NOT_FOUND: "未匹配到文件",
    ENCRYPT: "加密",
    DECRYPT: "解密",
  };
  function encrypt() {
    this.encrypt = true;
    return this;
  }
  function decrypt() {
    this.encrypt = false;
    return this;
  }
  async function run() {
    const { deep, reg } = options;
    inputPath = path.resolve(pwd, inputPath);
    outputPath = path.resolve(pwd, outputPath);
    const PREVFIX = this.encrypt ? TEXT.ENCRYPT : TEXT.DECRYPT;
    const HANDLER_CALL = this.encrypt ? encryptFile : decryptFile;
    // 处理文件
    if (!isDirectory(inputPath)) {
      const bar = createProgressBar(`${PREVFIX}${inputPath}`);
      await HANDLER_CALL(inputPath, outputPath, password, ({ progress, readSize, totalSize }) => {
        bar.update(progress / 100);
      });
      return console.log(`${PREVFIX}${TEXT.COMPLETE}`);
    }

    // 处理非深度目录
    if (!deep) {
      const files = getFiles(inputPath, reg);
      const fileLength = files.length;
      if (fileLength === 0) {
        return console.log(TEXT.NOT_FOUND);
      }
      for (let i = 0; i < fileLength; i++) {
        const filename = files[i],
          input = path.join(inputPath, filename),
          output = path.join(outputPath, filename),
          bar = createProgressBar(`${PREVFIX}[${i + 1}/${fileLength}] ${filename}`);
        await HANDLER_CALL(input, output, password, ({ progress, readSize, totalSize }) => {
          bar.update(progress / 100);
        });
      }
      return console.log(`${PREVFIX}${TEXT.COMPLETE}`);
    }

    // 处理深度目录
    const { tree, totalFiles } = getFileTree(inputPath, reg);
    if (totalFiles === 0) {
      return console.log(TEXT.NOT_FOUND);
    }
    let completeCount = 0; // 已完成文件数
    const stack = []; // 栈结构：存储待处理的节点，每个元素是 { node: 节点对象, key: 节点键名 }
    stack.push({ node: tree, key: "" });
    while (stack.length > 0) {
      const { node, key } = stack.pop();
      for (const filename in node) {
        const input = node[filename];
        if (typeof input === "string") {
          completeCount++;
          const output = input.replace(inputPath, outputPath);
          const bar = createProgressBar(`${PREVFIX}[${completeCount}/${totalFiles}] ${filename}`);
          await HANDLER_CALL(input, output, password, ({ progress, readSize, totalSize }) => {
            bar.update(progress / 100);
          });
        } else if (typeof input === "object" && input !== null) {
          // 检查目录是否存在
          const dir = path.join(outputPath, key, filename);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
          }
          stack.push({ node: input, key: path.join(key, filename) });
        }
      }
    }
  }
  return {
    encrypt,
    decrypt,
    run,
  };
}
