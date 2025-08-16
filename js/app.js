
document.addEventListener("DOMContentLoaded", function () {
  const products = [
    {
      name: "Corazón de Lolita Semi-Sweet White Wine",
      category: "wine",
      year: "—",
      country: "Spain",
      image: "images/product-corazon-de-lolita-white-wine-front.jpg"
    },
    {
      name: "Corazón de Lolita RTD Red Wine Cans",
      category: "wine",
      year: "—",
      country: "Spain/Australia/Chile",
      image: "images/product-lolita-rtd-red-wine-cans.jpg"
    },
    {
      name: "Anderra Reserve Carmenere",
      category: "wine",
      year: "2021",
      country: "Chile",
      image: "images/product-anderra-reserva-carmenere-2021.jpg"
    },
    {
      name: "Anderra Reserve Cabernet Sauvignon",
      category: "wine",
      year: "2022",
      country: "Chile",
      image: "images/product-anderra-reserva-cabernet-sauvignon-2022.jpg"
    },
    {
      name: "Honey Conti Côtes du Rhône 2019",
      category: "wine",
      year: "2019",
      country: "France",
      image: "images/product-honey-conti-cotes-du-rhone-2019.jpg"
    },
    {
      name: "Honey Conti VSOP Colorful Edition",
      category: "brandy",
      year: "—",
      country: "France",
      image: "images/product-honey-conti-vsop-colorful.jpg"
    },
    {
      name: "Honey Conti Napoleon VSOP",
      category: "brandy",
      year: "—",
      country: "France",
      image: "images/product-honey-conti-napoleon-vsop.jpg"
    },
    {
      name: "Honey Conti XO Royal",
      category: "brandy",
      year: "—",
      country: "France",
      image: "images/product-honey-conti-xo-royal.jpg"
    },
    {
      name: "Sunny Land Single Malt S25",
      category: "whiskey",
      year: "25yo",
      country: "Scotland",
      image: "images/product-sunny-land-single-malt-s25.jpg"
    },
    {
      name: "Sunny Land French Single Malt",
      category: "whiskey",
      year: "25yo",
      country: "France",
      image: "images/product-sunny-land-single-malt-france.jpg"
    },
    {
      name: "Caribbean Blaze Blended Bourbon 46",
      category: "whiskey",
      year: "—",
      country: "USA",
      image: "images/product-caribbean-blaze-bourbon-46.jpg"
    },
    {
      name: "Caribbean Blaze Blended Bourbon 18",
      category: "whiskey",
      year: "—",
      country: "USA",
      image: "images/product-caribbean-blaze-bourbon-18-box.jpg"
    },
    {
      name: "Royal Honney Conti Soda Water",
      category: "other",
      year: "—",
      country: "—",
      image: "images/product-royal-honney-conti-soda-water.jpg"
    },
    {
      name: "Royal Honney Conti Mixologist Spirits",
      category: "other",
      year: "—",
      country: "—",
      image: "images/product-royal-honney-conti-mixologist-spirits.jpg"
    },
    {
      name: "Royal Honney Conti RTD Cocktails (Cans)",
      category: "other",
      year: "—",
      country: "—",
      image: "images/product-royal-honney-conti-rtd-cocktails.jpg"
    },
    {
      name: "Bernard Magrez Le Symbole 2020",
      category: "wine",
      year: "2020",
      country: "France",
      image: "images/product-bernard-magrez-le-symbole-2020.jpg"
    },
    {
      name: "B.F. Kingdom BE.708 (Wood Box)",
      category: "wine",
      year: "—",
      country: "Australia",
      image: "images/product-bf-kingdom-be708-wood-box.jpg"
    },
    {
      name: "B.F. Kingdom BE.408 (Case)",
      category: "wine",
      year: "2023",
      country: "Australia",
      image: "images/product-bf-kingdom-be408-case.jpg"
    },
    {
      name: "B.F. Kingdom BE.408 (Box)",
      category: "wine",
      year: "2023",
      country: "Australia",
      image: "images/product-bf-kingdom-be408-box.jpg"
    },
    {
      name: "B.F. Kingdom 70 Old Vines (6-Pack)",
      category: "wine",
      year: "2017",
      country: "Australia",
      image: "images/product-bf-kingdom-70-old-vines-6-pack.jpg"
    }
  ];

  const productGrid = document.getElementById("product-grid");

  function renderProducts(filter = "all") {
    productGrid.innerHTML = "";
    const filtered = filter === "all" ? products : products.filter(p => p.category === filter);
    filtered.forEach(product => {
      const card = document.createElement("div");
      card.className = "card product-card";
      card.innerHTML = `
        <div class="product-img">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.year !== "—" ? product.year + " • " : ""}${product.country}</p>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  // Initial render
  renderProducts();

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filters .chip");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      filterButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const filter = this.dataset.filter;
      renderProducts(filter);
    });
  });
});
