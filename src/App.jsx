import { useEffect, useState } from 'react';
import './App.css';
import Converter from './Components/Converter/Converter'
import NewConverter from './Components/NewConverter/NewConverter'
import ConverterElement from './Components/ConverterElement/ConverterElement'

const BASE_URL = 'https://api.exchangeratesapi.io/latest'
const converterElements = JSON.parse(localStorage.getItem('converterElements')) || []

function App() {
  const [currencyOptions, setCurrencyOptions] = useState(JSON.parse(localStorage.getItem('currencyOptions')) || [])

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
    fetch(`${BASE_URL}?base=${evt.target.parentElement.parentElement.firstChild.firstChild.value}&symbols=${evt.target.value}`)
      .then(res => res.json())
      .then(data => {
        evt.target.nextElementSibling.value = data.rates[evt.target.value] * evt.target.parentElement.parentElement.firstChild.children[1].value
      })
  }

  // delete current converter
  function deleteCurrentConverter(evt) {
    let convElIndex = converterElements.findIndex(el => el.id = Number(evt.target.parentElement.dataset.id))
    converterElements.splice(convElIndex, 1)
    evt.target.parentElement.remove()
    localStorage.setItem('converterElements', JSON.stringify(converterElements))
  }

  // Adding all and one converter
  function addAll(evt) {
    const copiedConverterElements = (evt.target.previousElementSibling.lastChild).cloneNode(true)

    let previousConverterSelects = (evt.target.previousElementSibling.lastChild).querySelectorAll('select')

    let addConverterBtn = copiedConverterElements.querySelector("#addOneBtn")
    addConverterBtn.addEventListener('click', addOne)

    let deleteButtons = copiedConverterElements.querySelectorAll(".deleteBtn")
    for (let i = 2; i < deleteButtons.length; i++) {
      deleteButtons[i].addEventListener('click', deleteCurrentConverter)
    }

    let converterSelects = copiedConverterElements.querySelectorAll('select')
    for (let i = 0; i < converterSelects.length; i++) {
      converterSelects[i].value = previousConverterSelects[i].value
      converterSelects[i].addEventListener('change', calculateCurrency)
    }

    const parentElement = evt.target.previousElementSibling
    parentElement.appendChild(copiedConverterElements)
  }

  function addOne(evt) {
    const newConverter = (evt.target.previousElementSibling.lastChild).cloneNode(true)
    let converterSelect = newConverter.querySelector('select')
    let converterInput = newConverter.querySelector('input')
    converterSelect.value = evt.target.previousElementSibling.lastChild.firstChild.value
    converterSelect.addEventListener('change', calculateCurrency)

    let deleteConverterBtn = newConverter.querySelector('button')
    deleteConverterBtn.classList.remove('deleteConverterBtn')
    deleteConverterBtn.addEventListener('click', deleteCurrentConverter)

    let newConverterEl = new ConverterElement(converterElements[0] ? converterElements[converterElements.length - 1].id : 0, converterSelect.value, converterInput.value)
    converterElements.push(newConverterEl)
    localStorage.setItem('converterElements', JSON.stringify(converterElements))

    newConverter.dataset.id = newConverterEl.id

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
              {
                converterElements && (
                  converterElements.map(converterElement => (
                    <NewConverter
                      key={converterElement.id}
                      currencyOptions={currencyOptions}
                      calculateCurrency={calculateCurrency}
                      converterElement={converterElement}
                      deleteCurrentConverter={deleteCurrentConverter}
                    />
                  ))
                )
              }
            </div>
            <button id="addOneBtn" className="addOneButton" type="button" onClick={addOne}>+</button>
          </form>
        </div>
        <button type="button" className="addAllButton" onClick={addAll}>+</button>
      </div>
    </>
  );
}

export default App
