const clientId = import.meta.env.VITE_API_CLIENT_ID;  // Tulee .env tiedostosta, mikä pitää olla juuressa.
const redirectUrl = 'http://localhost:5173/';  // Make sure this matches your Spotify redirect URL

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-private user-read-email';

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

// Function to refresh the token using the refresh token
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
