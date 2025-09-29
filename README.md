# 简介

仅需一个命令，即可对你的文件进行加密解密。

## 功能特性

- 支持单个文件的加密和解密
- 支持递归处理目录下的所有文件
- 支持使用正则表达式匹配特定文件
- 加密解密过程中显示进度条
- 简单易用的命令行界面

## 安装

```bash
npm install -g file-crypt-cli
# 或
pnpm add -g file-crypt-cli
```

## 使用方法

### 加密文件

```bash
fcrypt enc <输入路径> <输出路径> <密码>
```

### 解密文件

```bash
fcrypt dec <输入路径> <输出路径> <密码>
```

### 参数说明

- `-d, --deep`: 递归处理目录下的所有文件
- `-r, --reg <pattern>`: 仅匹配满足指定正则的文件

## 示例

###

```bash
# 加密单个文件
fcrypt enc ./download.mp4 ./encoded/001.mp4 mysecretpassword

# 解密单个文件
fcrypt dec ./encoded/001.mp4 ./decoded/001.mp4 mysecretpassword

# 递归加密目录下的所有文件
fcrypt enc ./documents ./encrypted-documents mysecretpassword -d

# 使用正则表达式匹配特定文件
fcrypt enc ./documents ./encrypted-documents mysecretpassword -d -r ".*\\.pdf$"
```

## 注意事项

1. 请妥善保管您的密码，一旦丢失，加密文件将无法解密
2. 大文件加密解密可能需要较长时间，请耐心等待
3. Linux/Mac系统执行加解密请添加`sudo`权限，否则可能因为权限不足导致加解密异常

## 许可证

ISC

## 作者

Cheng Yanqi
