# 移动端打包指南 (Android)

本项目使用 Cordova 将 Web 应用打包为 Android APK。

## 前置准备

在打包之前，你需要确保本地环境已经安装并配置好了以下开发工具：

1.  **Java Development Kit (JDK)**
    *   建议安装 JDK 11 或 JDK 17。
    *   配置环境变量 `JAVA_HOME` 指向 JDK 安装目录。

2.  **Android Studio & Android SDK**
    *   下载并安装 [Android Studio](https://developer.android.com/studio)。
    *   打开 Android Studio，进入 SDK Manager，确保安装了 **Android SDK Platform** 和 **Android SDK Build-Tools**。
    *   配置环境变量 `ANDROID_HOME`：
        *   Windows 通常在: `C:\Users\你的用户名\AppData\Local\Android\Sdk`
    *   将以下路径添加到系统 `Path` 环境变量中：
        *   `%ANDROID_HOME%\platform-tools`
        *   `%ANDROID_HOME%\cmdline-tools\latest\bin` (如果有)
        *   `%ANDROID_HOME%\tools` (旧版 SDK)

3.  **Gradle**
    *   Cordova 通常会自动下载 Gradle，但如果遇到网络问题，可能需要手动安装 Gradle 并配置环境变量。

## 打包步骤

### 1. 构建 Web 资源
首先，需要将 TypeScript 代码编译并构建为静态资源。

```bash
# 在项目根目录下运行
npm run build:mobile
```
*该命令会执行 `npm run build` 并自动准备 Cordova 环境。*

### 2. 打包 APK
进入 `cordova_app` 目录并执行打包命令。

```bash
cd cordova_app
npx cordova build android
```

如果需要生成 Release 版本（签名包），请参考 Cordova 官方文档配置签名文件，或使用：
```bash
npx cordova build android --release
```

## 常见问题

*   **找不到 ANDROID_HOME**: 请检查环境变量是否正确配置。
*   **Gradle 下载失败**: 请检查网络连接，或手动配置 Gradle 代理。
