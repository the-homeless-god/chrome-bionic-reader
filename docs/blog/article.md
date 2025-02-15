# Биологический хак для чтения кода: Bionic Reader для программистов

#browser #extension #opensource #speedread #bionicreader #bionicreading #programming #productivity #reading

## TL;DR для занятых

- Расширение для Chrome, которое делает чтение кода и документации быстрее
- Поддерживает русский и английский языки
- Open source, без трекеров и аналитики
- Установка: [Chrome Web Store](https://chromewebstore.google.com/detail/chrome-bionic-reader/)
- Исходники: [GitHub](https://github.com/the-homeless-god/chrome-bionic-reader)

## Проблема

Каждый программист сталкивается с этим ежедневно:
- Тонны документации
- Километры чужого кода
- Бесконечные PR на ревью
- Статьи на Хабре по диагонали
- Технические спецификации

Мозг устает от постоянного парсинга текста. Особенно когда автор не заморочился с форматированием и структурой.

## Как работает наш мозг при чтении

1. Сначала учимся читать по буквам
2. Потом по слогам
3. Дальше целыми словами
4. Продвинутые читают фразами ("дорогие дамы и господа" = один блок)

Но даже опытные читатели спотыкаются на плохо структурированном тексте. Мозгу нужны точки фиксации.

Прикол в том, что наш мозг может парсить даже такое:
```
D94НН03 С006Щ3НN3 П0К4ЗЫ8437, К4КN3 У9N8N73ЛЬНЫ3 83ЩN М0Ж37 93Л47Ь Н4Ш Р4ЗУМ!
```

Почему? Потому что он цепляется за паттерны и достраивает остальное.

## Решение: Bionic Reading

Швейцарский разработчик придумал простой хак:
- Выделяем начало каждого слова жирным
- Мозг цепляется за эти "якоря"
- Достраивает остальное автоматически
- Скорость чтения увеличивается

## Почему моя версия

1. Работает с русским языком (оригинал не умеет)
2. Чистый код в функциональном стиле:
   - Композиция функций через pipe
   - Чистые функции
   - Явное управление состоянием
   - Тесты с 100% покрытием

3. Для разработчиков:
   - Весь код в одном файле (легко читать и модифицировать)
   - Автоматический деплой через GitHub Actions
   - Semantic versioning
   - Легко добавить новый язык

4. Никакого bloatware:
   - Нет телеметрии
   - Нет рекламы
   - Нет freemium-ограничений
   - Минимум permissions

## Технические детали

```javascript
// Конфигурация для языков
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
  }
}

// Основная логика
const modifyWord = pipe(
  word => calculateBoldLength(word),
  length => wrapInBold(word, length),
  joinWithBold
);
```

## Как использовать

1. Установить расширение
2. Кликнуть на иконку для включения
3. Profit! Теперь начало каждого слова выделено

Особенно полезно для:
- Чтения документации
- Ревью кода
- Технических статей
- Спецификаций
- Любых длинных текстов

## Для тех, кто хочет покопаться

1. Форкните репозиторий:
```bash
git clone https://github.com/the-homeless-god/chrome-bionic-reader
cd chrome-bionic-reader
```

2. Установите зависимости и запустите тесты:
```bash
cd tests
npm install
npm test
```

3. Добавьте свой язык в `extension/config.js`:
```javascript
japanese: {
  pattern: /[\u3040-\u309F]/,
  boldLength: 1
}
```

4. Соберите и протестируйте:
```bash
npm run test:coverage  # Проверить покрытие тестами (используется nyc)
npm run test:badges   # Обновить бейджи
```

## CI/CD

- Автоматическая проверка тестов при каждом PR
- Semantic versioning для релизов
- Автоматическая публикация в Chrome Web Store
- Генерация бейджей покрытия через nyc
- GitHub Packages для хранения артефактов

## Полезные ссылки

- [Оригинальный Bionic Reading](https://bionic-reading.com/)
- [Научное обоснование](https://www.oxfordlearning.com/what-is-bionic-reading-and-why-should-you-use-it/)
- [Reddit тред с обсуждением](https://www.reddit.com/r/coolguides/comments/ut3x75/bionic_reading_does_this_help_you/)
- [Logseq плагин](https://github.com/sawhney17/logseq-bionic-speedreader)

## Контакты

- GitHub: [the-homeless-god](https://github.com/the-homeless-god)
- Email: zimtir@mail.ru 
