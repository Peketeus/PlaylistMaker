import { useEffect, useState } from 'react';
import { fetchTracksUntilLimit } from '../service';
import InputField from './InputField';
import Slider from './Slider';
import Genres from '../resources/genres.json'
import Tooltip from './Tooltip';

function SearchForm({ setSearchResults }) {
    const [type, setType] = useState('track')
    const [genre, setGenre] = useState('')
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
        const tracks = await fetchTracksUntilLimit(yearFrom, yearTo, genre, limit);
        setSearchResults(tracks);
        setIsSearching(false);
    }

  return (
    <form className=' flex flex-col items-center justify-center gap-4' onSubmit={handleSubmit}>

      {/* Contains fields */}
      <fieldset className='form w-[20%] grid grid-cols-[0.75fr_1fr_0.1fr] gap-3'>

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
        <Tooltip text="?" tooltipText="Generated type" />

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
        <Tooltip text="?" tooltipText="Select music genre" />

        {/* Other input fields */}
        {/* SLIDER RANGE: 0 to 1.0 */}
        {/* EXCEPT: minLoudness(~-60 to 0) minTempo(~50 to 250) */}
        {/* From (year) */}
        <label htmlFor='yearFrom' className='text-right'>From (year): </label><InputField name="yearFrom" inputValue={yearFrom} setInputValue={setYearFrom} />
        <Tooltip text="?" tooltipText="Generate from year" />

        {/* To (year) */}
        <label htmlFor='yearTo' className='text-right'>To (year): </label><InputField name="yearTo" inputValue={yearTo} setInputValue={setYearTo} />
        <Tooltip text="?" tooltipText="Generate to year" />

        {/* Danceability */}
        <label htmlFor='minDanceability' className='text-right'>Danceability: </label>
        <Slider name="minDanceability" inputValue={minDanceability} setInputValue={setMinDanceability} min="0" max="1" step="0.001" />
        <Tooltip text="?" tooltipText="Not in use" />

        {/* Energy */}
        <label htmlFor='minEnergy' className='text-right'>Energy: </label>
        <Slider name="minEnergy" inputValue={minEnergy} setInputValue={setMinEnergy} min="0" max="1" step="0.001" />
        <Tooltip text="?" tooltipText="Not in use" />

        {/* Acousticness */}
        <label htmlFor='minAcousticness' className='text-right'>Acousticness: </label>
        <Slider name="minAcousticness" inputValue={minAcousticness} setInputValue={setMinAcousticness} min="0" max="1" step="0.001" />
        <Tooltip text="?" tooltipText="Not in use" />

        {/* Instumentalness */}
        <label htmlFor='minInstrumentalness' className='text-right'>Instrumentalness: </label>
        <Slider name="minInstrumentalness" inputValue={minInstrumentalness} setInputValue={setMinInstrumentalness} min="0" max="1" step="0.001" />
        <Tooltip text="?" tooltipText="Not in use" />
        {/* 
              <label htmlFor='minLiveness' className='text-right'>minLiveness: </label>
                <Slider name="minLiveness" inputValue={minLiveness} setInputValue={setmMinLiveness} min="0" max="1" step="0.001"/>

              <label htmlFor='minLoudness' className='text-right'>minLoudness: </label>
                <Slider name="minLoudness" inputValue={minLoudness} setInputValue={setMinLoudness} min="-60" max="0" step="0.5"/>
              */}
              <label htmlFor='minSpeechiness' className='text-right'>Speechiness: </label>
                <Slider name="minSpeechiness" inputValue={minSpeechiness} setInputValue={setMinSpeechiness} min="0" max="1" step="0.001"/>
                <Tooltip text="?" tooltipText="Not in use"/>

              {/* Tempo */}
              <label htmlFor='minTempo' className='text-right'>Tempo: </label>
                <Slider name="minTempo" inputValue={minTempo} setInputValue={setMinTempo} min="50" max="250" step="1"/>
                <Tooltip text="?" tooltipText="Not in use"/>

              {/* Valence */}
              <label htmlFor='minValence' className='text-right'>Valence: </label>
                <Slider name="minValence" inputValue={minValence} setInputValue={setMinValence} min="0" max="1" step="0.001"/>
                <Tooltip text="?" tooltipText="Not in use"/>
              
              {/* Limit */}
              <label htmlFor="limit" className='text-right'>Number of tracks: </label>
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
              <Tooltip text="?" tooltipText="Leave 0 for max amount. Otherwise 1-49"/>
            </fieldset>
            <br />
            <button 
              className={`font-semibold rounded transition duration-300 w-[180px]
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