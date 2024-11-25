import React, { useState, useRef, useEffect } from 'react';
import { makePlaylist } from '../service';
import './../index.css';
import removeicon from '../assets/removeicon.png';

function AudioPlayer({ previewUrl, onPlay }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Set default volume manually as browser sets it very high by default
    }
  }, []);

  const handlePlay = () => {
    if (onPlay) onPlay(audioRef.current);
  };

  if (!previewUrl) {
    return <p className='flex-[0_1_350px] min-w-[250px]'>Preview not available.</p>;
  }

  return (
    <audio className='flex-[0_1_350px] min-w-[250px]' ref={audioRef} controls onPlay={handlePlay}>
      <source src={previewUrl} type="audio/mpeg" />
      Your browser does not support this filetype.
    </audio>
  );
}

function SearchResults({ searchResults }) {
  const [results, setResults] = useState(searchResults); // Local copy of searchResults, this is modified
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null); // When playing a preview
  const [isSaving, setIsSaving] = useState(false); // Whether the playlist is being saved
  const [namePlaylist, setNamePlaylist] = useState('') // Name for the playlist
  const [playlistUrl, setPlaylistUrl] = useState(null); // Url for the saved playlist

  // When new results are generated or removing a song
  useEffect(() => {
    setResults(searchResults);
    setNamePlaylist('');
    setPlaylistUrl(null);
  }, [searchResults]);

  const handlePlay = (audioElement) => {
    // If audio is already playing, pause the previous audio before playing the selected one
    if (currentlyPlaying && currentlyPlaying !== audioElement) {
      currentlyPlaying.pause();
    }
    setCurrentlyPlaying(audioElement);
  }

  // Save the playlist with the tracks
  const handleSavePlaylist = async (e) => {
    e.preventDefault();
    // An example of doing something when the playlist is being saved and when it finishes
    setIsSaving(true);
    // Get the link and show it somewhere on the page?
    const url = await makePlaylist(results, namePlaylist);
    setPlaylistUrl(url);
    console.log("%cURL: " + url, "color:green;");
    setIsSaving(false);
  }

  // Removing a song
  const removeSong = (index) => {
    //console.log("REMOVE", index);
    // Only needs the index i, hence the _ (ignoring the actual element)
    const updated = results.filter((_, i) => i !== index);
    setResults(updated);
  }

  return (
    <div className='pt-8'>
      {!results && (null)}
      {results && results.length === 0 &&
        <p>Found no elements that match the filters!</p>}
      {results && results.length > 0 && (
        <div>
          <div className='relative min-w-[700px] max-w-[min(900px,60%)] h-auto mx-auto bg-[#272b36] py-8'>
            <h2 className='text-4xl font-bold mt-2'>Search results:</h2>
            <p>{results.length} elements</p>

            {/* Playlist saving */}
            <label className='absolute top-0 right-0 mt-2 px-4 py-2 flex font-bold'>
              Playlist name (optional)
              <input type="text" className='ml-2 bg-blue-300' maxLength='30'
              value={namePlaylist}
              onChange={(e) => setNamePlaylist(e.target.value)}>
              </input>
            </label>
            {/* Changing button appearance based on the state */}
            <button
              className={`absolute top-0 right-4 mt-12 px-4 py-2 font-semibold rounded transition duration-300
                  ${isSaving ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              onClick={handleSavePlaylist}
              disabled={isSaving}
            >
              {/* Changing text */}
              {isSaving ? 'Saving...' : 'Save to Spotify'}
            </button>
            {/* Link to the playlist */}
            {playlistUrl && 
            <label className='absolute top-20 right-8 mt-3 py-2 flex font-bold'>
              <a href={playlistUrl}>
                Saved playlist
              </a>
            </label>
            }
            
            {/* Results */}
            {results.map((result, index) => (
              <div key={result.id || index} className='flex justify-around items-center mt-8'>
                <div className='ml-8 flex-[0_0]'>{index + 1}</div>
                <a className='flex flex-[1_0_40%] max-w-[40%] gap-4 ml-8 no-underline text-inherit hover:text-inherit'
                  href={result.external_urls.spotify} target="_blank">
                  <img className='w-[64px] h-[64px]' src={result.album.images[2].url} />
                  <div>
                    <p className='resultSong'>{result.name}</p>
                    <p className='resultArtist'>{result.artists[0].name}</p>
                  </div>
                </a>
                <AudioPlayer previewUrl={result.preview_url} onPlay={handlePlay} />
                <button className='flex-[0_0_16px] p-0 ml-4 mr-4 border-0 bg-transparent'
                  onClick={() => removeSong(index)}
                >
                  <img src={removeicon} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;