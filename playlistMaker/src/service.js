const clientId = import.meta.env.VITE_API_CLIENT_ID;  // Comes from .env file that has to be in root folder
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

// Function checks if access token is expired
function isTokenExpired() {
  const expiresAtString = currentToken.expires;
  if (!expiresAtString) {
    // const token = await refreshToken();
    // currentToken.save(token);
    return true;
  }
  const expiresAt = new Date(expiresAtString);
  const currentTime = new Date(); 
  if (currentTime > expiresAt){
    // const token = await refreshToken();
    // currentToken.save(token);
    return true;
  }
  return false;
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

// Log out via button click
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
// ***POISTETAAN TÄMÄ KOMMENTTI LOPUSSA***
//-------------------------------------------------------------------------------------------

// TODO: delete?
export async function apiCallClick(params) {
  console.log("API call with parameters: ", params)


  // Search for a single song with song ID (params)
  const endpoint = "https://api.spotify.com/v1/tracks/".concat(params)

  const track = await apiCall(endpoint)
  
  console.log(track)

  return track;
}

// API call with URL constructed by helper functions
export async function apiCall(params) {
  if (isTokenExpired()) refreshTokenClick();
  const response = await fetch(params, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
  });

  return await response.json();
}

// Function to search for tracks based on genre and year range
async function searchTracksByCriteria(url, accessToken) {
  console.log('FETCHING URL:', url);
  const response = await fetch(url, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
  });

  if (response.ok) {
      const data = await response.json();
      // Extract tracks
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
  //console.log("FILTERS:", filters);
  return tracks.filter(track => {
    const feature = audio_features[track.id];
    if (feature) {
      return (
      audio_features[track.id].danceability >= filters.minDanceability &&
      audio_features[track.id].energy >= filters.minEnergyLevel &&
      audio_features[track.id].acousticness >= filters.minAcousticness &&
      audio_features[track.id].instrumentalness >= filters.minInstrumentalness &&
      audio_features[track.id].liveness >= filters.minLiveness &&
      audio_features[track.id].loudness >= filters.minLoudness &&
      audio_features[track.id].speechiness >= filters.minSpeechiness &&
      audio_features[track.id].tempo >= filters.minTempo &&
      audio_features[track.id].valence >= filters.minValence
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
  // Defaults TODO: delete? params will always contain default values see SearchForm.jsx states
  //const defaultGenre = '';
  const defaultYearFrom = 1900; // ?
  const defaultYearTo = new Date().getFullYear();
  const defaultMinDanceability = 0;
  const defaultMinEnergyLevel = 0;
  const defaultMinAcousticness = 0;
  const defaultMinInstrumentalness = 0;
  const defaultMinLiveness = 0;
  const defaultMinLoudness = -60; // In decibels, maybe lower?
  const defaultMinSpeechiness = 0;
  const defaultMinTempo = 0; // 50 very slow, but keep at 0?
  const defaultMinValence = 0;
  const defaultLimit = 50;

  // Sanitized inputs for the api call
  const sanitizedGenre = params.genre?.trim().toLowerCase() || null;
  const sanitizedYearFrom = params.yearFrom ? parseInt(params.yearFrom.trim()) : defaultYearFrom;
  const sanitizedYearTo = params.yearTo ? parseInt(params.yearTo.trim()) : defaultYearTo;

  // Filters
  const sanitizedMinDanceability = params.filters.minDanceability ? parseFloat(params.filters.minDanceability.trim()) : defaultMinDanceability;
  const sanitizedMinEnergyLevel = params.filters.minEnergyLevel ? parseFloat(params.filters.minEnergyLevel.trim()) : defaultMinEnergyLevel;
  const sanitizedMinAcousticness = params.filters.minAcousticness ? parseFloat(params.filters.minAcousticness.trim()) : defaultMinAcousticness;
  const sanitizedMinInstrumentalness = params.filters.minInstrumentalness ? parseFloat(params.filters.minInstrumentalness.trim()) : defaultMinInstrumentalness;
  const sanitizedMinLiveness = params.filters.minLiveness ? parseFloat(params.filters.minLiveness.trim()) : defaultMinLiveness;
  const sanitizedMinLoudness = params.filters.minLoudness ? parseFloat(params.filters.minLoudness.trim()) : defaultMinLoudness;
  const sanitizedMinSpeechiness = params.filters.minSpeechiness ? parseFloat(params.filters.minSpeechiness.trim()) : defaultMinSpeechiness;
  const sanitizedMinTempo = params.filters.minTempo ? parseFloat(params.filters.minTempo.trim()) : defaultMinTempo;
  const sanitizedMinValence = params.filters.minValence ? parseFloat(params.filters.minValence.trim()) : defaultMinValence;

  // Filters, same as when constructing them in SearchForm
  // TODO: consider just changing the params and not create a new one
  const filters = {
    'minDanceability': sanitizedMinDanceability,
    'minEnergyLevel': sanitizedMinEnergyLevel,
    'minAcousticness': sanitizedMinAcousticness,
    'minInstrumentalness': sanitizedMinInstrumentalness,
    'minLiveness': sanitizedMinLiveness,
    'minLoudness': sanitizedMinLoudness,
    'minSpeechiness': sanitizedMinSpeechiness,
    'minTempo': sanitizedMinTempo,
    'minValence': sanitizedMinValence,
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

/**
 * Performs searches in a loop to find tracks that match the given parameters
 * Vähän JSDoc tyyliä, jos halutaan
 * @async
 * @function getTracksByCriteria
 * @param {Object} params Object containg all search criteria
 * @returns {Promise<Array>} filtered tracks
 */
async function getTracksByCriteria(params) {
  console.log(params);
  // Refresh token if needed
  if (isTokenExpired()) await refreshTokenClick();
  const accessToken = currentToken.access_token;
  //console.log(accessToken);

  // Step 1: Random offset for random results
  let randomOffset = 0;
  // Sometimes offset + limit > 1000 so throws error???
  if (random) {
    const min = 550;
    const max = 950;
    // Limits to [min, max]
    randomOffset = Math.floor(Math.random() * (max - min) + min)
    //console.log(randomOffset);
  }
  
  // Searching tracks in a loop and lowering randomOffset on each search
  // Max number of searches at total
  const maxSearches = 10;
  let currentSearches = 0;

  // If no tracks are found for 4 CONSECUTIVE searches -> break
  const maxSearchesNoTracks = 4;
  let searchesNoTracks = 0;

  // Found tracks and the limit
  const found_tracks = [];
  const limit = params.limit ? parseInt(params.limit) : 50;
  while (
    currentSearches < maxSearches && 
    searchesNoTracks < maxSearchesNoTracks && 
    found_tracks.length < limit
  ) {
    // Step 2: Sanitize inputs and construct url as well as filters
    // TODO: refactoring so that sanitizing only happens once
    // works fine as of now
    const sanitized = constructURL(params, randomOffset);
    // Has a warning on await for some reason but works correctly
    const tracks = await searchAndFilter(sanitized, accessToken);
    console.log("SEARCHES:", currentSearches, "TRACKS:", found_tracks.length);
    
    // Add the tracks
    for (const track of tracks) {
      if (found_tracks.length < limit) {
        found_tracks.push(track);
      }
      else {
        // Limit is achieved
        console.log("LIMIT REACHED");
        console.log("FINAL: ", found_tracks);
        //return found_tracks;
        // Removing duplicates just in case
        return [...new Set(found_tracks)];
      }
    }

    // Adjust offset
    // This needs optimizing! probably based on randomOffset min and max
    if (tracks.length === 0) {
      searchesNoTracks++;
      // if (randomOffset > limit + 30)
      // This will be modified most likely
      //if (randomOffset > limit) {
      if (randomOffset > limit + 5) {
        //randomOffset = Math.round(randomOffset / 2);
        //randomOffset -= limit;
        // TODO: VERY RARE ERROR WHERE A SONG CAN BE FOUND TWICE
        // PROBABLY DUE TO CHANGES IN THE SPOTIFY DATABASE DURING THE SEARCH?
        // SOLUTION? -> SUBTRACT SLIGTHLY MORE THAN LIMIT TO ACCOUNT FOR MINOR CHANGES
        // OR CHECKING FOR DUPLICATES AT THE END?
        randomOffset -= (limit + 5);
      }
    }
    else {
      searchesNoTracks = 0;
      // This will stay like this
      if (randomOffset > limit + 5) {
        //randomOffset -= limit;
        randomOffset -= (limit + 5);
      }
    }
    currentSearches++;
  }

  console.log("FINAL: ", found_tracks);
  //return found_tracks;
  // Removing duplicates just in case
  return [...new Set(found_tracks)];
}

/**
 * Searches for tracks and filters through them
 * @param {Object} sanitized Object holding the sanitized url and filters
 * @param {string} accessToken The users's access token
 * @returns filtered tracks
 */
async function searchAndFilter(sanitized, accessToken) {
  //console.log(sanitized, accessToken);
  // Step 3: Search for tracks by genre and year range, filtering later
  const tracks = await searchTracksByCriteria(sanitized.url, accessToken);
  console.log("TRACKS: ", tracks);
  if (tracks.length === 0) {
    console.log("%cFOUND NO TRACKS --- RETURNING []", "color:red;");
    return [];
  }

  // Step 4: Fetch audio features and convert them to a more appropriate format
  const trackIds = tracks.map(track => track.id);
  const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);
  //console.log("AUDIO FEATURES:", audioFeatures);
  const featuresObj = featuresAsObj(audioFeatures);
  //console.log("FEATURES AS OBJ:", featuresObj);

  // Step 5: Filter tracks by all filters
  const filteredTracks = filterTracksByFilters(tracks, featuresObj, sanitized.filters);
  console.log('FILTERED TRACKS', filteredTracks);

  if (filteredTracks.length === 0) {
    console.log("%cFILTERING PRODUCED 0 VALID TRACKS --- RETURNING []", "color:yellow;");
    return [];
  }

  return filteredTracks;
}

/**
 * Creates a playlist for the user with the selected tracks
 * @param {Array} filteredTracks 
 * @param {Object} sanitized 
 * @returns url to the playlist
 */
export async function makePlaylist(filteredTracks/*, sanitized*/) {
  // Step 6: Creating a playlist if the user checked the box and more than 0 tracks
  const userData = await getUserData();
  // Constructing a date identifier for now
  const formattedDate = constructDateNow();
  const name = ("PLAYLIST", formattedDate);
  // Other 2 parameters
  // Do we even want to let the user specify the description?
  // For now outputs the current filters in a pretty format
  let description = formattedDate;
  //for (let filter in sanitized.filters) {
    //description += (filter + ': ' + sanitized.filters[filter] + ' ');
  //}
  // The user being able to set this will probably be handy
  const _public = true;
  const playlist = await createPlaylistSpotify(userData.id, name, description, _public);
  console.log("CREATED PLAYLIST:", playlist);
  const url = playlist.external_urls.spotify;
  //console.log("LINK:", url);

  // Step 7: Add filtered tracks to the new playlist
  const playlist_snapshot = await addTracksToPlaylist(playlist, filteredTracks);
  // Snapshot is a version identifier for the playlist. 
  // A new one is generated every time the playlist is modified.
  // Useful when modifying playlists as it works as a guarantee
  // you are working with the latest version.
  //console.log("SNAPSHOT:", playlist_snapshot);

  // TODO: return something to tell the user the playlist was created
  // Maybe the link to it?
  return url;
}

/**
 * Constructs audiofeatures in an object format
 * @param {Array} audioFeatures 
 * @returns object -> track_id: feature
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
 * Constructs a formatted date for current time
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
 * Creates a playlist for the user on Spotify
 * @param {String} user_id 
 * @param {String} name 
 * @param {String} description 
 * @param {Boolean} _public 
 * @returns data
 */
async function createPlaylistSpotify(user_id, name, description, _public) {
  const description_maxLength = 100;
  const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${currentToken.access_token}`,
        'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        name: name,
        description: description.substring(0, description_maxLength),
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
  //console.log("TRACK URIS:", track_uris);
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

// Example usage:
//const accessToken = 'YOUR_SPOTIFY_ACCESS_TOKEN';  //? currentToken.access_token
//const genre = 'pop'; // The genre you want to search
//const yearFrom = '2000'; // Starting year of range
//const yearTo = '2010'; // Ending year of range
//const minDanceability = '0.5'; // Minimum danceability
//const minEnergyLevel = '0.3'; // Minimum energy
//const limit = 50; // Number of tracks to fetch
//const _createPlaylist = false; // If a playlist is created
const random = true; // Random songs or the same ones as before TODO: move to a more sensible place

export async function search(params) {
  return getTracksByCriteria(params);
}