function InputField({ name, type, inputValue, setInputValue }) {
  return (
    <div className='flex justify-start content-center'>
      <input
        id={name}
        type={type}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        // Prevent non-numbers from being entered and set max year length to 4 digits
        // but allow backspace etc.
        onKeyDown={(e) => {
          if (['Backspace', 'Enter', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
            return;
          }
          if ((!/[0-9]/.test(e.key) || e.target.value.length >= 4) && e.target.type === "number") {
            e.preventDefault();
          }
        }}
        className="w-[15em]"
      />
    </div>
  );
}

export default InputField;
