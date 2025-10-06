// Telegram Web App интеграция
const tg = window.Telegram.WebApp;

// Глобальные переменные
let currentScreen = 'loadingScreen';
let gameState = {
    size: 0,
    currentNumber: 1,
    startTime: 0,
    timer: null,
    errors: 0,
    numbers: []
};

// Статистика
let statistics = JSON.parse(localStorage.getItem('schulteStats')) || {
    gamesPlayed: 0,
    bestTimes: {},
    totalErrors: 0,
    totalTime: 0
};

// Инициализация Telegram Web App
function initTelegramApp() {
    tg.expand();
    tg.enableClosingConfirmation();
    tg.BackButton.hide();
    
    // Устанавливаем цвета в соответствии с темой Telegram
    updateTheme();
    
    // Слушаем события Telegram
    tg.onEvent('themeChanged', updateTheme);
    tg.onEvent('viewportChanged', handleViewportChange);
}

// Обновление темы
function updateTheme() {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');
}

// Обработка изменения viewport
function handleViewportChange() {
    console.log('Viewport changed:', tg.viewportHeight);
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    initTelegramApp();
    showScreen('loadingScreen');
    simulateLoading();
});

// Имитация загрузки
function simulateLoading() {
    const progress = document.querySelector('.loading-progress');
    let width = 0;
    
    const interval = setInterval(() => {
        width += 2;
        progress.style.width = width + '%';
        
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => showScreen('mainMenu'), 300);
        }
    }, 20);
}

// Переключение экранов
function showScreen(screenId) {
    console.log('Switching to screen:', screenId);
    
    document.getElementById(currentScreen).classList.remove('active');
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    // Показываем/скрываем кнопку назад в Telegram
    if (screenId === 'mainMenu') {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBackButton);
    }
    
    // Обновляем контент при необходимости
    if (screenId === 'statsScreen') {
        updateStatsDisplay();
    }
    
    // Тактильная отдача
    tg.HapticFeedback.impactOccurred('soft');
}

// Обработка кнопки назад
function handleBackButton() {
    console.log('Back button pressed on screen:', currentScreen);
    
    if (currentScreen === 'gameScreen') {
        handleExitButton();
    } else if (currentScreen === 'difficultyScreen' || 
               currentScreen === 'aboutScreen' || 
               currentScreen === 'statsScreen' ||
               currentScreen === 'resultsScreen') {
        showScreen('mainMenu');
    }
}

// Начало игры
function startGame(size) {
    console.log('Starting game with size:', size);
    
    gameState = {
        size: size,
        currentNumber: 1,
        startTime: 0,
        timer: null,
        errors: 0,
        numbers: generateNumbers(size * size)
    };
    
    createGameBoard(size);
    showScreen('gameScreen');
    startTimer();
    tg.HapticFeedback.impactOccurred('light');
}

// Генерация чисел
function generateNumbers(count) {
    const numbers = Array.from({length: count}, (_, i) => i + 1);
    return shuffleArray(numbers);
}

// Перемешивание массива
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Создание игрового поля
function createGameBoard(size) {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    board.className = `game-board size-${size}`;
    
    gameState.numbers.forEach(number => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = number;
        cell.onclick = () => handleCellClick(number, cell);
        board.appendChild(cell);
    });
    
    // Сброс UI
    document.getElementById('currentNum').textContent = '1';
    document.getElementById('timer').textContent = '0с';
    document.getElementById('errors').textContent = '0';
}

// Обработка клика по ячейке
function handleCellClick(number, cell) {
    if (number === gameState.currentNumber) {
        // Правильный клик
        cell.classList.add('correct');
        gameState.currentNumber++;
        document.getElementById('currentNum').textContent = gameState.currentNumber;
        tg.HapticFeedback.impactOccurred('rigid');
        
        // Проверка завершения игры
        if (gameState.currentNumber > gameState.size * gameState.size) {
            console.log('Game completed!');
            setTimeout(() => endGame(), 300);
        }
        
        setTimeout(() => cell.classList.remove('correct'), 300);
    } else {
        // Неправильный клик
        cell.classList.add('wrong');
        gameState.errors++;
        document.getElementById('errors').textContent = gameState.errors;
        tg.HapticFeedback.impactOccurred('heavy');
        setTimeout(() => cell.classList.remove('wrong'), 500);
    }
}

