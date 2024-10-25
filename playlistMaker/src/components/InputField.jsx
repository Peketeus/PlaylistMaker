function InputField({ name, inputValue, setInputValue }) {
    return (
      <div>
        <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}: </label>
        <input
          id={name}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`${name}`}
        />
      </div>
    );
  }
  
  export default InputField;
  