/**
 * 玩家效果 UI 组件 (PlayerEffectsComponent)
 *
 * 职责:
 * 1. 创建位于右上角的玩家 Buff/武器展示区域。
 * 2. 根据数量生成对应的小方块。
 */
export class PlayerEffectsComponent {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "player-effects-container";
    this.container.style.position = "absolute";
    this.container.style.top = "2vmin";
    this.container.style.right = "2vmin";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "row-reverse"; // 从右向左排列
    this.container.style.flexWrap = "wrap-reverse";
    this.container.style.gap = "0.5vmin";
    this.container.style.maxWidth = "40vmin";
    this.container.style.zIndex = "90";
    this.container.style.pointerEvents = "none";

    document.body.appendChild(this.container);
  }

  public updateIcons(count: number) {
    // 简单优化：如果数量一致，暂不重新创建 DOM (除非为了完全准确的 diff，这里简化为全量重建或增删)
    // 鉴于 "简化成数量生成小方块"，全量重建最简单且不易出错，对于少量 DOM 性能影响可控。

    // 清空
    this.container.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const icon = document.createElement("div");
      icon.style.width = "3vmin";
      icon.style.height = "3vmin";
      icon.style.backgroundColor = "rgba(100, 200, 255, 0.6)"; // 浅蓝色代表 Buff/Weapon
      icon.style.border = "0.2vmin solid rgba(255, 255, 255, 0.5)";
      icon.style.borderRadius = "0.3vmin";
      this.container.appendChild(icon);
    }
  }

  public setVisible(visible: boolean) {
    this.container.style.display = visible ? "flex" : "none";
  }

  public destroy() {
    this.container.remove();
  }
}
