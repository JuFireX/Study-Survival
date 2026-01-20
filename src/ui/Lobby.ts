import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';
import { CharacterHandler } from './characterHandler';
import { SkillStand } from './SkillStand';
import { EquipmentStand } from './EquipmentStand';

export class Lobby {
    private app: pc.Application;
    private canvas: HTMLCanvasElement;
    private enterHandler: (() => void) | null = null;
    private characterHandler: (() => void) | null = null;
    private isVisible = false;
    private canEnterPortal = false;
    private canOpenCharacter = false;
    private boundPointerDown: (e: PointerEvent) => void;
    private portal: pc.Entity | null = null;
    private portalRadius = 2.2;
    private characterRadius = 1.8;
    private skillRadius = 1.8;
    private equipmentRadius = 1.8;
    private tempVec = new pc.Vec3();
    private characterModule: CharacterHandler;
    private skillStand: SkillStand;
    private equipmentStand: EquipmentStand;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.canvas = this.app.graphicsDevice.canvas as HTMLCanvasElement;
        this.boundPointerDown = this.onPointerDown.bind(this);
        this.canvas.addEventListener('pointerdown', this.boundPointerDown);
        this.characterModule = new CharacterHandler();
        this.skillStand = new SkillStand();
        this.equipmentStand = new EquipmentStand();
    }

    public setVisible(visible: boolean) {
        this.isVisible = visible;
        if (!visible) {
            this.setCharacterSelectVisible(false);
            this.skillStand.setPanelVisible(false);
            this.equipmentStand.setPanelVisible(false);
            return;
        }
        this.characterModule.ensureStand();
        this.skillStand.ensureStand();
        this.equipmentStand.ensureStand();
    }

    public setCharacterSelectVisible(visible: boolean) {
        this.characterModule.setSelectionVisible(visible);
    }

    public setActionState(canEnterPortal: boolean, canOpenCharacter: boolean) {
        this.canEnterPortal = canEnterPortal;
        this.canOpenCharacter = canOpenCharacter;
    }

    public setHandlers(onEnter: () => void, onCharacter: () => void) {
        this.enterHandler = onEnter;
        this.characterHandler = onCharacter;
    }

    private onPointerDown(e: PointerEvent) {
        if (!this.isVisible) return;
        if (this.characterModule.isSelectionVisible() || this.skillStand.isPanelVisible() || this.equipmentStand.isPanelVisible()) return;
        if ((e as MouseEvent).button !== undefined && (e as MouseEvent).button !== 0) return;

        const cameraEntity = GameContext.getInstance().getCamera();
        if (!cameraEntity || !cameraEntity.camera) return;

        const camera = cameraEntity.camera;
        const rect = this.canvas.getBoundingClientRect();
        const device = this.app.graphicsDevice;
        const x = (e.clientX - rect.left) * (device.width / rect.width);
        const y = (e.clientY - rect.top) * (device.height / rect.height);
        const from = camera.screenToWorld(x, y, camera.nearClip);
        const to = camera.screenToWorld(x, y, camera.farClip);
        const direction = to.sub(from).normalize();
        const ray = new pc.Ray(from, direction);

        const portal = this.getPortal();
        const stand = this.characterModule.getStand();
        const skillStand = this.skillStand.getStand();
        const equipmentStand = this.equipmentStand.getStand();
        const portalHit = portal && this.canEnterPortal ? this.raycastSphere(ray, portal.getPosition(), this.portalRadius) : null;
        const standHit = stand && this.canOpenCharacter ? this.raycastSphere(ray, stand.getPosition(), this.characterRadius) : null;
        const skillHit = skillStand ? this.raycastSphere(ray, skillStand.getPosition(), this.skillRadius) : null;
        const equipmentHit = equipmentStand ? this.raycastSphere(ray, equipmentStand.getPosition(), this.equipmentRadius) : null;

        const hits = [
            { distance: portalHit, handler: this.enterHandler },
            { distance: standHit, handler: this.characterHandler },
            { distance: skillHit, handler: () => this.skillStand.setPanelVisible(true) },
            { distance: equipmentHit, handler: () => this.equipmentStand.setPanelVisible(true) }
        ].filter(hit => hit.distance !== null).sort((a, b) => a.distance! - b.distance!);

        if (hits.length > 0) {
            hits[0].handler?.();
        }
    }

    private getPortal(): pc.Entity | null {
        if (this.portal && this.portal.parent) return this.portal;
        const found = this.app.root.findByName('LobbyPortal');
        this.portal = found instanceof pc.Entity ? found : null;
        return this.portal;
    }

    private raycastSphere(ray: pc.Ray, center: pc.Vec3, radius: number): number | null {
        const m = this.tempVec.copy(ray.origin).sub(center);
        const b = m.dot(ray.direction);
        const c = m.dot(m) - radius * radius;
        if (c > 0 && b > 0) return null;
        const discriminant = b * b - c;
        if (discriminant < 0) return null;
        const t = -b - Math.sqrt(discriminant);
        return t >= 0 ? t : 0;
    }

    public destroy() {
        this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
        this.characterModule.destroy();
        this.skillStand.destroy();
        this.equipmentStand.destroy();
    }
}
