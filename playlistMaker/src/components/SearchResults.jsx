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
    <audio className='flex-auto' ref={audioRef} controls>
      <source src={previewUrl} type="audio/mpeg" />
      Selaimesi ei tue tätä äänitiedostoa.
    </audio>
  );
}

function SearchResults() {
  const [searchResult, setSearchResult] = useState(null);
  const inputRef = useRef(0);
  
  return (
    <div>
      <div className="w-fit mx-auto">
        <div className="flex flex-col items-center pt-24">
          <div className="flex-auto">
            <label htmlFor="hakukentta">Syötä haettavan kappaleen ID: <input ref={inputRef}
              className={
              "ml-5 focus-visible:outline-none focus-visible:outline-[#646cff]"}
              id="hakukentta" type="text" size={50} name="haku" defaultValue='0cmANMS0v2eDqkCD093mHc' /></label>
          </div>
          <div className="flex-auto flex justify-center my-10 w-[30%]">
            <button type="button" className="w-full" onClick={async () => {
              apiCallClick(inputRef.current.value)
              .then((result) => {
                setSearchResult(result)
              });
            }
            }>Hae</button>
          </div>
        </div>
      </div>

      {/* Varmistetaan että haku on tehty, ja että tulos on oikeasti noudettu */}

      {searchResult ? ( 
      <div>
        <div className='min-w-[40%] max-w-[50%] h-auto mx-auto bg-[#272b36] py-8'>
          <h2 className='text-4xl font-bold'>Hakutulos:</h2>
          <div className='flex justify-around items-center mt-8'>
            <div className='ml-8 pr-8'>1</div>
            <a className='flex flex-auto gap-4 no-underline text-inherit hover:text-inherit' href={searchResult.external_urls.spotify}>
              <img src={searchResult.album.images[2].url} />
              <div>
                <p className='text-left'>{searchResult.name} </p>
                <p className='text-left'>{searchResult.artists[0].name}</p>
              </div>
            </a>
            <AudioPlayer previewUrl={searchResult.preview_url} />
            <button className='p-0 pl-8 mr-8 border-0 bg-transparent'><img src={removeicon} /></button>
          </div>
        </div>
      </div>
    ) : (null)}

    </div>
  );
}

export default SearchResults;