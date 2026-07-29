(() => {
  'use strict';

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  const pushEvent = (payload) => {
    window.dataLayer.push(payload);
  };

  const destinationUrl = (element) => element.href || element.getAttribute('href') || '';

  const elementText = (element) => element.textContent.trim().replace(/\s+/g, ' ');

  const buttonPosition = (element) => {
    if (element.dataset.buttonPosition) return element.dataset.buttonPosition;

    let currentElement = element;

    while (currentElement && currentElement !== document.documentElement) {
      const position = window.getComputedStyle(currentElement).position;

      if (position === 'fixed') return 'floating';
      if (position === 'sticky') return 'sticky';

      currentElement = currentElement.parentElement;
    }

    return 'inline';
  };

  const trackInquirySuccess = () => {
    const urlParameters = new URLSearchParams(window.location.search);

    if (urlParameters.get('contact_posted') !== 'true') return;

    const contactForm = document.querySelector('form.contact-form__form');

    if (!contactForm || !contactForm.id) return;

    pushEvent({
      event: 'inquiry_submit',
      form_type: 'shopify_contact',
      form_id: contactForm.id,
      page_location: window.location.href,
    });
  };

  const trackCtaClick = (clickEvent) => {
    if (!(clickEvent.target instanceof Element)) return;

    const ctaElement = clickEvent.target.closest('[data-track="cta"]');

    if (!ctaElement) return;

    pushEvent({
      event: 'cta_click',
      cta_name: ctaElement.dataset.ctaId || elementText(ctaElement),
      section_name: ctaElement.dataset.section || '',
      destination_url: destinationUrl(ctaElement),
      page_location: window.location.href,
    });
  };

  document.addEventListener('click', trackCtaClick, true);

  document.addEventListener('click', (clickEvent) => {
    if (!(clickEvent.target instanceof Element)) return;

    const trackedElement = clickEvent.target.closest('[data-track]');

    if (trackedElement) {
      const trackingType = trackedElement.dataset.track;

      if (trackingType === 'case-study') {
        pushEvent({
          event: 'case_study_click',
          market: trackedElement.dataset.market || '',
          system: trackedElement.dataset.system || '',
          application: trackedElement.dataset.application || '',
          destination_url: destinationUrl(trackedElement),
          page_location: window.location.href,
        });
      }

      if (trackingType === 'product-system') {
        pushEvent({
          event: 'product_system_click',
          system_name: trackedElement.dataset.systemName || '',
          system_category: trackedElement.dataset.systemCategory || '',
          destination_url: destinationUrl(trackedElement),
          page_location: window.location.href,
        });
      }
    }

    const whatsappLink = clickEvent.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');

    if (whatsappLink && buttonPosition(whatsappLink) === 'floating') {
      pushEvent({
        event: 'whatsapp_click',
        button_position: 'floating_whatsapp',
        page_location: window.location.href,
        device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      });
    }
  });

  trackInquirySuccess();
})();
