export class FloatingTextComponent {
    private container: HTMLElement;

    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'floating-text-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.overflow = 'hidden';
        this.container.style.zIndex = '900';
        document.body.appendChild(this.container);
    }

    public spawn(text: string, x: number, y: number, color: string) {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.position = 'absolute';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.color = color;
        el.style.fontSize = '24px';
        el.style.fontWeight = 'bold';
        el.style.textShadow = '2px 2px 0 #000';
        el.style.transition = 'top 1s ease-out, opacity 1s ease-out';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.opacity = '1';

        this.container.appendChild(el);

        // 强制重绘以触发 transition
        el.offsetHeight;

        // 动画：向上飘并消失
        el.style.top = `${y - 100}px`;
        el.style.opacity = '0';

        // 动画结束后移除元素
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    }

    public destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
