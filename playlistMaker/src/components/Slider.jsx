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
          className="w-[15em]"
        />
      </div>
    );
  }
  
  export default Slider;
