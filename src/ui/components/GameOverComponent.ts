/**
 * 游戏结束 UI 组件 (GameOverComponent)
 *
 * 职责:
 * 1. 显示 Game Over 标题。
 * 2. 提供重新开始按钮。
 */
export class GameOverComponent {
  private container: HTMLElement;
  private title: HTMLElement;
  private restartBtn: HTMLElement;

  constructor() {
    // 主容器
    this.container = document.createElement("div");
    this.container.id = "game-over-container";
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    this.container.style.display = "none"; // 初始隐藏
    this.container.style.flexDirection = "column";
    this.container.style.alignItems = "center";
    this.container.style.justifyContent = "center";
    this.container.style.zIndex = "200"; // 确保在最上层

    // 标题
    this.title = document.createElement("h1");
    this.title.innerText = "GAME OVER";
    this.title.style.color = "#ff3333";
    this.title.style.fontSize = "8vmin";
    this.title.style.fontFamily = "Impact, sans-serif";
    this.title.style.marginBottom = "5vmin";
    this.title.style.textShadow = "0 0 10px #ff0000";
    this.container.appendChild(this.title);

    // 重试按钮
    this.restartBtn = document.createElement("button");
    this.restartBtn.innerText = "RESTART";
    this.restartBtn.style.padding = "2vmin 5vmin";
    this.restartBtn.style.fontSize = "4vmin";
    this.restartBtn.style.backgroundColor = "#4caf50";
    this.restartBtn.style.color = "white";
    this.restartBtn.style.border = "none";
    this.restartBtn.style.borderRadius = "1vmin";
    this.restartBtn.style.cursor = "pointer";
    this.restartBtn.style.boxShadow = "0 0 15px rgba(76, 175, 80, 0.5)";

    // 按钮悬停效果
    this.restartBtn.onmouseover = () => {
      this.restartBtn.style.backgroundColor = "#45a049";
      this.restartBtn.style.transform = "scale(1.05)";
    };
    this.restartBtn.onmouseout = () => {
      this.restartBtn.style.backgroundColor = "#4caf50";
      this.restartBtn.style.transform = "scale(1)";
    };

    this.container.appendChild(this.restartBtn);

    document.body.appendChild(this.container);
  }

  /**
   * 显示游戏结束界面
   * @param onRestart 点击重试时的回调
   */
  public show(onRestart: () => void) {
    this.container.style.display = "flex";
    // 简单动画
    this.container.style.opacity = "0";
    this.container.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 500,
      fill: "forwards",
    });

    this.restartBtn.onclick = (e) => {
      e.stopPropagation(); // 防止点击穿透
      onRestart();
    };
  }

  public hide() {
    this.container.style.display = "none";
  }

  public destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
