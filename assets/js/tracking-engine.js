/**
 * Tracking & Conversion Engine
 * Integrates with GTM (dataLayer) and Klaviyo.
 */

const TrackingEngine = {
  init() {
    document.addEventListener('sectionsLoaded', () => {
      this.bindForms();
      this.bindBrochureDownloads();
    });
  },

  pushGTM(event, data = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: event,
      ...data
    });
    console.log(`[GTM Event] ${event}`, data);
  },

  pushKlaviyo(email, listId, tags = []) {
    // Integration hook for Klaviyo
    if (window.klaviyo) {
      window.klaviyo.push(['identify', { '$email': email }]);
      window.klaviyo.push(['track', 'FormSubmission', { listId, tags }]);
    }
    console.log(`[Klaviyo] ${email} added to ${listId} with tags: ${tags}`);
  },

  bindForms() {
    // Lead Magnet Form
    const magnetForm = document.getElementById('leadMagnetForm');
    if (magnetForm) {
      magnetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('magnet-email').value;
        this.pushGTM('LeadMagnetSubmit', { email });
        this.pushKlaviyo(email, 'Market Entry Guide Leads', ['lead-magnet']);
        this.showSuccess(magnetForm, 'Guide Sent! Check your email.');
      });
    }

    // Distributor Form
    const distForm = document.getElementById('distributorForm');
    if (distForm) {
      distForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('dist-email').value;
        const data = {
          company: document.getElementById('dist-company').value,
          region: document.getElementById('dist-region').value,
          volume: document.getElementById('dist-volume').value
        };
        this.pushGTM('DistributorFormSubmit', data);
        this.pushKlaviyo(email, 'Distributor Leads', ['distributor']);
        this.showSuccess(distForm, 'Application Submitted Successfully.');
      });
    }

    // Supplier Form
    const supForm = document.getElementById('supplierForm');
    if (supForm) {
      supForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('sup-email').value;
        const data = {
          name: document.getElementById('sup-name').value,
          country: document.getElementById('sup-country').value,
          product: document.getElementById('sup-product').value
        };
        this.pushGTM('SupplierFormSubmit', data);
        this.pushKlaviyo(email, 'Supplier Leads', ['supplier']);
        this.showSuccess(supForm, 'Inquiry Sent. Our sourcing team will contact you.');
      });
    }
  },

  bindBrochureDownloads() {
    document.querySelectorAll('a[download]').forEach(link => {
      link.addEventListener('click', () => {
        this.pushGTM('BrochureDownloadClick', { filename: link.getAttribute('download') });
      });
    });
  },

  showSuccess(form, message) {
    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = `${message} ✓`;
    btn.classList.add('bg-green-500', 'border-none');
    btn.disabled = true;
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('bg-green-500');
      btn.disabled = false;
      form.reset();
    }, 5000);
  }
};

TrackingEngine.init();
