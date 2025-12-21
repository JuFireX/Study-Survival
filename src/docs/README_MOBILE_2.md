# Android APK 打包指南

## 1. 环境准备

### 1.1 Android SDK

你的 Android SDK 路径已确认：

- `D:\Softwares\Android\SDK`

### 1.2 Java JDK

你的 Java JDK 路径已确认：

- `D:\Softwares\Program Files\Java\jdk-17`

### 1.3 Gradle (重要)

由于系统无法自动找到 Gradle，你可能需要手动安装：

1. 访问 [Gradle Releases](https://gradle.org/releases/)
2. 下载 **v8.4** 版本的 Binary-only (binary-only is enough)
3. 解压到某个目录，例如 `D:\Softwares\Gradle\gradle-8.4`
4. 将 `D:\Softwares\Gradle\gradle-8.4\bin` 添加到系统环境变量 Path 中
5. 打开新的命令行验证：`gradle -v`

如果你的网络环境允许 Cordova 自动下载，则可以跳过此步。

## 2. 自动构建脚本

为了简化流程，已在项目根目录创建了 `build_android.ps1` 脚本。

### 使用方法：

1. 打开 PowerShell
2. 进入项目根目录：`cd E:\Ugh-Study`
3. 运行脚本：
   ```powershell
   .\build_android.ps1
   ```

该脚本会自动设置 `JAVA_HOME` 和 `ANDROID_HOME`，然后尝试构建。

## 3. 手动构建步骤 (如果不使用脚本)

1. 设置环境变量：

   ```powershell
   $env:JAVA_HOME = "D:\Softwares\Program Files\Java\jdk-17"
   $env:ANDROID_HOME = "D:\Softwares\Android\SDK"
   $env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\build-tools\36.1.0;$env:Path"
   ```

2. 运行构建：
   ```powershell
   cd cordova_app
   npx cordova build android
   ```

## 4. 输出文件

构建成功后，APK 文件位于：
`cordova_app\platforms\android\app\build\outputs\apk\debug\app-debug.apk`

## 5. 常见问题

- **Could not find an installed version of Gradle**: 请参考 1.3 节手动安装 Gradle。
- **Android SDK not found**: 确保 `ANDROID_HOME` 指向正确的 SDK 目录。
