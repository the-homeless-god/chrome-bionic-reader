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

// Пример чистой функции
const detectLanguage = char => 
  Object.entries(config.languages)
    .find(([_, { pattern }]) => pattern.test(char))
    ?.[0] || config.defaultLanguage;

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
cd tests
npm install

# Запуск тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Генерация бейджей покрытия
npm run test:badges
```

## Конфигурация

Вся конфигурация централизована в `extension/config.js`:

```javascript
{
  languages: {
    russian: {
      pattern: /[а-яА-ЯёЁ]/,
      boldLength: 3
    },
    english: {
      pattern: /[a-zA-Z]/,
      boldLength: 2
    }
  },
  // ... другие настройки
}
```

Для добавления нового языка:

1. Добавьте конфигурацию языка в `config.js`:
```javascript
japanese: {
  pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  boldLength: 1
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
