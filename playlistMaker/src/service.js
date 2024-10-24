const clientId = import.meta.env.VITE_API_CLIENT_ID;  // Tulee .env tiedostosta, mikä pitää olla juuressa.
const redirectUrl = 'http://localhost:5173/';  // Make sure this matches your Spotify redirect URL

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';

// Data structure to manage the active token
export const currentToken = {
  get access_token() { return localStorage.getItem('access_token') || null; },
  get refresh_token() { return localStorage.getItem('refresh_token') || null; },
  get expires_in() { return localStorage.getItem('expires_in') || null; },
  get expires() { return localStorage.getItem('expires') || null; },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_in', expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + (expires_in * 1000));
    localStorage.setItem('expires', expiry);
  }
};

// Function to handle the Spotify login redirect
export async function redirectToSpotifyAuthorize() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  window.localStorage.setItem('code_verifier', code_verifier);

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to Spotify for login
}

// Function to get the access token from Spotify after authorization
export async function getToken(code) {
  const code_verifier = localStorage.getItem('code_verifier');

  console.log('Code verifier: ', code_verifier)

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
  });

  console.log(response)

  return await response.json();
}

// Function to refresh the token using the refresh token // TODO: katotaan jos yhdistetään tuohon isTokenExpired functioon ja jätettäis kaikki yhden alle.
export async function refreshToken() {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: currentToken.refresh_token,
    }),
  });

  return await response.json();
}

//  Functio tarkistaa onko tokeni vanhentunut ja jos on niin päivittää uuteen.Tuleeko toimimaan toisen päivityksen jälkeen? //TODO :Jätetään tähän vain tarkistus että tarviiko virkistää ja sitte palauttaa true tai false ja tämän jälkee siellä muualla voidaa kutsua refreshToken. Helpompilukusta syntaxia?
export function isTokenExpired() { // TODO: exportin voi ottaa pois ku ei enää testaile nappulalla
  const expiresAtString = currentToken.expires;
  if (!expiresAtString) {
    // const token = await refreshToken();
    // currentToken.save(token);
    console.log("Tokeni pitää virkistää!<3"); //rmv
    return true;
  }
  const expiresAt = new Date(expiresAtString);
  const currentTime = new Date(); 

  if (currentTime > expiresAt){
    // const token = await refreshToken();
    // currentToken.save(token);
    console.log("Tokeni pitää virkistää!"); //rmv
    return true;
  } else {
    console.log("Tokenia ei tarvitse virkistää. Virkistetään tämän kellonajan jälkeen: " + expiresAtString); //rmv
    return false;
  }
}

// Function to get the current user's data
export async function getUserData() {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
  });

  return await response.json();
}

// Optional function to handle login button click
export async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
}

// Kirjautuu ulos painiketta painamalla
export async function logoutClick() {
  localStorage.clear();
  window.location.href = redirectUrl;
}

// Optional function to handle refreshing tokens manually
export async function refreshTokenClick() {
  const token = await refreshToken();
  currentToken.save(token);
  console.log("Tokeni on virkistetty!<3");
}

//-------------------------------------------------------------------------------------------
// Laitetaan meidän omat funktiot tästä alas, niin ei mene tuohon authorization 
// koodin sekaan meidän omaa turhan paljon.

// tekee apikutsun nappia painamalla
export async function apiCallClick(params) {
  console.log("Api call parametrilla: ", params)


  // yhdistää yksittäisen biisin hakuun id:n (params)
  const endpoint = "https://api.spotify.com/v1/tracks/".concat(params)

  const track = await apiCall(endpoint)
  
  console.log(track)

  return track;
}

// apikutsu. Muut funktiot luovat osoitteen, jonka jälkeen tätä kutsutaan
export async function apiCall(params) {
  if (isTokenExpired()) refreshTokenClick(); // TODO: Tokenrefresher ei tainnu virkistää tokenia oikeassa järjestyksessä. Yritti hakea biisua ja sitte vasta virkisti tokenin? pitää kahtoa asiaa uudestaa.
  const response = await fetch(params, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
  });

  return await response.json();
}

// Merkitään haku tehdyksi jotta hakutulos-komponentti saadaan renderöidä, ja suoritetaan apikutsu
export async function searchAndShowResult(stateSetter, params) {
  stateSetter(true);
  return apiCallClick(params);
}

export function testiTeppo(){
  if(isTokenExpired()) refreshTokenClick();
}


