import { Card } from '../data/types';

export class SkillSelectUI {
    private container!: HTMLElement;
    private onSelectCallback: ((card: Card | null) => void) | null = null;

    constructor() {
        this.createDOM();
    }

    private createDOM() {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.display = 'none';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.flexDirection = 'column';
        this.container.style.zIndex = '100';

        const title = document.createElement('h1');
        title.textContent = 'Level Up! Choose a Card';
        title.style.color = 'white';
        title.style.marginBottom = '20px';
        this.container.appendChild(title);

        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'cards-container';
        cardsContainer.style.display = 'flex';
        cardsContainer.style.gap = '20px';
        this.container.appendChild(cardsContainer);

        const skipBtn = document.createElement('button');
        skipBtn.textContent = 'Skip';
        skipBtn.style.marginTop = '20px';
        skipBtn.style.padding = '10px 20px';
        skipBtn.onclick = () => {
            if (this.onSelectCallback) this.onSelectCallback(null);
            this.hide();
        };
        this.container.appendChild(skipBtn);

        document.body.appendChild(this.container);
    }

    public show(cards: Card[], callback: (card: Card | null) => void) {
        this.onSelectCallback = callback;
        const cardsContainer = this.container.querySelector('#cards-container') as HTMLElement;
        cardsContainer.innerHTML = '';

        cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.style.width = '200px';
            cardEl.style.height = '300px';
            cardEl.style.backgroundColor = '#333';
            cardEl.style.border = '2px solid #fff';
            cardEl.style.borderRadius = '10px';
            cardEl.style.padding = '10px';
            cardEl.style.cursor = 'pointer';
            cardEl.style.display = 'flex';
            cardEl.style.flexDirection = 'column';
            cardEl.style.alignItems = 'center';
            cardEl.style.color = 'white';

            cardEl.innerHTML = `
                <h3>${card.name}</h3>
                <p style="font-size: 12px; color: #aaa;">${card.type} - ${card.rarity}</p>
                <p>${card.description}</p>
            `;

            cardEl.onclick = () => {
                if (this.onSelectCallback) this.onSelectCallback(card);
                this.hide();
            };

            // Hover effect
            cardEl.onmouseenter = () => cardEl.style.backgroundColor = '#444';
            cardEl.onmouseleave = () => cardEl.style.backgroundColor = '#333';

            cardsContainer.appendChild(cardEl);
        });

        this.container.style.display = 'flex';
    }

    public hide() {
        this.container.style.display = 'none';
    }
}
