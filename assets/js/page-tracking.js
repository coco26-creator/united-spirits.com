(function () {
  window.dataLayer = window.dataLayer || [];

  function pushGtmEvent(eventName, payload) {
    window.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-event]').forEach(function (element) {
      if (element.dataset.trackingBound === 'true') return;
      element.dataset.trackingBound = 'true';
      var listenerName = element.tagName === 'FORM' ? 'submit' : 'click';
      element.addEventListener(listenerName, function () {
        pushGtmEvent(element.dataset.event, {
          href: element.getAttribute('href') || '',
          form_name: element.getAttribute('name') || '',
          lead_score: Number(element.dataset.leadScore || 0)
        });
      });
    });
  });
}());
