import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';

export class CharacterHandler {
    private app: pc.Application;
    private selectionPanel: HTMLDivElement | null = null;
    private stand: pc.Entity | null = null;
    private selectionVisible = false;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.createSelectionUI();
    }

    public ensureStand(): pc.Entity {
        if (this.stand && this.stand.parent) return this.stand;
        this.stand = this.createCharacterStand();
        return this.stand;
    }

    public getStand(): pc.Entity | null {
        if (this.stand && this.stand.parent) return this.stand;
        return null;
    }

    public setSelectionVisible(visible: boolean) {
        this.selectionVisible = visible;
        if (!this.selectionPanel) return;
        this.selectionPanel.style.display = visible ? 'flex' : 'none';
    }

    public isSelectionVisible(): boolean {
        return this.selectionVisible;
    }

    private createCharacterStand(): pc.Entity {
        const stand = new pc.Entity('CharacterStand');
        stand.setPosition(-6, 0.1, 0);

        const pedestal = new pc.Entity('StandPedestal');
        pedestal.addComponent('model', { type: 'cylinder' });
        pedestal.setLocalScale(2.4, 0.45, 2.4);
        const pedestalMaterial = new pc.StandardMaterial();
        pedestalMaterial.diffuse = new pc.Color(0.2, 0.2, 0.25);
        pedestalMaterial.update();
        pedestal.model!.material = pedestalMaterial;

        const preview = new pc.Entity('CharacterPreview');
        preview.addComponent('model', { type: 'capsule' });
        preview.setLocalPosition(0, 1.6, 0);
        preview.setLocalScale(0.8, 0.8, 0.8);
        const previewMaterial = new pc.StandardMaterial();
        previewMaterial.diffuse = new pc.Color(0.9, 0.7, 0.3);
        previewMaterial.update();
        preview.model!.material = previewMaterial;

        stand.addChild(pedestal);
        stand.addChild(preview);
        this.app.root.addChild(stand);
        return stand;
    }

    private createSelectionUI() {
        const panel = document.createElement('div');
        panel.style.position = 'absolute';
        panel.style.top = '0';
        panel.style.left = '0';
        panel.style.width = '100%';
        panel.style.height = '100%';
        panel.style.display = 'none';
        panel.style.alignItems = 'center';
        panel.style.justifyContent = 'center';
        panel.style.background = 'rgba(0, 0, 0, 0.7)';
        panel.style.zIndex = '150';

        const card = document.createElement('div');
        card.style.width = '60vmin';
        card.style.maxWidth = '90vw';
        card.style.padding = '4vmin';
        card.style.background = 'rgba(30, 30, 40, 0.95)';
        card.style.border = '0.3vmin solid rgba(255, 255, 255, 0.2)';
        card.style.borderRadius = '2vmin';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.gap = '3vmin';

        const title = document.createElement('div');
        title.innerText = '角色选择（占位）';
        title.style.color = '#fff';
        title.style.fontSize = '3vmin';

        const preview = document.createElement('div');
        preview.style.width = '24vmin';
        preview.style.height = '24vmin';
        preview.style.borderRadius = '2vmin';
        preview.style.background = 'linear-gradient(135deg, #4c8bf5, #7f5adf)';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.color = '#fff';
        preview.style.fontSize = '2.2vmin';
        preview.innerText = '角色模型占位';

        const closeButton = document.createElement('button');
        closeButton.innerText = '关闭';
        closeButton.style.padding = '1.2vmin 4vmin';
        closeButton.style.fontSize = '2vmin';
        closeButton.style.borderRadius = '1vmin';
        closeButton.style.border = '0.2vmin solid rgba(255, 255, 255, 0.6)';
        closeButton.style.background = 'rgba(220, 80, 80, 0.9)';
        closeButton.style.color = '#fff';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            this.setSelectionVisible(false);
        };

        card.appendChild(title);
        card.appendChild(preview);
        card.appendChild(closeButton);
        panel.appendChild(card);
        document.body.appendChild(panel);

        this.selectionPanel = panel;
    }

    public destroy() {
        if (this.stand) {
            this.stand.destroy();
            this.stand = null;
        }
        this.selectionPanel?.remove();
        this.selectionPanel = null;
    }
}
