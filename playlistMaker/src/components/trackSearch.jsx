import React, { useState, useRef } from 'react';
import { searchAndShowResult } from '../service';
import './../index.css';

function TrackSearch() {
  const [searchDone, setSearchDone] = useState(false);
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
              searchAndShowResult(setSearchDone, inputRef.current.value)
              .then((result) => {
                setSearchResult(result)
              });
            }
            }>Hae</button>
          </div>
        </div>
      </div>

      {/* Varmistetaan että haku on tehty, ja että tulos on oikeasti noudettu */}

      {searchDone && searchResult ? ( 
      <div>
        <div className='min-w-[30%] h-auto mx-auto bg-[#272b36] py-8'>
          <h2 className='text-4xl font-bold'>Hakutulos:</h2>
          <div className='flex flex-col items-center gap-4 mt-8'>
            <p>Kappaleen nimi: {searchResult.name} </p>
            <p>Artisti: {searchResult.artists[0].name}</p>
          </div>
        </div>
      </div>
    ) : (null)}

    </div>
  );
}

export default TrackSearch;