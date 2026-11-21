const $ = id => document.getElementById(id);
const pad = number => String(number).padStart(2, "0");

// Clock and pointer parallax
function updateClock() {
  const date = new Date();
  $("time").textContent = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  $("date").textContent = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(date);
}

updateClock();
setInterval(updateClock, 1000);

const parallaxQuery = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);

if (parallaxQuery.matches) {
  const background = document.querySelector(".background");
  const character = document.querySelector(".character");
  let parallaxFrame = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let characterX = 0;
  let characterY = 0;

  const resetParallax = () => {
    background.style.setProperty("--parallax-x", "0px");
    background.style.setProperty("--parallax-y", "0px");
    character.style.setProperty("--character-parallax-x", "0px");
    character.style.setProperty("--character-parallax-y", "0px");
  };

  window.addEventListener(
    "pointermove",
    event => {
      if (event.pointerType === "touch") return;

      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      parallaxX = x * -36;
      parallaxY = y * -24;
      characterX = x * -12;
      characterY = y * -8;

      if (parallaxFrame) return;

      parallaxFrame = requestAnimationFrame(() => {
        background.style.setProperty("--parallax-x", `${parallaxX.toFixed(1)}px`);
        background.style.setProperty("--parallax-y", `${parallaxY.toFixed(1)}px`);
        character.style.setProperty(
          "--character-parallax-x",
          `${characterX.toFixed(1)}px`
        );
        character.style.setProperty(
          "--character-parallax-y",
          `${characterY.toFixed(1)}px`
        );
        parallaxFrame = 0;
      });
    },
    { passive: true }
  );

  window.addEventListener("blur", resetParallax);
  document.addEventListener("mouseleave", resetParallax);
}

function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => element.classList.remove("show"), 2300);
}

// Search and app launcher
let searchEngine = "google";

const searchUrls = {
  google: query => "https://www.google.com/search?q=" + encodeURIComponent(query),
  yandex: query => "https://yandex.ru/search/?text=" + encodeURIComponent(query)
};

function setSearchEngine(engine) {
  searchEngine = engine === "yandex" ? "yandex" : "google";
  $("aiButton").hidden = searchEngine !== "google";

  const searchEngineInput = $("searchEngineInput");
  if (searchEngineInput) searchEngineInput.value = searchEngine;

  applySearchProviderUI(searchEngine);
}

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  const query = $("searchInput").value.trim();
  if (query) {
    window.open(
      (searchUrls[searchEngine] || searchUrls.google)(query),
      "_blank",
      "noopener,noreferrer"
    );
  }
});

const googleAiUrl =
  "https://www.google.com/search?" +
  "sca_esv=87185fd321e99336&" +
  "sxsrf=AKL5yDi8CdqfX-5wjMea4nwfxZOyDiooxA%3A1794574600181&" +
  "udm=50&" +
  "fbs=ACAhTvyNM6WXAtZOoUa0PyiXpeKTUQeJHy35l4ToZ37fZCxI1r8kx7qKg5pdVx5isO4EScCeLMA4yQlUjPBMm4-0AVoyDBiReNgS87r3eL-_MM94wmPRu5xsCAquxvadJ-rkK3H6ClKtVqKCzPcpT8A-ol9HP72c1EVxbV_hjAdyyA7-P6njQEpGDFU2XyC6hO4f_c_vL2uBSwac_3Bu1i8YoAC1IqGTbLPqcel-SYnSZ7uIUVMPYLhv1i-azeTj6mqPtJtrcESridcTmk7RgSqdfeicVLvFug&" +
  "vsint=&ntc=1&cs=1&" +
  "sa=X&" +
  "ved=2ahUKEwjkr8Os_4SYAxU42gIHHewpLY0Q2J8OegQIDBAD&" +
  "biw=1920&bih=911&dpr=1&zs=1";

$("aiButton").onclick = () => {
  location.href = googleAiUrl;
};

$("voiceButton").onclick = () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    toast("Голосовой ввод не поддерживается");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "ru-RU";
  recognition.onresult = event => {
    $("searchInput").value = event.results[0][0].transcript;
    $("searchInput").focus();
  };
  recognition.onerror = () => toast("Не удалось распознать речь");
  recognition.start();
};

