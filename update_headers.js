const fs = require('fs');
const path = require('path');

const targetFiles = [
  'about.html',
  'blog.html',
  'case-studies.html',
  'news.html',
  'products.html'
];

const headerReplacement = `  <header id="site-header" class="bg-gray-900 absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-50 transition-all duration-300">
    <!-- Logo -->
    <a href="index.html" class="logo flex items-center gap-2" aria-label="U.S.C — Home">
      <img src="united-spirits-site/assets/img/微信图片_20260403164412_266_408.png"
           class="logo-icon-img h-11 w-11 rounded-full object-cover"
           alt="United Spirits Logo" />
      <span class="text-white font-semibold">U.S.C</span>
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-8">
      <a href="index.html#collections" class="text-white hover:text-pink-300 transition-colors">Collections</a>
      <a href="index.html#featured" class="text-white hover:text-pink-300 transition-colors">Featured</a>
      <a href="news.html" class="text-white hover:text-pink-300 transition-colors">News</a>
      <a href="index.html#contact" class="text-white hover:text-pink-300 transition-colors">Contact</a>
    </nav>

    <!-- Mobile Menu Button -->
    <button
      id="mobileMenuButton"
      class="md:hidden p-2 text-white"
      aria-label="Toggle menu"
    >
      ☰
    </button>
  </header>`;

const footerReplacement = `  <footer class="bg-gray-900 text-white py-12 mt-auto">
    <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
      <!-- Company Info + Socials -->
      <div>
        <a href="index.html" class="flex items-center gap-3 mb-4">
          <img src="united-spirits-site/assets/img/hang.png" alt="United Spirits Logo" class="h-12 w-auto" />
          <span class="font-serif text-xl tracking-wide">U.S.C</span>
        </a>
        <p class="text-gray-400 mb-6 tracking-widest text-sm uppercase leading-relaxed">
          From the world<br>for the world
        </p>
        <div class="flex gap-4">
          <a href="https://x.com/unitedspiritshk" target="_blank" aria-label="X" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </a>
          <a href="https://www.youtube.com" target="_blank" aria-label="YouTube" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.76 49.76 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.76 49.76 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
              <path d="m10 15 5-3-5-3z"></path>
            </svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61579254602509" target="_blank" aria-label="Facebook" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="https://www.instagram.com/united_spiritshk/" target="_blank" aria-label="Instagram" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://wa.me/85269346630" target="_blank" aria-label="WhatsApp" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.3 8.3 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.7z"></path>
              <polyline points="15.5,9 9.5,15 6.5,12"></polyline>
            </svg>
          </a>
        </div>
      </div>
  
      <!-- Quick Links -->
      <div>
        <h3 class="text-lg font-semibold mb-6">Quick Links</h3>
        <ul class="space-y-3">
          <li><a href="index.html#collections" class="text-gray-400 hover:text-pink-400 transition-colors">Collections</a></li>
          <li><a href="index.html#featured" class="text-gray-400 hover:text-pink-400 transition-colors">Featured Bottles</a></li>
          <li><a href="news.html" class="text-gray-400 hover:text-pink-400 transition-colors">News</a></li>
          <li><a href="index.html#contact" class="text-gray-400 hover:text-pink-400 transition-colors">Contact Us</a></li>
        </ul>
      </div>
  
      <!-- Contact Info -->
      <div>
        <h3 class="text-lg font-semibold mb-6">Get in Touch</h3>
        <p class="text-gray-400 mb-4">
          Room 1002, 10/F, Easey Commercial Building,<br>
          253-261 Hennessy Road, Wanchai, Hong Kong
        </p>
        <p class="text-gray-400 mb-4">
          <strong>Email:</strong> <a href="mailto:info@unitedspiritshk.com" class="hover:text-pink-400 transition-colors">info@unitedspiritshk.com</a>
        </p>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.278571866072!2d114.17930467515414!3d22.281556037114364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340401e1a53c7b89%3A0x8130550006672c5a!2sEasey%20Commercial%20Building!5e0!3m2!1sen!2sus!4v1714880000000!5m2!1sen!2sus" 
          width="100%" 
          height="300" 
          style="border:0; border-radius: 1rem;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <div class="mt-4 text-center">
          <a href="https://www.google.com/maps/place/Easey+Commercial+Building/@22.281556,114.1793047,17z/data=!3m1!4b1!4m6!3m5!1s0x340401e1a53c7b89:0x8130550006672c5a!8m2!3d22.281556!4d114.181885!16s%2Fg%2F11c5yqjx8q?entry=ttu" 
             target="_blank" 
             class="text-sm text-pink-400 hover:underline">
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  
    <!-- Bottom Bar -->
    <div class="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm">
      <p>
        <a href="mailto:info@unitedspiritshk.com" class="hover:text-pink-400 transition-colors">info@unitedspiritshk.com</a>
        &nbsp;|&nbsp;
        &copy; 2025 Spirits United Supply Chain Co., Limited. All rights reserved. Crafted with care — Hong Kong
      </p>
    </div>
  </footer>`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace header block
  content = content.replace(/<header[\s\S]*?<\/header>/i, headerReplacement);
  
  // Replace footer block
  content = content.replace(/<footer[\s\S]*?<\/footer>/i, footerReplacement);
  
  // Also fix padding if the absolute header overlaps the content because it needs pt-24 at the top of the main wrap
  // But we'll just replace the tags.
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
