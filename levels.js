// Данные уровней игры
const gameLevels = [
    {
        id: 1,
        title: "Парадокс садовника",
        description: "Цветок должен быть полит вчера, но тогда он уже вырос сегодня. Создай временную петлю, чтобы разрешить этот парадокс.",
        initialState: {
            flower: {
                name: "Магический цветок",
                present: "Сухой, нуждается в поливе",
                past: "Не посажен",
                future: "Расцветший",
                targetState: "Расцветший в настоящем"
            },
            water: {
                name: "Лейка с водой",
                present: "Полная",
                past: "Пустая",
                future: "Пустая",
                targetState: "Пустая в настоящем"
            }
        },
        solution: {
            requiredActions: ["branch", "merge"],
            targetParadoxes: 1,
            maxStabilityLoss: 20
        },
        rewards: {
            knowledge: 10,
            unlockTool: "branch"
        }
    },
    {
        id: 2,
        title: "Замкнутый круг изобретений",
        description: "Чертежи телепорта попали в прошлое из будущего, создав петлю изобретения. Стабилизируй временную линию.",
        initialState: {
            blueprints: {
                name: "Чертежи телепорта",
                present: "У изобретателя",
                past: "Неизвестны",
                future: "Усовершенствованные",
                targetState: "Стабильные в настоящем"
            },
            inventor: {
                name: "Профессор Хронос",
                present: "Работает над телепортом",
                past: "Не знает о телепорте",
                future: "Известный ученый",
                targetState: "Создал телепорт"
            }
        },
        solution: {
            requiredActions: ["rewind", "fix", "merge"],
            targetParadoxes: 2,
            maxStabilityLoss: 30
        },
        rewards: {
            knowledge: 20,
            unlockTool: "fix"
        }
    },
    {
        id: 3,
        title: "Три времени одного города",
        description: "Город существует одновременно в трех временных периодах. Создай временные мосты между эпохами.",
        initialState: {
            city: {
                name: "Город Хронос",
                present: "Современный мегаполис",
                past: "Средневековая деревня",
                future: "Технологическая столица",
                targetState: "Стабильный во всех временах"
            },
            citizens: {
                name: "Жители города",
                present: "Современные люди",
                past: "Средневековые горожане",
                future: "Киборги",
                targetState: "Осознают временные аномалии"
            }
        },
        solution: {
            requiredActions: ["branch", "rewind", "merge", "fix"],
            targetParadoxes: 3,
            maxStabilityLoss: 40
        },
        rewards: {
            knowledge: 35,
            unlockTool: "merge"
        }
    }
];

// Состояния объектов по временным линиям
const timeStates = {
    past: "past",
    present: "present", 
    future: "future",
    paradox: "paradox"
};

// Стоимость действий
const actionCosts = {
    rewind: 10,
    branch: 25,
    merge: 30,
    fix: 15
};