const menuPanels = ["appsPanel", "settingsPanel"];

function togglePanel(id) {
  const panel = $(id);
  const wasOpen = !panel.classList.contains("hidden");

  menuPanels.forEach(key => $(key).classList.add("hidden"));
  if (!wasOpen) panel.classList.remove("hidden");
}

$("appsButton").onclick = () => togglePanel("appsPanel");
$("settingsButton").onclick = () => togglePanel("settingsPanel");

const yandexIcon = svg =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(svg.replace("<svg ", '<svg width="48" height="48" '));

const yandexIcons = {
  mail: yandexIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="mail" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff694d"/><stop offset="1" stop-color="#ffad32"/></linearGradient></defs><rect x="4" y="9" width="40" height="30" rx="7" fill="url(#mail)"/><path d="m6 14 18 14 18-14" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.2"/><path d="m6 35 12-10m24 10L30 25" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2.6" opacity=".8"/></svg>`
  ),
  disk: yandexIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="disk" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#42b9ff"/><stop offset="1" stop-color="#3975f6"/></linearGradient></defs><path d="m7 15 17-10 17 10v18L24 43 7 33z" fill="url(#disk)"/><path d="m7 15 17 11 17-11M24 26v17" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" opacity=".9"/></svg>`
  ),
  alice: yandexIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="alice" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#6975ff"/><stop offset="1" stop-color="#c168ef"/></linearGradient></defs><circle cx="24" cy="24" r="21" fill="url(#alice)"/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="2" opacity=".48"/><path d="M24 11c1.9 7.1 3.9 9.1 11 11-7.1 1.9-9.1 3.9-11 11-1.9-7.1-3.9-9.1-11-11 7.1-1.9 9.1-3.9 11-11Z" fill="#fff"/><circle cx="12" cy="12" r="1.5" fill="#fff" opacity=".85"/></svg>`
  ),
  docs: yandexIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="docs" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a56bff"/><stop offset="1" stop-color="#7045e8"/></linearGradient></defs><path d="M12 5h16l10 10v26H12a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" fill="url(#docs)"/><path d="M28 5v10h10" fill="#d8c6ff"/><path d="M17 23h15M17 29h15M17 35h10" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2.4"/></svg>`
  ),
  sheets: yandexIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="sheets" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#45c98b"/><stop offset="1" stop-color="#159b72"/></linearGradient></defs><path d="M12 5h16l10 10v26H12a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" fill="url(#sheets)"/><path d="M28 5v10h10" fill="#b9f1d8"/><path d="M16 22h17v15H16zM21.7 22v15M27.3 22v15M16 27h17M16 32h17" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`
  ),
  slides: yandexIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="slides" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffb547"/><stop offset="1" stop-color="#f07835"/></linearGradient></defs><path d="M12 5h16l10 10v26H12a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" fill="url(#slides)"/><path d="M28 5v10h10" fill="#ffe0ad"/><rect x="16" y="21" width="18" height="14" rx="2" fill="#fff" opacity=".94"/><path d="m19 32 4-5 3 3 3-5 3 7" fill="none" stroke="#f08a39" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`
  )
};

const serviceApps = {
  google: [
    {
      name: "Почта",
      url: "https://mail.google.com/",
      icon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
    },
    {
      name: "Диск",
      url: "https://drive.google.com/",
      icon: "https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png"
    },
    {
      name: "Gemini",
      url: "https://gemini.google.com/",
      icon: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64"
    },
    {
      name: "Документы",
      url: "https://docs.google.com/",
      icon: "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x32.png"
    },
    {
      name: "Таблицы",
      url: "https://sheets.google.com/",
      icon: "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico"
    },
    {
      name: "Презентации",
      url: "https://slides.google.com/",
      icon: "https://ssl.gstatic.com/docs/presentations/images/favicon5.ico"
    }
  ],
  yandex: [
    { name: "Почта", url: "https://mail.yandex.ru/", icon: yandexIcons.mail },
    { name: "Диск", url: "https://disk.yandex.ru/", icon: yandexIcons.disk },
    { name: "Алиса", url: "https://alice.yandex.ru/", icon: yandexIcons.alice },
    { name: "Документы", url: "https://docs.yandex.ru/", icon: yandexIcons.docs },
    { name: "Таблицы", url: "https://docs.yandex.ru/", icon: yandexIcons.sheets },
    {
      name: "Презентации",
      url: "https://docs.yandex.ru/",
      icon: yandexIcons.slides
    }
  ]
};

