const EDITION_LABELS = {
  Complet: "Complet",
  GKC: "GKC",
  CIAB: "CIAB",
  NS2E: "NS2E",
  Numerique: "Numérique",
};

const state = {
  sortKey: "date_sortie",
  sortDir: 1,
  search: "",
  edition: "",
  physicalOnly: false,
};

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(d) {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return d || "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function badge(edition) {
  const cls = "badge-" + edition.toLowerCase();
  return `<span class="badge ${cls}">${EDITION_LABELS[edition] || edition}</span>`;
}

function metacriticBadge(score) {
  if (score === null || score === undefined) {
    return `<span class="mc-score mc-na">NA</span>`;
  }
  let cls = "mc-mixed";
  if (score >= 75) cls = "mc-good";
  else if (score < 50) cls = "mc-bad";
  return `<span class="mc-score ${cls}">${score}</span>`;
}

function render() {
  const tbody = document.getElementById("games-body");
  const countEl = document.getElementById("result-count");

  let games = GAMES_DATA.jeux.slice();

  if (state.physicalOnly) {
    games = games.filter((g) => g.edition_physique !== "Numerique");
  }
  if (state.edition) {
    games = games.filter((g) => g.edition_physique === state.edition);
  }
  if (state.search) {
    const q = state.search.toLowerCase();
    games = games.filter(
      (g) =>
        g.nom.toLowerCase().includes(q) ||
        (g.editeur || "").toLowerCase().includes(q)
    );
  }

  games.sort((a, b) => {
    const va = a[state.sortKey] || "";
    const vb = b[state.sortKey] || "";
    if (va < vb) return -1 * state.sortDir;
    if (va > vb) return 1 * state.sortDir;
    return 0;
  });

  tbody.innerHTML = games
    .map((g) => {
      const nom = escapeHtml(g.nom);
      const editeur = escapeHtml(g.editeur) || "—";
      const code = escapeHtml(g.code) || "—";
      return `
    <tr>
      <td data-label="Jeu"><a class="game-link" href="jeu.html?id=${g.id}">${nom}</a></td>
      <td data-label="Date de sortie">${formatDate(g.date_sortie)}</td>
      <td data-label="Édition physique">${badge(g.edition_physique)}</td>
      <td class="cell-editeur" data-label="Éditeur">${editeur}</td>
      <td class="cell-code" data-label="EAN">${code}</td>
      <td class="cell-metacritic" data-label="Metacritic">${metacriticBadge(g.metacritic)}</td>
    </tr>`;
    })
    .join("");

  countEl.textContent = `${games.length} / ${GAMES_DATA.jeux.length} jeux`;
  updateSortIndicators();
}

function updateSortIndicators() {
  document.querySelectorAll("th[data-key]").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.key === state.sortKey) {
      th.classList.add(state.sortDir === 1 ? "sort-asc" : "sort-desc");
    }
  });
}

function syncStickyOffset() {
  const controls = document.querySelector(".controls");
  if (!controls) return;
  document.documentElement.style.setProperty(
    "--sticky-offset",
    controls.getBoundingClientRect().height + "px"
  );
}

window.addEventListener("resize", syncStickyOffset);

function renderMeta() {
  const m = GAMES_DATA.meta;
  document.getElementById("meta-info").innerHTML =
    `Liste compilée le ${formatDate(m.date_compilation)} · ${m.nombre_total_jeux} jeux au total. ` +
    `Le catalogue 100% numérique (petits titres eShop) peut être incomplet. Le champ "Code" est le code-barres EAN-13 du produit physique, renseigné quand trouvable (109/215 jeux physiques à ce jour). ` +
    `Sources : Wikipedia "List of Nintendo Switch 2 games", Nintendo Life, Nintendo Wire.`;
}

document.getElementById("search").addEventListener("input", (e) => {
  state.search = e.target.value;
  render();
});

document.getElementById("filter-edition").addEventListener("change", (e) => {
  state.edition = e.target.value;
  render();
});

document.getElementById("filter-physical").addEventListener("change", (e) => {
  state.physicalOnly = e.target.checked;
  render();
});

document.querySelectorAll("th[data-key]").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    if (state.sortKey === key) {
      state.sortDir *= -1;
    } else {
      state.sortKey = key;
      state.sortDir = 1;
    }
    render();
  });
});

renderMeta();
render();
syncStickyOffset();
