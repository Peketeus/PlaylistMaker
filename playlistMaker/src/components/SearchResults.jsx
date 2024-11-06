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
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // Whether the playlist is being created

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
    const url = await makePlaylist(searchResults);
    console.log("%cURL: " + url, "color:green;");
    setIsCreating(false);
  }

  // Removing a song
  const removeSong = (e) => {
    e.preventDefault();
    // e.target = button
    // e.target.parentNode.parentNode.childNodes[0] --- div which contains index
    // e.target.parentNode.parentNode.childNodes[0].textContent --- div's text
    const div = e.target.parentNode.parentNode.childNodes[0];
    const index = parseInt(div.textContent);
    console.log("REMOVE", index);
    searchResults.splice(index - 1, 1);
    // Don't remove HTML elements as it causes React errors
    // there probably exists a better way of doing this
    div.parentNode.style.display = 'none';
  }

  return (
    <div className='pt-8'>

      {searchResults && searchResults.length > 0 ? (
        <div>
          <div className='relative min-w-[700px] max-w-[min(900px,60%)] h-auto mx-auto bg-[#272b36] py-8'>
          <h2 className='text-4xl font-bold'>Search Results:</h2>
          {/* Changing button appearance based on the state */}
          <button 
            className= {`absolute top-0 right-0 mt-4 mr-4 px-4 py-2 font-semibold rounded transition duration-300
              ${isCreating ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            onClick={handleCreatePlaylist}
            disabled={isCreating}
          >
            {/* Changing text */}
            {isCreating ? 'Creating...' : 'Create Playlist'}
          </button>

            {/* Showing results */}
            {searchResults.map((searchResult, index) => (
              <div key={searchResult.id || index} className='flex justify-around items-center mt-8'>
                <div className='ml-8 flex-[0_0]'>{index + 1}</div>
                <a className='flex flex-[1_0_40%] max-w-[40%] gap-4 ml-8 no-underline text-inherit hover:text-inherit' href={searchResult.external_urls.spotify} target="_blank">
                  <img className='w-[64px] h-[64px]' src={searchResult.album.images[2].url} />
                  <div>
                    <p className='resultSong'>{searchResult.name}</p>
                    <p className='resultArtist'>{searchResult.artists[0].name}</p>
                  </div>
                </a>
                <AudioPlayer previewUrl={searchResult.preview_url} onPlay={handlePlay} />
                <button className='flex-[0_0_16px] p-0 ml-4 mr-4 border-0 bg-transparent'
                  onClick={removeSong}
                >
                <img src={removeicon}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (null)}

    </div>
  );
}

export default SearchResults;