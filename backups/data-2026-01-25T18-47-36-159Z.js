/* =========================================================
   Kyusei - Product Data (CLEANED for NEW ASSETS STRUCTURE)
   - Asset mapping based on user list:
     assets/ui/logo.jpg
     assets/ui/top.jpg
     assets/ui/welcome.png
     assets/qris/qris.jpg
     assets/products/genshin/A001/1.jpg.. etc
     assets/products/ml/B001/1.jpg
     assets/products/toram/C001/1.jpg..9.jpg
   ========================================================= */

var SITE_NAME = "Kyusei";

/**
 * PRODUCT schema (dipakai oleh home/product/pay):
 * {
 *   code: "A001",
 *   name: "Nama Produk",
 *   game: "genshin" | "ml" | "toram",
 *   price: number,
 *   sold?: boolean,
 *   photos: string[],
 *   detail?: string[],
 *   qris?: string   // optional: path QRIS khusus produk, default = assets/qris/qris.jpg
 * }
 */
var PRODUCTS = [
  // =========================
  // GENSHIN IMPACT
  // =========================
  {
    code: "A001",
    name: "Genshin A001",
    game: "genshin",
    price: 50000,
    sold: false,
    photos: [
      "assets/products/genshin/A001/1.jpg",
      "assets/products/genshin/A001/2.jpg",
      "assets/products/genshin/A001/3.jpg"
    ],
    detail: [
      "Isi detail A001 di sini"
    ]
  },
  {
    code: "A002",
    name: "Genshin A002",
    game: "genshin",
    price: 75000,
    sold: false,
    photos: [
      "assets/products/genshin/A002/1.jpg",
      "assets/products/genshin/A002/2.jpg",
      "assets/products/genshin/A002/3.jpg",
      "assets/products/genshin/A002/4.jpg",
      "assets/products/genshin/A002/5.jpg"
    ],
    detail: [
      "Isi detail A002 di sini"
    ]
  },
  {
    code: "A003",
    name: "Genshin A003",
    game: "genshin",
    price: 50000,
    sold: false,
    photos: [
      "assets/products/genshin/A003/1.jpg"
    ],
    detail: [
      "Isi detail A003 di sini"
    ]
  },
  {
    code: "A004",
    name: "Genshin A004",
    game: "genshin",
    price: 50000,
    sold: false,
    photos: [
      "assets/products/genshin/A004/1.jpg",
      "assets/products/genshin/A004/2.jpg"
    ],
    detail: [
      "Isi detail A004 di sini"
    ]
  },
  {
    code: "A005",
    name: "Genshin A005",
    game: "genshin",
    price: 50000,
    sold: false,
    photos: [
      "assets/products/genshin/A005/1.jpg",
      "assets/products/genshin/A005/2.jpg"
    ],
    detail: [
      "Isi detail A005 di sini"
    ]
  },

  // =========================
  // MOBILE LEGENDS
  // =========================
  {
    code: "B001",
    name: "Mobile Legends B001",
    game: "ml",
    price: 0,
    sold: false,
    photos: [
      "assets/products/ml/B001/1.png"
    ],
    detail: [
      "Isi detail B001 di sini"
    ]
  },

  // =========================
  // TORAM ONLINE
  // =========================
  {
    code: "C001",
    name: "Toram C001",
    game: "toram",
    price: 0,
    sold: false,
    photos: [
      "assets/products/toram/C001/1.jpg",
      "assets/products/toram/C001/2.jpg",
      "assets/products/toram/C001/3.jpg",
      "assets/products/toram/C001/4.jpg",
      "assets/products/toram/C001/5.jpg",
      "assets/products/toram/C001/6.jpg",
      "assets/products/toram/C001/7.jpg",
      "assets/products/toram/C001/8.jpg",
      "assets/products/toram/C001/9.jpg"
    ],
    detail: [
      "Isi detail C001 di sini"
    ]
  }
];

// =========================
// Helper
// =========================
function rupiah(n) {
  var num = Number(n || 0);
  return "Rp" + String(Math.trunc(num)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
