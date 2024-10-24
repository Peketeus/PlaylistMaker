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
    const [maxPopularity, setMaxPopularity] = useState('')
    const [danceability, setDanceability] = useState('')
    const [energyLevel, setEnergyLevel] = useState('')


    const handleSubmit = (e) => {
        e.preventDefault() // Estää sivun uudelleenlataamisen
        // Vie kenttien arvot funktioon
        search(genre,yearFrom, yearTo, maxPopularity, limit, danceability, energyLevel);
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
            <InputField name="maxPopularity" inputValue={maxPopularity} setInputValue={setMaxPopularity} />
            <InputField name="danceability" inputValue={danceability} setInputValue={setDanceability} />
            <InputField name="energyLevel" inputValue={energyLevel} setInputValue={setEnergyLevel} />

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
                onInput={(e) => {
                  // Poistetaan kaikki ei-numeraaliset merkit
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
            </div>

            <br />
            <br />
            <p>genre: pop, rock, metal jne. maxPopularity: 0-100, danceability: 0.1 - 1, energyLevel: 0.1 - 1</p> {/*TODO: poistetaan tämä<----*/}
            <br />


            <button type="submit">HAE</button>
        </form>
    )
}


export default SearchForm