// Function to search for tracks based on genre and year range
async function searchTracksByCriteria(url, accessToken) {
  // Fixed URL without popularity (Spotify API doesn't support direct popularity filtering in search)
  //const url = `https://api.spotify.com/v1/search?q=genre:${genre}%20year:${yearFrom}-${yearTo}&type=track&limit=${limit}&offset=${offset}`;

  // Log the URL for debugging
  console.log('Fetching URL:', url);

  const response = await fetch(url, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
  });

  if (response.ok) {
      const data = await response.json();
      // Extract track items with popularity metadata
      const tracks = data.tracks.items;
      return tracks;
  } else {
      console.error('Error searching tracks by criteria:', response.status, response.statusText);
      return [];
  }
}

/**
 * Filters tracks by given filters
 * @param {Array} tracks 
 * @param {Object} audio_features 
 * @param {Object} filters 
 * @returns 
 */
function filterTracksByFilters(tracks, audio_features, filters) {
  console.log("FILTERS:", filters);
  return tracks.filter(track => {
    const feature = audio_features[track.id];
    if (feature) {
      return (
      track.popularity >= filters.minPopularity &&
      audio_features[track.id].danceability >= filters.minDanceability &&
      audio_features[track.id].energy >= filters.minEnergyLevel
      );
    }
    // Here is whether to include a track that has no matching audio feature
    // i.e. the API couldn't find the features for this track or nonexistent
    return false;
  });
}

// Fetch audio features for given track IDs
async function fetchAudioFeatures(trackIds, accessToken) {
  if (trackIds.length === 0) return [];

  const url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`;

  const response = await fetch(url, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
  });

  if (response.ok) {
      const data = await response.json();
      return data.audio_features;
  } else {
      console.error('Error fetching audio features:', response.status, response.statusText);
      return [];
  }
}

/**
 * Sanitizes all inputs from the user and constructs the url
 * @param {Object} params 
 * @param {Number} offset 
 * @returns object containing the url and filters
 */
function constructURL(params, offset) {
  // Defaults
  //const defaultGenre = '';
  const defaultYearFrom = 1900; // ?
  const defaultYearTo = new Date().getFullYear();
  const defaultMinPopularity = 0;
  const defaultMinDanceability = 0;
  const defaultMinEnergyLevel = 0;
  const defaultLimit = 50;

  // Sanitized inputs for the api call
  const sanitizedGenre = params.genre?.trim().toLowerCase() || null;
  const sanitizedYearFrom = params.yearFrom ? parseInt(params.yearFrom.trim()) : defaultYearFrom;
  const sanitizedYearTo = params.yearTo ? parseInt(params.yearTo.trim()) : defaultYearTo;

  const sanitizedMinPopularity = params.minPopularity ? parseInt(params.minPopularity.trim()) : defaultMinPopularity;
  const sanitizedMinDanceability = params.minDanceability ? parseFloat(params.minDanceability.trim()) : defaultMinDanceability;
  const sanitizedMinEnergyLevel = params.minEnergyLevel ? parseFloat(params.minEnergyLevel.trim()) : defaultMinEnergyLevel;

  // Filters
  const filters = {
    'minPopularity': sanitizedMinPopularity,
    'minDanceability': sanitizedMinDanceability,
    'minEnergyLevel': sanitizedMinEnergyLevel,
  }

  // Currently per api call
  const sanitizedLimit = params.limit ? parseInt(params.limit) : defaultLimit;

  let queryParams = '';
  // Conditionally add parameters to query
  if (sanitizedGenre) {
    queryParams += `genre=${sanitizedGenre}&`;
  }
  // Always atm
  if (sanitizedYearTo) {
    queryParams += `year:${sanitizedYearFrom}-${sanitizedYearTo}&`;
  }
  // Remove trailing & if exists
  queryParams = queryParams.substring(0, queryParams.length-1);
  if (queryParams.length !== 0) {
    queryParams += '&';
  }
  queryParams += 'type=track';

  const url = `https://api.spotify.com/v1/search?q=${queryParams}&limit=${sanitizedLimit}&offset=${offset}`;
  return {
    'url': url,
    'filters': filters,
  };;
}

