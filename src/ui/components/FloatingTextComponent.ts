/**
 * 浮动文字 UI 组件 (FloatingTextComponent)
 *
 * 职责:
 * 1. 创建单个浮动文字的 DOM 元素。
 * 2. 提供设置位置、文本、颜色和透明度的接口。
 */
export class FloatingTextComponent {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.left = "0px";
    this.element.style.top = "0px";
    this.element.style.fontWeight = "bold";
    this.element.style.fontSize = "2vmin"; // 字体大小
    this.element.style.textShadow = "1px 1px 1px black";
    this.element.style.pointerEvents = "none";
    this.element.style.userSelect = "none";
    this.element.style.whiteSpace = "nowrap";
    this.element.style.willChange = "transform, opacity";
    this.element.style.zIndex = "80";
    this.element.style.display = "none";

    document.body.appendChild(this.element);
  }

  public setup(text: string, color: string) {
    this.element.innerText = text;
    this.element.style.color = color;
    this.element.style.display = "block";
    this.element.style.opacity = "1";
  }

  public setPosition(x: number, y: number) {
    // 使用 transform 提高性能
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  public setOpacity(alpha: number) {
    this.element.style.opacity = alpha.toString();
  }

  public setActive(active: boolean) {
    this.element.style.display = active ? "block" : "none";
  }

  public destroy() {
    this.element.remove();
  }
}
