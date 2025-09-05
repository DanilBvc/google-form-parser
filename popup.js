
class FormsScanner {
  constructor() {
    this.questions = [];
    this.apiKey = '';
    this.init();
  }

  init() {
    this.loadApiKey();
    this.loadLanguage();
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    document.getElementById('scanForm').addEventListener('click', () => this.scanForm());
    document.getElementById('copyData').addEventListener('click', () => this.copyData());
    document.getElementById('sendToGemini').addEventListener('click', () => this.sendToGemini());
    document.getElementById('apiKey').addEventListener('input', (e) => this.saveApiKey(e.target.value));
    document.getElementById('languageSelector').addEventListener('change', (e) => this.switchLanguage(e.target.value));
  }

  loadLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
    document.getElementById('languageSelector').value = savedLang;
  }

  switchLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    this.updateUI();
  }

  updateUI() {
    document.getElementById('title').textContent = t('title');
    document.getElementById('apiKeyLabel').textContent = t('apiKeyLabel');
    document.getElementById('apiKey').placeholder = t('apiKeyPlaceholder');
    document.getElementById('scanForm').textContent = t('scanButton');
    document.getElementById('copyData').textContent = t('copyButton');
    document.getElementById('sendToGemini').textContent = t('sendButton');
    document.getElementById('status').textContent = t('readyStatus');
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.local.get(['geminiApiKey']);
      if (result.geminiApiKey) {
        this.apiKey = result.geminiApiKey;
        document.getElementById('apiKey').value = this.apiKey;
      }
    } catch (error) {
      console.error(t('apiKeyLoadError'), error);
    }
  }

  async saveApiKey(key) {
    this.apiKey = key;
    try {
      await chrome.storage.local.set({ geminiApiKey: key });
    } catch (error) {
      console.error(t('apiKeySaveError'), error);
    }
  }

  async scanForm() {
    this.updateStatus(t('scanning'));

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url.includes('docs.google.com/forms')) {
        this.updateStatus(t('notGoogleForms'));
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scanForm' });

      if (response && response.questions) {
        this.questions = response.questions;
        this.updateStatus(t('questionsFound', { count: this.questions.length }));
        this.enableButtons();
      } else {
        this.updateStatus(t('noQuestions'));
      }
    } catch (error) {
      console.error(t('scanError'), error);
      this.updateStatus(t('scanError') + ' ' + error);
    }
  }

  async copyData() {
    if (this.questions.length === 0) {
      this.updateStatus(t('scanFirst'));
      return;
    }

    try {
      const formattedText = this.formatQuestionsForCopy();
      await navigator.clipboard.writeText(formattedText);
      this.updateStatus(t('dataCopied'));
    } catch (error) {
      console.error(t('copyError'), error);
      this.updateStatus(t('copyError'));
    }
  }

  formatQuestionsForCopy() {
    const instruction = t('copyInstruction');
    const questionsText = this.questions.map((q, index) => {
      let result = t('questionPrefix', { number: index + 1, question: q.question });

      if (q.images && q.images.length > 0) {
        q.images.forEach((img, imgIndex) => {
          result += `🖼️ Image ${imgIndex + 1}: ${img.src}\n`;
          if (img.alt) {
            result += `   Description: ${img.alt}\n`;
          }
        });
      }

      if (q.type === 'radio' || q.type === 'checkbox' || q.type === 'select') {
        result += t('optionsPrefix', { options: q.options.join('(next variant) ') });
      } else if (q.type === 'text') {
        result += t('textAnswer');
      } else if (q.type === 'textarea') {
        result += t('textareaAnswer');
      } else if (q.type === 'grid') {
        result += t('gridAnswer', { count: q.options.length });
      }

      if (q.required) {
        result += t('requiredQuestion');
      }

      return result;
    }).join('\n');

    return instruction + questionsText;
  }

  async sendToGemini() {
    if (this.questions.length === 0) {
      this.updateStatus(t('scanFirst'));
      return;
    }

    if (!this.apiKey) {
      this.updateStatus(t('enterApiKey'));
      return;
    }

    this.updateStatus(t('sendingToGemini'));
    this.disableButtons();

    try {
      const prompt = this.createGeminiPrompt();
      const response = await this.callGeminiAPI(prompt);

      this.showResponse(response);
      this.updateStatus(t('responseReceived'));
    } catch (error) {
      console.error(t('geminiApiError'), error);
      this.updateStatus(t('geminiError') + ' ' + error);
    } finally {
      this.enableButtons();
    }
  }

  createGeminiPrompt() {
    const questionsText = this.questions.map((q, index) => {
      let text = t('questionLabel', { number: index + 1, question: q.question });
      text += t('typeLabel', { type: q.type });
      if (q.options.length > 0) {
        text += t('optionsLabel', { options: q.options.join(', ') });
      }
      if (q.required) {
        text += t('requiredLabel');
      }
      return text;
    }).join('\n\n');

    return t('geminiPrompt', { questions: questionsText });
  }

  async callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  showResponse(response) {
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = response;
    responseDiv.classList.remove('hidden');
  }

  updateStatus(message) {
    document.getElementById('status').textContent = message;
  }

  enableButtons() {
    document.getElementById('copyData').disabled = false;
    document.getElementById('sendToGemini').disabled = false;
  }

  disableButtons() {
    document.getElementById('copyData').disabled = true;
    document.getElementById('sendToGemini').disabled = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FormsScanner();
});