// Запуск таймера
function startTimer() {
    gameState.startTime = Date.now();
    gameState.timer = setInterval(updateTimer, 100);
}

// Обновление таймера
function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    document.getElementById('timer').textContent = `${elapsed}с`;
}

// Завершение игры
function endGame() {
    console.log('Ending game...');
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    const endTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const totalNumbers = gameState.size * gameState.size;
    const avgTime = (endTime / totalNumbers).toFixed(2);
    
    console.log('Game stats:', { endTime, avgTime, errors: gameState.errors });
    
    // Сохранение статистики
    updateStatistics(endTime, gameState.size);
    
    // Обновление UI результатов
    document.getElementById('finalTime').textContent = `${endTime}с`;
    document.getElementById('avgTime').textContent = `${avgTime}с`;
    document.getElementById('errorsCount').textContent = gameState.errors;
    
    // Отправка данных в Telegram
    sendGameDataToTelegram(endTime);
    
    // Показываем экран результатов
    showScreen('resultsScreen');
    
    // Вибрация успеха
    tg.HapticFeedback.notificationOccurred('success');
}

// Обработка выхода из игры
function handleExitButton() {
    tg.showConfirm('Вы уверены, что хотите выйти? Текущий прогресс будет потерян.', (confirmed) => {
        if (confirmed) {
            console.log('User confirmed exit from game');
            if (gameState.timer) {
                clearInterval(gameState.timer);
                gameState.timer = null;
            }
            showScreen('mainMenu');
        }
    });
}

// Обновление статистики
function updateStatistics(time, size) {
    statistics.gamesPlayed++;
    statistics.totalErrors += gameState.errors;
    statistics.totalTime += time;
    
    const difficulty = getDifficultyName(size);
    if (!statistics.bestTimes[difficulty] || time < statistics.bestTimes[difficulty]) {
        statistics.bestTimes[difficulty] = time;
    }
    
    localStorage.setItem('schulteStats', JSON.stringify(statistics));
    console.log('Statistics updated:', statistics);
}

// Получение названия сложности
function getDifficultyName(size) {
    const sizes = {4: 'Легкая', 5: 'Средняя', 6: 'Сложная', 7: 'Эксперт'};
    return sizes[size];
}

// Отправка данных в Telegram
function sendGameDataToTelegram(time) {
    if (tg.initDataUnsafe.user) {
        const gameData = {
            action: 'game_completed',
            time: time,
            size: gameState.size,
            errors: gameState.errors,
            difficulty: getDifficultyName(gameState.size)
        };
        
        console.log('Sending data to Telegram:', gameData);
        tg.sendData(JSON.stringify(gameData));
    }
}

// Обновление отображения статистики
function updateStatsDisplay() {
    const statsContent = document.getElementById('statsContent');
    
    if (statistics.gamesPlayed === 0) {
        statsContent.innerHTML = `
            <div class="no-stats">
                <div class="no-stats-icon">📈</div>
                <p>Статистика будет доступна после первых игр</p>
            </div>
        `;
        return;
    }
    
    const avgErrors = (statistics.totalErrors / statistics.gamesPlayed).toFixed(1);
    const avgTime = (statistics.totalTime / statistics.gamesPlayed).toFixed(1);
    
    let html = `
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Всего игр:</span>
                <span class="stat-value">${statistics.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Всего ошибок:</span>
                <span class="stat-value">${statistics.totalErrors}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Среднее время:</span>
                <span class="stat-value">${avgTime}с</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Средние ошибки:</span>
                <span class="stat-value">${avgErrors}</span>
            </div>
        </div>
        <div class="about-section">
            <h3>🏆 Лучшие результаты</h3>
    `;
    
    for (const [difficulty, time] of Object.entries(statistics.bestTimes)) {
        html += `<p>${difficulty}: <strong>${time}с</strong></p>`;
    }
    
    html += `</div>`;
    statsContent.innerHTML = html;
}

// Убедитесь, что функция closeApp НИГДЕ не вызывается автоматически
// Она оставлена только для ручного закрытия, если понадобится
function closeApp() {
    console.log('Manual app close requested');
    tg.close();
}
