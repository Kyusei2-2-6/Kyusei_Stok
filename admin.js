(function(){
  "use strict";
  function $(id){ return document.getElementById(id); }

  var LS_KEY = "kyusei_products_admin";
  var LS_SHEET = "kyusei_sheet_csv_url";

  function safeParse(jsonStr, fallback){
    try { return JSON.parse(jsonStr); } catch(e){ return fallback; }
  }

  function loadList(){
    var fromLS = null;
    try { fromLS = localStorage.getItem(LS_KEY); } catch(e){}
    var list = safeParse(fromLS || "[]", []);
    if (!Array.isArray(list)) list = [];
    return list;
  }

  function saveList(list){
    try { localStorage.setItem(LS_KEY, JSON.stringify(list || [])); } catch(e){}
  }

  function loadSheetUrl(){
    var v = "";
    try { v = localStorage.getItem(LS_SHEET) || ""; } catch(e){}
    return v;
  }
  function saveSheetUrl(v){
    try { localStorage.setItem(LS_SHEET, v || ""); } catch(e){}
  }

  function csvEscape(v){
    v = (v == null) ? "" : String(v);
    if (v.indexOf('"') >= 0) v = v.replace(/"/g,'""');
    if (/[",\n]/.test(v)) v = '"' + v + '"';
    return v;
  }

  function toCSV(list){
    var headers = ["code","game","name","price","sold","img","desc"];
    var out = headers.join(",") + "\n";
    for (var i=0;i<list.length;i++){
      var p = list[i] || {};
      var row = [
        p.code, p.game, p.name, p.price,
        (p.sold===true ? "TRUE" : "FALSE"),
        p.img, p.desc
      ].map(csvEscape).join(",");
      out += row + "\n";
    }
    return out;
  }

  function renderTable(list){
    var wrap = $("tableWrap");
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!list.length){
      wrap.innerHTML = "<div class='emptyBox'>Belum ada produk. Tambah dulu yaa 🍼</div>";
      return;
    }

    var table = document.createElement("table");
    table.className = "tbl";
    table.innerHTML = "<thead><tr><th>Code</th><th>Nama</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>";
    var tb = document.createElement("tbody");

    for (var i=0;i<list.length;i++){
      (function(p){
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>"+ (p.code||"-") +"</td>"+
          "<td>"+ (p.name||"-") +"</td>"+
          "<td>"+ (p.price||"-") +"</td>"+
          "<td>"+ (p.sold===true ? "SOLD" : "READY") +"</td>";

        var td = document.createElement("td");
        var edit = document.createElement("button");
        edit.className = "miniBtn";
        edit.textContent = "Edit";
        edit.onclick = function(){ fillForm(p); };

        var del = document.createElement("button");
        del.className = "miniBtn danger";
        del.textContent = "Hapus";
        del.onclick = function(){
          if (!confirm("Hapus produk "+(p.code||"")+" ?")) return;
          var cur = loadList().filter(function(x){ return x.code !== p.code; });
          saveList(cur);
          renderTable(cur);
        };

        td.appendChild(edit);
        td.appendChild(del);
        tr.appendChild(td);
        tb.appendChild(tr);
      })(list[i]);
    }

    table.appendChild(tb);
    wrap.appendChild(table);
  }

  function fillForm(p){
    $("f_code").value = p.code || "";
    $("f_game").value = p.game || "";
    $("f_name").value = p.name || "";
    $("f_price").value = p.price || "";
    $("f_img").value = p.img || "";
    $("f_desc").value = p.desc || "";
    $("f_sold").checked = (p.sold === true);
  }

  function clearForm(){
    fillForm({code:"",game:"",name:"",price:"",img:"",desc:"",sold:false});
  }

  async function testSheet(){
    var url = ($("sheetUrl").value || "").trim();
    var st = $("sheetStatus");
    if (!url){ st.textContent = "Tempel link dulu ya."; return; }
    st.textContent = "Ngetes...";

    try{
      var res = await fetch(url, {cache:"no-store"});
      var txt = await res.text();
      if (txt && txt.length > 10) st.textContent = "OK ✅ Data kebaca.";
      else st.textContent = "Hmm, datanya kosong?";
    }catch(e){
      st.textContent = "Gagal baca link 😿 (cek link / publish).";
    }
  }

  window.initAdmin = function(){
    // load sheet url
    var sheetUrl = $("sheetUrl");
    if (sheetUrl) sheetUrl.value = loadSheetUrl();

    var list = loadList();
    renderTable(list);
    clearForm();

    var saveSheet = $("saveSheet");
    if (saveSheet) saveSheet.onclick = function(){
      var v = (sheetUrl.value || "").trim();
      saveSheetUrl(v);
      var st = $("sheetStatus");
      if (st) st.textContent = v ? "Tersimpan ✅" : "Dikosongkan.";
    };

    var testBtn = $("testSheet");
    if (testBtn) testBtn.onclick = function(){ testSheet(); };

    var addBtn = $("addBtn");
    if (addBtn) addBtn.onclick = function(){
      var p = {
        code: ($("f_code").value || "").trim(),
        game: ($("f_game").value || "").trim(),
        name: ($("f_name").value || "").trim(),
        price: parseInt(($("f_price").value || "0").trim(), 10) || 0,
        sold: $("f_sold").checked === true,
        img: ($("f_img").value || "").trim(),
        desc: ($("f_desc").value || "").trim()
      };
      if (!p.code){ alert("Code wajib diisi yaa"); return; }
      if (!p.name){ alert("Nama wajib diisi yaa"); return; }

      var cur = loadList();
      // replace if same code
      var found = false;
      for (var i=0;i<cur.length;i++){
        if ((cur[i].code||"") === p.code){ cur[i]=p; found=true; break; }
      }
      if (!found) cur.push(p);

      saveList(cur);
      renderTable(cur);
      alert(found ? "Produk di-update ✅" : "Produk ditambah ✅");
    };

    var resetBtn = $("resetBtn");
    if (resetBtn) resetBtn.onclick = function(){ clearForm(); };

    var exportCsv = $("exportCsv");
    if (exportCsv) exportCsv.onclick = function(){
      var cur = loadList();
      $("exportOut").value = toCSV(cur);
    };

    var exportJson = $("exportJson");
    if (exportJson) exportJson.onclick = function(){
      var cur = loadList();
      $("exportOut").value = JSON.stringify(cur, null, 2);
    };

    var importJson = $("importJson");
    if (importJson) importJson.onclick = function(){
      var txt = prompt("Tempel JSON list produk di sini:");
      if (!txt) return;
      var arr = safeParse(txt, null);
      if (!Array.isArray(arr)){ alert("JSON-nya bukan array 😿"); return; }
      saveList(arr);
      renderTable(arr);
      alert("Import OK ✅");
    };

    var clearAll = $("clearAll");
    if (clearAll) clearAll.onclick = function(){
      if (!confirm("Hapus semua produk?")) return;
      saveList([]);
      renderTable([]);
    };

    var copyOut = $("copyOut");
    if (copyOut) copyOut.onclick = function(){
      var ta = $("exportOut");
      if (!ta) return;
      ta.select();
      try { document.execCommand("copy"); alert("Tercopy ✅"); } catch(e){ alert("Gagal copy 😿"); }
    };
  };
})();