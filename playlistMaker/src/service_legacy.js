////// LEGACY CODE BEFORE SPOTIFY CLOSED API ENDPOINTS

// const random = true; // Random songs or the same ones as before TODO: move to a more sensible place

// export async function search(params) {
//   return getTracksByCriteria(params);
// }
//
//
// /**
//  * Constructs audiofeatures in an object format
//  * @param {Array} audioFeatures
//  * @returns object -> track_id: feature
//  */
// function featuresAsObj(audioFeatures) {
//   return audioFeatures.reduce((obj, feature) => {
//     if (feature) {
//       obj[feature.id] = feature;
//     }
//     return obj;
//   }, {});
// }

// // Function to search for tracks based on genre and year range
// async function searchTracksByCriteria(url, accessToken) {
//   console.log("FETCHING URL:", url);
//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (response.ok) {
//     const data = await response.json();
//     // Extract tracks
//     const tracks = data.tracks.items;
//     return tracks;
//   } else {
//     console.error(
//       "Error searching tracks by criteria:",
//       response.status,
//       response.statusText
//     );
//     return [];
//   }
// }

// /**
//  * Filters tracks by given filters
//  * @param {Array} tracks
//  * @param {Object} audio_features
//  * @param {Object} filters
//  * @returns
//  */
// function filterTracksByFilters(tracks, audio_features, filters) {
//   return tracks.filter((track) => {
//     const feature = audio_features[track.id];
//     if (feature) {
//       return (
//         audio_features[track.id].danceability >= filters.minDanceability &&
//         audio_features[track.id].energy >= filters.minEnergy &&
//         audio_features[track.id].acousticness >= filters.minAcousticness &&
//         audio_features[track.id].instrumentalness >= filters.minInstrumentalness &&
//         audio_features[track.id].speechiness >= filters.minSpeechiness &&
//         audio_features[track.id].tempo >= filters.minTempo &&
//         audio_features[track.id].valence >= filters.minValence
//       );
//     }
//     // Here is whether to include a track that has no matching audio feature
//     // i.e. the API couldn't find the features for this track or nonexistent
//     return false;
//   });
// }

// // Fetch audio features for given track IDs
// async function fetchAudioFeatures(trackIds, accessToken) {
//   if (trackIds.length === 0) {
//     return [];
//   }
//   const url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(
//     ","
//   )}`;
//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (response.ok) {
//     const data = await response.json();
//     return data.audio_features;
//   } else {
//     console.error(
//       "Error fetching audio features:",
//       response.status,
//       response.statusText
//     );
//     return [];
//   }
// }

// /**
//  * Sanitizes all inputs from the user and constructs the url
//  * @param {Object} params
//  * @param {Number} offset
//  * @returns object containing the url and filters
//  */
// function constructURL(params, offset) {
//   // Defaults
//   const defaults = {
//     yearFrom: 1900,
//     yearTo: new Date().getFullYear(),
//     filters: {
//       minDanceability: 0,
//       minEnergy: 0,
//       minAcousticness: 0,
//       minInstrumentalness: 0,
//       minSpeechiness: 0,
//       minTempo: 0,
//       minValence: 0,
//     },
//     limit: 50,
//   };

//   // Sanitized inputs
//   const sanitizedInputs = {
//     genre: params.genre?.trim().toLowerCase() || null,
//     yearFrom: sanitizeFilter(params.yearFrom, parseInt, defaults.yearFrom),
//     yearTo: sanitizeFilter(params.yearTo, parseInt, defaults.yearTo),
//     limit: sanitizeFilter(params.limit, parseInt, defaults.limit),
//     filters: {
//       minDanceability: sanitizeFilter(
//         "minDanceability",
//         parseFloat,
//         defaults.filters.minDanceability
//       ),
//       minEnergy: sanitizeFilter(
//         "minEnergy",
//         parseFloat,
//         defaults.filters.minEnergy
//       ),
//       minAcousticness: sanitizeFilter(
//         "minAcousticness",
//         parseFloat,
//         defaults.filters.minAcousticness
//       ),
//       minInstrumentalness: sanitizeFilter(
//         "minInstrumentalness",
//         parseFloat,
//         defaults.filters.minInstrumentalness
//       ),
//       minSpeechiness: sanitizeFilter(
//         "minSpeechiness",
//         parseFloat,
//         defaults.filters.minSpeechiness
//       ),
//       minTempo: sanitizeFilter(
//         "minTempo",
//         parseFloat,
//         defaults.filters.minTempo
//       ),
//       minValence: sanitizeFilter(
//         "minValence",
//         parseFloat,
//         defaults.filters.minValence
//       ),
//     },
//   };

//   const sanitizedLimit = sanitizeFilter(params.limit, parseInt, defaults.limit);
//   let queryParams = "";
//   // Conditionally add parameters to query
//   if (sanitizedInputs.genre) {
//     queryParams += `genre=${sanitizedInputs.genre}&`;
//   }
//   if (sanitizedInputs.yearTo) {
//     queryParams += `year:${sanitizedInputs.yearFrom}-${sanitizedInputs.yearTo}&`;
//   }
//   // Remove trailing & if exists
//   queryParams = queryParams.substring(0, queryParams.length - 1);
//   if (queryParams.length !== 0) {
//     queryParams += "&";
//   }
//   queryParams += "type=track";
//   const url = `https://api.spotify.com/v1/search?q=${queryParams}&limit=${sanitizedLimit}&offset=${offset}`;
//   return {
//     url: url,
//     filters: sanitizedInputs.filters,
//   };
// }

