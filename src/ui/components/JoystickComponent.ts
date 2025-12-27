/**
 * 虚拟摇杆 UI 组件 (JoystickComponent)
 * 
 * 职责:
 * 1. 创建虚拟摇杆的 DOM 元素 (底座和摇杆)。
 * 2. 监听 Touch 事件，计算摇杆位置。
 */
export class JoystickComponent {
    private container: HTMLElement;
    private knob: HTMLElement;
    private base: HTMLElement;
    private touching: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private currentX: number = 0;
    private currentY: number = 0;
    private maxRadius: number = 50;

    public onMove: ((x: number, y: number) => void) | null = null;

    private boundMouseMove: (e: MouseEvent) => void;
    private boundMouseUp: (e: MouseEvent) => void;

    constructor() {
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseUp = this.onMouseUp.bind(this);

        // 创建 DOM 元素
        this.container = document.createElement('div');
        this.container.id = 'joystick-container';
        this.container.style.position = 'absolute';
        this.container.style.bottom = '8vmin';
        this.container.style.left = '8vmin';
        this.container.style.width = '25vmin';
        this.container.style.height = '25vmin';
        this.container.style.zIndex = '100';
        this.container.style.userSelect = 'none';
        this.container.style.touchAction = 'none';

        // 摇杆底座
        this.base = document.createElement('div');
        this.base.style.width = '100%';
        this.base.style.height = '100%';
        this.base.style.borderRadius = '50%';
        this.base.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.base.style.border = '0.4vmin solid rgba(255, 255, 255, 0.3)';
        this.container.appendChild(this.base);

        // 摇杆头部
        this.knob = document.createElement('div');
        this.knob.style.width = '10vmin';
        this.knob.style.height = '10vmin';
        this.knob.style.borderRadius = '50%';
        this.knob.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this.knob.style.position = 'absolute';
        this.knob.style.top = '50%';
        this.knob.style.left = '50%';
        this.knob.style.transform = 'translate(-50%, -50%)';
        this.container.appendChild(this.knob);

        document.body.appendChild(this.container);

        // 初始化最大半径 (基于初始大小)
        this.updateMaxRadius();
        window.addEventListener('resize', () => this.updateMaxRadius());

        // 绑定触摸事件
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

        // 绑定鼠标事件
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('mouseup', this.boundMouseUp);
    }

    private updateMaxRadius() {
        // 最大半径基于容器宽度的 40%
        if (this.container) {
            this.maxRadius = this.container.clientWidth * 0.4;
        }
    }

    public destroy() {
        this.container.remove();
        window.removeEventListener('mousemove', this.boundMouseMove);
        window.removeEventListener('mouseup', this.boundMouseUp);
    }

    private onTouchStart(e: TouchEvent) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.startDrag(touch.clientX, touch.clientY);
    }

    private onTouchMove(e: TouchEvent) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.updateDrag(touch.clientX, touch.clientY);
    }

    private onTouchEnd(e: TouchEvent) {
        e.preventDefault();
        this.endDrag();
    }

    private onMouseDown(e: MouseEvent) {
        e.preventDefault();
        this.startDrag(e.clientX, e.clientY);
    }

    private onMouseMove(e: MouseEvent) {
        if (this.touching) {
            e.preventDefault();
            this.updateDrag(e.clientX, e.clientY);
        }
    }

    private onMouseUp(e: MouseEvent) {
        if (this.touching) {
            e.preventDefault();
            this.endDrag();
        }
    }

    private startDrag(x: number, y: number) {
        this.touching = true;
        this.startX = x;
        this.startY = y;
        this.currentX = 0;
        this.currentY = 0;
        this.updateKnob();
    }

    private updateDrag(x: number, y: number) {
        const dx = x - this.startX;
        const dy = y - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.maxRadius) {
            const angle = Math.atan2(dy, dx);
            this.currentX = Math.cos(angle) * this.maxRadius;
            this.currentY = Math.sin(angle) * this.maxRadius;
        } else {
            this.currentX = dx;
            this.currentY = dy;
        }
        this.updateKnob();
    }

    private endDrag() {
        this.touching = false;
        this.currentX = 0;
        this.currentY = 0;
        this.updateKnob();
    }

    private updateKnob() {
        this.knob.style.transform = `translate(calc(-50% + ${this.currentX}px), calc(-50% + ${this.currentY}px))`;

        if (this.onMove) {
            // 直接线性映射：当前偏移 / 最大半径
            // 结果范围 [-1, 1]
            const x = this.currentX / this.maxRadius;
            const y = this.currentY / this.maxRadius;
            this.onMove(x, y);
        }
    }
}
