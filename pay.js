/* =========================================================
   Kyusei - pay.js (HASH SPA)
   Route: #/pay?code=A001&item=...&price=...
   - QRIS: default assets/qris/qris.jpg (or product.qris)
   - Whatsapp link
   - Save resume links
   ========================================================= */

(function () {
  "use strict";

  var PHONE = "6283863831670"; // format 62..., tanpa +

  function $(id) { return document.getElementById(id); }

  function rupiahSafe(n){
    if (typeof rupiah === "function") return rupiah(n);
    return "Rp" + String(Number(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function resolveAssetUrl(path) {
    try { return new URL(path, document.baseURI).href; }
    catch (e) { return path; }
  }

  function findProductByCode(code) {
    if (typeof PRODUCTS === "undefined" || !Array.isArray(PRODUCTS)) return null;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (String(PRODUCTS[i].code) === String(code)) return PRODUCTS[i];
    }
    return null;
  }

  window.initPay = function (params) {
    var code = params ? (params.get("code") || "") : "";
    var item = params ? (params.get("item") || "Produk") : "Produk";
    var price = params ? (params.get("price") || "") : "";

    var p = code ? findProductByCode(code) : null;

    // INFO HEADER
    var info = $("info");
    if (info) info.textContent = (code || "-") + " • " + item + " • " + rupiahSafe(price || 0);

    // LINK BACK TO PRODUCT
    var productUrl = code ? ("#/product?code=" + encodeURIComponent(code)) : "#/home";

    var productBtn = $("productBtn");
    if (productBtn) productBtn.href = productUrl;

    var backBtn = $("backBtn");
    if (backBtn) backBtn.href = productUrl;

    // SAVE LAST STATE (resume)
    try {
      localStorage.setItem("lastProductUrl", productUrl);

      // save pay url (current hash)
      localStorage.setItem("lastPayUrl", location.hash);
    } catch (e) {}

    // QRIS IMAGE
    var qrisPath = (p && p.qris) ? p.qris : "assets/qris/qris.jpg";

    var qrisImg = $("qrisImg");
    if (qrisImg) {
      qrisImg.src = resolveAssetUrl(qrisPath);
      qrisImg.alt = "QRIS untuk " + (code || "-");

      qrisImg.onerror = function(){
        qrisImg.alt = "QRIS tidak ditemukan: " + qrisPath;
      };
    }

    // WHATSAPP CONFIRMATION
    var text =
      "Halo kak, saya sudah bayar QRIS.\n\n" +
      "Kode: " + code + "\n" +
      "Produk: " + item + "\n" +
      "Harga: " + rupiahSafe(price || 0) + "\n\n" +
      "Saya lampirkan bukti transfer ya kak. Terima kasih 🙏";

    var wa = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);

    var paidBtn = $("paidBtn");
    if (paidBtn) paidBtn.href = wa;

    // rebind music disc
    if (window.__kyuseiMusic) window.__kyuseiMusic.rebind();
  };
})();
