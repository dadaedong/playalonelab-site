/**
 * privacy.html / terms.html 언어 선택 (한국어, English, 日本語)
 */
(function () {
  var STORAGE_KEY = "doc-lang";
  var defaultLang = "ko";

  function getTitles() {
    var main = document.getElementById("main");
    if (!main) return { ko: document.title, en: document.title, ja: document.title };
    return {
      ko: main.getAttribute("data-doc-title-ko") || document.title,
      en: main.getAttribute("data-doc-title-en") || document.title,
      ja: main.getAttribute("data-doc-title-ja") || document.title
    };
  }

  function activate(lang) {
    var contents = document.querySelectorAll(".doc-lang-content");
    var buttons = document.querySelectorAll(".doc-lang-switcher button[data-lang]");
    var titles = getTitles();
    contents.forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-lang") === lang);
    });
    buttons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    document.documentElement.lang = lang === "ko" ? "ko" : lang === "ja" ? "ja" : "en";
    if (titles[lang]) document.title = titles[lang];
  }

  function init() {
    var wrapper = document.querySelector(".doc-lang-switcher");
    if (!wrapper) return;
    var saved = "";
    try {
      saved = localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) {}
    var lang = ["ko", "en", "ja"].indexOf(saved) >= 0 ? saved : defaultLang;
    activate(lang);
    wrapper.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-lang]");
      if (btn) activate(btn.getAttribute("data-lang"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
