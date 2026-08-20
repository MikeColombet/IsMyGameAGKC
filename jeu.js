const EDITION_LABELS = {
  Complet: "Complet",
  GKC: "Game-Key Card (GKC)",
  CIAB: "Code in a Box (CIAB)",
  NS2E: "Nintendo Switch 2 Edition (NS2E)",
  Numerique: "Numérique uniquement",
};

const EDITION_DESC = {
  Complet: "Cartouche physique contenant l'intégralité du jeu.",
  GKC: "La carte en boîte ne contient qu'un lien de téléchargement, pas le jeu.",
  CIAB: "La boîte contient un code de téléchargement, sans aucune carte.",
  NS2E: "Édition physique ou mise à niveau d'un jeu Switch 1 avec des améliorations Switch 2.",
  Numerique: "Ce jeu n'a pas d'édition physique, disponible uniquement sur l'eShop.",
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

// Only accept exact Nintendo eShop product pages — never render an
// unrecognized scheme/host (e.g. javascript:) as a clickable link.
function safeEshopUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && parsed.hostname === "www.nintendo.com") {
      return parsed.href;
    }
  } catch (e) {
    // fall through
  }
  return null;
}

// YouTube video IDs are always exactly 11 URL-safe characters — reject
// anything else instead of interpolating it into the iframe src.
function safeYoutubeId(id) {
  if (typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id)) return id;
  return null;
}

function formatDate(d) {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return d || "Date inconnue";
  const [y, m, day] = d.split("-");
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  return `${parseInt(day, 10)} ${mois[parseInt(m, 10) - 1]} ${y}`;
}

function metacriticBadge(score) {
  if (score === null || score === undefined) {
    return `<span class="mc-score mc-na" style="font-size:1.1rem;padding:0.3rem 0.7rem;">NA</span>`;
  }
  let cls = "mc-mixed";
  if (score >= 75) cls = "mc-good";
  else if (score < 50) cls = "mc-bad";
  return `<span class="mc-score ${cls}" style="font-size:1.1rem;padding:0.3rem 0.7rem;">${score}</span>`;
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);
  const container = document.getElementById("game-detail");
  const game = GAMES_DATA.jeux.find((g) => g.id === id);

  if (!game) {
    container.innerHTML = `<p>Jeu introuvable. <a href="index.html">Retour à la liste</a>.</p>`;
    return;
  }

  const nom = escapeHtml(game.nom);
  document.getElementById("page-title").textContent = `${game.nom} — Is My Game A GKC ?`;
  document.getElementById("page-description").setAttribute(
    "content",
    game.pitch_fr || `Fiche jeu ${game.nom} sur Nintendo Switch 2 : édition physique, date de sortie, score Metacritic.`
  );

  const cls = "badge-" + game.edition_physique.toLowerCase();

  const eshopUrl = safeEshopUrl(game.eshop_url);
  const eshopLink = eshopUrl
    ? `<a class="eshop-link" href="${escapeHtml(eshopUrl)}" target="_blank" rel="noopener noreferrer">Voir sur le Nintendo eShop &rarr;</a>`
    : "";

  const trailerId = safeYoutubeId(game.youtube_trailer_id);
  const trailerSection = trailerId
    ? `
    <section class="detail-block">
      <h2>Bande-annonce</h2>
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${trailerId}"
          title="Bande-annonce officielle — ${nom}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </section>`
    : "";

  const editeur = escapeHtml(game.editeur) || "—";
  const code = escapeHtml(game.code) || "—";
  const pitch = escapeHtml(game.pitch_fr) || "Synopsis non disponible pour ce jeu.";

  container.innerHTML = `
    <h1>${nom}</h1>
    <div class="detail-meta">
      <span class="badge ${cls}">${EDITION_LABELS[game.edition_physique] || game.edition_physique}</span>
      ${metacriticBadge(game.metacritic)}
      ${eshopLink}
    </div>

    <section class="detail-block">
      <h2>Pitch</h2>
      <p>${pitch}</p>
    </section>

    <section class="detail-block">
      <h2>Informations</h2>
      <dl class="detail-grid">
        <dt>Date de sortie</dt>
        <dd>${formatDate(game.date_sortie)}</dd>

        <dt>Éditeur</dt>
        <dd>${editeur}</dd>

        <dt>Édition physique</dt>
        <dd>${EDITION_LABELS[game.edition_physique] || game.edition_physique} — ${EDITION_DESC[game.edition_physique] || ""}</dd>

        <dt>Code EAN</dt>
        <dd>${code}</dd>

        <dt>Score Metacritic</dt>
        <dd>${game.metacritic !== null && game.metacritic !== undefined ? game.metacritic + " / 100" : "NA"}</dd>
      </dl>
    </section>

    ${trailerSection}
  `;
}

render();
