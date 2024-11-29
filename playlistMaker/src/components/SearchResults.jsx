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
  const [isCreating, setIsCreating] = useState(false); // Whether the playlist is being created
  const [namePlaylist, setNamePlaylist] = useState('') // Name for the playlist

  // When removing a song
  useEffect(() => {
    setResults(searchResults);
  }, [searchResults]);

  const handlePlay = (audioElement) => {
    // If audio is already playing, pause the previous audio before playing the selected one
    if (currentlyPlaying && currentlyPlaying !== audioElement) {
      currentlyPlaying.pause();
    }
    setCurrentlyPlaying(audioElement);
  }

  // Creating a playlist with the tracks
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    // An example of doing something when the playlist is being created and when it finishes
    setIsCreating(true);
    // Get the link and show it somewhere on the page?
    const url = await makePlaylist(results, namePlaylist);
    console.log("%cURL: " + url, "color:green;");
    setIsCreating(false);
  }

  // Removing a song
  const removeSong = (index) => {
    console.log("REMOVE", index);
    // Only needs the index i, hence the _ (ignoring the actual element)
    const updated = results.filter((_, i) => i !== index);
    setResults(updated);
  }

  return (
    <div className="pt-8">
      {results && results.length > 0 ? (
        <div>
          {/* Search Results Container */}
          <div className="relative min-w-[700px] max-w-[min(900px,60%)] h-auto mx-auto bg-[#272b36] py-8">
            <div className="flex flex-col gap-4 items-end mr-4">
            <label>
              Playlist name:
              <input
                type="text"
                className="ml-2 bg-blue-300"
                maxLength="30"
                value={namePlaylist}
                onChange={(e) => setNamePlaylist(e.target.value)}
              />
            </label>
            <button
              className={`font-semibold rounded transition duration-300
                ${isCreating ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              onClick={handleCreatePlaylist}
              disabled={isCreating}
            >
              {isCreating ? 'Saving...' : 'Save to Spotify'}
            </button>
            </div>
            <h2 className="text-4xl font-bold mt-2">Search Results:</h2>
            {/* Scrollable Results */}
            <div
              className="overflow-y-auto overflow-x-hidden mt-8 mx-4 p-4 border-[2px] border-solid border-black rounded-xl shadow-[0_0_5px_5px_rgba(15,15,15,0.7)]"
              style={{
                maxHeight: '60vh'
              }}
            >
              {results.map((result, index) => (
                <div key={result.id || index} className="flex justify-around items-center mb-4 mr-4">
                  <div className="ml-4 flex-[0_0_2rem] text-center">{index + 1}</div>
                  <a
                    className="flex flex-[1_0_40%] max-w-[40%] gap-4 ml-8 mr-8 no-underline text-inherit hover:text-inherit"
                    href={result.external_urls.spotify}
                    target="_blank"
                  >
                    <img className="w-[64px] h-[64px]" src={result.album.images[2].url} alt="Album Art" />
                    <div>
                      <p className="resultSong">{result.name}</p>
                      <p className="resultArtist">{result.artists[0].name}</p>
                    </div>
                  </a>
                  <AudioPlayer previewUrl={result.preview_url} onPlay={handlePlay} />
                  <button
                    className="flex-[0_0_16px] p-0 border-0 bg-transparent"
                    onClick={() => removeSong(index)}
                  >
                    <img src={removeicon} alt="Remove" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SearchResults;