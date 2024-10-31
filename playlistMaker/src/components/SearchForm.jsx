import React, { useEffect, useState } from 'react';
import { search } from '../service';
import InputField from './InputField';
import Genres from '../resources/genres.json'

function SearchForm({ setSearchResults }) {
    const [type, setType] = useState('track')
    //const [query, setQuery] = useState('') // Tämän voi poistaa?
    const [genre, setGenre] = useState('')
    const [filteredGenres, setFilteredGenres] = useState([]) // Suodatetut genret
    const [limit, setLimit] = useState('')
    const [yearFrom, setYearFrom] = useState('')
    const [yearTo, setYearTo] = useState('')
    const [minPopularity, setMinPopularity] = useState('')
    const [minDanceability, setMinDanceability] = useState('')
    const [minEnergyLevel, setMinEnergyLevel] = useState('')
    const [minAcousticness, setMinAcousticness] = useState('')
    const [minInstrumentalness, setMinInstrumentalness] = useState('')
    const [minLiveness, setmMinLiveness] = useState('')
    const [minLoudness, setMinLoudness] = useState('')
    const [minSpeechiness, setMinSpeechiness] = useState('')
    const [minTempo, setMinTempo] = useState('')
    const [minValence, setMinValence] = useState('')

    //const [createPlaylist, setCreatePlaylist] = useState(false)

    // Tämä on tässä genresuodatusta varten
    useEffect(() => {
      if (genre) {
        const results = Genres.filter(g =>
          g.name.toLowerCase().includes(genre.toLowerCase())
        ).slice(0, 1500) // Tätä säätämällä voi muokata max osumien näytön määrää
        setFilteredGenres(results);
      } else {
          setFilteredGenres([]); // Tyhjentää listan, jos genrekenttä on tyhjä
      }
    }, [genre]); // Suodatetaan joka kerta kun 'genre' muuttuu

    const handleSubmit = async (e) => {
        e.preventDefault()
        const tracks = await search(
          {
            'genre': genre,
            'yearFrom': yearFrom,
            'yearTo': yearTo,
            'filters': {
              'minPopularity': minPopularity,
              'minDanceability': minDanceability,
              'minEnergyLevel': minEnergyLevel,
              'minAcousticness': minAcousticness,
              'minInstrumentalness': minInstrumentalness,
              'minLiveness': minLiveness,
              'minLoudness': minLoudness,
              'minSpeechiness': minSpeechiness,
              'minTempo': minTempo,
              'minValence': minValence,
            },
            'limit': limit,
            }
          );
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

              {/* Genre-hakukenttä */}
              <label htmlFor='genre' className='text-right'>Genre: </label>
              <input
                type="text"
                list="genre-options"
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Hae genreä..."
                className='w-1/2 min-w-[10em]'
              />
              <datalist id="genre-options">
                {filteredGenres.map((g) => (
                  <option key={g.id} value={g.name} />
                ))}
              </datalist>

              {/* Input fiels */}
              <label htmlFor='yearFrom' className='text-right'>Mistä vuodesta: </label><InputField name="yearFrom" inputValue={yearFrom} setInputValue={setYearFrom} />
              <label htmlFor='yearTo' className='text-right'>Mihin vuoteen: </label><InputField name="yearTo" inputValue={yearTo} setInputValue={setYearTo} />

              {/* Filters */}
              <label htmlFor='minPopularity' className='text-right'>minPopularity: </label><InputField name="minPopularity" inputValue={minPopularity} setInputValue={setMinPopularity} />
              <label htmlFor='minDanceability' className='text-right'>minDanceability: </label><InputField name="minDanceability" inputValue={minDanceability} setInputValue={setMinDanceability} />
              <label htmlFor='minEnergyLevel' className='text-right'>minEnergyLevel: </label><InputField name="minEnergyLevel" inputValue={minEnergyLevel} setInputValue={setMinEnergyLevel} />
              <label htmlFor='minAcousticness' className='text-right'>minAcousticness: </label><InputField name="minAcousticness" inputValue={minAcousticness} setInputValue={setMinAcousticness} />
              <label htmlFor='minInstrumentalness' className='text-right'>minInstrumentalness: </label><InputField name="minInstrumentalness" inputValue={minInstrumentalness} setInputValue={setMinInstrumentalness} />
              <label htmlFor='minLiveness' className='text-right'>minLiveness: </label><InputField name="minLiveness" inputValue={minLiveness} setInputValue={setmMinLiveness} />
              <label htmlFor='minLoudness' className='text-right'>minLoudness: </label><InputField name="minLoudness" inputValue={minLoudness} setInputValue={setMinLoudness} />
              <label htmlFor='minSpeechiness' className='text-right'>minSpeechiness: </label><InputField name="minSpeechiness" inputValue={minSpeechiness} setInputValue={setMinSpeechiness} />
              <label htmlFor='minTempo' className='text-right'>minTempo: </label><InputField name="minTempo" inputValue={minTempo} setInputValue={setMinTempo} />
              <label htmlFor='minValence' className='text-right'>minValence: </label><InputField name="minValence" inputValue={minValence} setInputValue={setMinValence} />

              {/* Limit */}
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
            </fieldset>

            <br />
            <br />
            <p>FILTERS:</p>
            <p>minPopularity - minValence</p>
            <p>RANGE: 0 to 1.0</p>
            <p>EXCEPT: minPopularity (0 to 100) minLoudness(~-60 to 0) minTempo(~50 to 250)</p>
            <p>minPopularity: 0-100 (This is a very harsh criterion, consider leaving at 0 or low)</p>
            <p>limit: number of tracks at most</p>
            {/*TODO: poistetaan tämä<----*/}
            <br />
            <button type="submit">HAE</button>
        </form>
    )
}

export default SearchForm