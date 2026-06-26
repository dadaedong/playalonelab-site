(() => {
  const openButton = document.getElementById("healthCheckButton");
  const closeButton = document.getElementById("healthCheckClose");
  const panel = document.getElementById("healthCheckPanel");
  const summary = document.getElementById("healthCheckSummary");
  const controls = document.getElementById("healthCheckControls");
  const grid = document.getElementById("healthCheckGrid");
  const raw = document.getElementById("healthCheckRaw");

  if (!openButton || !closeButton || !panel || !summary || !controls || !grid || !raw) {
    return;
  }

  const fieldLabelMap = {
    SBP: "수축기 혈압",
    DBP: "이완기 혈압",
    BMI: "체질량지수",
    "AST(SGOT)": "AST(SGOT)",
    "ALT(SGPT)": "ALT(SGPT)",
    "GAMMA-GTP": "감마지티피",
    HEIGHT: "신장",
    WEIGHT: "체중",
    WAIST: "허리둘레",
    HEMOGLOBIN: "혈색소",
    GLUCOSE: "공복혈당",
    CREATININE: "혈청크레아티닌",
    EGFR: "eGFR",
    URINE_PROTEIN: "요단백",
    LEFT_VISION: "시력(좌)",
    RIGHT_VISION: "시력(우)",
    HEARING: "청력"
  };

  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  let loaded = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getFirstMatch(text, regex) {
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  }

  function normalizeFieldKey(result) {
    const desc = result.description.toUpperCase();
    const id = result.objectId;

    if (desc === "SBP") return "SBP";
    if (desc === "DBP") return "DBP";
    if (desc === "BMI") return "BMI";
    if (desc.includes("AST")) return "AST(SGOT)";
    if (desc.includes("ALT")) return "ALT(SGPT)";
    if (desc.includes("GFR")) return "EGFR";

    if (id.endsWith("00001")) return "HEIGHT";
    if (id.endsWith("00002")) return "WEIGHT";
    if (id.endsWith("00003")) return result.date >= "2026-01-01" ? "URINE_PROTEIN" : "WAIST";
    if (id.endsWith("00004")) return result.date >= "2026-01-01" ? "HEMOGLOBIN" : "BMI";
    if (id.endsWith("00005")) return result.date >= "2026-01-01" ? "GLUCOSE" : "LEFT_VISION";
    if (id.endsWith("00006")) return result.date >= "2026-01-01" ? "CREATININE" : "RIGHT_VISION";
    if (id.endsWith("00007")) return result.date >= "2026-01-01" ? "EGFR" : "HEARING";
    if (id.endsWith("00010")) return "CREATININE";
    if (id.endsWith("00011")) return "EGFR";
    if (id.endsWith("00014")) return "GAMMA-GTP";

    return result.description || result.type || "검사 항목";
  }

  function parseResults(xmlText) {
    const blocks = [...xmlText.matchAll(/<ccr:Result>([\s\S]*?)<\/ccr:Result>/g)];

    return blocks
      .map(([, block]) => {
        const objectId = getFirstMatch(block, /<ccr:CCRDataObjectID>([\s\S]*?)<\/ccr:CCRDataObjectID>/);
        const date = getFirstMatch(block, /<ccr:ExactDateTime>([\s\S]*?)<\/ccr:ExactDateTime>/);
        const type = getFirstMatch(block, /<ccr:Type>\s*<ccr:Text>([\s\S]*?)<\/ccr:Text>/);
        const description = getFirstMatch(block, /<ccr:Description>\s*<ccr:Text>([\s\S]*?)<\/ccr:Text>/);
        const value = getFirstMatch(block, /<ccr:TestResult>\s*<ccr:Value>([\s\S]*?)<\/ccr:Value>/);
        const unit = getFirstMatch(block, /<ccr:Units>\s*<ccr:Unit>([\s\S]*?)<\/ccr:Unit>/);

        return { objectId, date, type, description, value, unit };
      })
      .filter((item) => item.date && item.value);
  }

  function groupByDate(results) {
    return results.reduce((accumulator, item) => {
      const key = item.date;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push({
        ...item,
        fieldKey: normalizeFieldKey(item)
      });
      return accumulator;
    }, {});
  }

  function renderCards(items) {
    const priority = [
      "HEIGHT",
      "WEIGHT",
      "WAIST",
      "BMI",
      "SBP",
      "DBP",
      "HEMOGLOBIN",
      "GLUCOSE",
      "CREATININE",
      "EGFR",
      "AST(SGOT)",
      "ALT(SGPT)",
      "GAMMA-GTP",
      "URINE_PROTEIN",
      "LEFT_VISION",
      "RIGHT_VISION",
      "HEARING"
    ];

    const sorted = [...items].sort((left, right) => {
      const leftIndex = priority.indexOf(left.fieldKey);
      const rightIndex = priority.indexOf(right.fieldKey);
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    });

    grid.innerHTML = sorted
      .map((item) => {
        const label = fieldLabelMap[item.fieldKey] || item.fieldKey;
        const value = item.unit ? `${item.value} ${item.unit}` : item.value;
        return `
          <article class="health-check-card">
            <span class="health-check-card__label">${escapeHtml(label)}</span>
            <strong class="health-check-card__value">${escapeHtml(value)}</strong>
            <span class="health-check-card__date">${escapeHtml(item.date)}</span>
          </article>
        `;
      })
      .join("");
  }

  function renderDateSelector(dateKeys, grouped) {
    if (dateKeys.length <= 1) {
      controls.hidden = true;
      return;
    }

    controls.hidden = false;
    controls.innerHTML = `
      <label for="healthCheckDate">검진일 선택</label>
      <select id="healthCheckDate">
        ${dateKeys
          .map((date) => `<option value="${escapeHtml(date)}">${escapeHtml(date)}</option>`)
          .join("")}
      </select>
    `;

    const select = document.getElementById("healthCheckDate");
    select.addEventListener("change", () => {
      const selectedItems = grouped[select.value] || [];
      summary.textContent = `${select.value} 검진 데이터 ${selectedItems.length}개 항목`;
      renderCards(selectedItems);
    });
  }

  async function loadHealthCheckData() {
    const response = await fetch("/labs/data/health-check-result.xml", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load health check data: ${response.status}`);
    }

    const xmlText = await response.text();
    raw.textContent = xmlText;

    const results = parseResults(xmlText);
    const grouped = groupByDate(results);
    const dateKeys = Object.keys(grouped).sort((left, right) => right.localeCompare(left));

    if (!dateKeys.length) {
      summary.textContent = "표시할 검진 항목을 찾지 못했습니다.";
      grid.innerHTML = "";
      return;
    }

    const initialDate = dateKeys[0];
    const initialItems = grouped[initialDate];
    const formattedDate = dateLabel.format(new Date(initialDate));

    summary.textContent = `가장 최근 검진일 ${formattedDate} 기준 ${initialItems.length}개 항목`;
    renderDateSelector(dateKeys, grouped);
    renderCards(initialItems);
  }

  async function ensureLoaded() {
    if (loaded) {
      return;
    }

    try {
      await loadHealthCheckData();
      loaded = true;
    } catch (error) {
      console.error(error);
      summary.textContent = "건강검진 데이터를 불러오지 못했습니다.";
      grid.innerHTML = `
        <article class="health-check-card">
          <span class="health-check-card__label">상태</span>
          <strong class="health-check-card__value">로드 실패</strong>
        </article>
      `;
    }
  }

  function openPanel() {
    panel.hidden = false;
    openButton.setAttribute("aria-expanded", "true");
    ensureLoaded();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closePanel() {
    panel.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
  }

  openButton.addEventListener("click", () => {
    if (panel.hidden) {
      openPanel();
      return;
    }

    closePanel();
  });

  closeButton.addEventListener("click", closePanel);
})();
