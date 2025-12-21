import { GameConfig } from '../config/evolution';
import type { PlayerStats as IPlayerStats } from '../config/types';
import { EventBus } from '../core/EventBus';
import { GameContext } from '../core/GameContext';

type ChipKey = '攻击' | '暴击' | '护甲' | '移速' | '吸血' | '幸运';

export class HUD {
    private eventBus: EventBus;

    private root!: HTMLDivElement;

    private levelText!: HTMLDivElement;
    private nameText!: HTMLDivElement;

    private hpFill!: HTMLDivElement;
    private shieldSeg!: HTMLDivElement;
    private hpValueText!: HTMLSpanElement;
    private shieldValueText!: HTMLSpanElement;

    private expFill!: HTMLDivElement;
    private expValueText!: HTMLSpanElement;
    private expLevelText!: HTMLSpanElement;

    private chipValues: Record<ChipKey, HTMLSpanElement> = {} as Record<ChipKey, HTMLSpanElement>;

    private maxShield: number = 0;

    private level: number = 1;
    private currentExp: number = 0;
    private expToNextLevel: number = 100;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.createDOM();
        this.bindEvents();

        const expCfg = GameConfig.levelTable.find(l => l.level === 1);
        this.level = 1;
        this.currentExp = 0;
        this.expToNextLevel = expCfg?.expRequired ?? 100;

        this.applyStats(GameConfig.defaultPlayerStats);
        this.setHealth(GameConfig.defaultPlayerStats.currentHealth, GameConfig.defaultPlayerStats.maxHealth, GameConfig.defaultPlayerStats.tempShield);
        this.setExp(this.currentExp, this.expToNextLevel, this.level);

