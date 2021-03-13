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
      ; (async function () {
        const response = await fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`)
        const data = await response.json()
        setExchangeRate(data.rates[toCurrency])
      })()
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

  // calculate Currency when select is selected
  function calculateCurrency(evt) {
    if (evt.target.value === "EUR") {
      evt.target.nextElementSibling.value = 0
    } else {
      fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${evt.target.value}`)
        .then(res => res.json())
        .then(data => {
          evt.target.nextElementSibling.value = data.rates[evt.target.value] * amount
        })
    }
  }

  // Adding all and one converter
  function addAll(evt) {
    const copiedConverterElements = (evt.target.previousElementSibling.lastChild).cloneNode(true)

    let addConverterBtn = copiedConverterElements.querySelector("#addOneBtn")
    addConverterBtn.addEventListener('click', addOne)

    let deleteButtons = copiedConverterElements.querySelectorAll(".deleteBtn")
    for (let i = 2; i < deleteButtons.length; i++) {
      deleteButtons[i].addEventListener('click', (evt) => evt.target.parentElement.remove())
    }

    let converterSelects = copiedConverterElements.querySelectorAll('select')
    let baseSelect = converterSelects[0]
    baseSelect.value = fromCurrency
    baseSelect.addEventListener('change', (evt) => setFromCurrency(evt.target.value))
    for (let i = 1; i < converterSelects.length; i++) {
      converterSelects[i].addEventListener('change', calculateCurrency)
    }

    const parentElement = evt.target.previousElementSibling
    parentElement.appendChild(copiedConverterElements)
  }

  function addOne(evt) {
    const newConverter = (evt.target.previousElementSibling.lastChild).cloneNode(true)
    // console.log(evt.target.previousElementSibling.lastChild.lastChild.value)
    let converterSelect = newConverter.querySelector('select')
    converterSelect.addEventListener('change', calculateCurrency)

    let deleteConverterBtn = newConverter.querySelector('button')
    deleteConverterBtn.classList.remove('deleteConverterBtn')
    deleteConverterBtn.addEventListener('click', (evt) => evt.target.parentElement.remove())

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
            <button id="addOneBtn" type="button" onClick={addOne}>+</button>
          </form>
        </div>
        <button type="button" onClick={addAll}>+</button>
      </div>
    </>
  );
}

export default App