function applySearchProviderUI(provider) {
  const isYandex = provider === "yandex";
  const label = isYandex ? "Яндекс" : "Google";
  const appsButton = $("appsButton");
  const appsTitle = $("appsTitle");
  const appsPanel = $("appsPanel");

  appsButton.title = "Приложения " + label;
  appsButton.setAttribute("aria-label", "Приложения " + label);
  appsTitle.textContent = "Приложения " + label;
  appsPanel.setAttribute("aria-label", "Приложения " + label);

  document.querySelectorAll(".apps-grid a").forEach((card, index) => {
    const app = serviceApps[provider]?.[index] || serviceApps.google[index];
    const icon = card.querySelector("b");
    const image = document.createElement("img");

    card.href = app.url;
    card.querySelector("span").textContent = app.name;
    image.className = "service-icon";
    image.alt = "";
    image.src =
      app.icon ||
      "https://favicon.yandex.net/favicon/" + app.domain;
    image.onerror = () => {
      image.onerror = null;
      image.src = isYandex
        ? "https://favicon.yandex.net/favicon/yandex.ru"
        : "https://www.google.com/s2/favicons?domain=" +
          encodeURIComponent(new URL(app.url).hostname) +
          "&sz=64";
    };
    icon.replaceChildren(image);
  });
}

// Settings panel and navigation
const settingsTabs = {
  themes: [$("themeDashboard")],
  sidebar: [...document.querySelectorAll(".sidebar-section")],
  games: [...document.querySelectorAll(".games-section")]
};
const currentSettings = document.querySelector(".current-settings");

function switchSettingsTab(tab) {
  document.querySelectorAll(".settings-nav").forEach(button => {
    button.classList.toggle("active", button.dataset.settingsTab === tab);
  });

  Object.entries(settingsTabs).forEach(([key, sections]) => {
    sections.forEach(section => {
      section.hidden = key !== tab;
    });
  });

  if (currentSettings) currentSettings.hidden = tab !== "themes";
}

document.querySelectorAll(".settings-nav[data-settings-tab]").forEach(button => {
  button.onclick = () => switchSettingsTab(button.dataset.settingsTab);
});
switchSettingsTab("themes");

document.querySelectorAll("[data-close]").forEach(button => {
  button.onclick = () => $(button.dataset.close).classList.add("hidden");
});
$("closeSettings").onclick = () => $("settingsPanel").classList.add("hidden");

document.addEventListener("click", event => {
  if (!event.target.closest(".top-actions,.menu-popover,.settings")) {
    menuPanels.forEach(key => $(key).classList.add("hidden"));
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (customThemeModal && !customThemeModal.classList.contains("hidden")) {
      closeCustomThemeModal();
      return;
    }
    menuPanels.forEach(key => $(key).classList.add("hidden"));
  }
});

// Site management
let sites = [];

