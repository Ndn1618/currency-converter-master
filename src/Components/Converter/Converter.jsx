import "./Converter.css"

function Converter(props) {
  const {
    currencyOptions,
    selectedCurrency,
    onChangeCurrency,
    onChangeAmount,
    amount
  } = props
  return (
    <div className="converter">
      <select value={selectedCurrency} onChange={onChangeCurrency}>
        {currencyOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <input type="number" className="input" value={amount} onChange={onChangeAmount} />
    </div>
  )
}

export default Converter
