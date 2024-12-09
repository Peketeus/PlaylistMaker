const clientId = import.meta.env.VITE_API_CLIENT_ID; // Comes from .env file that has to be in root folder
const redirectUrl = "http://localhost:5173/"; // Make sure this matches your Spotify redirect URL

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope =
  "user-read-private user-read-email playlist-modify-public playlist-modify-private";

// Data structure to manage the active token
export const currentToken = {
  get access_token() {
    return localStorage.getItem("access_token") || null;
  },
  get refresh_token() {
    return localStorage.getItem("refresh_token") || null;
  },
  get expires_in() {
    return localStorage.getItem("expires_in") || null;
  },
  get expires() {
    return localStorage.getItem("expires") || null;
  },

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

// Function to handle the Spotify login redirect
export async function redirectToSpotifyAuthorize() {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce(
    (acc, x) => acc + possible[x % possible.length],
    ""
  );

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  const code_challenge_base64 = btoa(
    String.fromCharCode(...new Uint8Array(hashed))
  )
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
  window.location.href = authUrl.toString(); // Redirect the user to Spotify for login
}

// Function to get the access token from Spotify after authorization
export async function getToken(code) {
  const code_verifier = localStorage.getItem("code_verifier");

  console.log("Code verifier: ", code_verifier);

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

  console.log(response);

  return await response.json();
}

// Function to refresh the token using the refresh token // TODO: katotaan jos yhdistetään tuohon isTokenExpired functioon ja jätettäis kaikki yhden alle.
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
  if (currentTime > expiresAt) {
    // const token = await refreshToken();
    // currentToken.save(token);
    return true;
  }
  return false;
}

// Function to get the current user's data
export async function getUserData() {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: "Bearer " + currentToken.access_token },
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
  console.log("API call with parameters: ", params);

  // Search for a single song with song ID (params)
  const endpoint = "https://api.spotify.com/v1/tracks/".concat(params);

  const track = await apiCall(endpoint);

  console.log(track);

  return track;
}

// API call with URL constructed by helper functions
export async function apiCall(params) {
  if (isTokenExpired()) refreshTokenClick();
  const response = await fetch(params, {
    method: "GET",
    headers: { Authorization: "Bearer " + currentToken.access_token },
  });

  return await response.json();
}