        this.trySyncFromPlayer(0);
    }

    public destroy() {
        this.eventBus.off('ui:updateHealth', this.onUpdateHealth, this);
        this.eventBus.off('ui:updateExp', this.onUpdateExp, this);
        this.eventBus.off('player:statsChanged', this.onStatsChanged, this);
        this.eventBus.off('player:levelUp', this.onLevelUp, this);
        this.root.remove();
    }

    private bindEvents() {
        this.eventBus.on('ui:updateHealth', this.onUpdateHealth, this);
        this.eventBus.on('ui:updateExp', this.onUpdateExp, this);
        this.eventBus.on('player:statsChanged', this.onStatsChanged, this);
        this.eventBus.on('player:levelUp', this.onLevelUp, this);
    }

    private onUpdateHealth = (current: number, max: number, shield: number) => {
        this.setHealth(current, max, shield);
    };

    private onUpdateExp = (currentExp: number, expToNext: number, level: number) => {
        this.currentExp = currentExp;
        this.expToNextLevel = expToNext;
        this.level = level;
        this.setExp(currentExp, expToNext, level);
        this.expLevelText.textContent = `Lv.${level}`;
        this.levelText.textContent = `${level}`;
    };

    private onStatsChanged = (stats: IPlayerStats) => {
        this.applyStats(stats);
        this.setHealth(stats.currentHealth, stats.maxHealth, stats.tempShield);
    };

    private onLevelUp = (level: number) => {
        this.level = level;
        this.expLevelText.textContent = `Lv.${level}`;
        this.levelText.textContent = `${level}`;

        const expCfg = GameConfig.levelTable.find(l => l.level === level);
        if (expCfg) {
            this.expToNextLevel = expCfg.expRequired;
            this.setExp(this.currentExp, this.expToNextLevel, this.level);
        }
    };

    private trySyncFromPlayer(attempt: number) {
        const player = GameContext.getInstance().getPlayer();
        const scripts = (player as any)?.script;
        const statsComp = scripts ? (scripts.get('playerStats') as any) : null;

        if (statsComp && statsComp.stats) {
            const stats = statsComp.stats as IPlayerStats;
            this.applyStats(stats);
            const lvl = typeof statsComp.level === 'number' ? statsComp.level : this.level;
            const cur = typeof statsComp.currentExp === 'number' ? statsComp.currentExp : this.currentExp;
            const next = typeof statsComp.expToNextLevel === 'number' ? statsComp.expToNextLevel : this.expToNextLevel;
            this.setExp(cur, next, lvl);
            this.expLevelText.textContent = `Lv.${lvl}`;
            this.levelText.textContent = `${lvl}`;
            this.setHealth(stats.currentHealth, stats.maxHealth, stats.tempShield);
            return;
        }

        if (attempt < 90) {
            window.requestAnimationFrame(() => this.trySyncFromPlayer(attempt + 1));
        }
    }

    private createDOM() {
        const existing = document.getElementById('hud-root');
        if (existing) existing.remove();

        this.ensureStyle();

        this.root = document.createElement('div');
        this.root.id = 'hud-root';
        this.root.className = 'hud-root';

        const leftPanel = document.createElement('div');
        leftPanel.className = 'hud-panel';

        const header = document.createElement('div');
        header.className = 'hud-header';

        const portrait = document.createElement('div');
        portrait.className = 'hud-portrait';

        this.levelText = document.createElement('div');
        this.levelText.className = 'hud-portrait-level';
        this.levelText.textContent = '1';
        portrait.appendChild(this.levelText);

        const titleWrap = document.createElement('div');
        titleWrap.className = 'hud-title-wrap';

        this.nameText = document.createElement('div');
        this.nameText.className = 'hud-name';
        this.nameText.textContent = 'Player';

        const subText = document.createElement('div');
        subText.className = 'hud-sub';
        subText.textContent = 'Status';

        titleWrap.appendChild(this.nameText);
        titleWrap.appendChild(subText);

        header.appendChild(portrait);
        header.appendChild(titleWrap);

        const hpWrap = document.createElement('div');
        hpWrap.className = 'hud-hp-wrap';

        const hpTop = document.createElement('div');
        hpTop.className = 'hud-bar-top';

        const hpLabel = document.createElement('span');
        hpLabel.className = 'hud-bar-label';
        hpLabel.textContent = 'HP';

        const hpValue = document.createElement('span');
        hpValue.className = 'hud-bar-value';

        this.hpValueText = document.createElement('span');
        this.hpValueText.textContent = '0/0';

        this.shieldValueText = document.createElement('span');
        this.shieldValueText.className = 'hud-shield-value';
        this.shieldValueText.textContent = '';

        hpValue.appendChild(this.hpValueText);
        hpValue.appendChild(this.shieldValueText);

        hpTop.appendChild(hpLabel);
        hpTop.appendChild(hpValue);

        const hpBar = document.createElement('div');
        hpBar.className = 'hud-bar';

        const hpBg = document.createElement('div');
        hpBg.className = 'hud-bar-bg';

        this.hpFill = document.createElement('div');
        this.hpFill.className = 'hud-bar-fill hud-bar-fill-hp';

        this.shieldSeg = document.createElement('div');
        this.shieldSeg.className = 'hud-bar-fill hud-bar-fill-shield';

        hpBg.appendChild(this.hpFill);
        hpBg.appendChild(this.shieldSeg);
        hpBar.appendChild(hpBg);

        hpWrap.appendChild(hpTop);
        hpWrap.appendChild(hpBar);

        const chips = document.createElement('div');
        chips.className = 'hud-chips';

        this.chipValues['攻击'] = this.createChip(chips, '攻击');
        this.chipValues['暴击'] = this.createChip(chips, '暴击');
        this.chipValues['护甲'] = this.createChip(chips, '护甲');
        this.chipValues['移速'] = this.createChip(chips, '移速');
        this.chipValues['吸血'] = this.createChip(chips, '吸血');
        this.chipValues['幸运'] = this.createChip(chips, '幸运');

        leftPanel.appendChild(header);
        leftPanel.appendChild(hpWrap);
        leftPanel.appendChild(chips);

        const expPanel = document.createElement('div');
        expPanel.className = 'hud-exp';

        const expTop = document.createElement('div');
        expTop.className = 'hud-exp-top';

        this.expLevelText = document.createElement('span');
        this.expLevelText.className = 'hud-exp-level';
        this.expLevelText.textContent = 'Lv.1';

        this.expValueText = document.createElement('span');
        this.expValueText.className = 'hud-exp-value';
        this.expValueText.textContent = '0/0';

        expTop.appendChild(this.expLevelText);
        expTop.appendChild(this.expValueText);

        const expBar = document.createElement('div');
        expBar.className = 'hud-exp-bar';

        const expBg = document.createElement('div');
        expBg.className = 'hud-exp-bg';

        this.expFill = document.createElement('div');
        this.expFill.className = 'hud-exp-fill';

        expBg.appendChild(this.expFill);
        expBar.appendChild(expBg);

        expPanel.appendChild(expTop);
        expPanel.appendChild(expBar);

        this.root.appendChild(leftPanel);
        this.root.appendChild(expPanel);

        document.body.appendChild(this.root);
    }

    private ensureStyle() {
        const styleId = 'hud-styles';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
#hud-root.hud-root{
  position:absolute;
  inset:0;
  z-index:950;
  pointer-events:none;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "PingFang SC";
  color:rgba(255,255,255,.92);
}

