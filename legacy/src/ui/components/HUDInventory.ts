export class HUDInventory {
    private container: HTMLElement;
    private items: Map<string, HTMLElement> = new Map();

    constructor() {
        // 创建容器 (右上角)
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '2vmin';
        this.container.style.right = '2vmin';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'row-reverse'; // 从右向左排列
        this.container.style.flexWrap = 'wrap-reverse'; // 换行
        this.container.style.gap = '1vmin';
        this.container.style.width = '35vmin'; // 限制宽度以便换行
        this.container.style.zIndex = '950';
        this.container.style.pointerEvents = 'none'; // 点击穿透

        document.body.appendChild(this.container);
    }

    public addItem(id: string, icon: string, rarity: string) {
        if (this.items.has(id)) return;

        const item = document.createElement('div');
        item.style.width = '8vmin';
        item.style.height = '8vmin';
        item.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        item.style.borderRadius = '1.5vmin'; // 圆角正方形
        item.style.border = `0.4vmin solid ${this.getRarityColor(rarity)}`;
        item.style.display = 'flex';
        item.style.justifyContent = 'center';
        item.style.alignItems = 'center';
        item.style.fontSize = '3vmin';
        item.style.color = '#fff';
        item.style.overflow = 'hidden';
        
        // 简单显示首字母作为图标，实际应使用img
        item.textContent = icon.substring(0, 1).toUpperCase();

        this.container.appendChild(item);
        this.items.set(id, item);
    }

    public removeItem(id: string) {
        const item = this.items.get(id);
        if (item) {
            item.remove();
            this.items.delete(id);
        }
    }

    public updateItem(id: string, rarity: string) {
        const item = this.items.get(id);
        if (item) {
            item.style.border = `2px solid ${this.getRarityColor(rarity)}`;
        }
    }

    private getRarityColor(rarity: string): string {
        switch (rarity) {
            case 'common': return '#A9A9A9';
            case 'rare': return '#007AFF';
            case 'epic': return '#AF52DE';
            case 'legendary': return '#FFD60A';
            default: return '#fff';
        }
    }

    public destroy() {
        this.container.remove();
        this.items.clear();
    }
}
