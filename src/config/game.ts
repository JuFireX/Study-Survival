/**
 * 游戏全局配置 (Game Config)
 *
 * 职责:
 * 1. 存储全局通用的游戏配置项。
 * 2. 为未来配置文件的序列化做准备。
 */
// 游戏一些其他配置 目前不用管, 这是为了之后所有配置文件化做的.
// 比如光照设置啊, 相机设置啊, 等等.
export const VFXConfig = {
    enabled: true,

    expOrb: {
        enabled: true,
        maxConcurrentAnimations: 32,

        retreat: {
            duration: 0.2,
            pixelsMin: 10,
            pixelsMax: 20
        },

        fly: {
            durationMin: 0.5,
            durationMax: 0.8,
            curvePixels: 40,
            wavePixels: 10,
            waveFrequency: 1.5
        },

        scaleEndRatio: 0.3,

        trail: {
            enabled: true,
            spawnInterval: 0.03,
            lifetime: 0.15,
            scaleStart: 0.12,
            scaleEnd: 0.02,
            maxConcurrent: 128
        },

        pickupBurst: {
            enabled: true,
            maxConcurrent: 24,
            numParticles: 14,
            lifetime: 0.22,
            speedMin: 0.8,
            speedMax: 2.2,
            scaleStart: 0.08,
            scaleEnd: 0.01
        }
    }
} as const;

