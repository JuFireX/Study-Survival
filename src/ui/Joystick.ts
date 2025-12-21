/**
 * 虚拟摇杆
 * 提供触摸和鼠标输入的模拟摇杆，用于控制角色移动。
 */
export class Joystick {
    private container: HTMLElement;
    private knob: HTMLElement;
    private base: HTMLElement;
    private touching: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private currentX: number = 0;
    private currentY: number = 0;
    private maxRadius: number = 50;

    // 对外暴露的输入值 (-1 到 1)
    public value = { x: 0, y: 0 };

    constructor() {
        // 创建 DOM 元素
        this.container = document.createElement('div');
        this.container.id = 'joystick-container';
        this.container.style.position = 'absolute';
        this.container.style.bottom = '50px';
        this.container.style.left = '50px';
        this.container.style.width = '120px';
        this.container.style.height = '120px';
        this.container.style.zIndex = '100';
        this.container.style.userSelect = 'none';
        this.container.style.touchAction = 'none';

        // 摇杆底座
        this.base = document.createElement('div');
        this.base.style.width = '100%';
        this.base.style.height = '100%';
        this.base.style.borderRadius = '50%';
        this.base.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.base.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        this.container.appendChild(this.base);

        // 摇杆头部
        this.knob = document.createElement('div');
        this.knob.style.width = '50px';
        this.knob.style.height = '50px';
        this.knob.style.borderRadius = '50%';
        this.knob.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this.knob.style.position = 'absolute';
        this.knob.style.top = '50%';
        this.knob.style.left = '50%';
        this.knob.style.transform = 'translate(-50%, -50%)';
        this.container.appendChild(this.knob);

        document.body.appendChild(this.container);

        // 绑定触摸事件
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

        // 绑定鼠标事件（用于桌面测试）
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
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

        // 归一化输出 (-1 到 1)
        this.value.x = this.currentX / this.maxRadius;
        this.value.y = this.currentY / this.maxRadius;
    }
}
