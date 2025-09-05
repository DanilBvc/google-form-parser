const translations = {
  uk: {
    title: "🔍 Сканер Форм",
    apiKeyLabel: "Gemini API ключ:",
    apiKeyPlaceholder: "Введіть ваш API ключ Gemini",
    scanButton: "📋 Сканувати форму",
    copyButton: "📄 Копіювати дані",
    sendButton: "🤖 Відправити в Gemini",
    readyStatus: "Готовий до роботи",

    scanning: "Сканування форми...",
    notGoogleForms: "❌ Відкрийте Google Forms для сканування",
    questionsFound: "✅ Знайдено {count} питань",
    noQuestions: "❌ Не вдалося знайти питання у формі",
    scanError: "❌ Помилка сканування форми",
    scanFirst: "❌ Спочатку проскануйте форму",
    dataCopied: "✅ Дані скопійовано в буфер обміну",
    copyError: "❌ Помилка копіювання",
    enterApiKey: "❌ Введіть API ключ Gemini",
    sendingToGemini: "🤖 Відправка в Gemini...",
    responseReceived: "✅ Відповідь отримано",
    geminiError: "❌ Помилка відправки в Gemini",

    copyInstruction: "Виріши ці завдання та дай коротку відповідь по кожному питанню у відповіді пиши номер питання само питання повністю та відповідь:\n\n",
    questionPrefix: "❓ Питання {number}: {question}\n",
    optionsPrefix: "🔘 Варіанти: {options}\n",
    textAnswer: "✏️ Відповідь: [короткий текст]\n",
    textareaAnswer: "✏️ Відповідь: [розгорнута відповідь]\n",
    gridAnswer: "📊 Сітка: {count} колонок\n",
    requiredQuestion: "⚠️ Обов'язкове питання\n",

    geminiPrompt: "Аналізуючи питання ти маєш обрати лише варіант або варіанти як надані в питаннях\n{questions}",
    questionLabel: "Питання {number}: {question}\n",
    typeLabel: "Тип: {type}\n",
    optionsLabel: "Варіанти: {options}\n",
    requiredLabel: "Обов'язкове питання\n",

    apiKeyLoadError: "Помилка завантаження API ключа:",
    apiKeySaveError: "Помилка збереження API ключа:",
    scanError: "Помилка сканування:",
    copyError: "Помилка копіювання:",
    geminiApiError: "Помилка Gemini API:"
  },

  en: {
    title: "🔍 Forms Scanner",
    apiKeyLabel: "Gemini API Key:",
    apiKeyPlaceholder: "Enter your Gemini API key",
    scanButton: "📋 Scan Form",
    copyButton: "📄 Copy Data",
    sendButton: "🤖 Send to Gemini",
    readyStatus: "Ready to work",

    scanning: "Scanning form...",
    notGoogleForms: "❌ Open Google Forms to scan",
    questionsFound: "✅ Found {count} questions",
    noQuestions: "❌ Could not find questions in the form",
    scanError: "❌ Form scanning error",
    scanFirst: "❌ Scan the form first",
    dataCopied: "✅ Data copied to clipboard",
    copyError: "❌ Copy error",
    enterApiKey: "❌ Enter Gemini API key",
    sendingToGemini: "🤖 Sending to Gemini...",
    responseReceived: "✅ Response received",
    geminiError: "❌ Gemini sending error",

    copyInstruction: "Solve these tasks and give a short answer for each question. In your answer write the question number, the full question and the answer:\n\n",
    questionPrefix: "❓ Question {number}: {question}\n",
    optionsPrefix: "🔘 Options: {options}\n",
    textAnswer: "✏️ Answer: [short text]\n",
    textareaAnswer: "✏️ Answer: [detailed answer]\n",
    gridAnswer: "📊 Grid: {count} columns\n",
    requiredQuestion: "⚠️ Required question\n",

    geminiPrompt: "When analyzing questions you must choose only the option or options as provided in the questions\n{questions}",
    questionLabel: "Question {number}: {question}\n",
    typeLabel: "Type: {type}\n",
    optionsLabel: "Options: {options}\n",
    requiredLabel: "Required question\n",

    apiKeyLoadError: "API key loading error:",
    apiKeySaveError: "API key saving error:",
    scanError: "Scanning error:",
    copyError: "Copy error:",
    geminiApiError: "Gemini API error:"
  }
};

function t(key, params = {}) {
  const lang = localStorage.getItem('selectedLanguage') || 'uk';
  let text = translations[lang][key] || translations['uk'][key] || key;

  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
  });

  return text;
}

function switchLanguage(lang) {
  localStorage.setItem('selectedLanguage', lang);
  location.reload();
}
