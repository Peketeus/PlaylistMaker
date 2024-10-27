function InputField({ name, inputValue, setInputValue }) {
    return (
      <div className='flex justify-start content-center'>
        {/* <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}: </label> */} {/* Tämä poistoon imo */}
        <input
          id={name}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-1/2"
        />
      </div>
    );
  }
  
  export default InputField;
