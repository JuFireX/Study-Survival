/**
 * 玩家状态 UI 组件 (PlayerStatusComponent)
 * 
 * 职责:
 * 1. 创建位于底部中心的玩家血量和经验条。
 * 2. 提供更新血量条（颜色、进度）和经验条的接口。
 */
export class PlayerStatusComponent {
    private container: HTMLElement;
    private hpBarContainer: HTMLElement;
    private hpBarFill: HTMLElement;
    private hpText: HTMLElement;
    private expBarContainer: HTMLElement;
    private expBarFill: HTMLElement;
    private expText: HTMLElement;

    constructor() {
        // 主容器
        this.container = document.createElement('div');
        this.container.id = 'player-status-container';
        this.container.style.position = 'absolute';
        this.container.style.bottom = '2vmin';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.width = '40vmin';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.zIndex = '90';
        this.container.style.pointerEvents = 'none'; // 穿透点击

        // 血条容器
        this.hpBarContainer = document.createElement('div');
        this.hpBarContainer.style.width = '100%';
        this.hpBarContainer.style.height = '2.5vmin';
        this.hpBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.hpBarContainer.style.border = '0.2vmin solid rgba(255, 255, 255, 0.3)';
        this.hpBarContainer.style.borderRadius = '0.5vmin';
        this.hpBarContainer.style.position = 'relative';
        this.hpBarContainer.style.overflow = 'hidden';
        this.hpBarContainer.style.marginBottom = '0.5vmin';
        this.container.appendChild(this.hpBarContainer);

        // 血条填充
        this.hpBarFill = document.createElement('div');
        this.hpBarFill.style.width = '100%';
        this.hpBarFill.style.height = '100%';
        this.hpBarFill.style.backgroundColor = '#4caf50'; // 默认绿色
        this.hpBarFill.style.transition = 'width 0.2s ease-out, background-color 0.2s';
        this.hpBarContainer.appendChild(this.hpBarFill);

        // 血量文字
        this.hpText = document.createElement('div');
        this.hpText.style.position = 'absolute';
        this.hpText.style.width = '100%';
        this.hpText.style.height = '100%';
        this.hpText.style.top = '0';
        this.hpText.style.left = '0';
        this.hpText.style.display = 'flex';
        this.hpText.style.alignItems = 'center';
        this.hpText.style.justifyContent = 'center';
        this.hpText.style.fontSize = '1.5vmin';
        this.hpText.style.color = '#fff';
        this.hpText.style.textShadow = '1px 1px 1px black';
        this.hpBarContainer.appendChild(this.hpText);

        // 经验条容器
        this.expBarContainer = document.createElement('div');
        this.expBarContainer.style.width = '90%'; // 比血条稍窄
        this.expBarContainer.style.height = '1vmin';
        this.expBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.expBarContainer.style.border = '0.1vmin solid rgba(255, 255, 255, 0.2)';
        this.expBarContainer.style.borderRadius = '0.5vmin';
        this.expBarContainer.style.position = 'relative';
        this.expBarContainer.style.overflow = 'hidden';
        this.container.appendChild(this.expBarContainer);

        // 经验条填充
        this.expBarFill = document.createElement('div');
        this.expBarFill.style.width = '0%';
        this.expBarFill.style.height = '100%';
        this.expBarFill.style.backgroundColor = '#2196f3'; // 蓝色
        this.expBarFill.style.transition = 'width 0.2s ease-out';
        this.expBarContainer.appendChild(this.expBarFill);

        // 经验条文字 (可选，暂时隐藏或仅显示等级)
        this.expText = document.createElement('div');
        this.expText.style.display = 'none';
        this.expBarContainer.appendChild(this.expText);

        document.body.appendChild(this.container);
    }

    public updateHP(percent: number, current: number, max: number, color: string) {
        this.hpBarFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        this.hpBarFill.style.backgroundColor = color;
        this.hpText.innerText = `${Math.ceil(current)} / ${Math.ceil(max)}`;
    }

    public updateEXP(percent: number, levelText: string) {
        this.expBarFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        this.expText.innerText = levelText;
    }

    public destroy() {
        this.container.remove();
    }
}