function siteFavicon(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      new URL(url).hostname
    )}&sz=64`;
  } catch {
    return "";
  }
}

function isCompactSiteIcon(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "figma.com" ||
      host.endsWith(".figma.com")
    );
  } catch {
    return false;
  }
}

function saveSites() {
  localStorage.setItem("sidebarSites", JSON.stringify(sites));
  extensionStorage?.set?.({ sidebarSites: sites });
}

function renderSites() {
  const dock = $("siteDock");
  if (!dock) return;

  dock.classList.toggle("empty", sites.length === 0);
  dock.querySelectorAll(".dynamic-site").forEach(element => element.remove());
  sites.forEach(site => {
    const link = document.createElement("a");
    link.className = "app dynamic-site";
    link.href = site.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = site.name;
    link.setAttribute("aria-label", site.name);
    link.draggable = true;

    const image = document.createElement("img");
    image.src = site.icon || siteFavicon(site.url);
    image.alt = "";
    if (isCompactSiteIcon(site.url)) image.classList.add("compact-site-icon");
    image.onerror = () => {
      image.onerror = null;
      image.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='12' fill='%23ffffff'/%3E%3Cpath d='M14 24h20M24 14v20' stroke='%2333304b' stroke-width='5'/%3E%3C/svg%3E";
    };
    link.append(image);
    link.dataset.siteId = site.id;

    link.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", site.id);
    });
    link.addEventListener("dragover", event => event.preventDefault());
    link.addEventListener("drop", event => {
      event.preventDefault();
      const from = sites.findIndex(
        item => item.id === event.dataTransfer.getData("text/plain")
      );
      const to = sites.findIndex(item => item.id === site.id);

      if (from >= 0 && to >= 0) {
        const [movedSite] = sites.splice(from, 1);
        sites.splice(to, 0, movedSite);
        saveSites();
        renderSites();
        renderSiteManager();
      }
    });

    $("addLink").before(link);
  });
}

function renderSiteManager() {
  const list = $("siteManagerList");
  if (!list) return;

  list.innerHTML = "";
  sites.forEach(site => {
    const row = document.createElement("div");
    row.className = "site-manager-row";
    row.innerHTML =
      `<img src="${site.icon || siteFavicon(site.url)}" alt="">` +
      `<input value="${esc(site.name)}" aria-label="Название сайта">` +
      `<input value="${esc(site.url)}" aria-label="URL сайта">` +
      '<button type="button" title="Удалить">×</button>';

    if (isCompactSiteIcon(site.url)) {
      row.querySelector("img").classList.add("compact-site-icon");
    }

    const [nameInput, urlInput] = row.querySelectorAll("input");
    nameInput.onchange = () => {
      site.name = nameInput.value.trim() || site.name;
      saveSites();
      renderSites();
    };
    urlInput.onchange = () => {
      try {
        site.url = new URL(urlInput.value).href;
        site.icon = siteFavicon(site.url);
        saveSites();
        renderSites();
        renderSiteManager();
      } catch {
        toast("Проверь URL");
      }
    };
    row.querySelector("button").onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      sites = sites.filter(item => item.id !== site.id);
      saveSites();
      renderSites();
      renderSiteManager();
    };
    list.append(row);
  });
}

function loadSites() {
  try {
    const savedSites = localStorage.getItem("sidebarSites");
    sites = savedSites === null ? [] : JSON.parse(savedSites);
    if (savedSites === null) {
      localStorage.setItem("sidebarSites", "[]");
    }
  } catch {
    sites = [];
  }

  document.querySelectorAll(".dock .app:not(#addLink)").forEach(element => {
    element.remove();
  });
  renderSites();
  renderSiteManager();
}

$("addLink").onclick = event => {
  event?.preventDefault();
  event?.stopPropagation();
  const name = prompt("Название сайта:");
  if (!name) return;

  let url = prompt("URL сайта (например, https://example.com):");
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  try {
    const parsedUrl = new URL(url);
    sites.push({
      id: `site-${Date.now()}`,
      name: name.trim(),
      url: parsedUrl.href,
      icon: siteFavicon(parsedUrl.href)
    });
    saveSites();
    renderSites();
    renderSiteManager();
  } catch {
    toast("Проверь адрес сайта");
  }
};

$("addSiteButton")?.addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();
  $("addLink").click();
});

function esc(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

loadSites();

// Settings, storage, and themes
const extensionStorage =
  globalThis.chrome && globalThis.chrome.storage
    ? globalThis.chrome.storage.local
    : null;

const readSettings = callback => {
  if (extensionStorage?.get) {
    extensionStorage.get(
      ["greetingText", "greetingName", "weatherCity", "searchEngine"],
      callback
    );
    return;
  }

  callback({
    greetingText: window.localStorage?.getItem("greetingText"),
    greetingName: window.localStorage?.getItem("greetingName"),
    weatherCity: window.localStorage?.getItem("weatherCity") || "",
    searchEngine: window.localStorage?.getItem("searchEngine") || "google"
  });
};

const writeSettings = data => {
  if (extensionStorage?.set) {
    extensionStorage.set(data);
    return;
  }
  Object.entries(data).forEach(([key, value]) => {
    window.localStorage?.setItem(key, value);
  });
};

function renderWelcome(greeting, name) {
  $("greetingText").textContent = greeting;
  $("greetingName").textContent = name;
  $("greetingBreak").hidden = !greeting || !name;
}

const persistentKeys = new Set(["selectedCharacter", "selectedBackground"]);

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}

  if (extensionStorage?.set && persistentKeys.has(key)) {
    extensionStorage.set({ [key]: value });
  }
}

function compressBackground(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, 1600 / image.width, 1000 / image.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    image.onerror = reject;
    image.src = url;
  });
}

function compressCharacter(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, 1200 / image.width, 1600 / image.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/webp", 0.88));
    };
    image.onerror = reject;
    image.src = url;
  });
}

function applyThemeCard(card) {
  document.querySelectorAll(".archon-theme").forEach(item => {
    item.classList.remove("selected");
  });
  card.classList.add("selected");

  const character = card.dataset.character;
  const background = card.dataset.background;
  if (character) {
    const mainCharacter = document.querySelector(".character");
    if (mainCharacter) {
      mainCharacter.classList.toggle(
        "character-large",
        card.classList.contains("theme-dendro")
      );
      mainCharacter.classList.toggle(
        "character-right",
        card.matches(".theme-anemo,.theme-dendro,.theme-void")
      );
      mainCharacter.classList.toggle(
        "character-furina",
        card.classList.contains("theme-hydro")
      );
      mainCharacter.classList.toggle(
        "character-natlan",
        card.classList.contains("theme-pyro")
      );
      mainCharacter.src = character;
    }
    saveLocal("selectedCharacter", character);
  }

  if (background) {
    document.querySelector(".background").style.backgroundImage =
      `url("${background}")`;
    saveLocal("selectedBackground", background);
  }

  saveLocal(
    "selectedTheme",
    card.dataset.themeName || card.querySelector("b")?.textContent || ""
  );
}

document.querySelectorAll(".archon-theme:not(.add-theme-card)").forEach(card => {
  card.onclick = () => applyThemeCard(card);
});

let savedThemes = [];
try {
  savedThemes = JSON.parse(localStorage.getItem("customThemes") || "[]");
} catch {
  savedThemes = [];
}

function addCustomThemeCard(theme) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "archon-theme custom-theme-card";
  card.dataset.themeName = theme.name;
  card.dataset.character = theme.character;
  card.dataset.background = theme.background;
  card.innerHTML =
    '<span class="theme-art"><i></i></span><b></b><small>Моя тема</small>' +
    '<span class="theme-delete" aria-label="Удалить тему">×</span>';
  card.querySelector("i").textContent = theme.icon || "✦";
  card.querySelector("b").textContent = theme.name;
  card
    .querySelector(".theme-art")
    .style.setProperty("--theme-image", `url("${theme.background}")`);
  card.onclick = () => applyThemeCard(card);
  card.querySelector(".theme-delete").onclick = event => {
    event.stopPropagation();
    savedThemes = savedThemes.filter(item => item.id !== theme.id);
    localStorage.setItem("customThemes", JSON.stringify(savedThemes));

    if (card.classList.contains("selected")) {
      const fallback = document.querySelector(
        ".archon-theme:not(.add-theme-card):not(.custom-theme-card)"
      );
      if (fallback) applyThemeCard(fallback);
    }

    card.remove();
    toast("Тема удалена");
  };
  $("addThemeButton").before(card);
}

savedThemes.forEach(addCustomThemeCard);
const customThemeModal = $("customThemeModal");
function closeCustomThemeModal() {
  customThemeModal.classList.add("hidden");
  $("addThemeButton").focus();
}

$("addThemeButton").onclick = () => {
  customThemeModal.classList.remove("hidden");
  $("themeNameInput").focus();
};
$("cancelThemeButton").onclick = closeCustomThemeModal;
customThemeModal.addEventListener("click", event => {
  if (event.target === customThemeModal) closeCustomThemeModal();
});

$("saveThemeButton").onclick = async () => {
  const name = $("themeNameInput").value.trim() || "Моя тема";
  const characterFile = $("themeCharacterUpload").files[0];
  const backgroundFile = $("themeBackgroundUpload").files[0];

  try {
    const theme = {
      id: `theme-${Date.now()}`,
      name,
      icon: "✦",
      character: characterFile
        ? await compressCharacter(characterFile)
        : localStorage.getItem("selectedCharacter") || "zhongli-lord.png",
      background: backgroundFile
        ? await compressBackground(backgroundFile)
        : localStorage.getItem("selectedBackground") || "background.png"
    };

    savedThemes.push(theme);
    localStorage.setItem("customThemes", JSON.stringify(savedThemes));
    addCustomThemeCard(theme);

    const card = [...document.querySelectorAll(".custom-theme-card")].at(-1);
    applyThemeCard(card);
    closeCustomThemeModal();
    $("themeNameInput").value = "";
    $("themeCharacterUpload").value = "";
    $("themeBackgroundUpload").value = "";
    toast("Тема добавлена");
  } catch {
    toast("Не удалось создать тему");
  }
};

const selectedCharacter = localStorage.getItem("selectedCharacter");
const selectedBackground = localStorage.getItem("selectedBackground");
if (selectedCharacter) document.querySelector(".character").src = selectedCharacter;
if (selectedBackground) {
  document.querySelector(".background").style.backgroundImage =
    `url("${selectedBackground}")`;
}

if (extensionStorage?.get) {
  extensionStorage.get(["selectedCharacter", "selectedBackground"], data => {
    if (localStorage.getItem("selectedTheme")) return;

    for (const key of ["selectedCharacter", "selectedBackground"]) {
      if (typeof data[key] !== "string") continue;
      localStorage.setItem(key, data[key]);
      if (key === "selectedCharacter") {
        document.querySelector(".character").src = data[key];
      } else {
        document.querySelector(".background").style.backgroundImage =
          `url("${data[key]}")`;
      }
    }
  });
}

const selectedThemeName = localStorage.getItem("selectedTheme");
if (selectedThemeName) {
  const selectedThemeCard = [
    ...document.querySelectorAll(".archon-theme:not(.add-theme-card)")
  ].find(card => card.dataset.themeName === selectedThemeName);
  if (selectedThemeCard) applyThemeCard(selectedThemeCard);
}

function saveSettingsFromInputs(event) {
  const greeting = $("greetingInput").value.trim();
  const name = $("nameInput").value.trim();
  const city = $("cityInput").value.trim();

  setSearchEngine($("searchEngineInput").value);
  renderWelcome(
    greeting || "К звёздам и к безднам!",
    name || "Путешественник"
  );
  writeSettings({
    greetingText: greeting || "К звёздам и к безднам!",
    greetingName: name || "Путешественник",
    weatherCity: city,
    searchEngine
  });

  if (event.target.id === "cityInput") {
    if (city) weatherCity(city);
    else $("weather").textContent = "";
  }
}

["greetingInput", "nameInput", "cityInput", "searchEngineInput"].forEach(id => {
  $(id).addEventListener("change", saveSettingsFromInputs);
});

readSettings(data => {
  const savedGreeting = data.greetingText?.trim();
  const savedName = data.greetingName?.trim();
  const greeting =
    !savedGreeting ||
    savedGreeting === "Здравствуйте," ||
    savedGreeting === "К звёздам и к безднам"
      ? "К звёздам и к безднам!"
      : savedGreeting;
  const name =
    !savedName ||
    savedName === "Прекрасная Богиня" ||
    savedName === "путешественник"
      ? "Путешественник"
      : savedName;

  setSearchEngine(data.searchEngine);
  $("greetingInput").value = greeting;
  $("nameInput").value = name;
  $("searchEngineInput").value = searchEngine;
  renderWelcome(greeting, name);
  writeSettings({
    greetingText: greeting,
    greetingName: name,
    weatherCity: data.weatherCity || "",
    searchEngine
  });

  if (data.weatherCity) {
    $("cityInput").value = data.weatherCity;
    weatherCity(data.weatherCity);
  } else {
    $("cityInput").value = "";
    $("weather").textContent = "";
  }
});

// Weather
function weatherEmoji(description = "") {
  const text = description.toLowerCase();
  if (text.includes("thunder") || text.includes("гроза")) return "⛈️";
  if (text.includes("snow") || text.includes("снег")) return "❄️";
  if (text.includes("rain") || text.includes("дожд")) return "🌧️";
  if (text.includes("cloud") || text.includes("облач")) return "☁️";
  if (
    text.includes("mist") ||
    text.includes("fog") ||
    text.includes("туман")
  ) {
    return "🌫️";
  }
  return "☀️";
}

async function getWeather(city = "") {
  try {
    const place = city ? encodeURIComponent(city) : "";
    const response = await fetch(
      `https://wttr.in/${place}?format=j1&lang=ru`
    );
    if (!response.ok) throw 0;

    const data = await response.json();
    const current = data.current_condition?.[0];
    if (!current) throw 0;

    const description =
      current.lang_ru?.[0]?.value || current.weatherDesc?.[0]?.value || "";
    const resolvedCity =
      data.nearest_area?.[0]?.areaName?.[0]?.value || city;
    $("weather").textContent =
      `${resolvedCity ? resolvedCity + " · " : ""}` +
      `${Math.round(Number(current.temp_C))}° ${weatherEmoji(description)}`;
  } catch {
    $("weather").textContent = city
      ? "Город не найден"
      : "Погода временно недоступна";
  }
}

