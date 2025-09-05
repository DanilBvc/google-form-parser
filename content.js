
class GoogleFormsParser {
  constructor() {
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'scanForm') {
        const questions = this.parseForm();
        sendResponse({ questions });
      }
    });
  }

  parseForm() {
    const questions = [];
    const seenQuestions = new Set();

    const questionContainers = document.querySelectorAll('[role="listitem"]');

    questionContainers.forEach((container) => {
      if (this.isHeaderOnly(container)) return;

      const questionText = this.extractQuestionText(container);
      const images = this.extractImages(container);

      // Якщо немає тексту питання, але є зображення, використовуємо зображення як питання
      const questionIdentifier = questionText || (images.length > 0 ? `image_${images[0].src}` : '');

      if (!questionIdentifier || seenQuestions.has(questionIdentifier)) return;

      const headerTexts = [
        'Choose the correct word or form to complete the sentence',
        'Виберіть правильне слово або форму для завершення речення'
      ];

      if (headerTexts.some(text => questionText.includes(text))) return;

      const questionData = {
        question: questionText || (images.length > 0 ? `[Зображення ${images.length}]` : ''),
        type: this.detectQuestionType(container),
        options: this.extractOptions(container),
        required: this.isRequired(container),
        answer: null,
        images: images
      };

      questions.push(questionData);
      seenQuestions.add(questionIdentifier);
    });

    return questions;
  }

  isHeaderOnly(container) {
    const text = container.textContent?.toLowerCase() || '';
    const headerPatterns = [
      'choose the correct word or form to complete the sentence',
      'виберіть правильне слово або форму для завершення речення',
      'choose the correct',
      'виберіть правильне'
    ];

    return headerPatterns.some(pattern => text.includes(pattern)) &&
      !container.querySelector('[role="listbox"]') ||
      text.length < 10;
  }

  extractQuestionText(container) {
    const titleElement = container.querySelector('[role="heading"] span');
    if (titleElement) {
      const text = titleElement.textContent?.trim();
      if (text && text.length > 10) {
        return text;
      }
    }

    const heading3 = container.querySelector('[role="heading"][aria-level="3"] span');
    if (heading3) {
      const text = heading3.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }

    const allSpans = container.querySelectorAll('span');
    for (const span of allSpans) {
      const text = span.textContent?.trim();
      if (text && text.length > 0 &&
        !text.includes('*') &&
        !text.includes('Your answer') &&
        !text.includes('Ваша відповідь') &&
        !text.includes('Required question') &&
        !text.includes('Обов\'язкове питання') &&
        !text.includes('Choose the correct word or form to complete the sentence') &&
        !text.includes('Виберіть правильне слово або форму для завершення речення') &&
        !text.includes('Choose') &&
        !text.includes('Виберіть') &&
        !text.includes('point') &&
        !text.includes('бал') &&
        !text.includes('Required') &&
        !text.includes('Обов\'язкове')) {
        return text;
      }
    }

    return '';
  }

  extractImages(container) {
    const images = [];
    const imgElements = container.querySelectorAll('img');

    imgElements.forEach((img, index) => {
      if (img.src && !img.src.includes('data:image/svg+xml')) {
        images.push({
          src: img.src,
          alt: img.alt || `Image ${index + 1}`,
          title: img.title || '',
          index: index + 1
        });
      }
    });

    return images;
  }

  detectQuestionType(container) {
    if (container.querySelector('[role="listbox"]')) {
      return 'radio';
    }

    if (container.querySelector('[role="radiogroup"]')) {
      return 'radio';
    }

    if (container.querySelector('[role="checkbox"]')) {
      return 'checkbox';
    }

    if (container.querySelector('select')) {
      return 'select';
    }

    if (container.querySelector('input[type="text"]')) {
      return 'text';
    }

    if (container.querySelector('textarea')) {
      return 'textarea';
    }

    return 'unknown';
  }

  extractOptions(container) {
    const options = [];

    const listboxOptions = container.querySelectorAll('[role="listbox"] [role="option"]');
    listboxOptions.forEach(option => {
      const textElement = option.querySelector('span');
      if (textElement) {
        const text = textElement.textContent.trim();
        if (text && text.length > 0 &&
          text !== 'Choose' &&
          text !== 'Виберіть' &&
          text !== 'Select' &&
          text !== 'Обрати') {
          options.push(text);
        }
      }
    });

    const radioOptions = container.querySelectorAll('[role="radiogroup"] label');
    radioOptions.forEach(label => {
      const textElement = label.querySelector('span');
      if (textElement) {
        const text = textElement.textContent?.trim();
        if (text && text.length > 0) {
          options.push(text);
        }
      }
    });

    const checkboxOptions = container.querySelectorAll('[role="checkbox"]');
    checkboxOptions.forEach(checkbox => {
      const label = checkbox.closest('label');
      if (label) {
        const textElement = label.querySelector('span[dir="auto"]');
        if (textElement) {
          const text = textElement.textContent?.trim();
          if (text && text.length > 0) {
            options.push(text);
          }
        }
      }
    });

    const selectOptions = container.querySelectorAll('select option');
    selectOptions.forEach(option => {
      const text = option.textContent?.trim();
      if (text &&
        text !== 'Виберіть...' &&
        text !== 'Choose...' &&
        text !== 'Select...' &&
        text !== 'Обрати...') {
        options.push(text);
      }
    });

    return [...new Set(options)];
  }

  isRequired(container) {
    return container.querySelector('[aria-label*="Required"], [aria-label*="required"], [aria-label*="Обов\'язкове"], [aria-label*="обов\'язкове"]') !== null ||
      container.textContent?.includes('*') ||
      container.querySelector('textarea[required], input[required]') !== null;
  }
}

new GoogleFormsParser();
