
document.addEventListener("DOMContentLoaded", () => {
  // lucide icons
  if (window.lucide) lucide.createIcons();

  // year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // mobile menu toggle
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  toggle?.addEventListener("click", () => {
    menu?.classList.toggle("open");
    if (menu?.classList.contains("open")) {
      menu.style.display = "flex";
      menu.style.flexDirection = "column";
      menu.style.gap = "12px";
      menu.style.background = "#fff";
      menu.style.position = "absolute";
      menu.style.top = "60px";
      menu.style.right = "12px";
      menu.style.padding = "12px";
      menu.style.border = "1px solid #eee";
      menu.style.borderRadius = "12px";
      menu.style.boxShadow = "0 10px 28px rgba(0,0,0,.10)";
    } else {
      menu.style.display = "";
      menu.removeAttribute("style");
    }
  });

  // Load products
  const grid = document.getElementById("product-grid");
  let allProducts = [];
  fetch("products.json")
    .then(r => r.json())
    .then(data => {
      allProducts = data;
      renderProducts(allProducts);
    })
    .catch(() => {
      grid.innerHTML = `<p style="text-align:center;color:#6b7280">Unable to load products.</p>`;
    });

  function productCard(p) {
    return `
    <article class="card product">
      <div class="image"><img src="${p.image}" alt="${p.name}"></div>
      <div class="body">
        <div class="meta">
          <span class="pill">${p.category[0].toUpperCase()+p.category.slice(1)}</span>
          ${p.featured ? '<span class="pill featured">Featured</span>' : ''}
        </div>
        <h3 style="margin:6px 0 8px">${p.name}</h3>
        <p style="color:#6b7280;font-size:.95rem;margin:0 0 10px">${p.description||''}</p>
        <div style="display:grid;grid-template-columns:1fr auto;gap:6px;font-size:.85rem;color:#6b7280">
          ${p.alcohol ? `<div>Alcohol:</div><div><strong>${p.alcohol}</strong></div>`: ""}
          ${p.volume ? `<div>Volume:</div><div><strong>${p.volume}</strong></div>`: ""}
          ${p.origin ? `<div>Origin:</div><div><strong>${p.origin}</strong></div>`: ""}
        </div>
        ${p.notes ? `<div style="margin-top:10px;padding:10px;background:#f7f7f7;border-radius:10px"><strong style="font-size:.8rem">Tasting Notes</strong><div style="font-size:.85rem;color:#4b5563">${p.notes}</div></div>`:''}
      </div>
    </article>`;
  }

  function renderProducts(list){
    grid.innerHTML = list.map(productCard).join("");
    if (window.lucide) lucide.createIcons();
  }

  // filters
  document.querySelectorAll(".chip").forEach(ch => {
    ch.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      ch.classList.add("active");
      const f = ch.getAttribute("data-filter");
      if (f === "all") renderProducts(allProducts);
      else renderProducts(allProducts.filter(p => p.category === f));
    });
  });

  // Chat widget
  const openBtn = document.getElementById("chat-open");
  const panel = document.getElementById("chat");
  const closeBtn = document.getElementById("chat-close");
  const messages = document.getElementById("chat-messages");
  const input = document.getElementById("chat-text");
  const send = document.getElementById("chat-send");

  function addMsg(type, text){
    const el = document.createElement("div");
    el.className = `msg ${type}`;
    el.innerHTML = `<div class="bubble">${text}</div>`;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTyping(){
    const el = document.createElement("div");
    el.className = "msg bot typing";
    el.innerHTML = `<div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
    }

  // initial bot greeting
  addMsg("bot", "Welcome to Sunny Hocha! I can help you discover our wines, whiskeys, brandies and vodka. What can I help you with today?");

  openBtn?.addEventListener("click", () => {
    panel.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  });
  closeBtn?.addEventListener("click", () => panel.classList.add("hidden"));

  function botReply(userText){
    const t = userText.toLowerCase();
    if (t.includes("wine")) return "Our wines range from light and floral to bold and full-bodied. Would you like reds or whites?";
    if (t.includes("whiskey")) return "We carry smooth blends and single malts. Interested in something smoky or sweet?";
    if (t.includes("vodka")) return "Solaris Vodka is triple-filtered for a clean, silky finish—great neat or in cocktails.";
    if (t.includes("brandy")) return "Our brandies are aged to develop rich fruit and oak notes. Perfect after dinner.";
    if (t.includes("gift")) return "Gifting? Tell me a budget and preferred spirit and I’ll recommend a bottle.";
    if (t.includes("whatsapp")) return 'You can reach us on WhatsApp at <a href="https://wa.me/85269346630" target="_blank" rel="noopener">+852 6934 6630</a>.';
    return "We offer a curated selection of premium spirits. Ask me about wines, whiskey, vodka, or gift recommendations.";
  }

  function sendMessage(){
    const txt = (input.value || "").trim();
    if (!txt) return;
    addMsg("user", txt);
    input.value = "";
    const typing = addTyping();
    setTimeout(() => {
      typing.remove();
      addMsg("bot", botReply(txt));
    }, 700);
  }

  send?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
});
