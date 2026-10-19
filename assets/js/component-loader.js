/**
 * Component Loader System
 * Fetches HTML fragments from /sections/ and injects them into placeholders.
 */

const sections = [
  'header',
  'hero',
  'solutions',
  'lead-magnet',
  'case-studies',
  'distributor',
  'supplier',
  'testimonials',
  'insights',
  'footer'
];

async function loadSections() {
  const loadPromises = sections.map(async (id) => {
    const container = document.getElementById(id);
    if (!container) return;

    try {
      const response = await fetch(`sections/${id}.html`);
      if (!response.ok) throw new Error(`Could not load section: ${id}`);
      const html = await response.text();
      container.innerHTML = html;
      
      // Trigger animations for the new content
      if (window.observer) {
        container.querySelectorAll('.reveal').forEach(el => window.observer.observe(el));
      }
    } catch (err) {
      console.error(`Error loading section ${id}:`, err);
    }
  });

  await Promise.all(loadPromises);
  
  // Dispatch event when all sections are loaded
  document.dispatchEvent(new CustomEvent('sectionsLoaded'));
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', loadSections);
