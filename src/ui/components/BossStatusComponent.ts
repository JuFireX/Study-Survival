/**
 * Boss 血条 UI 组件 (BossStatusComponent)
 *
 * 职责:
 * 1. 创建 Boss 血条的 DOM 元素。
 * 2. 更新血条显示 (百分比)。
 */
export class BossStatusComponent {
  private container: HTMLElement;
  private barBg: HTMLElement;
  private barFill: HTMLElement;
  private label: HTMLElement;

  constructor() {
    // 创建容器
    this.container = document.createElement("div");
    this.container.id = "boss-status-container";
    this.container.style.position = "absolute";
    this.container.style.top = "5vmin";
    this.container.style.left = "5vmin";
    this.container.style.width = "30vmin";
    this.container.style.height = "4vmin";
    this.container.style.zIndex = "90";
    this.container.style.display = "none"; // 默认隐藏
    this.container.style.pointerEvents = "none";

    // 标签
    this.label = document.createElement("div");
    this.label.innerText = "BOSS";
    this.label.style.color = "#ff4444";
    this.label.style.fontSize = "2.5vmin";
    this.label.style.fontWeight = "bold";
    this.label.style.marginBottom = "0.5vmin";
    this.label.style.textShadow = "1px 1px 2px black";
    this.container.appendChild(this.label);

    // 血条背景
    this.barBg = document.createElement("div");
    this.barBg.style.width = "100%";
    this.barBg.style.height = "100%";
    this.barBg.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    this.barBg.style.border = "0.2vmin solid rgba(255, 255, 255, 0.3)";
    this.barBg.style.borderRadius = "0.5vmin";
    this.barBg.style.overflow = "hidden";
    this.container.appendChild(this.barBg);

    // 血条填充
    this.barFill = document.createElement("div");
    this.barFill.style.width = "100%";
    this.barFill.style.height = "100%";
    this.barFill.style.backgroundColor = "#d32f2f"; // 深红色
    this.barFill.style.transition = "width 0.2s ease-out";
    this.barBg.appendChild(this.barFill);

    document.body.appendChild(this.container);
  }

  public updateHealth(percent: number) {
    this.barFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  public setVisible(visible: boolean) {
    this.container.style.display = visible ? "block" : "none";
  }

  public destroy() {
    this.container.remove();
  }
}
