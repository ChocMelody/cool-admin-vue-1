# 验证码构建配置说明

## 概述

本项目支持在打包时配置登录页面是否需要验证码。通过不同的构建命令,可以生成不同版本的生产环境代码。

## 构建命令

### 1. 默认构建（需要验证码）

```bash
npm run build
```

此命令会构建**需要验证码**的生产版本。登录时会显示验证码输入框,并调用 `login` 接口。

### 2. 无验证码构建

```bash
npm run build:no-captcha
```

此命令会构建**不需要验证码**的生产版本。登录时不会显示验证码输入框,并调用 `loginByPassword` 接口。

## 环境变量配置

### .env.production

```
VITE_REQUIRE_CAPTCHA=true
```

默认生产环境配置,需要验证码。

### .env.production.no-captcha

```
VITE_REQUIRE_CAPTCHA=false
```

无验证码生产环境配置。

## 开发环境

在开发环境中,验证码开关由 **DevTools** 的"基础设置"控制,可以动态切换,无需重启服务器。

## 技术实现

- 开发环境: 使用 `localStorage` 中的 `devTools.captcha` 配置
- 生产环境: 使用构建时注入的 `VITE_REQUIRE_CAPTCHA` 环境变量

## 注意事项

1. 确保后端已实现 `loginByPassword` 接口,否则无验证码登录将失败
2. 生产环境的验证码配置在构建时确定,无法动态修改
3. 如需修改生产环境配置,需要重新构建项目
