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

  if(currentTime > expiresAt){
    // const token = await refreshToken();
    // currentToken.save(token);
    console.log("Tokeni pitää virkistää!"); //rmv
    return true;
  }else{
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
  if(isTokenExpired()) refreshTokenClick(); // TODO: Tokenrefresher ei tainnu virkistää tokenia oikeassa järjestyksessä. Yritti hakea biisua ja sitte vasta virkisti tokenin? pitää kahtoa asiaa uudestaa.
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
async function searchTracksByCriteria(genre, yearFrom, yearTo, accessToken, limit = 50, offset = 0) {
  // Fixed URL without popularity (Spotify API doesn't support direct popularity filtering in search)
  const url = `https://api.spotify.com/v1/search?q=genre:${genre}%20year:${yearFrom}-${yearTo}&type=track&limit=${limit}&offset=${offset}`;

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

// Filter tracks by popularity manually after fetching the results
function filterTracksByPopularity(tracks, maxPopularity) {
  return tracks.filter(track => track.popularity <= maxPopularity);
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

// Filter tracks by danceability and energy
function filterTracksByFeatures(audioFeatures, danceabilityThreshold, energyThreshold) {
  return audioFeatures.filter(feature => 
      feature.danceability >= danceabilityThreshold && feature.energy >= energyThreshold
  );
}

// const danceability = 0.1; //between 0-1 the level is higher than the number
// const energyLevel = 0.1;
// Combine everything together and filter by danceability, energy, and popularity
async function getHighEnergyDanceableTracksByCriteria(genre, yearFrom, yearTo, maxPopularity, accessToken, limit = 50, random, danceability, energyLevel) {
  // Step 1: Random offset for random results
  let randomOffset = 0;
  if(random){
    randomOffset = Math.floor(Math.random() * 1000);
    console.log(randomOffset);
  } 

  // Step 2: Search for tracks by genre and year range (popularity will be filtered manually)
  const tracks = await searchTracksByCriteria(genre, yearFrom, yearTo, accessToken, limit, randomOffset);

  // Step 3: Filter tracks by popularity (Spotify API doesn't support direct filtering)
  const filteredByPopularity = filterTracksByPopularity(tracks, maxPopularity); //filtteri syö limittimäärästä biisejä, esim jos haetaan 50 biisiä ja 14 osuu kriteereihin nii palautetaan vain 14 biisua, tähän pitäis tehä paikkaus joka täydentää haluttuun lukumäärään

  // Step 4: Extract track IDs and fetch audio features for danceability and energy
  const trackIds = filteredByPopularity.map(track => track.id);
  const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);

  // Step 5: Filter by danceability and energy > 70%
  const filteredTracks = filterTracksByFeatures(audioFeatures, danceability, energyLevel);
  
  console.log('Filtered tracks with energy and danceability > 70%:', filteredTracks);

  // Step 6: Creating a playlist
  const userData = await getUserData();
  // Constructing a date identifier for now
  const formattedDate = constructDateNow();
  const name = ("TESTI PLAYLIST", formattedDate);
  // Other 2 parameters
  const description = "RANDOMILLA GENEROITU";
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
        description: description.substring(0, 50),
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
const accessToken = 'YOUR_SPOTIFY_ACCESS_TOKEN';  //? currentToken.access_token
const genre = 'pop';  // The genre you want to search
const yearFrom = 2000;  // Starting year of range
const yearTo = 2010;    // Ending year of range
const maxPopularity = 100;  // Maximum popularity threshold
const limit = 50;  // Number of tracks to fetch
const random = true; // otetaanko random biisit vai samat

export function hakuHarri(){
  getHighEnergyDanceableTracksByCriteria(genre, yearFrom, yearTo, maxPopularity, currentToken.access_token, limit, random);
}

export function search(genre, yearFrom, yearTo, maxPopularity, limit, danceability, energyLevel){
  getHighEnergyDanceableTracksByCriteria(genre, yearFrom, yearTo, maxPopularity, currentToken.access_token, limit, random, danceability, energyLevel);
}