(function(){
  "use strict";

  var LS_KEY = "kyusei_products_admin";
  var LS_SHEET = "kyusei_sheet_csv_url";

  function getSheetUrl(){
    // 1) from config.js (recommended for public)
    if (typeof SHEET_CSV_URL === "string" && SHEET_CSV_URL.trim()) return SHEET_CSV_URL.trim();
    // 2) fallback: from localStorage (useful for testing on your device)
    try { return (localStorage.getItem(LS_SHEET) || "").trim(); } catch(e) {}
    return "";
  }

  function safeParse(jsonStr, fallback){
    try { return JSON.parse(jsonStr); } catch(e){ return fallback; }
  }

  function loadFromLocal(){
    try{
      var raw = localStorage.getItem(LS_KEY);
      var arr = safeParse(raw || "[]", []);
      if (Array.isArray(arr) && arr.length) return arr;
    }catch(e){}
    return [];
  }

  // Very small CSV parser that supports quoted fields
  function parseCSV(text){
    var rows = [];
    var i=0, cur="", row=[], inQ=false;
    function pushCell(){ row.push(cur); cur=""; }
    function pushRow(){ rows.push(row); row=[]; }
    while(i < text.length){
      var ch = text[i];
      if (inQ){
        if (ch === '"'){
          if (text[i+1] === '"'){ cur += '"'; i++; }
          else inQ=false;
        } else cur += ch;
      } else {
        if (ch === '"') inQ=true;
        else if (ch === ','){ pushCell(); }
        else if (ch === '\n'){ pushCell(); pushRow(); }
        else if (ch === '\r'){ /* ignore */ }
        else cur += ch;
      }
      i++;
    }
    if (cur.length || row.length){ pushCell(); pushRow(); }
    return rows;
  }

  function mapRows(rows){
    if (!rows || rows.length < 2) return [];
    var headers = rows[0].map(function(x){ return (x||"").trim(); });
    var out = [];
    for (var r=1;r<rows.length;r++){
      var obj = {};
      for (var c=0;c<headers.length;c++){
        obj[headers[c]] = (rows[r][c] || "").trim();
      }
      if (!obj.code) continue;
      out.push({
        code: obj.code,
        game: obj.game || "",
        name: obj.name || "",
        price: parseInt(obj.price || "0", 10) || 0,
        sold: String(obj.sold || "").toUpperCase() === "TRUE" || String(obj.sold||"").toUpperCase()==="YES",
        photos: (obj.img ? [obj.img] : []),
        desc: obj.desc || ""
      });
    }
    return out;
  }

  async function loadFromSheet(url){
    var res = await fetch(url, { cache: "no-store" });
    var txt = await res.text();
    var rows = parseCSV(txt);
    return mapRows(rows);
  }

  window.__kyuseiStock = {
    load: async function(){
      // Priority: Sheet URL -> Local storage -> existing PRODUCTS from data.js
      var url = getSheetUrl();
      if (url){
        try{
          var list = await loadFromSheet(url);
          window.PRODUCTS = list;
          return list;
        }catch(e){
          console.warn("Sheet load failed:", e);
        }
      }
      var local = loadFromLocal();
      if (local && local.length){
        // normalize to site format
        window.PRODUCTS = local.map(function(p){
          return {
            code: p.code,
            game: p.game || "",
            name: p.name || "",
            price: parseInt(p.price||0,10)||0,
            sold: p.sold===true,
            photos: (p.img ? [p.img] : (p.photos||[])),
            desc: p.desc || ""
          };
        });
        return window.PRODUCTS;
      }
      // fallback: keep PRODUCTS from data.js (might be empty)
      return (window.PRODUCTS || []);
    }
  };
})();