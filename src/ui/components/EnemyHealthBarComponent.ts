/**
 * 敌人血条 UI 视图组件 (EnemyHealthBarComponent)
 * 
 * 职责:
 * 1. 创建并管理单个敌人头顶的血条 DOM 元素。
 * 2. 提供设置位置、显示/隐藏、更新血量的接口。
 * 3. 纯 DOM 操作，不包含游戏逻辑。
 */
export class EnemyHealthBarComponent {
    private container: HTMLElement;
    private fill: HTMLElement;

    constructor() {
        // 创建 DOM 元素
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.width = '60px';
        this.container.style.height = '6px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.border = '1px solid rgba(0,0,0,0.8)';
        this.container.style.borderRadius = '3px';
        this.container.style.pointerEvents = 'none'; // 点击穿透
        this.container.style.display = 'none'; // 初始隐藏
        this.container.style.zIndex = '50';

        this.fill = document.createElement('div');
        this.fill.style.width = '100%';
        this.fill.style.height = '100%';
        this.fill.style.backgroundColor = '#ff3333'; // 红色
        this.fill.style.transition = 'width 0.1s';

        this.container.appendChild(this.fill);
        document.body.appendChild(this.container);
    }

    /**
     * 更新血量
     * @param percent 0-1
     */
    public updateHealth(percent: number) {
        this.fill.style.width = `${Math.max(0, Math.min(100, percent * 100))}%`;
    }

    /**
     * 设置屏幕位置
     * @param x 屏幕 X 坐标
     * @param y 屏幕 Y 坐标
     */
    public setPosition(x: number, y: number) {
        this.container.style.left = `${x - 30}px`; // 宽度一半
        this.container.style.top = `${y - 3}px`; // 高度一半
    }

    /**
     * 设置可见性
     */
    public setVisible(visible: boolean) {
        this.container.style.display = visible ? 'block' : 'none';
    }

    public destroy() {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