// const minDanceability = 0.1; //between 0-1 the level is higher than the number
// const minEnergyLevel = 0.1;
// Combine everything together and filter by minPopularity, minDanceability and minEnergy
async function getTracksByCriteria(params) {
  // Refresh token if needed
  if (isTokenExpired()) await refreshTokenClick();
  const accessToken = currentToken.access_token;
  //console.log(accessToken);

  // Step 1: Random offset for random results
  let randomOffset = 0;
  // Sometimes offset + limit > 1000 so throws error???
  if (random) {
    // Limited to 0-950 now
    randomOffset = Math.floor(Math.random() * 950) // 949 for good measure?
    //console.log(randomOffset);
  }

  // Step 2: Sanitize inputs and construct url as well as filters
  const sanitized = constructURL(params, randomOffset);

  // Step 3: Search for tracks by genre and year range (popularity , minDanceability and minEnergy level will be filtered manually)
  const tracks = await searchTracksByCriteria(sanitized.url, accessToken);
  console.log("TRACKS: ", tracks);

  // Step 4: Fetch audio features and convert them to a more appropriate format
  const trackIds = tracks.map(track => track.id);
  const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);
  console.log("AUDIO FEATURES:", audioFeatures);

  const featuresObj = featuresAsObj(audioFeatures);
  console.log("FEATURES AS OBJ:", featuresObj);

  // Step 5: Filter tracks by all filters
  const filteredTracks = filterTracksByFilters(tracks, featuresObj, sanitized.filters);
  console.log('FILTERED TRACKS', filteredTracks);

  if (filteredTracks.length === 0) {
    console.log("FOUND NO TRACKS --- RETURNING");
    return;
  }
  if (!params.createPlaylist) {
    console.log("NO PLAYLIST CREATION --- RETURNING");
    return;
  }

  // Step 6: Creating a playlist if the user checked the box and more than 0 tracks
  const userData = await getUserData();
  // Constructing a date identifier for now
  const formattedDate = constructDateNow();
  const name = ("PLAYLIST", formattedDate);
  // Other 2 parameters
  let description = '';
  for (let filter in sanitized.filters) {
    description += (filter + ': ' + sanitized.filters[filter] + ' ');
  }
  const _public = true;
  const playlist = await createPlaylist(userData.id, name, description, _public);
  console.log("CREATED PLAYLIST:", playlist);
  console.log("LINK:", playlist.external_urls.spotify);

  // Step 7: Add filtered tracks to the new playlist
  const playlist_snapshot = await addTracksToPlaylist(playlist, filteredTracks);
  // Snapshot is a version identifier for the playlist. 
  // A new one is generated every time the playlist is modified.
  // Useful when modifying playlists as it works as a guarantee
  // you are working with the latest version.
  console.log("SNAPSHOT:", playlist_snapshot);
}

/**
 * Constructs audiofeatures in an object format
 * @param {Array} audioFeatures 
 * @returns object which has key as track id and value feature
 */
function featuresAsObj(audioFeatures) {
  return audioFeatures.reduce((obj, feature) => {
    if (feature) {
      obj[feature.id] = feature;
    }
    return obj;
  }, {});
}

/**
 * Constructs a formated date for current time
 * @returns formatted date
 */
function constructDateNow() {
  const now = new Date(Date.now());
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Creates a playlist for the user
 * @param {String} user_id 
 * @param {String} name 
 * @param {String} description 
 * @param {Boolean} _public 
 * @returns data
 */
async function createPlaylist(user_id, name, description, _public) {
  const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${currentToken.access_token}`,
        'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        name: name,
        description: description.substring(0, 100),
        public: _public,
      })
    });
  if (!response.ok) {
    throw new Error(`Failed to create playlist: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

/**
 * Adds tracks to the specified playlist
 * @param {Object} playlist 
 * @param {Array} tracks 
 * @returns data
 */
async function addTracksToPlaylist(playlist, tracks) {
  // Correct format
  const track_uris = tracks.map(track => `spotify:track:${track.id}`);
  console.log("TRACK URIS:", track_uris);
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${currentToken.access_token}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: track_uris,
    })
});
if (!response.ok){
  throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
}
  const data = await response.json();
  return data;
}

// Example usage:                                                                                   //???? JERJEJREJJREJRE
//const accessToken = 'YOUR_SPOTIFY_ACCESS_TOKEN';  //? currentToken.access_token
const genre = 'pop'; // The genre you want to search
const yearFrom = '2000'; // Starting year of range
const yearTo = '2010'; // Ending year of range
const minPopularity = '0'; // Minimum popularity threshold
const minDanceability = '0.5'; // Minimum danceability
const minEnergyLevel = '0.3'; // Minimum energy
const limit = 50; // Number of tracks to fetch
const _createPlaylist = false; // If a playlist is created
const random = true; // otetaanko random biisit vai samat

export function hakuHarri(){
  search(genre, yearFrom, yearTo, minPopularity, minDanceability, minEnergyLevel, limit, _createPlaylist);
}

export function search(genre, yearFrom, yearTo, minPopularity, minDanceability, minEnergyLevel, limit, createPlaylist) {
  const params = {
    'genre': genre,
    'yearFrom': yearFrom,
    'yearTo': yearTo,
    'minPopularity': minPopularity,
    'minDanceability': minDanceability,
    'minEnergyLevel': minEnergyLevel,
    'limit': limit,
    'createPlaylist': createPlaylist,
    };
  getTracksByCriteria(params);
}