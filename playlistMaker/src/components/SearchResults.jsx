import React, { useState, useRef, useEffect } from 'react';
import { apiCallClick } from '../service';
import './../index.css';
import removeicon from '../assets/removeicon.png';

function AudioPlayer({ previewUrl, onPlay }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Asetetaan äänenvoimakkuus itse koska se on vakiona niin kovalla että naapuritkin heräävät
    }
  }, []);

  const handlePlay = () => {
    if (onPlay) onPlay(audioRef.current); // Seurataan mikä elementti soittaa tällä hetkellä musiikkia
  };

  if (!previewUrl) {
    return <p className='flex-[0_1_350px] min-w-[250px]'>Esikuuntelua ei saatavilla.</p>;
  }

  return (
    <audio className='flex-[0_1_350px] min-w-[250px]' ref={audioRef} controls onPlay={handlePlay}>
      <source src={previewUrl} type="audio/mpeg" />
      Selaimesi ei tue tätä äänitiedostoa.
    </audio>
  );
}

function SearchResults({ searchResults }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const handlePlay = (audioElement) => {
    // Jos soi jo audio, niin edellinen pauselle
    if (currentlyPlaying && currentlyPlaying !== audioElement) {
      currentlyPlaying.pause();
    }
    setCurrentlyPlaying(audioElement);
  }

  return (
    <div className='pt-8'>
      {/* Näytetään hakutulokset, jos tuloksia on */}

      {searchResults && searchResults.length > 0 ? ( 
      <div>
        <div className='min-w-[700px] max-w-[min(900px,60%)] h-auto mx-auto bg-[#272b36] py-8'>
          <h2 className='text-4xl font-bold'>Hakutulos:</h2>

          {searchResults.map((searchResult, index) => (
          <div key={searchResult.id || index} className='flex justify-around items-center mt-8'>
            <div className='ml-8 flex-[0_0]'>{index + 1}</div>
            <a className='flex flex-[1_0_40%] max-w-[40%] gap-4 ml-8 no-underline text-inherit hover:text-inherit' href={searchResult.external_urls.spotify} target="_blank">
              <img className='w-[64px] h-[64px]' src={searchResult.album.images[2].url} />
              <div>
                <p className='resultSong'>{searchResult.name} </p>
                <p className='resultArtist'>{searchResult.artists[0].name}</p>
              </div>
            </a>
            <AudioPlayer previewUrl={searchResult.preview_url} onPlay={handlePlay} />
            <button className='flex-[0_0_16px] p-0 ml-4 mr-4 border-0 bg-transparent'><img src={removeicon} /></button>
          </div>
          ))}
        </div>
      </div>
    ) : (null)}

    </div>
  );
}

export default SearchResults;