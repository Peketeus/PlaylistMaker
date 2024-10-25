import React, { useState } from 'react';
import { apiCall } from '../service';
import { search } from '../service';
import InputField from './InputField' ;

const SearchForm = () => {
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


    const handleSubmit = (e) => {
        e.preventDefault() // Estää sivun uudelleenlataamisen
        // Vie kenttien arvot funktioon
        search(genre, yearFrom, yearTo, minPopularity, minDanceability, minEnergyLevel, limit, createPlaylist);
      }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='type'>Type: </label>
                <select
                  id='type'
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="track">Track</option>
                </select>
              </div>
            {/*Läjä hakukenttiä*/}
            <InputField name="genre" inputValue={genre} setInputValue={setGenre} />
            <InputField name="yearFrom" inputValue={yearFrom} setInputValue={setYearFrom} />
            <InputField name="yearTo" inputValue={yearTo} setInputValue={setYearTo} />
            <InputField name="minPopularity" inputValue={minPopularity} setInputValue={setMinPopularity} />
            <InputField name="minDanceability" inputValue={minDanceability} setInputValue={setMinDanceability} />
            <InputField name="minEnergyLevel" inputValue={minEnergyLevel} setInputValue={setMinEnergyLevel} />
            <div>
              <label htmlFor="limit">Limit: </label>
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
              />
            </div>
            <div>
              <label htmlFor="createPlaylist">Create playlist? </label>
                <input
                  type="checkbox"
                  checked={createPlaylist}
                  onChange={(e) => {
                    setCreatePlaylist(e.target.checked);
                  }}
                />
            </div>

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