// /**
//  * Sanitizer the given filter with the given parser
//  * @param {String} filter
//  * @param {Function} parser
//  * @param {Number} _default
//  * @returns
//  */
// function sanitizeFilter(filter, parser, _default) {
//   return filter ? parser(filter.trim()) : _default;
// }

// /**
//  * Performs searches in a loop to find tracks that match the given parameters
//  * @param {Object} params Object containg all search criteria
//  * @returns filtered tracks
//  */
// async function getTracksByCriteria(params) {
//   console.log(params);
//   // Refresh token if needed
//   if (isTokenExpired()) await refreshTokenClick();
//   const accessToken = currentToken.access_token;
//   //console.log(accessToken);

//   // Step 1: Random offset for random results
//   let randomOffset = 0;
//   // Sometimes offset + limit > 1000 so throws error???
//   if (random) {
//     const min = 550;
//     const max = 950;
//     // Limits to [min, max]
//     randomOffset = Math.floor(Math.random() * (max - min) + min);
//     //console.log(randomOffset);
//   }

//   // Searching tracks in a loop and lowering randomOffset on each search
//   // Max number of searches at total
//   const maxSearches = 10;
//   let currentSearches = 0;

//   // If no tracks are found for 4 CONSECUTIVE searches -> break
//   const maxSearchesNoTracks = 4;
//   let searchesNoTracks = 0;

//   // Found tracks and the limit
//   const found_tracks = [];
//   const limit = params.limit ? parseInt(params.limit) : 50;
//   while (
//     currentSearches < maxSearches &&
//     searchesNoTracks < maxSearchesNoTracks &&
//     found_tracks.length < limit
//   ) {
//     // Step 2: Sanitize inputs and construct url as well as filters
//     // TODO: refactoring so that sanitizing only happens once
//     // works fine as of now
//     const sanitized = constructURL(params, randomOffset);
//     const tracks = await searchAndFilter(sanitized, accessToken);
//     console.log("SEARCHES:", currentSearches, "TRACKS:", found_tracks.length);

//     // Add the tracks
//     for (const track of tracks) {
//       if (limit <= found_tracks.length) {
//         console.log("FINAL: ", found_tracks);
//         return found_tracks;
//       }
//       // Check for duplicate
//       if (!found_tracks.some((found_track) => found_track.id === track.id)) {
//         found_tracks.push(track);
//       }
//     }

//     // Adjust offset
//     // This needs optimizing! probably based on randomOffset min and max
//     if (tracks.length === 0) {
//       searchesNoTracks++;
//       // if (randomOffset > limit + 30)
//       // This will be modified most likely
//       //if (randomOffset > limit) {
//       if (randomOffset > limit + 5) {
//         //randomOffset = Math.round(randomOffset / 2);
//         //randomOffset -= limit;
//         // TODO: VERY RARE ERROR WHERE A SONG CAN BE FOUND TWICE
//         // PROBABLY DUE TO CHANGES IN THE SPOTIFY DATABASE DURING THE SEARCH?
//         // SOLUTION? -> SUBTRACT SLIGTHLY MORE THAN LIMIT TO ACCOUNT FOR MINOR CHANGES
//         // OR CHECKING FOR DUPLICATES AT THE END?
//         randomOffset -= limit + 5;
//       }
//     } else {
//       searchesNoTracks = 0;
//       // This will stay like this
//       if (randomOffset > limit + 5) {
//         //randomOffset -= limit;
//         randomOffset -= limit + 5;
//       }
//     }
//     currentSearches++;
//   }

//   console.log("FINAL: ", found_tracks);
//   return found_tracks;
// }

// /**
//  * Searches for tracks and filters through them
//  * @param {Object} sanitized Object holding the sanitized url and filters
//  * @param {string} accessToken The users's access token
//  * @returns filtered tracks
//  */
// async function searchAndFilter(sanitized, accessToken) {
//   //console.log(sanitized, accessToken);
//   // Step 3: Search for tracks by genre and year range, filtering later
//   const tracks = await searchTracksByCriteria(sanitized.url, accessToken);
//   console.log("TRACKS: ", tracks);
//   if (tracks.length === 0) {
//     console.log("%cFOUND NO TRACKS --- RETURNING []", "color:red;");
//     return [];
//   }

//   // Step 4: Fetch audio features and convert them to a more appropriate format
//   const trackIds = tracks.map((track) => track.id);
//   const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);
//   //console.log("AUDIO FEATURES:", audioFeatures);
//   const featuresObj = featuresAsObj(audioFeatures);
//   //console.log("FEATURES AS OBJ:", featuresObj);

//   // Step 5: Filter tracks by all filters
//   const filteredTracks = filterTracksByFilters(
//     tracks,
//     featuresObj,
//     sanitized.filters
//   );
//   console.log("FILTERED TRACKS", filteredTracks);

//   if (filteredTracks.length === 0) {
//     console.log(
//       "%cFILTERING PRODUCED 0 VALID TRACKS --- RETURNING []",
//       "color:yellow;"
//     );
//     return [];
//   }

//   return filteredTracks;
// }
