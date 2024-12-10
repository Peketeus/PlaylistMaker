import { useState, useRef, useEffect } from 'react';
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
  const [results, setResults] = useState(searchResults); // Local copy of searchResults
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
    setIsSaving(false);
  }

  // Removing a song
  const removeSong = (index) => {
    // Only needs the index i, hence the _ (ignoring the actual element)
    const updated = results.filter((_, i) => i !== index);
    setResults(updated);
  }

  return (
    <div className='flex justify-center align-center pt-8'>
      {!results && (null)}
      {results && results.length === 0 &&
        <p>Found no elements that match the filters!</p>}
      {results && results.length > 0 && (

        // Search results container
        <div className="relative w-[700px] h-auto m-[0_auto] bg-[#272b36] py-8">
          <div className="flex flex-col gap-4 items-start ml-4">
            <label>
              Playlist name:
              <input
                type="text"
                className="ml-2 bg-[rgb(70,69,75)] text-white"
                maxLength="30"
                value={namePlaylist}
                onChange={(e) => setNamePlaylist(e.target.value)}
              />
            </label>
            <button
              className={`font-semibold rounded transition duration-300
                ${isSaving ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              onClick={handleSavePlaylist}
              disabled={isSaving}
            >
              {/* Changing text */}
              {isSaving ? 'Saving...' : 'Save to Spotify'}
            </button>

            {/* Link to the playlist */}
            {playlistUrl &&
              <label className='absolute top-3 right-8 mt-3 py-8 flex font-bold'>
                <a
                href={playlistUrl}
                target="_blank" 
                className='underline cursor-pointer text-[rgba(255,255,255,0.87)] transition-[color_0.3s_ease] hover:text-[rgba(255,255,255,0.5)]'>
                  Playlist saved, click to open in Spotify!
                </a>
              </label>
            }

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
      )}
    </div>
  );
}

export default SearchResults;