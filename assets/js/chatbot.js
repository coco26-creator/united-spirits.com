(function () {
  var quickReplies = [
    {
      match: ['distributor', 'distribution', 'partner', 'asia', 'africa'],
      text: 'For distributor partnerships, please share your company name, region, channels, annual case volume, and email in the distributor form. Our team will review fit and follow up.'
    },
    {
      match: ['supplier', 'winery', 'distillery', 'producer'],
      text: 'For supplier onboarding, we evaluate product type, production capacity, certifications, export readiness, and target markets. The supplier form routes your profile to our sourcing team.'
    },
    {
      match: ['private', 'label', 'custom', 'manufacturing', 'brand'],
      text: 'Our private-label process covers concept, liquid sourcing, packaging, bottling, compliance, and launch support. Tell us about your brand vision and target channel.'
    },
    {
      match: ['guide', 'download', 'brochure', 'catalogue'],
      text: 'You can download the Market Entry Guide from the lead magnet or downloads center, and the product catalogue/company brochure from the downloads center.'
    }
  ];

  function pushEvent(eventName, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
  }

  function createMessage(role, text) {
    var message = document.createElement('div');
    message.className = role === 'bot' ? 'usc-chatbot-message usc-chatbot-bot' : 'usc-chatbot-message usc-chatbot-user';
    message.textContent = text;
    return message;
  }

  function answerFor(input) {
    var normalized = input.toLowerCase();
    var match = quickReplies.find(function (reply) {
      return reply.match.some(function (keyword) { return normalized.indexOf(keyword) !== -1; });
    });

    return match ? match.text : 'Thanks — I can help with distributor partnerships, supplier onboarding, private label projects, and downloads. For a sales conversation, email info@unitedspiritshk.com or use the contact page.';
  }


  function injectStyles() {
    if (document.getElementById('usc-chatbot-styles')) return;
    var style = document.createElement('style');
    style.id = 'usc-chatbot-styles';
    style.textContent = '.usc-chatbot{position:fixed;right:1.25rem;bottom:1.25rem;z-index:80;font-family:Inter,Arial,sans-serif}.usc-chatbot-toggle{width:4rem;height:4rem;border-radius:999px;color:#fff;font-weight:800;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 18px 40px rgba(168,85,247,.35)}.usc-chatbot-panel{position:absolute;right:0;bottom:5rem;width:min(22rem,calc(100vw - 2rem));overflow:hidden;border-radius:1.5rem;background:#fff;color:#111827;box-shadow:0 24px 70px rgba(17,24,39,.25);border:1px solid rgba(17,24,39,.08)}.usc-chatbot-panel header{display:flex;align-items:center;justify-content:space-between;padding:1rem;background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff}.usc-chatbot-close{font-size:1.5rem;line-height:1}.usc-chatbot-log{max-height:16rem;overflow-y:auto;padding:1rem;background:#f9fafb}.usc-chatbot-message{margin-bottom:.75rem;padding:.75rem .9rem;border-radius:1rem;font-size:.9rem;line-height:1.4}.usc-chatbot-bot{background:#fff;border:1px solid #e5e7eb}.usc-chatbot-user{margin-left:2rem;background:#fce7f3;color:#831843}.usc-chatbot-quick-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;padding:.75rem 1rem 0}.usc-chatbot-quick-actions button{border-radius:999px;background:#f3e8ff;color:#6b21a8;padding:.45rem .5rem;font-size:.75rem;font-weight:700}.usc-chatbot-form{display:flex;gap:.5rem;padding:1rem}.usc-chatbot-form input{flex:1;min-width:0;border:1px solid #d1d5db;border-radius:.9rem;padding:.7rem .8rem}.usc-chatbot-form button{border-radius:.9rem;background:#ec4899;color:#fff;padding:.7rem .9rem;font-weight:700}';
    document.head.appendChild(style);
  }

  function initChatbot() {
    if (document.getElementById('usc-chatbot')) return;
    injectStyles();

    var widget = document.createElement('aside');
    widget.id = 'usc-chatbot';
    widget.className = 'usc-chatbot';
    widget.innerHTML = [
      '<button class="usc-chatbot-toggle" type="button" aria-expanded="false" aria-controls="usc-chatbot-panel">Chat</button>',
      '<section class="usc-chatbot-panel" id="usc-chatbot-panel" aria-label="United Spirits assistant" hidden>',
      '  <header><strong>United Spirits Assistant</strong><button type="button" class="usc-chatbot-close" aria-label="Close chatbot">×</button></header>',
      '  <div class="usc-chatbot-log" aria-live="polite"></div>',
      '  <div class="usc-chatbot-quick-actions">',
      '    <button type="button" data-chat-prompt="I want to become a distributor">Distributor</button>',
      '    <button type="button" data-chat-prompt="I am a supplier or winery">Supplier</button>',
      '    <button type="button" data-chat-prompt="Tell me about private label">Private label</button>',
      '  </div>',
      '  <form class="usc-chatbot-form">',
      '    <input type="text" name="message" placeholder="Ask about partnerships..." aria-label="Chat message" required />',
      '    <button type="submit">Send</button>',
      '  </form>',
      '</section>'
    ].join('');

    document.body.appendChild(widget);

    var toggle = widget.querySelector('.usc-chatbot-toggle');
    var panel = widget.querySelector('.usc-chatbot-panel');
    var close = widget.querySelector('.usc-chatbot-close');
    var log = widget.querySelector('.usc-chatbot-log');
    var form = widget.querySelector('.usc-chatbot-form');

    function openPanel() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      pushEvent('ChatbotOpen');
      if (!log.dataset.started) {
        log.dataset.started = 'true';
        log.appendChild(createMessage('bot', 'Hi — I can help route distributor, supplier, private label, and download questions. What are you looking for?'));
      }
    }

    function closePanel() {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }

    function submitMessage(text) {
      log.appendChild(createMessage('user', text));
      log.appendChild(createMessage('bot', answerFor(text)));
      log.scrollTop = log.scrollHeight;
      pushEvent('ChatbotMessage', { message_topic: text.slice(0, 80) });
    }

    toggle.addEventListener('click', function () {
      if (panel.hidden) openPanel(); else closePanel();
    });
    close.addEventListener('click', closePanel);
    widget.querySelectorAll('[data-chat-prompt]').forEach(function (button) {
      button.addEventListener('click', function () { submitMessage(button.dataset.chatPrompt); });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.elements.message;
      submitMessage(input.value);
      input.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', initChatbot);
}());
