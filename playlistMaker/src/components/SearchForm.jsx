import React, { useEffect, useState } from 'react';
import { apiCallSearch, search } from '../service';
import InputField from './InputField';
import Slider from './Slider';
import Genres from '../resources/genres.json'

function SearchForm({ setSearchResults }) {
    const [type, setType] = useState('track')
    const [genre, setGenre] = useState('pop')
    const [filteredGenres, setFilteredGenres] = useState([])
    const [yearFrom, setYearFrom] = useState('')
    const [yearTo, setYearTo] = useState('')
    const [minDanceability, setMinDanceability] = useState("0")
    const [minEnergy, setMinEnergy] = useState("0")
    const [minAcousticness, setMinAcousticness] = useState("0")
    const [minInstrumentalness, setMinInstrumentalness] = useState("0")
    //const [minLiveness, setmMinLiveness] = useState("0")
    //const [minLoudness, setMinLoudness] = useState("-60")
    const [minSpeechiness, setMinSpeechiness] = useState("0")
    const [minTempo, setMinTempo] = useState("0")
    const [minValence, setMinValence] = useState("0")
    const [limit, setLimit] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    //const [createPlaylist, setCreatePlaylist] = useState(false)

    // Filter what genres the search box offers upon user input
    useEffect(() => {
      if (genre) {
        const results = Genres.filter(g =>
          g.name.toLowerCase().includes(genre.toLowerCase())
        ).slice(0, 1500) // Adjust 2nd parameter to show more genre matches
        setFilteredGenres(results);
      } else {
          setFilteredGenres([]); // If the genre-field is empty, empty the list
      }
    }, [genre]); // Do filtering each time the genre-variable changes

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSearching(true);
        const tracks = await apiCallSearch(yearFrom, yearTo, genre, limit);
        // const tracks = await search(    // TODO: Spotify took off endpoints from the public API users so this code is now useless. POISTA
        //   {
        //     'genre': genre,
        //     'yearFrom': yearFrom,
        //     'yearTo': yearTo,
        //     'filters': {
        //       'minDanceability': minDanceability,
        //       'minEnergy': minEnergy,
        //       'minAcousticness': minAcousticness,
        //       'minInstrumentalness': minInstrumentalness,
        //       //'minLiveness': minLiveness,
        //       //'minLoudness': minLoudness,
        //       'minSpeechiness': minSpeechiness,
        //       'minTempo': minTempo,
        //       'minValence': minValence,
        //     },
        //     'limit': limit,
        //     }
        //   );
        setSearchResults(tracks);
        setIsSearching(false);
    }

    return (
        <form onSubmit={handleSubmit}>

            {/* Contains fields */}
            <fieldset className=' w-[50%] m-[0_auto] grid grid-cols-[0.75fr_1fr] gap-3'>

              {/* Type chooser - delete? */}
              <label htmlFor='type' className='text-right'>Type: </label>
              <select
                id='type'
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='w-[15em]'
              >
                <option value="track">Track</option>
              </select>

              {/* Search field for genre */}
              <label htmlFor='genre' className='text-right'>Genre: </label>
              <input
                type="text"
                list="genre-options"
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-[15em]"
              />
              <datalist id="genre-options">
                {filteredGenres.map((g) => (
                  <option key={g.id} value={g.name} />
                ))}
              </datalist>

              {/* Other input fields */}
              {/* SLIDER RANGE: 0 to 1.0 */}
              {/* EXCEPT: minLoudness(~-60 to 0) minTempo(~50 to 250) */}
              <label htmlFor='yearFrom' className='text-right'>From (year): </label><InputField name="yearFrom" inputValue={yearFrom} setInputValue={setYearFrom} />
              <label htmlFor='yearTo' className='text-right'>To (year): </label><InputField name="yearTo" inputValue={yearTo} setInputValue={setYearTo} />
              <label htmlFor='minDanceability' className='text-right'>Danceability: </label>
                <Slider name="minDanceability" inputValue={minDanceability} setInputValue={setMinDanceability} min="0" max="1" step="0.001"/>
              <label htmlFor='minEnergy' className='text-right'>Energy: </label>
                <Slider name="minEnergy" inputValue={minEnergy} setInputValue={setMinEnergy} min="0" max="1" step="0.001"/>
              <label htmlFor='minAcousticness' className='text-right'>Acousticness: </label>
                <Slider name="minAcousticness" inputValue={minAcousticness} setInputValue={setMinAcousticness} min="0" max="1" step="0.001"/>
              <label htmlFor='minInstrumentalness' className='text-right'>Instrumentalness: </label>
                <Slider name="minInstrumentalness" inputValue={minInstrumentalness} setInputValue={setMinInstrumentalness} min="0" max="1" step="0.001"/>
              {/* 
              <label htmlFor='minLiveness' className='text-right'>minLiveness: </label>
                <Slider name="minLiveness" inputValue={minLiveness} setInputValue={setmMinLiveness} min="0" max="1" step="0.001"/>
              <label htmlFor='minLoudness' className='text-right'>minLoudness: </label>
                <Slider name="minLoudness" inputValue={minLoudness} setInputValue={setMinLoudness} min="-60" max="0" step="0.5"/>
              */}
              <label htmlFor='minSpeechiness' className='text-right'>Speechiness: </label>
                <Slider name="minSpeechiness" inputValue={minSpeechiness} setInputValue={setMinSpeechiness} min="0" max="1" step="0.001"/>
              <label htmlFor='minTempo' className='text-right'>Tempo: </label>
                <Slider name="minTempo" inputValue={minTempo} setInputValue={setMinTempo} min="50" max="250" step="1"/>
              <label htmlFor='minValence' className='text-right'>Valence: </label>
                <Slider name="minValence" inputValue={minValence} setInputValue={setMinValence} min="0" max="1" step="0.001"/>
              
              {/* Limit */}
              <label htmlFor="limit" className='text-right'>Limit: </label>
              <input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => {
                  const value = e.target.value;
                  // If field is empty, allow null-value
                  if (value === "" || (value >= 1 && value <= 50)) {
                    setLimit(value);
                  }
                }}
                placeholder="0"
                min="1"
                max="50"
                //required="required"
                onInput={(e) => {
                  // Remove all non-numbers
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                className='w-[15em]'
              />
            </fieldset>
            <br />
            <button 
              className= {`font-semibold rounded transition duration-300
                ${isSearching ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              disabled={isSearching}
              type="submit"
              >
              {isSearching ? 'Generating...' : 'Generate playlist'}
            </button>
        </form>
    )
}

export default SearchForm