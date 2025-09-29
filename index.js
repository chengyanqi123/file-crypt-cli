#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { program } from "commander";
import core from "./lib/core.js";
import { __dirname } from "./lib/utils.js";

// 定义版本和描述
const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8"));
program.version(version).description("仅需一个命令，即可对你的文件进行加密解密");

// 加密文件
program
  .command("enc <inputPath> <outputPath> <password>")
  .description("加密文件")
  .option("-d, --deep", "递归目录下的所有文件")
  .option("-r, --reg <pattern>", "仅匹配满足指定正则的文件")
  .action(async (...args) => {
    await core(...args)
      .encrypt()
      .run();
  });

// 解密文件
program
  .command("dec <inputPath> <outputPath> <password>")
  .description("解密文件")
  .option("-d, --deep", "递归目录下的所有文件")
  .option("-r, --reg <pattern>", "仅匹配满足指定正则的文件")
  .action(async (...args) => {
    await core(...args)
      .decrypt()
      .run();
  });

program.parse(process.argv);