#hud-root .hud-panel{
  position:absolute;
  left:50%;
  bottom:62px;
  transform:translateX(-50%);
  width:min(480px, calc(100vw - 40px));
  padding:10px 10px 8px;
  background:linear-gradient(180deg, rgba(18,18,24,.78), rgba(10,10,14,.55));
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 10px 30px rgba(0,0,0,.35);
  border-radius:14px;
  backdrop-filter: blur(10px);
}

#hud-root .hud-header{
  display:flex;
  gap:10px;
  align-items:center;
  margin-bottom:10px;
}

#hud-root .hud-portrait{
  width:40px;
  height:40px;
  border-radius:12px;
  background:radial-gradient(circle at 30% 20%, rgba(255,255,255,.18), rgba(255,255,255,0) 55%),
             linear-gradient(145deg, rgba(120,110,255,.55), rgba(45,200,255,.25));
  border:1px solid rgba(255,255,255,.12);
  position:relative;
  overflow:hidden;
}

#hud-root .hud-portrait-level{
  position:absolute;
  inset:auto 6px 6px auto;
  min-width:18px;
  padding:2px 6px;
  border-radius:999px;
  background:rgba(0,0,0,.5);
  border:1px solid rgba(255,255,255,.12);
  font-weight:700;
  font-size:12px;
  text-align:center;
}

#hud-root .hud-title-wrap{flex:1;min-width:0;}
#hud-root .hud-name{font-size:13px;font-weight:800;letter-spacing:.2px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#hud-root .hud-sub{font-size:11px;color:rgba(255,255,255,.65);margin-top:2px;}

#hud-root .hud-hp-wrap{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;}
#hud-root .hud-bar-top{display:flex;justify-content:space-between;align-items:baseline;}
#hud-root .hud-bar-label{font-size:12px;font-weight:800;color:rgba(255,255,255,.72);letter-spacing:.6px;}
#hud-root .hud-bar-value{font-size:12px;color:rgba(255,255,255,.85);display:flex;gap:8px;align-items:baseline;}
#hud-root .hud-shield-value{color:rgba(120,230,255,.95);font-weight:700;}

#hud-root .hud-bar{height:10px;border-radius:999px;overflow:hidden;}
#hud-root .hud-bar-bg{
  height:100%;
  width:100%;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10);
  border-radius:999px;
  position:relative;
}

#hud-root .hud-bar-fill{
  height:100%;
  position:absolute;
  left:0;
  top:0;
  width:0%;
  transition: width 140ms ease-out, left 140ms ease-out;
  border-radius:999px;
}

#hud-root .hud-bar-fill-hp{
  background:linear-gradient(90deg, rgba(255,70,70,.95), rgba(255,140,70,.92));
  box-shadow: 0 0 12px rgba(255,70,70,.18);
}

#hud-root .hud-bar-fill-shield{
  background:linear-gradient(90deg, rgba(70,220,255,.9), rgba(160,120,255,.85));
  box-shadow: 0 0 12px rgba(70,220,255,.14);
  opacity:.95;
}

#hud-root.hud-danger .hud-bar-fill-hp{
  background:linear-gradient(90deg, rgba(255,50,50,1), rgba(255,50,50,.75));
  box-shadow: 0 0 16px rgba(255,50,50,.22);
}

#hud-root .hud-chips{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:6px;
}

#hud-root .hud-chip{
  padding:5px 7px;
  border-radius:10px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);
  display:flex;
  justify-content:space-between;
  gap:10px;
}

#hud-root .hud-chip-k{
  font-size:10px;
  font-weight:800;
  color:rgba(255,255,255,.62);
  letter-spacing:.6px;
}
#hud-root .hud-chip-v{
  font-size:10px;
  font-weight:800;
  color:rgba(255,255,255,.92);
}

#hud-root .hud-exp{
  position:absolute;
  left:50%;
  bottom:14px;
  transform:translateX(-50%);
  width:min(480px, calc(100vw - 40px));
  padding:8px 10px;
  background:linear-gradient(180deg, rgba(18,18,24,.68), rgba(10,10,14,.42));
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 10px 30px rgba(0,0,0,.30);
  border-radius:14px;
  backdrop-filter: blur(10px);
}

#hud-root .hud-exp-top{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  margin-bottom:6px;
}

