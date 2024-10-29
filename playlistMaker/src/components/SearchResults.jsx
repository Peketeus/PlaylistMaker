import React, { useState, useRef, useEffect } from 'react';
import { apiCallClick } from '../service';
import './../index.css';
import removeicon from '../assets/removeicon.png';

function AudioPlayer({ previewUrl }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Asetetaan äänenvoimakkuus itse koska se on vakiona niin kovalla että naapuritkin heräävät
    }
  }, []);

  return (
    <audio className='w-[350px]' ref={audioRef} controls>
      <source src={previewUrl} type="audio/mpeg" />
      Selaimesi ei tue tätä äänitiedostoa.
    </audio>
  );
}

function SearchResults({ searchResults }) {
  const inputRef = useRef(0);
  
  return (
    <div className='pt-8'>
      {/* Näytetään hakutulokset, jos tuloksia on */}

      {searchResults && searchResults.length > 0 ? ( 
      <div>
        <div className='min-w-[300px] max-w-[50%] h-auto mx-auto bg-[#272b36] py-8'>
          <h2 className='text-4xl font-bold'>Hakutulos:</h2>

          {searchResults.map((searchResult, index) => (
          <div key={searchResult.id || index} className='flex justify-around items-center mt-8'>
            <div className='ml-8 pr-8'>{index + 1}</div>
            <a className='flex flex-auto gap-4 no-underline text-inherit hover:text-inherit' href={searchResult.external_urls.spotify}>
              <img src={searchResult.album.images[2].url} />
              <div>
                <p className='resultSong'>{searchResult.name} </p>
                <p className='resultArtist'>{searchResult.artists[0].name}</p>
              </div>
            </a>
            <AudioPlayer previewUrl={searchResult.preview_url} />
            <button className='p-0 pl-8 mr-8 border-0 bg-transparent'><img src={removeicon} /></button>
          </div>
          ))}
        </div>
      </div>
    ) : (null)}

    </div>
  );
}

export default SearchResults;