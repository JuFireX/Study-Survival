import * as pc from 'playcanvas';
import { GameConfig } from '../../../config/evolution';
import { PlayerStats as IPlayerStats } from '../../../config/types';

export class PlayerStats extends pc.ScriptType {
    public stats!: IPlayerStats;

    // Leveling
    public level: number = 1;
    public currentExp: number = 0;
    public expToNextLevel: number = 100;

    initialize() {
        // Deep copy default stats
        this.stats = JSON.parse(JSON.stringify(GameConfig.defaultPlayerStats));
        this.updateLevelRequirements();
    }

    updateLevelRequirements() {
        const config = GameConfig.levelTable.find(l => l.level === this.level);
        if (config) {
            this.expToNextLevel = config.expRequired;
        } else {
            // Fallback for high levels
            this.expToNextLevel = Math.floor(100 * Math.pow(1.2, this.level - 1));
        }
    }
}
