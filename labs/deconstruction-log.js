(() => {
  const mount = document.getElementById("deconstruction-week-mount");
  if (!mount) return;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderWeekCard(item) {
    const week = escapeHtml(item.week);
    const phase = escapeHtml(item.phase);
    const datetime = escapeHtml(item.datetime);
    const period = escapeHtml(item.period);
    const dose = escapeHtml(item.dose);
    const weight = escapeHtml(item.weight);
    const waist = escapeHtml(item.waist);
    const appetite = escapeHtml(item.appetite);
    const focus = escapeHtml(item.focus);
    const sideEffects = escapeHtml(item.sideEffects);
    const quote = escapeHtml(item.quote);
    const titleId = `week${week}-title-dynamic`;

    return `
      <article class="week-card" aria-labelledby="${titleId}">
        <div>
          <h2 class="week-title" id="${titleId}">WEEK ${week} - ${phase}</h2>
          <time datetime="${datetime}">${period}</time>
        </div>
        <div class="week-grid">
          <div class="week-cell">
            <span class="week-label">용량</span>
            <span class="week-value">${dose}</span>
          </div>
          <div class="week-cell">
            <span class="week-label">체중 변화</span>
            <span class="week-value">${weight}</span>
            <span class="week-label">허리 둘레</span>
            <span class="week-value">${waist}</span>
          </div>
          <div class="week-cell">
            <span class="week-label">식욕 변화</span>
            <span class="week-value">${appetite}</span>
          </div>
          <div class="week-cell">
            <span class="week-label">감정/집중</span>
            <span class="week-value">${focus}</span>
          </div>
          <div class="week-cell full">
            <span class="week-label">부작용</span>
            <span class="week-value">${sideEffects}</span>
          </div>
        </div>
        <p class="week-quote">${quote}</p>
      </article>
    `;
  }

  async function init() {
    try {
      const response = await fetch("/labs/data/deconstruction-weeks.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      const weeks = await response.json();
      if (!Array.isArray(weeks)) {
        throw new Error("Invalid week data format");
      }
      const sortedWeeks = [...weeks].sort(
        (a, b) => Number(a?.week ?? 0) - Number(b?.week ?? 0)
      );
      mount.innerHTML = sortedWeeks.map(renderWeekCard).join("");
    } catch (error) {
      console.error(error);
      mount.innerHTML = `
        <article class="week-card">
          <p class="week-quote">주차 데이터 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
        </article>
      `;
    }
  }

  init();
})();
