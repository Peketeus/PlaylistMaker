const clientId = import.meta.env.VITE_API_CLIENT_ID; // Comes from .env file
const redirectUrl = "http://localhost:5173/"; // Make sure this matches your Spotify redirect URL

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private";

//
//-------------------------------------------------------------------------------------------------
// Authorization functionality
//-------------------------------------------------------------------------------------------------
//

// Data structure to manage the active token.
export const currentToken = {
  get access_token() { return localStorage.getItem("access_token") || null; },
  get refresh_token() { return localStorage.getItem("refresh_token") || null; },
  get expires_in() { return localStorage.getItem("expires_in") || null; },
  get expires() { return localStorage.getItem("expires") || null; },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_in", expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + expires_in * 1000);
    localStorage.setItem("expires", expiry);
  },
};

// Function to handle the Spotify login redirect and authorization.
export async function redirectToSpotifyAuthorize() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  const code_challenge_base64 = btoa(
    String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  window.localStorage.setItem("code_verifier", code_verifier);

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  // Redirect the user to Spotify for login
  window.location.href = authUrl.toString();
}

// Function to get the access token from Spotify after authorization.
export async function getToken(code) {
  const code_verifier = localStorage.getItem("code_verifier");
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
  });

  return await response.json();
}

// Function to refresh the token using the refresh token.
export async function refreshToken() {
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: currentToken.refresh_token,
    }),
  });

  return await response.json();
}

// Function to check if access token is expired.
function isTokenExpired() {
  const expiresAtString = currentToken.expires;
  if (!expiresAtString) {
    return true;
  }
  const expiresAt = new Date(expiresAtString);
  const currentTime = new Date();
  if (currentTime > expiresAt) {
    return true;
  }
  return false;
}

// Optional function to handle refreshing tokens manually.
export async function refreshTokenClick() {
  const token = await refreshToken();
  currentToken.save(token);
}

// Function to get the current user's data.
export async function getUserData() {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: "Bearer " + currentToken.access_token },
  });

  return await response.json();
}

// Optional function to handle login button click.
export async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
}

// Log out via button click.
export async function logoutClick() {
  localStorage.clear();
  window.location.href = redirectUrl;
}

//
//-------------------------------------------------------------------------------------------------
// PlaylistMaker functionality
//-------------------------------------------------------------------------------------------------
//

/**
 * Fetches tracks by using user-given parameters until limit is reached.
 * @param {Object} params Object containing search parameters
 * @param {String} params.genre 
 * @param {String} params.yearFrom 
 * @param {String} params.yearTo 
 * @param {String} params.limit 
 * @returns Fetched tracks
 */
export async function fetchTracksUntilLimit(params) {
  const yearNow = new Date().getFullYear();
  const defaultYearOffset = 30;
  // Default parameters
  const defaults = {
    defaultGenre: '',
    defaultYearFrom: (yearNow - defaultYearOffset).toString(),
    defaultYearTo: yearNow.toString(),
    defaultLimit: "50",
  };

  let offset = 450; // Offset for the query
  const paramsExpanded = {
    ...sanitizeParams(params, defaults),
    offset: offset,
  }

  const tracks = []; // Accumulated tracks
  let currentSearches = 0;
  const maxSearches = 10;

  while (
    0 <= offset && 
    currentSearches < maxSearches
  ) {
    const fetchedTracks = await apiCallSearch(paramsExpanded);
    for (const track of fetchedTracks) {
      if (paramsExpanded.limit <= tracks.length) {
        return tracks;
      }
      if (!tracks.some((found_track) => found_track.id === track.id)) {
        tracks.push(track);
      }
    }
    offset -= 50;
    currentSearches++;
  }

  return tracks;
}

/**
 * Function to sanitize user-given parameters.
 * @param {Object} params Object containing search parameters
 * @param {String} params.genre 
 * @param {String} params.yearFrom 
 * @param {String} params.yearTo 
 * @param {String} params.limit 
 * 
 * @param {Object} defaults Default parameters
 * @param {String} defaults.defaultGenre
 * @param {String} defaults.defaultYearFrom
 * @param {String} defaults.defaultYearTo
 * @param {String} defaults.defaultLimit
 * @returns Sanitized params
 */
function sanitizeParams(params, defaults) {
  const paramsCopy = {
    ...params
  };

  if (!params.yearFrom) {
    paramsCopy.yearFrom = defaults.defaultYearFrom;
  }
  if (!params.yearTo) {
    paramsCopy.yearTo = defaults.defaultYearTo;
  }
  // Swap
  if (paramsCopy.yearTo < paramsCopy.yearFrom) {
    [paramsCopy.yearFrom, paramsCopy.yearTo] = [paramsCopy.yearTo, paramsCopy.yearFrom];
  }
  if (!params.limit) {
    paramsCopy.limit = defaults.defaultLimit;
  }
  return paramsCopy;
}

/**
 * Calls the API with the query.
 * @param {Object} params 
 * @param {String} params.genre 
 * @param {String} params.yearFrom 
 * @param {String} params.yearTo 
 * @param {String} params.limit 
 * @param {Number} params.offset 
 * @returns returned tracks
 */
export async function apiCallSearch(params) {
  if (isTokenExpired()) {
    await refreshTokenClick();
  }
  const baseURL = "https://api.spotify.com/v1/search";
  const query = {
    q: `genre:${params.genre} year:${params.yearFrom}-${params.yearTo}`,
    type: "track",
    limit: params.limit,
    offset: randomOffset(params.offset),
  };
  const queryString = new URLSearchParams(query).toString();
  const url = `${baseURL}?${queryString}`;
  const token = currentToken.access_token;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.tracks.items;
  }
  console.error("Error searching tracks by criteria:", response.status, response.statusText);
  return [];
}

/**
 * Returns a random number between [0, max].
 * @param {Number} max 
 * @returns random number
 */
function randomOffset(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Constructs a formatted date for current time.
 * @returns formatted date
 */
function constructDateNow() {
  const now = new Date(Date.now());
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Creates a playlist for the user with the selected tracks.
 * @param {Array} filteredTracks 
 * @param {String} namePlaylist 
 * @returns url to the playlist
 */
export async function makePlaylist(filteredTracks, namePlaylist) {
  const userData = await getUserData();
  const formattedDate = constructDateNow();

  const name = namePlaylist.trim().length > 0 ? namePlaylist : "PlaylistMaker " + formattedDate;
  const description = "Made using PlaylistMaker " + formattedDate;
  const _public = true;

  const playlist = await createPlaylistSpotify(userData.id, name, description, _public);
  const url = playlist.external_urls.spotify;
  await addTracksToPlaylist(playlist, filteredTracks);
  return url;
}

/**
 * Creates a playlist for the user on Spotify.
 * @param {String} user_id 
 * @param {String} name 
 * @param {String} description 
 * @param {Boolean} _public 
 * @returns JSON data of the playlist
 */
async function createPlaylistSpotify(user_id, name, description, _public) {
  const descriptionMaxLength = 100;
  const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${currentToken.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      description: description.substring(0, descriptionMaxLength),
      public: _public,
    }),
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
 * @returns playlist snapshot_id
 */
async function addTracksToPlaylist(playlist, tracks) {
  const track_uris = tracks.map((track) => `spotify:track:${track.id}`);
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentToken.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: track_uris,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
