(() => {
  const openButton = document.getElementById("healthCheckButton");
  const closeButton = document.getElementById("healthCheckClose");
  const panel = document.getElementById("healthCheckPanel");
  const summary = document.getElementById("healthCheckSummary");
  const tableWrap = document.getElementById("healthCheckTableWrap");

  if (!openButton || !closeButton || !panel || !summary || !tableWrap) {
    return;
  }

  const years = ["2017", "2023", "2025", "2026"];

  const rows = [
    { type: "date", values: { "2017": "12/27", "2023": "11/03", "2025": "06/17", "2026": "05/22" } },
    { section: "계측검사", goal: "비만", item: "신장", unit: "Cm", values: { "2017": "167.7", "2023": "166.2", "2025": "167.0", "2026": "166.5" } },
    { goal: "", item: "체중", unit: "Kg", values: { "2017": "72.0", "2023": "91.6", "2025": "88.1", "2026": "66.5" } },
    { goal: "", item: "허리둘레", unit: "Cm", values: { "2017": "85.0", "2023": "106.0", "2025": "101.5", "2026": "78.8" } },
    { goal: "", item: "체질량지수", unit: "kg/m2", values: { "2017": "25.6", "2023": "33.2", "2025": "31.6", "2026": "24.0" } },
    { goal: "시각이상", item: "시력(좌/우)", unit: "", values: { "2017": "0.9/0.9", "2023": "0.8/0.8", "2025": "0.9/1.0", "2026": "0.6/0.9" } },
    { goal: "청각이상", item: "청각(좌/우)", unit: "", values: { "2017": "정상/정상", "2023": "정상/정상", "2025": "정상/정상", "2026": "정상/정상" } },
    { goal: "고혈압", item: "혈압(최고/최저)", unit: "mmHg", values: { "2017": "110/70", "2023": "146/99", "2025": "120/80", "2026": "92/64" }, tones: { "2023": "warning", "2025": "warning", "2026": "recovered" } },
    { section: "요검사", goal: "신장질환", item: "요단백", unit: "", values: { "2017": "음성", "2023": "음성", "2025": "음성", "2026": "음성" } },
    { section: "혈액검사", goal: "빈혈", item: "혈색소", unit: "g/dL", values: { "2017": "16.5", "2023": "16.2", "2025": "15.8", "2026": "15.2" } },
    { goal: "당뇨병", item: "공복혈당", unit: "mg/dL", values: { "2017": "110", "2023": "121", "2025": "113", "2026": "98" }, tones: { "2017": "warning", "2023": "warning", "2025": "warning", "2026": "recovered" } },
    { goal: "이상지질혈증", item: "총콜레스테롤", unit: "mg/dL", values: { "2017": "161", "2023": "203", "2025": "", "2026": "" }, tones: { "2023": "warning" } },
    { goal: "", item: "고밀도(HDL) 콜레스테롤", unit: "mg/dL", values: { "2017": "52", "2023": "49", "2025": "", "2026": "" }, tones: { "2017": "warning", "2023": "warning" } },
    { goal: "", item: "중성지방", unit: "mg/dL", values: { "2017": "166", "2023": "241", "2025": "", "2026": "" }, tones: { "2017": "warning", "2023": "warning" } },
    { goal: "", item: "저밀도(LDL) 콜레스테롤", unit: "mg/dL", values: { "2017": "75", "2023": "106", "2025": "", "2026": "" } },
    { goal: "신장질환", item: "혈청크레아티닌", unit: "mg/dL", values: { "2017": "0.7", "2023": "0.6", "2025": "0.90", "2026": "0.64" }, tones: { "2026": "recovered" } },
    { goal: "", item: "신사구체여과율(GFR)", unit: "mL/min /1.73m2", values: { "2017": "140", "2023": "162", "2025": "107", "2026": "123" }, tones: { "2026": "recovered" } },
    { goal: "간장질환", item: "에이에스티(AST, SGOT)", unit: "U/L", values: { "2017": "20", "2023": "37", "2025": "20", "2026": "28" } },
    { goal: "", item: "에이엘티(ALT, SGPT)", unit: "U/L", values: { "2017": "16", "2023": "62", "2025": "32", "2026": "24" }, tones: { "2023": "warning", "2026": "recovered" } },
    { goal: "", item: "감마지티피(γ-GTP)", unit: "U/L", values: { "2017": "37", "2023": "250", "2025": "149", "2026": "47" }, tones: { "2023": "warning", "2025": "warning", "2026": "recovered" } },
    { section: "영상검사", goal: "폐결핵 및 기타흉부질환", item: "흉부방사선촬영", unit: "", values: { "2017": "정상", "2023": "정상", "2025": "정상", "2026": "정상" } },
    { type: "judgement", values: { "2017": "정상", "2023": "의심", "2025": "의심", "2026": "정상" }, tones: { "2017": "recovered", "2023": "warning", "2025": "warning", "2026": "recovered" } }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getToneClass(row, year) {
    const tone = row.tones?.[year];
    if (tone === "warning") return "health-check-table__value--warning";
    if (tone === "recovered") return "health-check-table__value--recovered";
    return "";
  }

  function countSectionRows(startIndex) {
    let count = 1;
    for (let index = startIndex + 1; index < rows.length; index += 1) {
      if (rows[index].section || rows[index].type) {
        break;
      }
      count += 1;
    }
    return count;
  }

  function renderYearCells(row, useBadge = false) {
    return years.map((year) => {
      const value = row.values?.[year] || "";
      const toneClass = getToneClass(row, year);

      if (useBadge) {
        return `
          <td class="health-check-table__year">
            <span class="health-check-table__badge ${toneClass}">${escapeHtml(value)}</span>
          </td>
        `;
      }

      return `<td class="health-check-table__year ${toneClass}">${escapeHtml(value)}</td>`;
    }).join("");
  }

  function renderDateRow(row) {
    return `
      <tr>
        <th class="health-check-table__section">검진일자</th>
        <td></td>
        <td></td>
        ${renderYearCells(row)}
        <td></td>
      </tr>
    `;
  }

  function renderJudgementRow(row) {
    return `
      <tr>
        <th class="health-check-table__section"></th>
        <td class="health-check-table__center">판정</td>
        <td></td>
        ${renderYearCells(row, true)}
        <td></td>
      </tr>
    `;
  }

  function renderRows() {
    return rows.map((row, index) => {
      if (row.type === "date") {
        return renderDateRow(row);
      }

      if (row.type === "judgement") {
        return renderJudgementRow(row);
      }

      const sectionCell = row.section
        ? `<th class="health-check-table__section" rowspan="${countSectionRows(index)}">${escapeHtml(row.section)}</th>`
        : "";

      return `
        <tr>
          ${sectionCell}
          <td class="health-check-table__goal">${escapeHtml(row.goal || "")}</td>
          <td>${escapeHtml(row.item || "")}</td>
          ${renderYearCells(row)}
          <td class="health-check-table__unit">${escapeHtml(row.unit || "")}</td>
        </tr>
      `;
    }).join("");
  }

  function renderTable() {
    tableWrap.innerHTML = `
      <table class="health-check-table">
        <thead>
          <tr>
            <th rowspan="2">구분</th>
            <th rowspan="2">목표질환</th>
            <th rowspan="2">검사항목</th>
            <th class="health-check-table__center" colspan="4">검진결과</th>
            <th rowspan="2">단위</th>
          </tr>
          <tr>
            <th class="health-check-table__year">2017년</th>
            <th class="health-check-table__year">2023년</th>
            <th class="health-check-table__year">2025년</th>
            <th class="health-check-table__year">2026년</th>
          </tr>
        </thead>
        <tbody>
          ${renderRows()}
        </tbody>
      </table>
    `;
  }

  function openPanel() {
    panel.hidden = false;
    openButton.setAttribute("aria-expanded", "true");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closePanel() {
    panel.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
    openButton.focus();
  }

  renderTable();
  summary.textContent = "체중 감량 결과 모든 수치가 다시 정상으로 돌아옴.";

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
