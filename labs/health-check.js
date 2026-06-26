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

  const fieldPriority = [
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

  const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
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
    const description = result.description.toUpperCase();
    const objectId = result.objectId;

    if (description === "SBP") return "SBP";
    if (description === "DBP") return "DBP";
    if (description === "BMI") return "BMI";
    if (description.includes("AST")) return "AST(SGOT)";
    if (description.includes("ALT")) return "ALT(SGPT)";
    if (description.includes("GFR")) return "EGFR";

    if (objectId.endsWith("00001")) return "HEIGHT";
    if (objectId.endsWith("00002")) return "WEIGHT";
    if (objectId.endsWith("00003")) return result.date >= "2026-01-01" ? "URINE_PROTEIN" : "WAIST";
    if (objectId.endsWith("00004")) return result.date >= "2026-01-01" ? "HEMOGLOBIN" : "BMI";
    if (objectId.endsWith("00005")) return result.date >= "2026-01-01" ? "GLUCOSE" : "LEFT_VISION";
    if (objectId.endsWith("00006")) return result.date >= "2026-01-01" ? "CREATININE" : "RIGHT_VISION";
    if (objectId.endsWith("00007")) return result.date >= "2026-01-01" ? "EGFR" : "HEARING";
    if (objectId.endsWith("00010")) return "CREATININE";
    if (objectId.endsWith("00011")) return "EGFR";
    if (objectId.endsWith("00014")) return "GAMMA-GTP";

    return result.description || result.type || "검사 항목";
  }

  function parseResults(xmlText) {
    const blocks = [...xmlText.matchAll(/<ccr:Result>([\s\S]*?)<\/ccr:Result>/g)];

    return blocks
      .map(([, block]) => ({
        objectId: getFirstMatch(block, /<ccr:CCRDataObjectID>([\s\S]*?)<\/ccr:CCRDataObjectID>/),
        date: getFirstMatch(block, /<ccr:ExactDateTime>([\s\S]*?)<\/ccr:ExactDateTime>/),
        type: getFirstMatch(block, /<ccr:Type>\s*<ccr:Text>([\s\S]*?)<\/ccr:Text>/),
        description: getFirstMatch(block, /<ccr:Description>\s*<ccr:Text>([\s\S]*?)<\/ccr:Text>/),
        value: getFirstMatch(block, /<ccr:TestResult>\s*<ccr:Value>([\s\S]*?)<\/ccr:Value>/),
        unit: getFirstMatch(block, /<ccr:Units>\s*<ccr:Unit>([\s\S]*?)<\/ccr:Unit>/)
      }))
      .filter((item) => item.date && item.value)
      .map((item) => ({
        ...item,
        fieldKey: normalizeFieldKey(item),
        year: item.date.slice(0, 4)
      }));
  }

  function formatDisplayDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return Number.isNaN(date.getTime()) ? dateString : dateFormatter.format(date);
  }

  function buildComparisonModel(results) {
    const years = [...new Set(results.map((item) => item.year))].sort((left, right) => right.localeCompare(left));
    const fieldMap = new Map();

    results.forEach((item) => {
      const label = fieldLabelMap[item.fieldKey] || item.fieldKey;
      const current = fieldMap.get(item.fieldKey) || {
        fieldKey: item.fieldKey,
        label,
        years: {}
      };

      const previous = current.years[item.year];
      if (!previous || item.date > previous.date) {
        current.years[item.year] = {
          value: item.unit ? `${item.value} ${item.unit}` : item.value,
          date: item.date
        };
      }

      fieldMap.set(item.fieldKey, current);
    });

    const fields = [...fieldMap.values()].sort((left, right) => {
      const leftIndex = fieldPriority.indexOf(left.fieldKey);
      const rightIndex = fieldPriority.indexOf(right.fieldKey);
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    });

    return { years, fields };
  }

  function renderComparisonCards(model) {
    grid.innerHTML = model.fields
      .map((field) => {
        const comparison = model.years
          .map((year) => {
            const item = field.years[year];
            if (!item) {
              return `
                <div class="health-check-comparison__item">
                  <span class="health-check-comparison__year">${escapeHtml(year)}</span>
                  <strong class="health-check-comparison__value">-</strong>
                  <span class="health-check-comparison__date">기록 없음</span>
                </div>
              `;
            }

            return `
              <div class="health-check-comparison__item">
                <span class="health-check-comparison__year">${escapeHtml(year)}</span>
                <strong class="health-check-comparison__value">${escapeHtml(item.value)}</strong>
                <span class="health-check-comparison__date">${escapeHtml(formatDisplayDate(item.date))}</span>
              </div>
            `;
          })
          .join("");

        return `
          <article class="health-check-card health-check-card--comparison">
            <span class="health-check-card__label">${escapeHtml(field.label)}</span>
            <div class="health-check-comparison">
              ${comparison}
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function loadHealthCheckData() {
    const response = await fetch("/labs/data/health-check-result.xml", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load health check data: ${response.status}`);
    }

    const xmlText = await response.text();
    raw.textContent = xmlText;
    controls.hidden = true;
    controls.innerHTML = "";

    const results = parseResults(xmlText);
    const model = buildComparisonModel(results);

    if (!model.years.length || !model.fields.length) {
      summary.textContent = "표시할 건강검진 결과를 찾지 못했습니다.";
      grid.innerHTML = "";
      return;
    }

    summary.textContent = `${model.years.join(", ")} 기록을 항목별로 비교합니다.`;
    renderComparisonCards(model);
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
    openButton.focus();
  }

  openButton.addEventListener("click", () => {
    if (panel.hidden) {
      openPanel();
      return;
    }

    closePanel();
  });

  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });
})();