function weatherCity(city) {
  getWeather(city);
}

// Puzzle visibility and daily puzzle
const puzzleToggle = $("puzzleToggle");
const puzzleCardElement = document.querySelector(".puzzle-card");

function applyPuzzleVisibility(visible) {
  puzzleCardElement?.classList.toggle("is-hidden", !visible);
  document.querySelector(".scene")?.classList.toggle("puzzle-hidden", !visible);
  localStorage.setItem("showPuzzle", String(visible));
}

if (puzzleToggle) {
  const showPuzzle = localStorage.getItem("showPuzzle") !== "false";
  puzzleToggle.checked = showPuzzle;
  applyPuzzleVisibility(showPuzzle);
  puzzleToggle.onchange = () => applyPuzzleVisibility(puzzleToggle.checked);
}

const grid = $("puzzleGrid");
const puzzleCard = document.querySelector(".puzzle-card");
const puzzleStorageKey = "dailyPuzzleState";
let puzzleThemes = [];

if (globalThis.indexedDB) {
  const request = indexedDB.deleteDatabase("zhongli-puzzles");
  request.onerror = () => {
    console.error(
      "Не удалось удалить ранее загруженные изображения для пятнашек",
      request.error
    );
  };
  request.onblocked = () => {
    console.warn(
      "Удаление ранее загруженных изображений для пятнашек ожидает закрытия других вкладок"
    );
  };
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function puzzleForToday() {
  const date = new Date();
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
  return puzzleThemes[day % puzzleThemes.length];
}

let activePuzzle;
let activePuzzleDate = today();
let board = [];

function isSolved() {
  return board.length === 16 && board.every((value, index) => {
    return value === (index === 15 ? 0 : index + 1);
  });
}

function savePuzzle() {
  localStorage.setItem(
    puzzleStorageKey,
    JSON.stringify({ date: today(), image: activePuzzle.id, board })
  );
}

function restorePuzzle() {
  try {
    const saved = JSON.parse(localStorage.getItem(puzzleStorageKey));
    const validBoard =
      Array.isArray(saved?.board) &&
      saved.board.length === 16 &&
      new Set(saved.board).size === 16 &&
      saved.board.every(
        value => Number.isInteger(value) && value >= 0 && value < 16
      );

    if (
      saved?.date === today() &&
      saved.image === activePuzzle.id &&
      validBoard
    ) {
      board = saved.board;
      return true;
    }
  } catch {}
  return false;
}

function draw() {
  grid.innerHTML = "";
  const fullImage = $("completedPuzzle");
  if (fullImage.dataset.src !== activePuzzle.src) {
    fullImage.src = new URL(activePuzzle.src, document.baseURI).href;
    fullImage.dataset.src = activePuzzle.src;
  }

  const solved = isSolved();
  puzzleCard.classList.toggle("solved", solved);
  if (solved) return;

  board.forEach((value, index) => {
    const tile = document.createElement("button");
    tile.className = "tile" + (value === 0 ? " empty" : "");

    if (value) {
      const imageUrl = new URL(activePuzzle.src, document.baseURI).href;
      tile.style.backgroundImage = `url("${imageUrl}")`;
      tile.style.backgroundSize = "400% 400%";
      tile.style.backgroundPosition =
        `${((value - 1) % 4) * 100 / 3}% ` +
        `${Math.floor((value - 1) / 4) * 100 / 3}%`;

      const number = document.createElement("span");
      number.className = "tile-number";
      number.textContent = value;
      tile.appendChild(number);
    }

    tile.setAttribute("aria-label", value ? `Плитка ${value}` : "Пустая клетка");
    tile.onclick = () => move(index);
    grid.appendChild(tile);
  });
}

function move(index) {
  const emptyIndex = board.indexOf(0);
  const row = Math.floor(index / 4);
  const column = index % 4;
  const emptyRow = Math.floor(emptyIndex / 4);
  const emptyColumn = emptyIndex % 4;
  if (Math.abs(row - emptyRow) + Math.abs(column - emptyColumn) !== 1) return;

  [board[index], board[emptyIndex]] = [board[emptyIndex], board[index]];
  savePuzzle();
  draw();
  if (isSolved()) toast("Картинка собрана! ✨");
}

function shuffle() {
  board = Array.from({ length: 16 }, (_, index) =>
    index === 15 ? 0 : index + 1
  );
  let emptyIndex = 15;
  let previousIndex = -1;

  for (let step = 0; step < 170; step++) {
    const column = emptyIndex % 4;
    const options = [
      emptyIndex - 4,
      emptyIndex + 4,
      ...(column ? [emptyIndex - 1] : []),
      ...(column < 3 ? [emptyIndex + 1] : [])
    ].filter(index => index >= 0 && index < 16 && index !== previousIndex);
    const nextIndex = options[Math.floor(Math.random() * options.length)];

    [board[emptyIndex], board[nextIndex]] = [
      board[nextIndex],
      board[emptyIndex]
    ];
    previousIndex = emptyIndex;
    emptyIndex = nextIndex;
  }

  savePuzzle();
  draw();
}

async function loadPuzzleImages() {
  try {
    const response = await fetch("puzzles/index.json");
    if (!response.ok) {
      throw new Error(`Не удалось загрузить список картинок: ${response.status}`);
    }

    const filenames = await response.json();
    if (
      !Array.isArray(filenames) ||
      filenames.length === 0 ||
      !filenames.every(
        filename =>
          typeof filename === "string" &&
          filename.endsWith(".jpg") &&
          !/[\\/]/.test(filename)
      )
    ) {
      throw new Error("Список картинок для пятнашек имеет неверный формат");
    }

    puzzleThemes = filenames.map(filename => ({
      id: filename,
      src: `puzzles/${encodeURIComponent(filename)}`
    }));
    activePuzzle = puzzleForToday();

    if (!restorePuzzle()) shuffle();
    else draw();

    setInterval(() => {
      const date = today();
      if (date === activePuzzleDate) return;

      activePuzzleDate = date;
      activePuzzle = puzzleForToday();
      shuffle();
    }, 60000);
  } catch (error) {
    console.error("Не удалось загрузить картинки для пятнашек", error);
    toast("Не удалось загрузить картинки для пятнашек");
  }
}

loadPuzzleImages();
