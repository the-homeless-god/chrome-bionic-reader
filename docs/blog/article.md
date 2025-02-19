# Биологический хак для чтения кода: Bionic Reader для программистов

#browser #extension #opensource #speedread #bionicreader #bionicreading #programming #productivity #reading

## TL;DR для занятых

- Расширение для Chrome, которое делает чтение кода и документации быстрее
- Поддерживает русский и английский языки с гибкими настройками
- Адаптивное выделение для длинных слов
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

## Решение: Bionic Reading с адаптивным выделением

Основная идея проста:
- Выделяем начало каждого слова жирным
- Мозг цепляется за эти "якоря"
- Достраивает остальное автоматически
- Скорость чтения увеличивается

Дополнительно:
- Для длинных слов используется адаптивное выделение
- Процент выделения зависит от длины слова
- Гибкие настройки для каждого языка

## Почему моя версия

1. Работает с русским языком:
   - Гибкие настройки длины выделения (2-12 символов)
   - Учет особенностей языка
   - Адаптивное выделение для длинных слов

2. Чистый код в функциональном стиле:
   - Композиция функций через pipe
   - Чистые функции
   - Явное управление состоянием
   - Тесты с 100% покрытием

3. Для разработчиков:
   - TypeScript с строгой типизацией
   - Автоматический деплой через GitHub Actions
   - Semantic versioning
   - Легко добавить новый язык

4. Никакого bloatware:
   - Нет телеметрии
   - Нет рекламы
   - Нет freemium-ограничений
   - Минимум permissions

## Технические детали

```typescript
// Конфигурация для языков
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

// Основная логика с адаптивным выделением
const calculateBoldLength = (word: string, language: string): number => {
  if (word.length > config.constants.longWordThreshold) {
    const percentLength = Math.ceil(word.length * config.constants.boldPercentage);
    const minLength = Math.max(
      Math.ceil(word.length * config.constants.minBoldPercentage),
      config.languages[language].minBoldLength
    );
    const maxLength = Math.min(
      Math.ceil(word.length * config.constants.maxBoldPercentage),
      config.languages[language].maxBoldLength
    );
    return Math.min(Math.max(percentLength, minLength), maxLength);
  }
  return config.languages[language].boldLength;
};
```

## Как использовать

1. Установить расширение
2. Настроить длину выделения для каждого языка
3. Profit! Теперь начало каждого слова выделено с учетом его длины

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
npm install
npm test
```

3. Добавьте свой язык в `src/config.ts`:
```typescript
japanese: {
  pattern: /[\u3040-\u309F]/,
  boldLength: 1,
  minBoldLength: 1,
  maxBoldLength: 12
}
```

4. Соберите и протестируйте:
```bash
npm run test:coverage  # Проверить покрытие тестами
npm run test:badges   # Обновить бейджи
```

## CI/CD

- Автоматическая проверка тестов при каждом PR
- Semantic versioning для релизов
- Автоматическая публикация в Chrome Web Store
- Генерация бейджей покрытия
- GitHub Packages для хранения артефактов

## Полезные ссылки

- [Оригинальный Bionic Reading](https://bionic-reading.com/)
- [Научное обоснование](https://www.oxfordlearning.com/what-is-bionic-reading-and-why-should-you-use-it/)
- [Reddit тред с обсуждением](https://www.reddit.com/r/coolguides/comments/ut3x75/bionic_reading_does_this_help_you/)

## Контакты

- GitHub: [the-homeless-god](https://github.com/the-homeless-god)
- Email: zimtir@mail.ru 
