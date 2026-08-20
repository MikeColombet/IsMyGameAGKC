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

  document.getElementById("page-title").textContent = `${game.nom} — Is My Game A GKC ?`;

  const cls = "badge-" + game.edition_physique.toLowerCase();

  const eshopLink = game.eshop_url
    ? `<a class="eshop-link" href="${game.eshop_url}" target="_blank" rel="noopener noreferrer">Voir sur le Nintendo eShop &rarr;</a>`
    : "";

  const trailerSection = game.youtube_trailer_id
    ? `
    <section class="detail-block">
      <h2>Bande-annonce</h2>
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${game.youtube_trailer_id}"
          title="Bande-annonce officielle — ${game.nom}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </section>`
    : "";

  container.innerHTML = `
    <h1>${game.nom}</h1>
    <div class="detail-meta">
      <span class="badge ${cls}">${EDITION_LABELS[game.edition_physique] || game.edition_physique}</span>
      ${metacriticBadge(game.metacritic)}
      ${eshopLink}
    </div>

    <section class="detail-block">
      <h2>Pitch</h2>
      <p>${game.pitch_fr || "Synopsis non disponible pour ce jeu."}</p>
    </section>

    ${trailerSection}

    <section class="detail-block">
      <h2>Informations</h2>
      <dl class="detail-grid">
        <dt>Date de sortie</dt>
        <dd>${formatDate(game.date_sortie)}</dd>

        <dt>Éditeur</dt>
        <dd>${game.editeur || "—"}</dd>

        <dt>Édition physique</dt>
        <dd>${EDITION_LABELS[game.edition_physique] || game.edition_physique} — ${EDITION_DESC[game.edition_physique] || ""}</dd>

        <dt>Code EAN</dt>
        <dd>${game.code || "—"}</dd>

        <dt>Score Metacritic</dt>
        <dd>${game.metacritic !== null && game.metacritic !== undefined ? game.metacritic + " / 100" : "NA"}</dd>
      </dl>
    </section>
  `;
}

render();
