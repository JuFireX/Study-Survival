import * as pc from "playcanvas";
import { GameContext } from "../core/GameContext";

export class EquipmentStand {
  private app: pc.Application;
  private stand: pc.Entity | null = null;
  private panel: HTMLDivElement | null = null;
  private panelVisible = false;

  constructor() {
    this.app = GameContext.getInstance().getApp();
    this.createPanel();
  }

  public ensureStand(): pc.Entity {
    if (this.stand && this.stand.parent) return this.stand;
    this.stand = this.createStand();
    return this.stand;
  }

  public getStand(): pc.Entity | null {
    if (this.stand && this.stand.parent) return this.stand;
    return null;
  }

  public setPanelVisible(visible: boolean) {
    this.panelVisible = visible;
    if (!this.panel) return;
    this.panel.style.display = visible ? "flex" : "none";
  }

  public isPanelVisible(): boolean {
    return this.panelVisible;
  }

  private createStand(): pc.Entity {
    const stand = new pc.Entity("EquipmentStand");
    stand.setPosition(0, 0.1, -6);

    const pedestal = new pc.Entity("EquipmentPedestal");
    pedestal.addComponent("model", { type: "cylinder" });
    pedestal.setLocalScale(2.2, 0.4, 2.2);
    const pedestalMaterial = new pc.StandardMaterial();
    pedestalMaterial.diffuse = new pc.Color(0.2, 0.18, 0.22);
    pedestalMaterial.update();
    pedestal.model!.material = pedestalMaterial;

    const gear = new pc.Entity("EquipmentCore");
    gear.addComponent("model", { type: "box" });
    gear.setLocalPosition(0, 1.35, 0);
    gear.setLocalScale(0.9, 0.9, 0.9);
    const gearMaterial = new pc.StandardMaterial();
    gearMaterial.diffuse = new pc.Color(0.85, 0.55, 0.2);
    gearMaterial.update();
    gear.model!.material = gearMaterial;

    stand.addChild(pedestal);
    stand.addChild(gear);
    this.app.root.addChild(stand);
    return stand;
  }

  private createPanel() {
    const panel = document.createElement("div");
    panel.style.position = "absolute";
    panel.style.top = "0";
    panel.style.left = "0";
    panel.style.width = "100%";
    panel.style.height = "100%";
    panel.style.display = "none";
    panel.style.alignItems = "center";
    panel.style.justifyContent = "center";
    panel.style.background = "rgba(0, 0, 0, 0.7)";
    panel.style.zIndex = "150";

    const card = document.createElement("div");
    card.style.width = "60vmin";
    card.style.maxWidth = "90vw";
    card.style.padding = "4vmin";
    card.style.background = "rgba(30, 30, 40, 0.95)";
    card.style.border = "0.3vmin solid rgba(255, 255, 255, 0.2)";
    card.style.borderRadius = "2vmin";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";
    card.style.gap = "3vmin";

    const title = document.createElement("div");
    title.innerText = "装备配置（占位）";
    title.style.color = "#fff";
    title.style.fontSize = "3vmin";

    const preview = document.createElement("div");
    preview.style.width = "24vmin";
    preview.style.height = "24vmin";
    preview.style.borderRadius = "2vmin";
    preview.style.background = "linear-gradient(135deg, #f39c12, #f1c40f)";
    preview.style.display = "flex";
    preview.style.alignItems = "center";
    preview.style.justifyContent = "center";
    preview.style.color = "#fff";
    preview.style.fontSize = "2.2vmin";
    preview.innerText = "装备展示占位";

    const closeButton = document.createElement("button");
    closeButton.innerText = "关闭";
    closeButton.style.padding = "1.2vmin 4vmin";
    closeButton.style.fontSize = "2vmin";
    closeButton.style.borderRadius = "1vmin";
    closeButton.style.border = "0.2vmin solid rgba(255, 255, 255, 0.6)";
    closeButton.style.background = "rgba(220, 80, 80, 0.9)";
    closeButton.style.color = "#fff";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = () => {
      this.setPanelVisible(false);
    };

    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(closeButton);
    panel.appendChild(card);
    document.body.appendChild(panel);

    this.panel = panel;
  }

  public destroy() {
    if (this.stand) {
      this.stand.destroy();
      this.stand = null;
    }
    this.panel?.remove();
    this.panel = null;
  }
}
