document.addEventListener('DOMContentLoaded', () => {
    const donateBtn = document.querySelector('.donate-btn');
    donateBtn.addEventListener('click', () => {
      // Replace this URL with your actual donation page or payment gateway
      window.open('https://example.com/donate', '_blank');
    });
});

const apiKey = 'c2ebe3d363b34d7cc6f174adb4d219aa';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieContainer = document.getElementById('movie-container');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
  }
});

async function searchMovies(query) {
  try {
    const response = await fetch(`${baseUrl}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    const filteredResults = data.results.filter(item => item.poster_path);
    displayResults(filteredResults);
  } catch (error) {
    console.error('Error searching movies:', error);
  }
}

function displayResults(results) {
  movieContainer.innerHTML = '';
  results.forEach(item => {
    if (item.media_type === 'movie' || item.media_type === 'tv') {
      const movieCard = document.createElement('div');
      movieCard.classList.add('movie-card');

      const title = item.title || item.name;
      const desc = item.overview;
      const shortDesc = desc ? getShortOverview(desc) : '';
      const posterPath = item.poster_path ? `${imageBaseUrl}${item.poster_path}` : '';
      const mediaType = item.media_type === 'tv' ? 'TV' : 'Movie';

      movieCard.innerHTML = `
        <img src="${posterPath}" alt="${title}">
        <h3>${title}</h3>
        <h5>${shortDesc}</h5>
        <p>Release: ${item.release_date || item.first_air_date || 'N/A'}</p>
        <p>${mediaType}</p>
      `;

      movieCard.addEventListener('click', () => showDetailedCard(item));

      movieContainer.appendChild(movieCard);
    }
  });
}

async function showDetailedCard(item) {
  const detailedCard = document.createElement('div');
  detailedCard.classList.add('detailed-card');

  const title = item.title || item.name;
  const desc = item.overview;
  const posterPath = item.poster_path ? `${imageBaseUrl}${item.poster_path}` : '';
  const mediaType = item.media_type === 'tv' ? 'TV Show' : 'Movie';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  let seasonsHtml = '';
  if (item.media_type === 'tv') {
    const tvDetails = await fetchTVDetails(item.id);
    seasonsHtml = generateSeasonsHtml(tvDetails.seasons);
  }

  detailedCard.innerHTML = `
    <div class="detailed-content">
      <img src="${posterPath}" alt="${title}">
      <div class="info">
        <h2>${title}</h2>
        <p><strong>Description:</strong> ${desc}</p>
        <p><strong>TMDB Rating:</strong> ${rating}</p>
        <p><strong>Release Date:</strong> ${item.release_date || item.first_air_date || 'N/A'}</p>
        <p><strong>Media Type:</strong> ${mediaType}</p>
        ${seasonsHtml}
      </div>
    </div>
    <button class="close-btn">Close</button>
  `;

  document.body.appendChild(detailedCard);

  const closeBtn = detailedCard.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(detailedCard);
  });
}

async function fetchTVDetails(tvId) {
  try {
    const response = await fetch(`${baseUrl}/tv/${tvId}?api_key=${apiKey}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV details:', error);
    return null;
  }
}

function generateSeasonsHtml(seasons) {
  if (!seasons || seasons.length === 0) return '';

  let seasonsHtml = '<div class="seasons"><h3>Seasons</h3>';
  seasons.forEach(season => {
    seasonsHtml += `
      <div class="season">
        <h4>${season.name}</h4>
        <p>Episodes: ${season.episode_count}</p>
        <p>Air Date: ${season.air_date || 'N/A'}</p>
      </div>
    `;
  });
  seasonsHtml += '</div>';

  return seasonsHtml;
}

async function loadPopularMovies() {
  try {
    const response = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}`);
    const data = await response.json();
    const filteredResults = data.results.filter(item => item.poster_path);
    displayResults(filteredResults);
  } catch (error) {
    console.error('Error loading popular movies:', error);
  }
}

function getShortOverview(overview) {
  const words = overview.split(' ');
  if (words.length > 20) {
    return `${words.slice(0, 20).join(' ')}...`;
  }
  return overview;
}

loadPopularMovies();