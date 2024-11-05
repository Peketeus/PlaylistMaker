function Slider({ name, min, max, step, inputValue, setInputValue }) {
    return (
      <div className='flex justify-start content-center'>
        <input
          id={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-1/2 min-w-[10em]"
        />
      </div>
    );
  }
  
  export default Slider;
