# Chrome Bionic Reader

Chrome Bionic Reader - это расширение для Chrome, которое помогает улучшить фокусировку при чтении текста, выделяя начало слов жирным шрифтом (принцип бионического чтения).

## Отличия от оригинального расширения [smartReader](https://github.com/Poucous/smartReader):

- Функциональный стиль программирования
- Чистая архитектура
- Конфигурация через единый файл
- Поддержка русского языка
- Автоматическая публикация в Chrome Web Store
- 100% покрытие тестами
- Постоянная работоспособность благодаря автоматизированному тестированию
- Адаптивное выделение для длинных слов
- Гибкие настройки для каждого языка

## Возможности

### Основные функции
- Выделение начала слов для улучшения читаемости
- Поддержка русского и английского языков
- Адаптивное выделение для длинных слов
- Мгновенное применение настроек
- Статистика обработки текста

### Настройки
- Настройка длины выделения для каждого языка (1-12 символов)
- Адаптивное выделение для длинных слов:
  - Минимальный процент выделения: 20%
  - Оптимальный процент выделения: 30%
  - Максимальный процент выделения: 50%
- Кнопка "Переподсветить текст" для применения изменений

### Интерфейс
- Простой и понятный интерфейс настроек
- Статистика обработанных слов
- Время обработки страницы
- Продолжительность сессии

## Архитектура

Расширение следует принципам функционального программирования:
- Чистые функции
- Иммутабельность
- Композиция функций
- Декларативный стиль
- Разработка через конфигурацию

```javascript
// Пример композиции функций
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// Пример чистой функции с адаптивным выделением
const calculateBoldLength = (word, language) => {
  if (word.length > config.constants.longWordThreshold) {
    return Math.ceil(word.length * config.constants.boldPercentage);
  }
  return config.languages[language].boldLength;
};

// Пример декларативного стиля
const updatePage = () =>
  pipe(
    createTreeWalker,
    collectElements,
    filterValidElements,
    elements => elements.map(updateElement)
  )();
```

## Установка

### Из Chrome Web Store
Установите расширение напрямую из [Chrome Web Store](https://chromewebstore.google.com/detail/chrome-bionic-reader/)

### Ручная установка
1. Склонируйте репозиторий:
```bash
git clone https://github.com/the-homeless-god/chrome-bionic-reader
cd chrome-bionic-reader
```

### Установка в Chrome

1. Откройте страницу расширений chrome://extensions/
2. Включите "Режим разработчика"
3. Нажмите "Загрузить распакованное расширение"
4. Выберите папку extension из скачанного репозитория

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Генерация бейджей покрытия
npm run test:badges
```

## Конфигурация

Вся конфигурация централизована в `src/config.ts`:

```typescript
{
  languages: {
    ru: {
      pattern: /[а-яА-ЯёЁ]/,
      boldLength: 3,
      minBoldLength: 2,
      maxBoldLength: 12
    },
    en: {
      pattern: /[a-zA-Z]/,
      boldLength: 2,
      minBoldLength: 1,
      maxBoldLength: 12
    }
  },
  constants: {
    longWordThreshold: 6,
    boldPercentage: 0.3,
    minBoldPercentage: 0.2,
    maxBoldPercentage: 0.5
  }
}
```

### Добавление нового языка

1. Добавьте конфигурацию языка в `src/config.ts`:
```typescript
japanese: {
  pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  boldLength: 1,
  minBoldLength: 1,
  maxBoldLength: 12
}
```

2. Добавьте настройки по умолчанию:
```typescript
defaultSettings: {
  japanese: { boldLength: 1 }
}
```

## Публикация

Расширение автоматически публикуется в Chrome Web Store когда:
1. Все тесты проходят успешно
2. Достигнуты пороги покрытия кода
3. Создан новый тег

Необходимые секреты:
- `EXTENSION_ID`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `REFRESH_TOKEN`

## Покрытие тестами

- 100% функциональное покрытие
- Тестирование чистых функций
- Интеграционные тесты
- Тесты манипуляций с DOM
- Моки Chrome API

## Для Firefox

Для Firefox рекомендуется использовать [оригинальное расширение](https://github.com/Poucous/smartReader).

## Контакты

Email: zimtir@mail.ru 
