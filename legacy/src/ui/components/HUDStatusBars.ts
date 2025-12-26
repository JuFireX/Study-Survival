export class HUDStatusBars {
    private container: HTMLElement;
    private expBar: HTMLElement;
    private expFill: HTMLElement;
    private expText: HTMLElement;
    private hpBar: HTMLElement;
    private hpFill: HTMLElement;
    private hpText: HTMLElement;

    constructor() {
        // 创建容器 (左上角)
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '2vmin';
        this.container.style.left = '2vmin';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.gap = '0.5vmin';
        this.container.style.width = '30vmin';
        this.container.style.zIndex = '950';
        this.container.style.pointerEvents = 'none';

        // 经验条 (上)
        const expWrap = document.createElement('div');
        expWrap.style.position = 'relative';
        expWrap.style.height = '1.5vmin';
        expWrap.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        expWrap.style.borderRadius = '0.75vmin';
        expWrap.style.border = '0.1vmin solid rgba(255, 255, 255, 0.2)';
        expWrap.style.overflow = 'hidden';

        this.expFill = document.createElement('div');
        this.expFill.style.height = '100%';
        this.expFill.style.width = '0%';
        this.expFill.style.backgroundColor = '#4CD964'; // Green
        this.expFill.style.transition = 'width 0.2s';
        expWrap.appendChild(this.expFill);

        this.expText = document.createElement('span');
        this.expText.style.position = 'absolute';
        this.expText.style.width = '100%';
        this.expText.style.textAlign = 'center';
        this.expText.style.top = '0';
        this.expText.style.lineHeight = '1.5vmin';
        this.expText.style.fontSize = '1.1vmin';
        this.expText.style.color = '#fff';
        this.expText.style.textShadow = '0.1vmin 0.1vmin 0.1vmin #000';
        this.expText.textContent = 'Lv.1';
        expWrap.appendChild(this.expText);

        // 血条 (下)
        const hpWrap = document.createElement('div');
        hpWrap.style.position = 'relative';
        hpWrap.style.height = '2.5vmin';
        hpWrap.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        hpWrap.style.borderRadius = '1.25vmin';
        hpWrap.style.border = '0.1vmin solid rgba(255, 255, 255, 0.2)';
        hpWrap.style.overflow = 'hidden';

        this.hpFill = document.createElement('div');
        this.hpFill.style.height = '100%';
        this.hpFill.style.width = '100%';
        this.hpFill.style.backgroundColor = '#FF3B30'; // Red
        this.hpFill.style.transition = 'width 0.2s, background-color 0.2s';
        hpWrap.appendChild(this.hpFill);

        this.hpText = document.createElement('span');
        this.hpText.style.position = 'absolute';
        this.hpText.style.width = '100%';
        this.hpText.style.textAlign = 'center';
        this.hpText.style.top = '0';
        this.hpText.style.lineHeight = '2.5vmin';
        this.hpText.style.fontSize = '1.6vmin';
        this.hpText.style.color = '#fff';
        this.hpText.style.textShadow = '0.1vmin 0.1vmin 0.1vmin #000';
        this.hpText.textContent = '100/100';
        hpWrap.appendChild(this.hpText);

        this.container.appendChild(expWrap);
        this.container.appendChild(hpWrap);

        document.body.appendChild(this.container);
        this.expBar = expWrap;
        this.hpBar = hpWrap;
    }

    public updateExp(current: number, max: number, level: number) {
        const pct = Math.min(1, Math.max(0, current / Math.max(1, max)));
        this.expFill.style.width = `${pct * 100}%`;
        this.expText.textContent = `Lv.${level} (${Math.floor(pct * 100)}%)`;
    }

    public updateHealth(current: number, max: number, shield: number) {
        const safeMax = Math.max(1, max);
        const safeCur = Math.max(0, current);
        const pct = safeCur / safeMax;
        
        this.hpFill.style.width = `${Math.min(1, pct) * 100}%`;
        this.hpText.textContent = `${Math.ceil(safeCur)}/${Math.ceil(safeMax)}`;

        // 根据百分比改变颜色
        if (pct > 0.5) {
            this.hpFill.style.backgroundColor = '#4CD964'; // Green
        } else if (pct > 0.25) {
            this.hpFill.style.backgroundColor = '#FFCC00'; // Yellow
        } else {
            this.hpFill.style.backgroundColor = '#FF3B30'; // Red
        }

        if (shield > 0) {
             this.hpText.textContent += ` (+${Math.ceil(shield)})`;
        }
    }

    public destroy() {
        this.container.remove();
    }
}
