/* ==========================================================================
 * Horário de Ônibus DF — melhorias progressivas (vanilla JS)
 *
 * Princípio: o HTML já vem completo do servidor. O JS apenas ENRIQUECE —
 * favoritos (localStorage), filtro instantâneo, menus e mapas. Sem JS, o site
 * continua navegável e a busca funciona via submit do formulário.
 * ========================================================================== */
(function () {
  "use strict";

  var FAV_KEY = "honibusdf:favoritos";
  var MARCAS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");

  function normalizar(s) {
    return (s || "").normalize("NFD").replace(MARCAS, "").toLowerCase();
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  // ==================== Favoritos (localStorage) ====================

  function lerFavoritos() {
    try {
      var arr = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === "string"; }) : [];
    } catch (e) { return []; }
  }

  function salvarFavoritos(lista) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(lista)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("favoritos:change"));
  }

  function alternarFavorito(slug) {
    var atual = lerFavoritos();
    var i = atual.indexOf(slug);
    if (i === -1) atual.push(slug); else atual.splice(i, 1);
    salvarFavoritos(atual);
  }

  /** Sincroniza o visual de todas as estrelas com o storage. */
  function pintarEstrelas() {
    var favs = lerFavoritos();
    document.querySelectorAll("[data-fav-toggle]").forEach(function (btn) {
      var ativo = favs.indexOf(btn.getAttribute("data-fav-slug")) !== -1;
      var numero = btn.getAttribute("data-fav-numero") || "";
      btn.setAttribute("aria-pressed", ativo ? "true" : "false");
      btn.setAttribute("aria-label",
        (ativo ? "Remover linha " : "Adicionar linha ") + numero + (ativo ? " dos favoritos" : " aos favoritos"));
      btn.classList.toggle("star-ativo", ativo);
      var icone = btn.querySelector(".star-icon");
      if (icone) {
        icone.setAttribute("fill", ativo ? "currentColor" : "none");
        icone.setAttribute("stroke-width", ativo ? "0" : "1.5");
      }
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-fav-toggle]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var slug = btn.getAttribute("data-fav-slug");
    var eraFavorito = lerFavoritos().indexOf(slug) !== -1;
    var sec = document.getElementById("favoritos");

    // Feedback imediato: ao desfavoritar pela própria seção de favoritos,
    // some com o card na hora (a sincronização com o servidor vem depois).
    if (eraFavorito && sec && sec.contains(btn)) {
      var card = btn.closest("li");
      if (card) card.remove();
    }

    alternarFavorito(slug);
  });

  document.addEventListener("favoritos:change", pintarEstrelas);
  window.addEventListener("storage", function (e) { if (e.key === FAV_KEY) pintarEstrelas(); });

  // ==================== Seção "Minhas Linhas Favoritas" ====================
  // O HTML dos cards vem do SERVIDOR (/favoritos?slugs=…), renderizado pelo
  // mesmo template das listagens — nenhum markup duplicado aqui.

  var favoritosPendente = false;
  var favoritosDesatualizado = false;

  function renderFavoritos() {
    var sec = document.getElementById("favoritos");
    if (!sec) return;

    // Já há um fetch em andamento: marca para refazer ao terminar, em vez de
    // descartar a atualização (senão cliques rápidos dessincronizam a UI).
    if (favoritosPendente) {
      favoritosDesatualizado = true;
      return;
    }

    var favs = lerFavoritos();

    if (!favs.length) {
      sec.classList.add("hidden");
      sec.innerHTML = "";
      return;
    }

    favoritosPendente = true;

    fetch("/favoritos?slugs=" + encodeURIComponent(favs.join(",")))
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (html) {
        if (html.trim()) {
          sec.innerHTML = html;
          sec.classList.remove("hidden");
          pintarEstrelas();
        } else {
          sec.classList.add("hidden");
          sec.innerHTML = "";
        }
      })
      .catch(function () { /* mantém o que já está na tela */ })
      .finally(function () {
        favoritosPendente = false;
        if (favoritosDesatualizado) {
          favoritosDesatualizado = false;
          renderFavoritos();
        }
      });
  }

  // ==================== Filtro instantâneo (melhoria) ====================
  // O form já funciona sem JS (GET /linhas?q=…). Aqui filtramos os cards
  // visíveis para dar resposta imediata enquanto o usuário digita.

  function initFiltro() {
    var input = document.getElementById("busca-linha");
    var lista = document.getElementById("linhas-lista");
    if (!input || !lista) return;

    var cards = Array.prototype.slice.call(lista.querySelectorAll("[data-linha]"));
    var vazio = document.getElementById("linhas-vazio");
    var status = document.getElementById("busca-status");
    var statusOriginal = status ? status.textContent : "";
    var linkTodos = document.getElementById("busca-todos");

    input.addEventListener("input", function () {
      var termo = normalizar(input.value.trim());
      var visiveis = 0;

      cards.forEach(function (card) {
        var mostra = !termo || normalizar(card.getAttribute("data-busca")).indexOf(termo) !== -1;
        card.classList.toggle("hidden", !mostra);
        if (mostra) visiveis++;
      });

      if (vazio) vazio.classList.toggle("hidden", visiveis !== 0);
      if (linkTodos && termo) linkTodos.href = "/linhas?q=" + encodeURIComponent(input.value.trim());
      if (status) {
        status.textContent = termo
          ? visiveis + " de " + cards.length + " exibidas correspondem a “" + input.value + "”"
          : statusOriginal;
      }
    });
  }

  // ==================== Busca de tarifas ====================

  function initTarifas() {
    var input = document.getElementById("busca-tarifa");
    var lista = document.getElementById("tarifas-lista");
    if (!input || !lista) return;

    var itens = Array.prototype.slice.call(lista.querySelectorAll("li"));
    var status = document.getElementById("tarifa-status");
    var vazio = document.getElementById("tarifas-vazio");

    input.addEventListener("input", function () {
      var termo = normalizar(input.value.trim());
      var visiveis = 0;

      itens.forEach(function (li) {
        var mostra = !termo || normalizar(li.getAttribute("data-busca")).indexOf(termo) !== -1;
        li.classList.toggle("hidden", !mostra);
        if (mostra) visiveis++;
      });

      if (status) {
        status.textContent = termo
          ? visiveis + " resultado" + (visiveis === 1 ? "" : "s") + " para “" + input.value + "”"
          : itens.length + " trajetos disponíveis";
      }
      if (vazio) vazio.classList.toggle("hidden", visiveis !== 0);
    });
  }

  // ==================== Navegação ====================

  function initNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var aberto = !menu.classList.toggle("hidden");
        toggle.setAttribute("aria-expanded", aberto ? "true" : "false");
      });
    }

    var dd = document.querySelector("[data-dropdown]");
    if (!dd) return;
    var ddToggle = dd.querySelector("[data-dropdown-toggle]");
    var ddMenu = dd.querySelector("[data-dropdown-menu]");

    ddToggle.addEventListener("click", function () {
      var aberto = !ddMenu.classList.toggle("hidden");
      ddToggle.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!dd.contains(e.target)) {
        ddMenu.classList.add("hidden");
        ddToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ==================== Mapa do trajeto ====================

  /**
   * O Leaflet calcula o tamanho do mapa na criação. Se o container ainda não
   * tinha dimensões nesse instante (layout/fontes/CSS pendentes), o overlay
   * SVG nasce com largura 0 e as polylines saem recortadas ("M0 0").
   * `invalidateSize()` força o recálculo; o ResizeObserver cobre mudanças
   * posteriores (rotação de tela, container responsivo).
   */
  function corrigirTamanhoMapa(map, el, aoRedimensionar) {
    var refazer = function () {
      map.invalidateSize(false);
      if (typeof aoRedimensionar === "function") aoRedimensionar();
    };

    requestAnimationFrame(refazer);
    setTimeout(refazer, 250);

    if (typeof ResizeObserver !== "undefined") {
      var ultimaLargura = el.clientWidth;
      new ResizeObserver(function () {
        if (el.clientWidth !== ultimaLargura) {
          ultimaLargura = el.clientWidth;
          refazer();
        }
      }).observe(el);
    }
  }

  var COR_ORIGEM = "#059669"; // emerald-600
  var SENTIDOS_MAPA = [
    { chave: "ida", nome: "Trajeto de Ida", cor: "#1d63f1" },   // brand-600
    { chave: "volta", nome: "Trajeto de Volta", cor: "#dc2626" } // red-600
  ];

  function initMapaTrajeto() {
    var el = document.getElementById("mapa-trajeto");
    if (!el || typeof L === "undefined") return;

    var percurso;
    try { percurso = JSON.parse(el.getAttribute("data-percurso") || "{}"); } catch (e) { return; }

    // Só sentidos desenháveis (2+ pontos formam uma linha).
    var disponiveis = SENTIDOS_MAPA
      .map(function (s) {
        return { chave: s.chave, nome: s.nome, cor: s.cor, coords: (percurso && percurso[s.chave]) || [] };
      })
      .filter(function (s) { return s.coords.length >= 2; });

    if (!disponiveis.length) return;

    var map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    var camada = null;
    var sentidoAtual = 0;
    var legenda = document.getElementById("legenda-destino");

    /** Desenha UM sentido por vez, substituindo o anterior. */
    function desenhar(i) {
      var atual = disponiveis[i];
      if (!atual) return;
      sentidoAtual = i;

      if (camada) { map.removeLayer(camada); camada = null; }

      var grupo = L.layerGroup();
      var linha = L.polyline(atual.coords, {
        color: atual.cor, weight: 5, opacity: 0.9, lineJoin: "round", lineCap: "round"
      }).addTo(grupo);

      // circleMarker evita os 404 clássicos dos ícones PNG do Leaflet.
      L.circleMarker(atual.coords[0], {
        radius: 7, color: "#ffffff", weight: 2, fillColor: COR_ORIGEM, fillOpacity: 1
      }).bindPopup("Origem").addTo(grupo);

      L.circleMarker(atual.coords[atual.coords.length - 1], {
        radius: 7, color: "#ffffff", weight: 2, fillColor: atual.cor, fillOpacity: 1
      }).bindPopup("Destino").addTo(grupo);

      grupo.addTo(map);
      camada = grupo;

      map.fitBounds(linha.getBounds(), { padding: [28, 28] });

      el.setAttribute("aria-label", "Mapa do " + atual.nome.toLowerCase());
      if (legenda) legenda.style.backgroundColor = atual.cor;
    }

    // Alternador: só faz sentido quando há Ida E Volta.
    var barra = document.getElementById("mapa-sentidos");
    if (barra && disponiveis.length > 1) {
      barra.classList.remove("hidden");
      barra.classList.add("inline-flex");

      disponiveis.forEach(function (s, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.textContent = s.nome;
        btn.className = "rounded-lg px-4 py-2 text-sm font-semibold transition";

        btn.addEventListener("click", function () {
          barra.querySelectorAll("button").forEach(function (b) {
            b.setAttribute("aria-selected", "false");
            b.className = "rounded-lg px-4 py-2 text-sm font-semibold transition text-slate-600 hover:text-slate-900";
          });
          btn.setAttribute("aria-selected", "true");
          btn.className = "rounded-lg px-4 py-2 text-sm font-semibold transition bg-white text-brand-700 shadow-sm";
          desenhar(i);
        });

        barra.appendChild(btn);
      });

      // Estado inicial: primeiro sentido selecionado.
      barra.firstChild.setAttribute("aria-selected", "true");
      barra.firstChild.className = "rounded-lg px-4 py-2 text-sm font-semibold transition bg-white text-brand-700 shadow-sm";
      for (var j = 1; j < barra.children.length; j++) {
        barra.children[j].setAttribute("aria-selected", "false");
        barra.children[j].className = "rounded-lg px-4 py-2 text-sm font-semibold transition text-slate-600 hover:text-slate-900";
      }
    }

    desenhar(0);
    // Redesenha o sentido corrente após o recálculo de tamanho.
    corrigirTamanhoMapa(map, el, function () { desenhar(sentidoAtual); });
  }

  // ==================== GPS em tempo real ====================

  var GPS_INTERVALO = 10;
  var COR_NEUTRO = "#64748b"; // slate-500 — sem rota para classificar o veículo

  // Ícone de ônibus como divIcon vetorial (não depende de arquivos de imagem).
  var BUS_PATH = "M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z";

  function criarIconeOnibus(cor) {
    return L.divIcon({
      className: "onibus-pin",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      html: '<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:' + cor +
        ';border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="' + BUS_PATH + '"/></svg></span>'
    });
  }

  // --- Geometria: em qual rota (ida/volta) o veículo está "por cima"? ------
  // Projeção equirectangular local (metros aprox.) — suficiente para COMPARAR
  // a proximidade do veículo às duas polylines na escala de Brasília.
  var LAT0 = -15.8;
  var R_TERRA = 6371000;

  function projetar(lat, lng) {
    var rad = Math.PI / 180;
    return [lng * rad * Math.cos(LAT0 * rad) * R_TERRA, lat * rad * R_TERRA];
  }

  function distPontoSegmento(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var len2 = dx * dx + dy * dy;
    var t = len2 === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  }

  function distAteRota(p, rota) {
    if (!rota.length) return Infinity;
    if (rota.length === 1) return Math.hypot(p[0] - rota[0][0], p[1] - rota[0][1]);
    var min = Infinity;
    for (var i = 0; i < rota.length - 1; i++) {
      min = Math.min(min, distPontoSegmento(p, rota[i], rota[i + 1]));
    }
    return min;
  }

  /** GeoJSON do DFTrans → [{id, lat, lng, velocidade}]. */
  function normalizarFeed(fc) {
    var out = [];
    ((fc && fc.features) || []).forEach(function (f) {
      var c = f.geometry && f.geometry.coordinates;
      if (!c || c.length < 2) return;
      // GeoJSON é [lng, lat]; o Leaflet espera [lat, lng].
      var lng = Number(c[0]), lat = Number(c[1]);
      if (!isFinite(lat) || !isFinite(lng)) return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
      var p = f.properties || {};
      out.push({
        id: p.numero != null ? String(p.numero) : lat.toFixed(5) + "," + lng.toFixed(5),
        lat: lat, lng: lng,
        velocidade: p.velocidade != null ? Number(p.velocidade) : null
      });
    });
    return out;
  }

  var COR_IDA_MAPA = "#1d63f1";   // brand-600
  var COR_VOLTA_MAPA = "#dc2626"; // red-600

  /** Legenda: traço da rota + pino do ônibus, por sentido. */
  function renderLegendaGps(idaOk, voltaOk) {
    var box = document.getElementById("mapa-legenda");
    if (!box) return;

    function traco(cor, label) {
      return '<span class="inline-flex items-center gap-2">' +
        '<span class="inline-block h-1 w-5 rounded-full" style="background-color:' + cor + '" aria-hidden="true"></span>' +
        label + "</span>";
    }

    function pino(cor, label) {
      return '<span class="inline-flex items-center gap-2">' +
        '<span class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full" style="background-color:' + cor + '" aria-hidden="true">' +
        '<svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><path d="' + BUS_PATH + '"/></svg></span>' +
        label + "</span>";
    }

    var itens = [];
    if (idaOk) itens.push(traco(COR_IDA_MAPA, "Rota de ida"));
    if (voltaOk) itens.push(traco(COR_VOLTA_MAPA, "Rota de volta"));
    if (idaOk) itens.push(pino(COR_IDA_MAPA, "Ônibus na ida"));
    if (voltaOk) itens.push(pino(COR_VOLTA_MAPA, "Ônibus na volta"));

    if (!idaOk && !voltaOk) {
      itens.push(pino(COR_NEUTRO, "Ônibus (posição atual)"));
      itens.push("<span>Traçado da rota indisponível para esta linha.</span>");
    }

    box.innerHTML = itens.join("");
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

    // O TRAÇADO é estático: desenhado UMA vez, nunca nos ciclos seguintes.
    // Aqui mostramos ida E volta juntas, pois o objetivo é ver os veículos
    // sobre toda a linha (diferente do mapa de trajeto, que alterna sentidos).
    var idaOk = !!(percurso && percurso.ida && percurso.ida.length >= 2);
    var voltaOk = !!(percurso && percurso.volta && percurso.volta.length >= 2);
    var pts = [];

    if (idaOk) {
      L.polyline(percurso.ida, { color: COR_IDA_MAPA, weight: 4, opacity: 0.85 }).addTo(map);
      pts = pts.concat(percurso.ida);
    }
    if (voltaOk) {
      L.polyline(percurso.volta, { color: COR_VOLTA_MAPA, weight: 4, opacity: 0.85 }).addTo(map);
      pts = pts.concat(percurso.volta);
    }
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.1));

    corrigirTamanhoMapa(map, el, function () {
      if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.1));
    });

    renderLegendaGps(idaOk, voltaOk);

    // Rotas projetadas uma única vez — usadas para classificar cada veículo.
    var idaProj = idaOk ? percurso.ida.map(function (c) { return projetar(c[0], c[1]); }) : [];
    var voltaProj = voltaOk ? percurso.volta.map(function (c) { return projetar(c[0], c[1]); }) : [];

    var icones = {
      ida: criarIconeOnibus(COR_IDA_MAPA),
      volta: criarIconeOnibus(COR_VOLTA_MAPA),
      neutro: criarIconeOnibus(COR_NEUTRO)
    };

    /** Sentido pela rota mais próxima; "neutro" quando não há traçado. */
    function sentidoDoVeiculo(v) {
      if (!idaProj.length && !voltaProj.length) return "neutro";
      if (idaProj.length && !voltaProj.length) return "ida";
      if (voltaProj.length && !idaProj.length) return "volta";
      var p = projetar(v.lat, v.lng);
      return distAteRota(p, idaProj) <= distAteRota(p, voltaProj) ? "ida" : "volta";
    }

    function popupHtml(v, sentido) {
      var vel = v.velocidade != null && isFinite(v.velocidade) ? Math.round(v.velocidade) + " km/h" : "—";
      var rotulo = sentido === "ida" ? "Sentido: ida"
        : sentido === "volta" ? "Sentido: volta" : "Sentido: indefinido";
      return '<div style="font-size:12px;line-height:1.5"><strong>Ônibus ' + esc(v.id) +
        "</strong><br/>" + rotulo + "<br/>Velocidade: " + vel + "</div>";
    }

    // Marcadores reaproveitados entre ciclos: só a posição (e o ícone, se o
    // veículo trocou de sentido) mudam.
    var marcadores = {};
    var sentidos = {};

    function atualizar(veiculos) {
      var vistos = {};

      veiculos.forEach(function (v) {
        vistos[v.id] = true;
        var sentido = sentidoDoVeiculo(v);

        if (marcadores[v.id]) {
          marcadores[v.id].setLatLng([v.lat, v.lng]);
          if (sentidos[v.id] !== sentido) marcadores[v.id].setIcon(icones[sentido]);
          marcadores[v.id].setPopupContent(popupHtml(v, sentido));
        } else {
          marcadores[v.id] = L.marker([v.lat, v.lng], { icon: icones[sentido] })
            .addTo(map).bindPopup(popupHtml(v, sentido));
        }

        sentidos[v.id] = sentido;
      });

      Object.keys(marcadores).forEach(function (id) {
        if (!vistos[id]) {
          map.removeLayer(marcadores[id]);
          delete marcadores[id];
          delete sentidos[id];
        }
      });
    }

    function buscar() {
      fetch("https://www.sistemas.dftrans.df.gov.br/gps/linha/" + encodeURIComponent(numero) + "/geo/recent")
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (fc) {
          var v = normalizarFeed(fc);
          atualizar(v);
          if (statusEl) {
            statusEl.textContent = v.length
              ? v.length + " ônibus em operação agora"
              : "Nenhum ônibus transmitindo posição no momento.";
          }
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "Não foi possível obter as posições agora. Nova tentativa em instantes.";
        });
    }

    buscar();
    var restante = GPS_INTERVALO;
    setInterval(function () {
      restante--;
      if (restante <= 0) { buscar(); restante = GPS_INTERVALO; }
      if (contadorEl) contadorEl.textContent = restante;
    }, 1000);
  }

  // ==================== Service Worker (PWA) ====================

  function initSw() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  }

  // ==================== Bootstrap ====================

  function init() {
    pintarEstrelas();
    renderFavoritos();
    document.addEventListener("favoritos:change", renderFavoritos);
    initFiltro();
    initTarifas();
    initNav();
    initMapaTrajeto();
    initGps();
    initSw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
