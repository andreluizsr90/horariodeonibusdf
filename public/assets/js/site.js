/* ==========================================================================
 * Horário de Ônibus DF — JavaScript do site (Trongate / vanilla JS)
 * Substitui a interatividade que na versão Next.js era feita em React:
 *  - menu mobile e dropdown de Tarifas
 *  - favoritos (localStorage) + estrela toggle + seção de favoritos
 *  - colapso do itinerário
 *  - mapa do trajeto (Leaflet)
 * ========================================================================== */
(function () {
  "use strict";

  // -------------------- Favoritos (localStorage) --------------------
  var FAV_KEY = "honibusdf:favoritos";

  function lerFavoritos() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === "string"; }) : [];
    } catch (e) { return []; }
  }

  function salvarFavoritos(lista) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(lista)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("favoritos:change"));
  }

  function ehFavorito(slug) { return lerFavoritos().indexOf(slug) !== -1; }

  function alternarFavorito(slug) {
    var atual = lerFavoritos();
    var i = atual.indexOf(slug);
    if (i === -1) atual.push(slug); else atual.splice(i, 1);
    salvarFavoritos(atual);
  }

  // Atualiza o visual de todas as estrelas presentes na página.
  function atualizarEstrelas() {
    var botoes = document.querySelectorAll("[data-fav-toggle]");
    botoes.forEach(function (btn) {
      var slug = btn.getAttribute("data-fav-slug");
      var ativo = ehFavorito(slug);
      btn.setAttribute("aria-pressed", ativo ? "true" : "false");
      var numero = btn.getAttribute("data-fav-numero") || "linha";
      btn.setAttribute("aria-label", (ativo ? "Remover linha " : "Adicionar linha ") + numero + (ativo ? " dos favoritos" : " aos favoritos"));
      btn.classList.toggle("text-accent-500", ativo);
      btn.classList.toggle("text-slate-400", !ativo);
      var icon = btn.querySelector(".star-icon");
      if (icon) {
        icon.setAttribute("fill", ativo ? "currentColor" : "none");
        icon.setAttribute("stroke-width", ativo ? "0" : "1.5");
      }
    });
  }

  // Clique nas estrelas (delegado).
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-fav-toggle]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    alternarFavorito(btn.getAttribute("data-fav-slug"));
  });

  document.addEventListener("favoritos:change", atualizarEstrelas);
  window.addEventListener("storage", function (e) { if (e.key === FAV_KEY) atualizarEstrelas(); });

  // -------------------- Menu mobile + dropdown --------------------
  function initNav() {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("hidden") === false;
        mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var dd = document.querySelector("[data-dropdown]");
    if (dd) {
      var toggle = dd.querySelector("[data-dropdown-toggle]");
      var menu = dd.querySelector("[data-dropdown-menu]");
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("hidden") === false;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!dd.contains(e.target)) { menu.classList.add("hidden"); toggle.setAttribute("aria-expanded", "false"); }
      });
    }
  }

  // -------------------- Itinerário (colapso) --------------------
  function initItinerario() {
    var btn = document.querySelector("[data-itinerario-toggle]");
    var extra = document.querySelector("[data-itinerario-extra]");
    var scroller = document.querySelector("[data-itinerario-scroller]");
    if (!btn || !extra) return;
    btn.addEventListener("click", function () {
      var aberto = extra.classList.toggle("hidden") === false;
      btn.setAttribute("aria-expanded", aberto ? "true" : "false");
      btn.textContent = aberto ? "Recolher itinerário" : btn.getAttribute("data-label-fechado");
      if (scroller) scroller.classList.toggle("max-h-[26rem]", aberto);
      if (scroller) scroller.classList.toggle("overflow-y-auto", aberto);
    });
  }

  // -------------------- Mapa do trajeto (Leaflet) --------------------
  function initMapa() {
    var el = document.getElementById("mapa-trajeto");
    if (!el || typeof L === "undefined") return;
    var percurso;
    try { percurso = JSON.parse(el.getAttribute("data-percurso") || "{}"); } catch (e) { return; }
    var ida = percurso.ida || [];
    var volta = percurso.volta || [];
    if (!ida.length && !volta.length) return;

    var map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap", maxZoom: 19
    }).addTo(map);

    var todas = [];
    if (ida.length) { L.polyline(ida, { color: "#1d63f1", weight: 4 }).addTo(map); todas = todas.concat(ida); }
    if (volta.length) { L.polyline(volta, { color: "#e69100", weight: 3, dashArray: "6 6" }).addTo(map); todas = todas.concat(volta); }

    if (todas.length) {
      var origem = ida[0] || volta[0];
      var destino = ida[ida.length - 1] || volta[volta.length - 1];
      L.circleMarker(origem, { radius: 7, color: "#059669", fillColor: "#10b981", fillOpacity: 1 }).addTo(map).bindPopup("Origem");
      L.circleMarker(destino, { radius: 7, color: "#164ede", fillColor: "#1d63f1", fillOpacity: 1 }).addTo(map).bindPopup("Destino");
      map.fitBounds(L.latLngBounds(todas).pad(0.1));
    }
  }

  // -------------------- Home (busca + lista + favoritos) --------------------
  var STAR = "M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z";
  var BASE = document.querySelector("base") ? document.querySelector("base").href : "/";

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  function estrelaHtml(linha, extraClass) {
    return '<button type="button" data-fav-toggle data-fav-slug="' + esc(linha.slug) + '" data-fav-numero="' + esc(linha.numero) +
      '" aria-pressed="false" class="' + (extraClass || "") + ' inline-flex items-center rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-accent-500">' +
      '<svg class="star-icon h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linejoin="round" d="' + STAR + '"/></svg></button>';
  }

  function subtitulo(linha) {
    var partes = [linha.origem, linha.destino].filter(Boolean);
    if (partes.length) return esc(partes.join(" → "));
    return esc(linha.cidadeNome || "");
  }

  function cardLinha(linha) {
    return '<li class="relative">' +
      '<a href="' + BASE + 'linhas/' + encodeURIComponent(linha.slug) + '" class="card group flex items-center gap-4 p-4 pr-12">' +
      '<span class="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">' + esc(linha.numero || "—") + '</span>' +
      '<span class="min-w-0"><span class="block truncate font-semibold text-slate-800 group-hover:text-brand-700">' + esc(linha.nome) + '</span>' +
      (subtitulo(linha) ? '<span class="mt-0.5 block truncate text-sm text-slate-500">' + subtitulo(linha) + '</span>' : '') +
      '</span></a>' + estrelaHtml(linha, "absolute right-2 top-2") + '</li>';
  }

  function cardFavorito(linha) {
    var acoes = '<a href="' + BASE + 'linhas/' + encodeURIComponent(linha.slug) + '" class="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">Ver Horários</a>';
    if (linha.semob) {
      acoes += '<a href="' + BASE + 'linhas/' + encodeURIComponent(linha.slug) + '/localizacao" class="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"><span class="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500"></span>Ver Localização</a>';
    }
    return '<li class="relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">' +
      '<div class="flex items-start gap-3 pr-9"><span class="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">' + esc(linha.numero || "—") + '</span>' +
      '<span class="min-w-0"><span class="block truncate font-semibold text-slate-800">' + esc(linha.nome) + '</span>' +
      (subtitulo(linha) ? '<span class="mt-0.5 block truncate text-sm text-slate-500">' + subtitulo(linha) + '</span>' : '') + '</span></div>' +
      estrelaHtml(linha, "absolute right-2 top-2") +
      '<div class="mt-4 flex flex-wrap gap-2">' + acoes + '</div></li>';
  }

  function initHome() {
    var lista = document.getElementById("linhas-lista");
    if (!lista || !Array.isArray(window.__LINHAS)) return;
    var todas = window.__LINHAS;
    var mapa = {};
    todas.forEach(function (l) { mapa[l.slug] = l; });

    var busca = document.getElementById("busca-linha");
    var status = document.getElementById("busca-status");
    var secaoFav = document.getElementById("favoritos");

    function renderLista() {
      var termo = (busca && busca.value || "").trim().toLowerCase();
      // __LINHAS_LIMITE: quantas exibir sem busca ativa (0/undefined = todas;
      // a home usa 50). Definido pela view.
      var limite = typeof window.__LINHAS_LIMITE === "number" ? window.__LINHAS_LIMITE : 50;
      var res = termo
        ? todas.filter(function (l) {
            return (l.nome || "").toLowerCase().indexOf(termo) !== -1 ||
                   (l.numero || "").toLowerCase().indexOf(termo) !== -1 ||
                   (l.origem || "").toLowerCase().indexOf(termo) !== -1 ||
                   (l.destino || "").toLowerCase().indexOf(termo) !== -1;
          })
        : (limite > 0 ? todas.slice(0, limite) : todas);
      lista.innerHTML = res.length ? res.map(cardLinha).join("") : '<li class="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Nenhuma linha encontrada.</li>';
      if (status) {
        status.textContent = termo
          ? res.length + " resultado" + (res.length === 1 ? "" : "s") + ' para "' + (busca.value) + '"'
          : (res.length < todas.length
              ? "Exibindo " + res.length + " de " + todas.length + " linhas"
              : todas.length + " linhas disponíveis");
      }
      atualizarEstrelas();
    }

    function renderFavoritos() {
      if (!secaoFav) return;
      var favs = lerFavoritos().map(function (s) { return mapa[s]; }).filter(Boolean);
      if (!favs.length) { secaoFav.classList.add("hidden"); secaoFav.innerHTML = ""; return; }
      secaoFav.classList.remove("hidden");
      secaoFav.innerHTML =
        '<div class="mb-4 flex items-center gap-2"><svg class="h-5 w-5 text-accent-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="' + STAR + '"/></svg>' +
        '<h2 id="favoritos-titulo" class="text-lg font-bold text-slate-900">Minhas Linhas Favoritas</h2>' +
        '<span class="rounded-full bg-accent-500/20 px-2.5 py-0.5 text-xs font-semibold text-accent-600">' + favs.length + '</span></div>' +
        '<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">' + favs.map(cardFavorito).join("") + '</ul>';
      atualizarEstrelas();
    }

    if (busca) busca.addEventListener("input", renderLista);
    document.addEventListener("favoritos:change", renderFavoritos);
    renderFavoritos();
    renderLista();
  }

  // -------------------- Tarifas do Entorno (busca) --------------------
  // Regex de marcas diacríticas montada por código (evita caracteres
  // combinantes literais no arquivo-fonte).
  var MARCAS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");

  function normalizar(s) {
    return (s || "").normalize("NFD").replace(MARCAS, "").toLowerCase();
  }

  function initTarifas() {
    var busca = document.getElementById("busca-tarifa");
    var lista = document.getElementById("tarifas-lista");
    if (!busca || !lista) return;
    var itens = Array.prototype.slice.call(lista.querySelectorAll("li"));
    var status = document.getElementById("tarifa-status");
    var vazio = document.getElementById("tarifas-vazio");

    busca.addEventListener("input", function () {
      var termo = normalizar(busca.value.trim());
      var visiveis = 0;
      itens.forEach(function (li) {
        var alvo = normalizar(li.getAttribute("data-busca"));
        var mostra = !termo || alvo.indexOf(termo) !== -1;
        li.classList.toggle("hidden", !mostra);
        if (mostra) visiveis++;
      });
      if (status) {
        status.textContent = termo
          ? visiveis + " resultado" + (visiveis === 1 ? "" : "s") + ' para "' + busca.value + '"'
          : itens.length + " trajetos disponíveis";
      }
      if (vazio) vazio.classList.toggle("hidden", visiveis !== 0);
    });
  }

  // -------------------- GPS em tempo real (Leaflet) --------------------
  var GPS_INTERVALO = 10; // segundos

  /** Converte o GeoJSON do DFTrans em veículos [{id,lat,lng,velocidade}]. */
  function normalizarFeed(fc) {
    var out = [];
    var feats = (fc && fc.features) || [];
    for (var i = 0; i < feats.length; i++) {
      var f = feats[i];
      var c = f.geometry && f.geometry.coordinates;
      if (!c || c.length < 2) continue;
      // GeoJSON é [lng, lat]; o Leaflet espera [lat, lng].
      var lng = Number(c[0]), lat = Number(c[1]);
      if (!isFinite(lat) || !isFinite(lng)) continue;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
      var p = f.properties || {};
      out.push({
        id: p.numero != null ? String(p.numero) : lat.toFixed(5) + "," + lng.toFixed(5),
        lat: lat, lng: lng,
        velocidade: p.velocidade != null ? Number(p.velocidade) : null
      });
    }
    return out;
  }

  function initGps() {
    var el = document.getElementById("mapa-localizacao");
    if (!el || typeof L === "undefined") return;

    var numero = el.getAttribute("data-numero");
    var percurso = null;
    try { percurso = JSON.parse(el.getAttribute("data-percurso") || "null"); } catch (e) {}

    var statusEl = document.getElementById("gps-status");
    var contadorEl = document.getElementById("gps-contador");

    var map = L.map(el, { scrollWheelZoom: false }).setView([-15.7934, -47.8822], 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; colaboradores do OpenStreetMap", maxZoom: 19
    }).addTo(map);

    // O TRAÇADO é estático: desenhado UMA vez (nunca redesenhado nos ciclos).
    var pontosRota = [];
    if (percurso) {
      if (percurso.ida && percurso.ida.length) {
        L.polyline(percurso.ida, { color: "#1d63f1", weight: 4, opacity: 0.7 }).addTo(map);
        pontosRota = pontosRota.concat(percurso.ida);
      }
      if (percurso.volta && percurso.volta.length) {
        L.polyline(percurso.volta, { color: "#dc2626", weight: 3, opacity: 0.7, dashArray: "6 6" }).addTo(map);
        pontosRota = pontosRota.concat(percurso.volta);
      }
      if (pontosRota.length) map.fitBounds(L.latLngBounds(pontosRota).pad(0.1));
    }

    // Cache de marcadores por id do veículo — a cada ciclo só a POSIÇÃO muda.
    var marcadores = {};
    var icone = L.divIcon({
      className: "",
      html: '<div style="background:#1d63f1;border:2px solid #fff;border-radius:9999px;width:16px;height:16px;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8]
    });

    function atualizarVeiculos(veiculos) {
      var vistos = {};
      veiculos.forEach(function (v) {
        vistos[v.id] = true;
        var texto = "Veículo " + v.id + (v.velocidade != null && isFinite(v.velocidade) ? " · " + v.velocidade + " km/h" : "");
        if (marcadores[v.id]) {
          marcadores[v.id].setLatLng([v.lat, v.lng]).setPopupContent(texto);
        } else {
          marcadores[v.id] = L.marker([v.lat, v.lng], { icon: icone }).addTo(map).bindPopup(texto);
        }
      });
      // Remove os que sumiram do feed.
      Object.keys(marcadores).forEach(function (id) {
        if (!vistos[id]) { map.removeLayer(marcadores[id]); delete marcadores[id]; }
      });
    }

    function buscar() {
      if (statusEl) statusEl.textContent = "Atualizando…";
      fetch("https://www.sistemas.dftrans.df.gov.br/gps/linha/" + encodeURIComponent(numero) + "/geo/recent")
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (fc) {
          var veiculos = normalizarFeed(fc);
          atualizarVeiculos(veiculos);
          if (statusEl) {
            statusEl.textContent = veiculos.length
              ? veiculos.length + " ônibus em operação agora"
              : "Nenhum ônibus transmitindo posição no momento.";
          }
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "Não foi possível obter as posições agora. Nova tentativa em instantes.";
        });
    }

    // Ciclo: contador regressivo → busca → reinicia.
    var restante = 0;
    buscar();
    restante = GPS_INTERVALO;
    setInterval(function () {
      restante--;
      if (restante <= 0) { buscar(); restante = GPS_INTERVALO; }
      if (contadorEl) contadorEl.textContent = restante;
    }, 1000);
  }

  // -------------------- Bootstrap --------------------
  function init() {
    atualizarEstrelas();
    initNav();
    initItinerario();
    initMapa();
    initHome();
    initTarifas();
    initGps();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
