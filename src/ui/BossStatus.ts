import { BossStatusComponent } from "./components/BossStatusComponent";

/**
 * Boss 状态栏 (BossStatus)
 *
 * 职责:
 * 1. 管理 Boss 血条的显示逻辑。
 * 2. 暂时作为占位符，提供 API 供后续使用。
 */
export class BossStatus {
  private component: BossStatusComponent;

  constructor() {
    this.component = new BossStatusComponent();
  }

  /**
   * 设置 Boss 血量
   * @param current 当前血量
   * @param max 最大血量
   */
  public setHealth(current: number, max: number) {
    if (max <= 0) return;
    const percent = (current / max) * 100;
    this.component.updateHealth(percent);

    // 如果有血量显示，则确保可见
    if (current > 0) {
      this.component.setVisible(true);
    } else {
      this.component.setVisible(false);
    }
  }

  public show() {
    this.component.setVisible(true);
  }

  public hide() {
    this.component.setVisible(false);
  }

  public destroy() {
    this.component.destroy();
  }
}