// Function to search for tracks based on genre and year range
async function searchTracksByCriteria(url, accessToken) {
  console.log("FETCHING URL:", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    // Extract tracks
    const tracks = data.tracks.items;
    return tracks;
  } else {
    console.error(
      "Error searching tracks by criteria:",
      response.status,
      response.statusText
    );
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
  return tracks.filter((track) => {
    const feature = audio_features[track.id];
    if (feature) {
      return (
        audio_features[track.id].danceability >= filters.minDanceability &&
        audio_features[track.id].energy >= filters.minEnergy &&
        audio_features[track.id].acousticness >= filters.minAcousticness &&
        audio_features[track.id].instrumentalness >=
          filters.minInstrumentalness &&
        //audio_features[track.id].liveness >= filters.minLiveness &&
        //audio_features[track.id].loudness >= filters.minLoudness &&
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
  if (trackIds.length === 0) {
    return [];
  }

  const url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(
    ","
  )}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.audio_features;
  } else {
    console.error(
      "Error fetching audio features:",
      response.status,
      response.statusText
    );
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
  const defaults = {
    //genre: '',
    yearFrom: 1900,
    yearTo: new Date().getFullYear(),
    filters: {
      minDanceability: 0,
      minEnergy: 0,
      minAcousticness: 0,
      minInstrumentalness: 0,
      //minLiveness: 0,
      //minLoundess: -60,
      minSpeechiness: 0,
      minTempo: 0,
      minValence: 0,
    },
    limit: 50,
  };

  // Sanitized inputs
  const sanitizedInputs = {
    genre: params.genre?.trim().toLowerCase() || null,
    yearFrom: sanitizeFilter(params.yearFrom, parseInt, defaults.yearFrom),
    yearTo: sanitizeFilter(params.yearTo, parseInt, defaults.yearTo),
    limit: sanitizeFilter(params.limit, parseInt, defaults.limit),
    filters: {
      minDanceability: sanitizeFilter(
        "minDanceability",
        parseFloat,
        defaults.filters.minDanceability
      ),
      minEnergy: sanitizeFilter(
        "minEnergy",
        parseFloat,
        defaults.filters.minEnergy
      ),
      minAcousticness: sanitizeFilter(
        "minAcousticness",
        parseFloat,
        defaults.filters.minAcousticness
      ),
      minInstrumentalness: sanitizeFilter(
        "minInstrumentalness",
        parseFloat,
        defaults.filters.minInstrumentalness
      ),
      //minLiveness: sanitizeFilter('minLiveness', parseFloat, defaults.filters.minLiveness),
      //minLoudness: sanitizeFilter('minLoudness', parseFloat, defaults.filters.minLoudness),
      minSpeechiness: sanitizeFilter(
        "minSpeechiness",
        parseFloat,
        defaults.filters.minSpeechiness
      ),
      minTempo: sanitizeFilter(
        "minTempo",
        parseFloat,
        defaults.filters.minTempo
      ),
      minValence: sanitizeFilter(
        "minValence",
        parseFloat,
        defaults.filters.minValence
      ),
    },
  };

  // Currently per api call
  const sanitizedLimit = sanitizeFilter(params.limit, parseInt, defaults.limit);
  let queryParams = "";
  // Conditionally add parameters to query
  if (sanitizedInputs.genre) {
    queryParams += `genre=${sanitizedInputs.genre}&`;
  }
  // Always atm
  if (sanitizedInputs.yearTo) {
    queryParams += `year:${sanitizedInputs.yearFrom}-${sanitizedInputs.yearTo}&`;
  }
  // Remove trailing & if exists
  queryParams = queryParams.substring(0, queryParams.length - 1);
  if (queryParams.length !== 0) {
    queryParams += "&";
  }
  queryParams += "type=track";
  const url = `https://api.spotify.com/v1/search?q=${queryParams}&limit=${sanitizedLimit}&offset=${offset}`;
  return {
    url: url,
    filters: sanitizedInputs.filters,
  };
}

/**
 * Sanitizer the given filter with the given parser
 * @param {String} filter
 * @param {Function} parser
 * @param {Number} _default
 * @returns
 */
function sanitizeFilter(filter, parser, _default) {
  return filter ? parser(filter.trim()) : _default;
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
    randomOffset = Math.floor(Math.random() * (max - min) + min);
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
    const tracks = await searchAndFilter(sanitized, accessToken);
    console.log("SEARCHES:", currentSearches, "TRACKS:", found_tracks.length);

    // Add the tracks
    for (const track of tracks) {
      if (limit <= found_tracks.length) {
        console.log("FINAL: ", found_tracks);
        return found_tracks;
      }
      // Check for duplicate
      if (!found_tracks.some((found_track) => found_track.id === track.id)) {
        found_tracks.push(track);
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
        randomOffset -= limit + 5;
      }
    } else {
      searchesNoTracks = 0;
      // This will stay like this
      if (randomOffset > limit + 5) {
        //randomOffset -= limit;
        randomOffset -= limit + 5;
      }
    }
    currentSearches++;
  }

  console.log("FINAL: ", found_tracks);
  return found_tracks;
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
  const trackIds = tracks.map((track) => track.id);
  const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);
  //console.log("AUDIO FEATURES:", audioFeatures);
  const featuresObj = featuresAsObj(audioFeatures);
  //console.log("FEATURES AS OBJ:", featuresObj);

  // Step 5: Filter tracks by all filters
  const filteredTracks = filterTracksByFilters(
    tracks,
    featuresObj,
    sanitized.filters
  );
  console.log("FILTERED TRACKS", filteredTracks);

  if (filteredTracks.length === 0) {
    console.log(
      "%cFILTERING PRODUCED 0 VALID TRACKS --- RETURNING []",
      "color:yellow;"
    );
    return [];
  }

  return filteredTracks;
}

/**
 * Creates a playlist for the user with the selected tracks
 * @param {Array} filteredTracks
 * @param {String} namePlaylist
 * @returns url to the playlist
 */
export async function makePlaylist(filteredTracks, namePlaylist) {
  // Step 6: Creating a playlist if the user checked the box and more than 0 tracks
  const userData = await getUserData();
  // Constructing a date identifier for now
  const formattedDate = constructDateNow();

  const name =
    namePlaylist.trim().length > 0
      ? namePlaylist
      : "PlaylistMaker " + formattedDate;
  // Other 2 parameters
  // Do we even want to let the user specify the description?
  const description = "Made using PlaylistMaker " + formattedDate;
  // The user being able to set this will probably be handy
  const _public = true;

  const playlist = await createPlaylistSpotify(
    userData.id,
    name,
    description,
    _public
  );
  console.log("CREATED PLAYLIST:", playlist);
  const url = playlist.external_urls.spotify;
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
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
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
    method: "POST",
    headers: {
      Authorization: `Bearer ${currentToken.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      description: description.substring(0, description_maxLength),
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
 * @returns data
 */
async function addTracksToPlaylist(playlist, tracks) {
  // Correct format
  const track_uris = tracks.map((track) => `spotify:track:${track.id}`);
  //console.log("TRACK URIS:", track_uris);
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

const random = true; // Random songs or the same ones as before TODO: move to a more sensible place

export async function search(params) {
  return getTracksByCriteria(params);
}

// export async function getTracks(yearFrom, yearTo, genre, limit){
//   const maxSearches = 10;
//   let currentSearches = 0;
  
//   // If no tracks are found for 4 CONSECUTIVE searches -> break
//   const maxSearchesNoTracks = 4;
//   let searchesNoTracks = 0;
  
//   // Found tracks and the limit
//   const found_tracks = [];
//   const limit = params.limit ? parseInt(params.limit) : 50;
//   while (
//       currentSearches < maxSearches &&
//       searchesNoTracks < maxSearchesNoTracks &&
//       found_tracks.length < limit
//     ) {
//         // Step 2: Sanitize inputs and construct url as well as filters
//         // TODO: refactoring so that sanitizing only happens once
//         // works fine as of now
//         const sanitized = constructURL(params, randomOffset);
//         const tracks = await searchAndFilter(sanitized, accessToken);
//         console.log("SEARCHES:", currentSearches, "TRACKS:", found_tracks.length);
      
//         // Add the tracks
//         for (const track of tracks) {
//             if (limit <= found_tracks.length) {
//                 console.log("FINAL: ", found_tracks);
//                 return found_tracks;
//               }
//               // Check for duplicate
//               if (!found_tracks.some((found_track) => found_track.id === track.id)) {
//                   found_tracks.push(track);
//                 }
//               }
            
//               // Adjust offset
//               // This needs optimizing! probably based on randomOffset min and max
//               if (tracks.length === 0) {
//                   searchesNoTracks++;
//                   // if (randomOffset > limit + 30)
//                   // This will be modified most likely
//                   //if (randomOffset > limit) {
//                     if (randomOffset > limit + 5) {
//                         //randomOffset = Math.round(randomOffset / 2);
//                         //randomOffset -= limit;
//                         // TODO: VERY RARE ERROR WHERE A SONG CAN BE FOUND TWICE
//                         // PROBABLY DUE TO CHANGES IN THE SPOTIFY DATABASE DURING THE SEARCH?
//                         // SOLUTION? -> SUBTRACT SLIGTHLY MORE THAN LIMIT TO ACCOUNT FOR MINOR CHANGES
//                         // OR CHECKING FOR DUPLICATES AT THE END?
//                         randomOffset -= limit + 5;
//                       }
//                     } else {
//                         searchesNoTracks = 0;
//       // This will stay like this
//       if (randomOffset > limit + 5) {
//           //randomOffset -= limit;
//           randomOffset -= limit + 5;
//         }
//       }
//       currentSearches++;
//     }
    
//     console.log("FINAL: ", found_tracks);
//     return found_tracks;
// }


/**
 * Fetches tracks by using parameters below until it can return limit amount of tracks.
 * @param {Number} yearFrom 
 * @param {Number} yearTo 
 * @param {String} genre 
 * @param {Number} limit 
 * @returns Array of found tracks
 */
export async function fetchTracksUntilLimit(yearFrom, yearTo , genre , limit) {
  let offset = 500; // Starting offset
  let tracks = []; // Array to accumulate tracks
  let maxFetch = 0;
  if(!limit) limit = 50;
  console.log(typeof(yearTo));
  if(!yearFrom || isNaN(yearFrom)) yearFrom = 1990;
  if(!yearTo || isNaN(yearTo)) yearTo = 2020;
  if(yearTo < yearFrom) yearTo = yearFrom;
  console.log("Year from " +yearFrom);  //TODO: OTETAAN POIS CONSOLET
  console.log("Year To " + yearTo);
  console.log("genre "+genre);
  console.log("Limit "+limit);

  while (offset >= 0 && tracks.length < limit) {
    console.log(`Fetching with offset: ${offset}`);
    if(offset < 0) break;
    maxFetch++;
    if (maxFetch > 10){ // The offset will go down to 0, the last fetch will happen and this will break the loop because there are no other tracks to look for.
      console.log("No more tracks were found.");
      break;
    } 

    // Call the apiCallSearch function
    const fetchedTracks = await apiCallSearch(yearFrom, yearTo, genre, limit - tracks.length, offset);

    for (const track of fetchedTracks) {
      // Check if the track ID (or URI) is already in the Set
      if (!tracks.some((found_track) => found_track.id === track.id)) {
        tracks.push(track);
      }
    }
    
    
    // If fewer tracks than requested are returned, reduce the offset
    if (fetchedTracks.length < (limit - tracks.length)) {
      if(0 < offset < 100){
        offset = 0;
        continue;
      }else{
        offset -= 100;
      }
    }  
  }

  console.log(`Total tracks fetched: ${tracks.length}`);
  return tracks;
}

/**
 * 
 * @param {Number} yearFrom 
 * @param {Number} yearTo 
 * @param {String} genre 
 * @param {Number} limit 
 * @param {Number} offset 
 * @returns Array of tracks
 */
export async function apiCallSearch(yearFrom, yearTo, genre, limit, offset) {
  if (isTokenExpired()) await refreshTokenClick();
  const baseURL = "https://api.spotify.com/v1/search";

  const query = {
    q: `genre:${genre} year:${yearFrom}-${yearTo}`,
    type: "track",  
    limit: limit,
    offset: randomOffset(offset), 
  };

  const queryString = new URLSearchParams(query).toString();
  console.log(queryString);

  const url = `${baseURL}?${queryString}`;
  const token = currentToken.access_token;

  // The API request
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data.tracks.items);
    return data.tracks.items;
  } else {
    console.error(
      "Error searching tracks by criteria:",
      response.status,
      response.statusText
    );
    return [];
  }   
}
    

/**
 *  TODO: PALAUTETAAN VAAN TUO MATHFLOOR HOMMA TAKASI, VÄHÄ TESTAILUA
 * @returns random number between 0 and max
 */
function randomOffset(max){  
  return Math.floor(Math.random() * max);
}
