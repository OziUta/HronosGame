class TimeChroniclesGame {
    constructor() {
        this.currentScreen = 'loading';
        this.currentLevel = 0;
        this.playerState = {
            chronoEnergy: 100,
            stability: 100,
            knowledge: 0,
            unlockedTools: ['rewind']
        };
        this.gameState = {
            currentTimeline: 'main',
            timelines: new Map(),
            activeParadoxes: [],
            usedActions: []
        };
        
        // Отложим инициализацию до полной загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Инициализация игры...');
        
        try {
            this.setupEventListeners();
            this.showScreen('loading');
            
            // Имитация загрузки
            setTimeout(() => {
                this.loadGame();
                this.showScreen('mainMenu');
                console.log('Игра успешно загружена');
            }, 2000);
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        }
    }

    setupEventListeners() {
        console.log('Настройка обработчиков событий...');
        
        try {
            // Кнопки меню
            document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
            document.getElementById('continueBtn').addEventListener('click', () => this.continueGame());
            document.getElementById('levelsBtn').addEventListener('click', () => this.showLevels());
            
            // Игровые кнопки
            document.getElementById('menuBtn').addEventListener('click', () => this.showScreen('mainMenu'));
            document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
            document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
            
            // Инструменты времени
            document.getElementById('rewindBtn').addEventListener('click', () => this.useTool('rewind'));
            document.getElementById('branchBtn').addEventListener('click', () => this.useTool('branch'));
            document.getElementById('mergeBtn').addEventListener('click', () => this.useTool('merge'));
            document.getElementById('fixBtn').addEventListener('click', () => this.useTool('fix'));
            
            // Кнопки завершения уровня
            document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
            document.getElementById('menuBackBtn').addEventListener('click', () => this.showScreen('mainMenu'));
            
            console.log('Все обработчики установлены');
        } catch (error) {
            console.error('Ошибка настройки обработчиков:', error);
        }
    }

    showScreen(screenName) {
        console.log('Переключение на экран:', screenName);
        
        try {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = document.getElementById(screenName + 'Screen');
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenName;
            } else {
                console.error('Экран не найден:', screenName);
            }
        } catch (error) {
            console.error('Ошибка переключения экрана:', error);
        }
    }

    startNewGame() {
        console.log('Начало новой игры');
        this.playerState = {
            chronoEnergy: 100,
            stability: 100,
            knowledge: 0,
            unlockedTools: ['rewind']
        };
        this.currentLevel = 0;
        this.startLevel(0);
    }

    continueGame() {
        console.log('Продолжение игры');
        const saved = this.loadFromStorage();
        if (saved) {
            this.playerState = saved.playerState;
            this.currentLevel = saved.currentLevel;
            this.startLevel(this.currentLevel);
        } else {
            console.log('Сохранение не найдено, начинаем новую игру');
            this.startNewGame();
        }
    }

    startLevel(levelIndex) {
        console.log('Загрузка уровня:', levelIndex);
        
        try {
            this.currentLevel = levelIndex;
            const level = gameLevels[levelIndex];
            
            if (!level) {
                console.error('Уровень не найден:', levelIndex);
                this.showScreen('mainMenu');
                return;
            }

            this.gameState = {
                currentTimeline: 'main',
                timelines: new Map([['main', this.createTimeline('main', level.initialState)]]),
                activeParadoxes: [],
                usedActions: []
            };

            this.updateGameDisplay();
            this.showScreen('gameScreen');
            console.log('Уровень успешно загружен');
        } catch (error) {
            console.error('Ошибка загрузки уровня:', error);
        }
    }

    createTimeline(id, initialState) {
        return {
            id: id,
            objects: JSON.parse(JSON.stringify(initialState)),
            stability: 100,
            createdActions: []
        };
    }

    useTool(toolName) {
        console.log('Использование инструмента:', toolName);
        
        try {
            if (!this.playerState.unlockedTools.includes(toolName)) {
                this.showMessage(`Инструмент "${toolName}" еще не разблокирован!`);
                return;
            }

            const cost = actionCosts[toolName];
            if (this.playerState.chronoEnergy < cost) {
                this.showMessage("Недостаточно хроно-энергии!");
                return;
            }

            this.playerState.chronoEnergy -= cost;
            this.gameState.usedActions.push(toolName);

            switch (toolName) {
                case 'rewind':
                    this.rewindTime();
                    break;
                case 'branch':
                    this.createTimelineBranch();
                    break;
                case 'merge':
                    this.mergeTimelines();
                    break;
                case 'fix':
                    this.fixParadox();
                    break;
            }

            this.checkLevelCompletion();
            this.updateGameDisplay();
        } catch (error) {
            console.error('Ошибка использования инструмента:', error);
        }
    }

    rewindTime() {
        const currentTimeline = this.gameState.timelines.get(this.gameState.currentTimeline);
        this.showMessage("Перемотка времени... Прошлое изменено!");
        
        // Создаем парадокс при перемотке
        this.createParadox("Временная аномалия: объект существует в двух состояниях одновременно");
    }

    createTimelineBranch() {
        const branchId = 'branch_' + Date.now();
        const currentTimeline = this.gameState.timelines.get(this.gameState.currentTimeline);
        
        const branchTimeline = this.createTimeline(branchId, currentTimeline.objects);
        branchTimeline.objects.flower.present = "Полит в альтернативной реальности";
        
        this.gameState.timelines.set(branchId, branchTimeline);
        this.showMessage(`Создана альтернативная временная линия: ${branchId}`);
        
        this.createParadox("Парадокс ветвления: конфликтующие реальности");
    }

    mergeTimelines() {
        const branches = Array.from(this.gameState.timelines.keys()).filter(id => id !== 'main');
        if (branches.length === 0) {
            this.showMessage("Нет альтернативных линий для слияния!");
            return;
        }

        const branchToMerge = branches[0];
        const mainTimeline = this.gameState.timelines.get('main');
        const branchTimeline = this.gameState.timelines.get(branchToMerge);

        // Объединяем состояния
        mainTimeline.objects.flower.present = "Расцветший (после слияния)";
        mainTimeline.objects.water.present = "Пустая (после слияния)";
        
        this.gameState.timelines.delete(branchToMerge);
        this.showMessage("Временные линии успешно объединены!");

        // Проверяем разрешение парадоксов
        this.resolveParadoxes();
    }

    fixParadox() {
        if (this.gameState.activeParadoxes.length === 0) {
            this.showMessage("Нет активных парадоксов для фиксации!");
            return;
        }

        const paradox = this.gameState.activeParadoxes[0];
        paradox.resolved = true;
        this.playerState.stability = Math.min(100, this.playerState.stability + 10);
        
        this.showMessage("Парадокс зафиксирован! Стабильность восстановлена.");
    }

    createParadox(description) {
        this.gameState.activeParadoxes.push({
            id: Date.now(),
            description: description,
            resolved: false
        });
        this.playerState.stability = Math.max(0, this.playerState.stability - 15);
    }

    resolveParadoxes() {
        // Автоматическое разрешение парадоксов при правильных действиях
        const currentLevel = gameLevels[this.currentLevel];
        const mainTimeline = this.gameState.timelines.get('main');
        
        if (mainTimeline.objects.flower.present.includes("Расцветший") && 
            mainTimeline.objects.water.present.includes("Пустая")) {
            this.gameState.activeParadoxes = this.gameState.activeParadoxes.map(p => ({
                ...p,
                resolved: true
            }));
        }
    }

    checkLevelCompletion() {
        const currentLevel = gameLevels[this.currentLevel];
        const mainTimeline = this.gameState.timelines.get('main');
        
        // Проверяем условия завершения уровня
        const flowerCorrect = mainTimeline.objects.flower.present.includes("Расцветший");
        const waterCorrect = mainTimeline.objects.water.present.includes("Пустая");
        const paradoxesResolved = this.gameState.activeParadoxes.every(p => p.resolved);
        const stabilityOk = this.playerState.stability >= 50;

        if (flowerCorrect && waterCorrect && paradoxesResolved && stabilityOk) {
            this.completeLevel();
        }
    }

    completeLevel() {
        console.log('Завершение уровня:', this.currentLevel);
        
        try {
            const level = gameLevels[this.currentLevel];
            this.playerState.knowledge += level.rewards.knowledge;
            
            if (level.rewards.unlockTool && !this.playerState.unlockedTools.includes(level.rewards.unlockTool)) {
                this.playerState.unlockedTools.push(level.rewards.unlockTool);
            }

            // Обновляем статистику на экране завершения
            document.getElementById('timeSpent').textContent = 100 - this.playerState.chronoEnergy;
            document.getElementById('stabilitySaved').textContent = this.playerState.stability;
            document.getElementById('knowledgeGained').textContent = level.rewards.knowledge;

            this.saveToStorage();
            this.showScreen('levelCompleteScreen');
        } catch (error) {
            console.error('Ошибка завершения уровня:', error);
        }
    }

    nextLevel() {
        console.log('Переход к следующему уровню');
        this.currentLevel++;
        if (this.currentLevel >= gameLevels.length) {
            this.showMessage("Поздравляем! Вы прошли все уровни!");
            this.showScreen('mainMenu');
        } else {
            this.startLevel(this.currentLevel);
        }
    }

    updateGameDisplay() {
        try {
            // Обновляем ресурсы
            document.getElementById('chronoEnergy').textContent = this.playerState.chronoEnergy;
            document.getElementById('stability').textContent = this.playerState.stability + '%';
            document.getElementById('knowledge').textContent = this.playerState.knowledge;
            document.getElementById('currentLevel').textContent = this.currentLevel + 1;

            // Обновляем стабильность
            document.getElementById('stabilityValue').textContent = this.playerState.stability;
            document.getElementById('stabilityFill').style.width = this.playerState.stability + '%';

            // Обновляем инструменты
            this.updateToolsDisplay();

            // Обновляем временные линии
            this.updateTimelinesDisplay();

            // Обновляем игровой мир
            this.updateWorldDisplay();

            // Обновляем парадоксы
            this.updateParadoxesDisplay();
        } catch (error) {
            console.error('Ошибка обновления дисплея:', error);
        }
    }

    updateToolsDisplay() {
        const tools = document.querySelectorAll('.time-tool');
        tools.forEach(tool => {
            const toolName = tool.id.replace('Btn', '');
            const cost = actionCosts[toolName];
            const isUnlocked = this.playerState.unlockedTools.includes(toolName);
            const canAfford = this.playerState.chronoEnergy >= cost;

            tool.disabled = !isUnlocked || !canAfford;
        });
    }

    updateTimelinesDisplay() {
        try {
            const mainPoints = document.getElementById('mainTimePoints');
            const branchContainer = document.getElementById('branchTimelines');
            
            // Основная временная линия
            if (mainPoints) {
                mainPoints.innerHTML = `
                    <div class="time-point active">
                        <strong>Настоящее</strong>
                        <div>Стабильность: ${this.playerState.stability}%</div>
                    </div>
                `;
            }

            // Альтернативные линии
            if (branchContainer) {
                branchContainer.innerHTML = '';
                this.gameState.timelines.forEach((timeline, id) => {
                    if (id !== 'main') {
                        const branchEl = document.createElement('div');
                        branchEl.className = 'branch-timeline';
                        branchEl.innerHTML = `
                            <div class="timeline-label">Линия: ${id}</div>
                            <div class="time-point">
                                <strong>Альтернативное настоящее</strong>
                                <div>Стабильность: ${timeline.stability}%</div>
                            </div>
                        `;
                        branchContainer.appendChild(branchEl);
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка обновления временных линий:', error);
        }
    }

    updateWorldDisplay() {
        try {
            const level = gameLevels[this.currentLevel];
            const currentTimeline = this.gameState.timelines.get(this.gameState.currentTimeline);
            
            if (document.getElementById('puzzleTitle')) {
                document.getElementById('puzzleTitle').textContent = level.title;
                document.getElementById('puzzleDescription').textContent = level.description;
            }

            const worldState = document.getElementById('worldState');
            if (worldState) {
                worldState.innerHTML = '';

                Object.values(currentTimeline.objects).forEach(obj => {
                    const objEl = document.createElement('div');
                    objEl.className = 'world-object';
                    objEl.innerHTML = `
                        <div class="object-info">
                            <strong>${obj.name}</strong>
                        </div>
                        <div class="object-state">
                            <span class="state-indicator state-present">${obj.present}</span>
                        </div>
                    `;
                    worldState.appendChild(objEl);
                });
            }
        } catch (error) {
            console.error('Ошибка обновления игрового мира:', error);
        }
    }

    updateParadoxesDisplay() {
        try {
            const paradoxList = document.getElementById('paradoxList');
            if (paradoxList) {
                paradoxList.innerHTML = '';

                this.gameState.activeParadoxes.forEach(paradox => {
                    const paradoxEl = document.createElement('div');
                    paradoxEl.className = `paradox-item ${paradox.resolved ? 'resolved' : ''}`;
                    paradoxEl.textContent = paradox.description;
                    paradoxList.appendChild(paradoxEl);
                });
            }
        } catch (error) {
            console.error('Ошибка обновления парадоксов:', error);
        }
    }

    showMessage(message) {
        // Простая система сообщений
        console.log('Сообщение:', message);
        alert(message);
    }

    showHint() {
        const level = gameLevels[this.currentLevel];
        const hint = `Подсказка: ${level.solution.requiredActions.join(', ')}`;
        this.showMessage(hint);
    }

    resetLevel() {
        console.log('Сброс уровня');
        this.startLevel(this.currentLevel);
    }

    showLevels() {
        this.showMessage("Выберите уровень для игры (в разработке)");
    }

    saveToStorage() {
        const saveData = {
            playerState: this.playerState,
            currentLevel: this.currentLevel,
            timestamp: Date.now()
        };
        localStorage.setItem('timeChroniclesSave', JSON.stringify(saveData));
        console.log('Игра сохранена');
    }

    loadFromStorage() {
        const saved = localStorage.getItem('timeChroniclesSave');
        if (saved) {
            console.log('Загрузка сохранения');
            return JSON.parse(saved);
        }
        console.log('Сохранение не найдено');
        return null;
    }

    loadGame() {
        const saved = this.loadFromStorage();
        if (saved) {
            this.playerState = saved.playerState;
            this.currentLevel = saved.currentLevel;
            console.log('Игра загружена из сохранения');
        } else {
            console.log('Новое сохранение создано');
        }
    }
}

// Запуск игры
console.log('Загрузка игры Хроники Парадокса...');
window.game = new TimeChroniclesGame();
