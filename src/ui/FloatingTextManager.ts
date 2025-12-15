import * as pc from 'playcanvas';

export class FloatingTextManager {
    app: pc.Application;
    container: HTMLElement;
    camera: pc.Entity | null = null;

    constructor(app: pc.Application) {
        this.app = app;
        this.container = document.createElement('div');
        this.container.id = 'floating-text-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.overflow = 'hidden';
        this.container.style.zIndex = '900'; // Below Joystick/UI
        document.body.appendChild(this.container);
    }
    
    setCamera(camera: pc.Entity) {
        this.camera = camera;
    }

    spawn(text: string, worldPos: pc.Vec3, color: string = 'white') {
        if (!this.camera) return;

        const screenPos = new pc.Vec3();
        this.camera.camera!.worldToScreen(worldPos, screenPos);
        
        // If behind camera z might be negative? In PC worldToScreen returns screen coords.
        // It doesn't explicitly return z depth usually in x/y, but z component might indicate depth.
        // PC docs: "z is the distance from the camera in world units."
        if (screenPos.z < 0) return; 

        const el = document.createElement('div');
        el.textContent = text;
        el.style.position = 'absolute';
        el.style.left = `${screenPos.x}px`;
        el.style.top = `${screenPos.y}px`;
        el.style.color = color;
        el.style.fontSize = '24px';
        el.style.fontWeight = 'bold';
        el.style.textShadow = '2px 2px 0 #000';
        el.style.transition = 'top 1s ease-out, opacity 1s ease-out';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.opacity = '1';
        
        this.container.appendChild(el);

        // Force reflow
        el.offsetHeight;

        // Animate
        el.style.top = `${screenPos.y - 100}px`;
        el.style.opacity = '0';

        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    }
}
