import React, { useState } from 'react';
import { apiCall } from '../service';
import { search } from '../service';
import InputField from './InputField' ;

function SearchForm({ setSearchResults }) {
    const [type, setType] = useState('track')
    const [query, setQuery] = useState('')
    const [genre, setGenre] = useState('')    
    const [limit, setLimit] = useState('')
    const [yearFrom, setYearFrom] = useState('')
    const [yearTo, setYearTo] = useState('')
    const [minPopularity, setMinPopularity] = useState('')
    const [minDanceability, setMinDanceability] = useState('')
    const [minEnergyLevel, setMinEnergyLevel] = useState('')
    const [createPlaylist, setCreatePlaylist] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault() // Estää sivun uudelleenlataamisen
        // Vie kenttien arvot funktioon
        const tracks = await search(genre, yearFrom, yearTo, minPopularity, minDanceability, minEnergyLevel, limit, createPlaylist);
        setSearchResults(tracks);
      }

    return (
        <form onSubmit={handleSubmit}>
            <div className='pt-8 pb-4'>
                <label htmlFor='type'>Type: </label>
                <select
                  id='type'
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="track">Track</option>
                </select>
              </div>
            <fieldset className=' w-[50%] m-[0_auto] grid grid-cols-[0.75fr_1fr] gap-3'>
            {/*Läjä hakukenttiä*/}
              <label htmlFor='genre' className='text-right'>Genre: </label><InputField name="genre" inputValue={genre} setInputValue={setGenre} />
              <label htmlFor='yearFrom' className='text-right'>Mistä vuodesta: </label><InputField name="yearFrom" inputValue={yearFrom} setInputValue={setYearFrom} />
              <label htmlFor='yearTo' className='text-right'>Mihin vuoteen: </label><InputField name="yearTo" inputValue={yearTo} setInputValue={setYearTo} />
              <label htmlFor='minPopularity' className='text-right'>minPopularity: </label><InputField name="minPopularity" inputValue={minPopularity} setInputValue={setMinPopularity} />
              <label htmlFor='minDanceability' className='text-right'>minDanceability: </label><InputField name="minDanceability" inputValue={minDanceability} setInputValue={setMinDanceability} />
              <label htmlFor='minEnergyLevel' className='text-right'>minEnergyLevel: </label><InputField name="minEnergyLevel" inputValue={minEnergyLevel} setInputValue={setMinEnergyLevel} />

              <label htmlFor="limit" className='text-right'>Limit: </label>
              <input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => {
                  const value = e.target.value;
                  // Jos kenttä on tyhjä, salli null-arvo
                  if (value === "" || (value >= 1 && value <= 50)) {
                    setLimit(value);
                  }
                }}
                placeholder="0"
                min="1"
                max="50"
                //required="required"
                onInput={(e) => {
                  // Poistetaan kaikki ei-numeraaliset merkit
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                className='w-1/2'
              />

              <label htmlFor="createPlaylist"className='text-right'>Create playlist? ***TÄMÄ PITÄÄ POISTAA*** </label>
                <input
                  className='justify-self-start'
                  type="checkbox"
                  checked={createPlaylist}
                  onChange={(e) => {
                    setCreatePlaylist(e.target.checked);
                  }}
                />
            </fieldset>

            <br />
            <p>genre: pop, rock, metal, classical etc...</p>
            <p>minPopularity: 0-100 (This is a very harsh criterion, consider leaving at 0 or low)</p>
            <p>minDanceability: 0-1, minEnergyLevel: 0-1</p>
            <p>limit: number of tracks at most</p>
            {/*TODO: poistetaan tämä<----*/}
            <br />
            <button type="submit">HAE</button>
        </form>
    )
}


export default SearchForm