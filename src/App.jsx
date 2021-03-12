import { useEffect, useState } from 'react';
import './App.css';
import Converter from './Components/Converter/Converter'

const BASE_URL = 'https://api.exchangeratesapi.io/latest'

function App() {
  const [currencyOptions, setCurrencyOptions] = useState(JSON.parse(localStorage.getItem('currencyOptions')) || [])

  // const [currencyCalculations, setCurrencyCalculations] = useState(JSON.parse(localStorage.getItem('currencyCalculations')) || [])

  const [fromCurrency, setFromCurrency] = useState()
  const [toCurrency, setToCurrency] = useState()
  const [exchangeRate, setExchangeRate] = useState()
  const [amount, setAmount] = useState(1)
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true)

  let toAmount, fromAmount
  if (amountInFromCurrency) {
    fromAmount = amount
    toAmount = amount * exchangeRate
  } else {
    toAmount = amount
    fromAmount = amount / exchangeRate
  }

  useEffect(() => {
    ; (async function () {
      const response = await fetch(BASE_URL)
      const data = await response.json()
      const firstCurrency = Object.keys(data.rates)[0]
      setCurrencyOptions([data.base, ...Object.keys(data.rates)])
      localStorage.setItem('currencyOptions', JSON.stringify([data.base, ...Object.keys(data.rates)]))
      setFromCurrency(data.base)
      setToCurrency(firstCurrency)
      setExchangeRate(data.rates[firstCurrency])
    })()
  }, [])

  useEffect(() => {
    if (fromCurrency != null && toCurrency != null) {
      fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`)
        .then(res => res.json())
        .then(data => setExchangeRate(data.rates[toCurrency]))
    }
  }, [fromCurrency, toCurrency])

  function handleFromAmountChange(e) {
    setAmount(e.target.value)
    setAmountInFromCurrency(true)
  }

  function handleToAmountChange(e) {
    setAmount(e.target.value)
    setAmountInFromCurrency(false)
  }

  // Adding all and one converter
  function addAll(evt) {
    const copiedConverterElements = (evt.target.previousElementSibling.lastChild).cloneNode(true)

    const parentElement = evt.target.previousElementSibling
    parentElement.appendChild(copiedConverterElements)
  }

  function addOne(evt) {
    const newConverter = (evt.target.previousElementSibling.lastChild).cloneNode(true)
    // console.log(evt.target.previousElementSibling.lastChild.lastChild.value)
    let converterInput = newConverter.querySelector('input')
    let converterSelect = newConverter.querySelector('select')
    converterSelect.addEventListener('change', (evt) => {
      if (evt.target.value === "EUR") {
        converterInput.value = 1
      } else {
        fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${evt.target.value}`)
          .then(res => res.json())
          .then(data => {
            converterInput.value = data.rates[evt.target.value] * amount
          })
      }
    })
    evt.target.previousElementSibling.appendChild(newConverter)
  }

  return (
    <>
      <div>
        <div>
          <form className="converter-form" action="">
            <div className="converter-wrapper">
              <Converter
                currencyOptions={currencyOptions}
                selectedCurrency={fromCurrency}
                onChangeCurrency={e => setFromCurrency(e.target.value)}
                onChangeAmount={handleFromAmountChange}
                amount={fromAmount}
              />
              <div className="equals">=</div>
              <Converter
                currencyOptions={currencyOptions}
                selectedCurrency={toCurrency}
                onChangeCurrency={e => setToCurrency(e.target.value)}
                onChangeAmount={handleToAmountChange}
                amount={toAmount}
              />
            </div>
            <button type="button" onClick={addOne}>+</button>
          </form>
        </div>
        <button type="button" onClick={addAll}>+</button>
      </div>
    </>
  );
}

export default App;
