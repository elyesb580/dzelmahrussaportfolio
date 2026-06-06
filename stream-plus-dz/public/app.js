// ---------- CONFIGURATION ----------
// Service de proxy CORS gratuit (pas d'installation, pas de clé)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const appDiv = document.getElementById('app');
const playerContainer = document.getElementById('player-container');
const player = document.getElementById('player');
let animeData = null;

document.getElementById('load-btn').addEventListener('click', loadAnime);

// ---------- CHARGEMENT DE LA PAGE ET EXTRACTION DES DONNÉES ----------
async function loadAnime() {
  const url = document.getElementById('anime-url').value.trim();
  if (!url) return alert('Entre une URL de saison Muguwara');

  try {
    // Récupère le code HTML de la page via le proxy CORS
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    const html = await response.text();

    // Cherche le bloc JSON contenant "animeServer"
    const match = html.match(/"animeServer":(\{.*?\}),"disponibles"/s);
    if (!match) {
      alert('Données de l\'anime introuvables. Vérifie l\'URL.');
      return;
    }

    animeData = JSON.parse(match[1]);
    renderAnime();
  } catch (e) {
    alert('Erreur réseau ou proxy CORS indisponible. Réessaie plus tard.');
  }
}

// ---------- AFFICHAGE DES SAISONS ET ÉPISODES ----------
function renderAnime() {
  appDiv.innerHTML = `<h2>${animeData.anime}</h2>`;
  const saisons = animeData.options.saisons || [];

  saisons.forEach(saison => {
    const saisonDiv = document.createElement('div');
    saisonDiv.innerHTML = `<h3>${saison.name}</h3>`;

    // VF
    const vfDiv = document.createElement('div');
    vfDiv.innerHTML = '<strong>VF</strong>';
    vfDiv.appendChild(createEpisodeList(saison.lang.vf));
    saisonDiv.appendChild(vfDiv);

    // VOSTFR
    const vostDiv = document.createElement('div');
    vostDiv.innerHTML = '<strong>VOSTFR</strong>';
    vostDiv.appendChild(createEpisodeList(saison.lang.vostfr));
    saisonDiv.appendChild(vostDiv);

    appDiv.appendChild(saisonDiv);
  });
}

// ---------- CRÉATION DE LA LISTE D'ÉPISODES ----------
function createEpisodeList(serverGroups) {
  const wrapper = document.createElement('div');
  wrapper.className = 'episode-list';

  if (!serverGroups || serverGroups.length === 0) {
    wrapper.textContent = 'Aucun lien trouvé';
    return wrapper;
  }

  const mainServer = serverGroups[0] || [];          // Premier serveur (souvent Sibnet)
  const fallbackServers = serverGroups.slice(1);     // Autres serveurs (Vidmoly, Sendvid…)

  mainServer.forEach((url, index) => {
    const epNum = index + 1;
    const btn = document.createElement('button');
    btn.className = 'episode-card';
    btn.textContent = `Ép. ${epNum}`;
    btn.addEventListener('click', () => {
      const fallbackUrls = fallbackServers.map(s => s[index]).filter(Boolean);
      playEpisode(url, fallbackUrls);
    });
    wrapper.appendChild(btn);
  });

  return wrapper;
}

// ---------- LANCEMENT DE LA LECTURE ----------
async function playEpisode(primaryUrl, fallbackUrls) {
  playerContainer.classList.remove('hidden');

  const urlObj = new URL(primaryUrl);
  const videoid = urlObj.searchParams.get('videoid');

  // Si c'est un lien Sibnet, on extrait le mp4 direct
  if (videoid) {
    try {
      const shellUrl = `https://video.sibnet.ru/shell.php?videoid=${videoid}`;
      const res = await fetch(CORS_PROXY + encodeURIComponent(shellUrl));
      const page = await res.text();

      const mp4Match = page.match(/file:\s*['"]([^'"]+\.mp4[^'"]*)['"]/);
      if (mp4Match) {
        let mp4 = mp4Match[1];
        if (mp4.startsWith('/')) mp4 = 'https://video.sibnet.ru' + mp4;
        player.src = mp4;
        player.play();
        return;
      }
    } catch (e) {
      console.warn('Échec extraction Sibnet');
    }
  }

  // Fallback : ouvre le premier serveur alternatif dans un nouvel onglet
  if (fallbackUrls.length > 0) {
    window.open(fallbackUrls[0], '_blank');
    playerContainer.classList.add('hidden');
  } else {
    alert('Aucun serveur disponible pour cet épisode.');
    playerContainer.classList.add('hidden');
  }
}

// Fermeture du lecteur
document.getElementById('close-player').addEventListener('click', () => {
  player.pause();
  playerContainer.classList.add('hidden');
});