#hud-root .hud-exp-level{
  font-size:12px;
  font-weight:900;
  color:rgba(255,255,255,.85);
  letter-spacing:.4px;
}
#hud-root .hud-exp-value{
  font-size:12px;
  color:rgba(255,255,255,.75);
  font-weight:800;
}

#hud-root .hud-exp-bar{height:8px;border-radius:999px;overflow:hidden;}
#hud-root .hud-exp-bg{
  height:100%;
  width:100%;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.10);
  border-radius:999px;
  position:relative;
}
#hud-root .hud-exp-fill{
  position:absolute;
  left:0;top:0;
  height:100%;
  width:0%;
  transition: width 160ms ease-out;
  background:linear-gradient(90deg, rgba(120,255,180,.95), rgba(70,200,255,.85));
  box-shadow: 0 0 14px rgba(70,220,255,.16);
  border-radius:999px;
}
        `;
        document.head.appendChild(style);
    }

    private createChip(container: HTMLElement, key: ChipKey): HTMLSpanElement {
        const chip = document.createElement('div');
        chip.className = 'hud-chip';

        const k = document.createElement('span');
        k.className = 'hud-chip-k';
        k.textContent = key;

        const v = document.createElement('span');
        v.className = 'hud-chip-v';
        v.textContent = '-';

        chip.appendChild(k);
        chip.appendChild(v);

        container.appendChild(chip);
        return v;
    }

    private applyStats(stats: IPlayerStats) {
        this.maxShield = Math.max(0, stats.maxShield ?? 0);

        const atk = (stats.baseDamage ?? 0) * (stats.damageMultiplier ?? 1);
        this.chipValues['攻击'].textContent = this.formatNumber(atk);

        const critRate = Math.max(0, Math.min(1, stats.critRate ?? 0));
        const critMult = stats.critMultiplier ?? 1;
        this.chipValues['暴击'].textContent = `${Math.round(critRate * 100)}% x${this.formatNumber(critMult)}`;

        this.chipValues['护甲'].textContent = this.formatNumber(stats.armor ?? 0);
        this.chipValues['移速'].textContent = this.formatNumber(stats.moveSpeed ?? 0);

        const ls = Math.max(0, stats.lifesteal ?? 0);
        this.chipValues['吸血'].textContent = `${Math.round(ls * 100)}%`;

        this.chipValues['幸运'].textContent = this.formatNumber(stats.luck ?? 0);
    }

    private setHealth(current: number, max: number, shield: number) {
        const safeMax = Math.max(1, max);
        const safeCur = Math.max(0, current);

        const shieldMax = Math.max(0, this.maxShield, shield);
        const totalMax = shieldMax > 0 ? safeMax + shieldMax : safeMax;

        const healthPct = this.clamp01(safeCur / totalMax);
        const shieldPct = shieldMax > 0 ? this.clamp01(shield / totalMax) : 0;

        const healthWidth = `${healthPct * 100}%`;
        this.hpFill.style.width = healthWidth;

        if (shieldPct > 0) {
            this.shieldSeg.style.display = 'block';
            this.shieldSeg.style.left = healthWidth;
            this.shieldSeg.style.width = `${shieldPct * 100}%`;
        } else {
            this.shieldSeg.style.display = 'none';
            this.shieldSeg.style.left = '0%';
            this.shieldSeg.style.width = '0%';
        }

        this.hpValueText.textContent = `${Math.round(safeCur)}/${Math.round(safeMax)}`;
        this.shieldValueText.textContent = shield > 0 ? `+${Math.round(shield)}` : '';

        const rawHealthPct = safeCur / safeMax;
        if (rawHealthPct <= 0.3) this.root.classList.add('hud-danger');
        else this.root.classList.remove('hud-danger');
    }

    private setExp(currentExp: number, expToNext: number, level: number) {
        const safeNext = Math.max(1, expToNext);
        const safeCur = Math.max(0, currentExp);
        const pct = this.clamp01(safeCur / safeNext);

        this.expFill.style.width = `${pct * 100}%`;
        this.expValueText.textContent = `${Math.floor(safeCur)}/${Math.floor(safeNext)}`;
        this.expLevelText.textContent = `Lv.${level}`;
    }

    private clamp01(v: number) {
        if (v < 0) return 0;
        if (v > 1) return 1;
        return v;
    }

    private formatNumber(v: number) {
        const abs = Math.abs(v);
        if (abs >= 100) return `${Math.round(v)}`;
        return `${Math.round(v * 10) / 10}`;
    }
}