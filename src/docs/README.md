# 移动端打包指南

## Android 打包

### 前置准备

在打包之前，你需要确保本地环境已经安装并配置好了以下开发工具：

1.  **Java Development Kit (JDK)**

    - 建议安装 JDK 11 或 JDK 17。
    - 配置环境变量 `JAVA_HOME` 指向 JDK 安装目录。

2.  **Android Studio & Android SDK**

    - 下载并安装 [Android Studio](https://developer.android.com/studio)。
    - 打开 Android Studio，进入 SDK Manager，确保安装了 **Android SDK Platform** 和 **Android SDK Build-Tools**。
    - 配置环境变量 `ANDROID_HOME`：
      - Windows 通常在: `C:\Users\你的用户名\AppData\Local\Android\Sdk`
    - 将以下路径添加到系统 `Path` 环境变量中：
      - `%ANDROID_HOME%\platform-tools`
      - `%ANDROID_HOME%\cmdline-tools\latest\bin` (如果有)
      - `%ANDROID_HOME%\tools` (旧版 SDK)

3.  **Gradle**

    - Cordova 通常会自动下载 Gradle，但如果遇到网络问题，可能需要手动安装 Gradle 并配置环境变量。

    - 手动安装 Gradle：

      1. 访问 [Gradle Releases](https://gradle.org/releases/)
      2. 下载 **v8.4** 版本的 Binary-only (binary-only is enough)
      3. 解压到某个目录，例如 `D:\Softwares\Gradle\gradle-8.4`
      4. 将 `D:\Softwares\Gradle\gradle-8.4\bin` 添加到系统环境变量 Path 中
      5. 打开新的命令行验证：`gradle -v`

### 打包步骤

1. 手动打包

   1. 构建 Web 资源

      首先，需要将 TypeScript 代码编译并构建为静态资源。

      ```bash
      # 在项目根目录下运行
      npm run build:mobile
      ```

      _该命令会执行 `npm run build` 并自动准备 Cordova 环境。_

   2. 打包 APK

      进入 `cordova_app` 目录并执行打包命令。

      ```bash
      cd cordova_app
      npx cordova build android
      ```

      如果需要生成 Release 版本（签名包），请参考 Cordova 官方文档配置签名文件，或使用：

      ```bash
      npx cordova build android --release
      ```

2. 自动打包

   > 为了简化流程，已在项目根目录创建了 `build_android.ps1` 脚本。
   > 该脚本会自动执行构建和打包步骤。
   > 你可以直接运行该脚本，无需手动执行每个步骤。

   1. 打开 PowerShell

   2. 进入项目根目录：`cd E:\Ugh-Study`
   3. 运行脚本：

   ```powershell
   .\build_android.ps1
   ```

   该脚本会自动设置 `JAVA_HOME` 和 `ANDROID_HOME`，然后尝试构建。
   如果一切顺利，会在 `cordova_app\platforms\android\app\build\outputs\apk\release` 目录下生成 `Ugh-Study-release.apk` 文件。

### 常见问题

- **Could not find an installed version of Gradle**: 请参考 1.3 节手动安装 Gradle。
- **Android SDK not found**: 确保 `ANDROID_HOME` 指向正确的 SDK 目录。
