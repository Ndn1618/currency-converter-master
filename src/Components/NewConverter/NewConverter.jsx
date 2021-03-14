import "../Converter/Converter.css"

function NewConverter(props) {
  const {
    currencyOptions,
    calculateCurrency,
    converterElement,
    deleteCurrentConverter
  } = props
  return (
    <>
      <div className="converter" data-id={converterElement.id}>
        <select value={converterElement.selectValue} onChange={calculateCurrency}>
          {currencyOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <input type="number" className="input" value={converterElement.inputValue} onChange={e => console.log(e)} />
        <button className="deleteBtn" type="button" onClick={deleteCurrentConverter}>X</button>
      </div>
    </>
  )
}

export default NewConverter
