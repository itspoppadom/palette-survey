(function () {
  "use strict";
  const C = window.SURVEY_CONFIG;
  const LETTERS = "ABCDEFGH";
  const startedAt = new Date();
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- header text ----------
  $("#title").textContent = C.title;
  document.title = C.title;
  $("#owner").textContent = C.owner;
  $("#project").textContent = C.project;

  // ---------- random order, blind labels ----------
  const order = C.palettes.slice();
  // Fisher-Yates for a fair shuffle
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const label = (i) => "Palette " + LETTERS[i];

  const ease = (name, q, req = true) => `
    <fieldset class="field" ${req ? "data-required" : ""}>
      <legend class="q">${q} ${req ? '<span class="req">required</span>' : ""}</legend>
      <div class="scale" role="radiogroup">
        ${[1, 2, 3, 4, 5].map((v) => `
          <label><input type="radio" name="${name}" value="${v}"><span>${v}</span>
          ${v === 1 ? '<em>Very hard</em>' : v === 5 ? '<em>Very easy</em>' : ""}</label>`).join("")}
        <label class="na"><input type="radio" name="${name}" value="Can't tell"><span>Can't tell</span></label>
      </div>
    </fieldset>`;

  const swatch = (hex, text, dark) =>
    `<span class="sw" style="background:${hex};color:${dark ? "#111" : "#fff"}">${esc(text)}</span>`;
  const isLight = (hex) => {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
  };

  $("#palettes").innerHTML = order.map((p, i) => {
    const id = p.id, L = label(i);
    return `
    <section class="card palette" aria-labelledby="h-${id}">
      <h2 id="h-${id}">${L} <span class="step">${i + 1} of ${order.length}</span></h2>
      <figure>
        <button type="button" class="zoom-btn" data-src="${esc(p.image)}" data-alt="${L} sample charts" aria-label="Enlarge ${L} charts">
          <img src="${esc(p.image)}" alt="${L}: a line chart of five animal groups, a bar chart of weekend takings after a win, draw or loss, and a calendar heatmap of daily takings." loading="lazy">
        </button>
        <figcaption>Tap or click the image to enlarge it. Left: 5 lines. Middle: Win / Draw / Loss bars. Right: busy vs quiet days.</figcaption>
      </figure>

      ${ease(id + "_lines_ease", "How easy is it to tell the <strong>5 lines</strong> (left chart) apart by colour?")}

      <fieldset class="field">
        <legend class="q">Which lines look the same or very similar to you? <span class="opt">(tick any)</span></legend>
        <div class="choices">
          ${C.series.map((s) => `<label><input type="checkbox" name="${id}_lines_alike" value="${esc(s)}"> ${esc(s)}</label>`).join("")}
          <label><input type="checkbox" name="${id}_lines_alike" value="None"> None, all clear</label>
        </div>
      </fieldset>

      ${ease(id + "_wdl_ease", "How easy is it to tell <strong>Win, Draw and Loss</strong> (middle chart) apart by colour?")}
      ${ease(id + "_heatmap_ease", "How easy is it to spot <strong>busy vs quiet days</strong> (right chart)?")}

      <fieldset class="field">
        <legend class="q">Colour check: do any of these numbered blocks look the same as another one? <span class="opt">(tick any that do)</span></legend>
        <div class="swatches" aria-hidden="true">
          ${p.cat.map((h, k) => swatch(h, k + 1, isLight(h))).join("")}
        </div>
        <div class="choices">
          ${p.cat.map((h, k) => `<label><input type="checkbox" name="${id}_swatch_same" value="${k + 1} (${h})"> Block ${k + 1}</label>`).join("")}
          <label><input type="checkbox" name="${id}_swatch_same" value="None"> All look different</label>
        </div>
      </fieldset>

      <label class="field">
        <span class="q">Any comments on ${L}? <span class="opt">(optional)</span></span>
        <textarea name="${id}_comment" rows="2" maxlength="1000"></textarea>
      </label>
    </section>`;
  }).join("");

  document.querySelectorAll("[data-palette-select]").forEach((sel) => {
    order.forEach((p, i) => sel.insertAdjacentHTML("beforeend", `<option value="${p.id}">${label(i)}</option>`));
  });

  // ---------- zoom dialog ----------
  const dlg = $("#zoom");
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".zoom-btn");
    if (!b) return;
    $("#zoom-img").src = b.dataset.src;
    $("#zoom-img").alt = b.dataset.alt;
    if (dlg.showModal) dlg.showModal(); else window.open(b.dataset.src, "_blank");
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  // ---------- "None" un-ticks the others and vice versa ----------
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.type !== "checkbox") return;
    const group = document.querySelectorAll(`input[name="${t.name}"]`);
    if (t.value === "None" && t.checked) group.forEach((x) => { if (x !== t) x.checked = false; });
    if (t.value !== "None" && t.checked) group.forEach((x) => { if (x.value === "None") x.checked = false; });
  });

  // ---------- collect ----------
  function collect() {
    const form = $("#survey"), fd = new FormData(form), data = {};
    // Every question gets a key (blank if skipped) so sheet columns stay in a stable order.
    form.querySelectorAll("[name]").forEach((el) => { if (el.name !== "website") data[el.name] = ""; });
    for (const [k, v] of fd.entries()) {
      if (data[k] === "" || data[k] === undefined) data[k] = v;
      else data[k] = [].concat(data[k], v);
    }
    Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) data[k] = data[k].join("; "); });
    const nameOf = (id) => { const i = order.findIndex((p) => p.id === id); return i < 0 ? "" : `${label(i)} = ${id}`; };
    if (data.favourite) data.favourite = nameOf(data.favourite);
    if (data.least_favourite) data.least_favourite = nameOf(data.least_favourite);
    data.palette_order = order.map((p, i) => `${LETTERS[i]}=${p.id}`).join(", ");
    data.submitted_at = new Date().toISOString();
    data.minutes_taken = Math.round((Date.now() - startedAt) / 6000) / 10;
    data.screen = `${window.screen.width}x${window.screen.height}`;
    return data;
  }

  // ---------- validate ----------
  function validate() {
    const missing = [];
    document.querySelectorAll("fieldset[data-required]").forEach((fs) => {
      const name = fs.querySelector("input").name;
      const ok = !!document.querySelector(`input[name="${name}"]:checked`);
      fs.classList.toggle("invalid", !ok);
      if (!ok) missing.push(fs);
    });
    const fav = $('select[name="favourite"]');
    fav.closest(".field").classList.toggle("invalid", !fav.value);
    if (!fav.value) missing.push(fav);
    return missing;
  }

  let lastData = null;
  $("#survey").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#form-error");
    const missing = validate();
    if (missing.length) {
      err.textContent = `Please answer the ${missing.length} required question${missing.length > 1 ? "s" : ""} highlighted with a thick outline. "Can't tell" is a fine answer.`;
      err.hidden = false;
      const first = missing[0];
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      (first.querySelector ? first.querySelector("input,select") : first)?.focus({ preventScroll: true });
      return;
    }
    err.hidden = true;
    const data = collect();
    if (data.website) return; // honeypot filled = bot
    delete data.website;
    lastData = data;

    const btn = $("#submit-btn");
    btn.disabled = true; btn.textContent = "Sending…";
    let sent = false;
    if (C.SCRIPT_URL) {
      try {
        // text/plain keeps this a "simple" request, so no CORS pre-flight is needed.
        await fetch(C.SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data)
        });
        sent = true;
      } catch (ex) {
        sent = false;
      }
    }
    window.__lastSubmission = data; // handy for testing
    showThanks(sent);
  });

  function showThanks(sent) {
    $("#survey").hidden = true;
    const t = $("#thanks");
    t.hidden = false;
    $("#thanks-msg").textContent = sent
      ? "Your answers have been sent. Thanks for helping make these charts readable for more people."
      : (C.SCRIPT_URL
        ? "Something went wrong sending your answers. Please use the button below to download them and send the file to me directly."
        : "This copy of the survey isn't connected to a spreadsheet yet, so please download your answers below and send them to me.");
    $("#reveal").innerHTML = order.map((p, i) => `
      <li><strong>${label(i)}</strong>: ${esc(p.name)}
        <span class="mini">${p.cat.map((h) => `<i style="background:${h}" title="${h}"></i>`).join("")}</span></li>`).join("");
    t.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("#download-btn").addEventListener("click", () => {
    if (!lastData) return;
    const blob = new Blob([JSON.stringify(lastData, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "palette-survey-answers.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
