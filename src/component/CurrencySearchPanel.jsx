import { useState, useMemo, useRef, useEffect } from 'react'
import { back } from '../icons/images'

const CURRENCIES_RAW = {
  "AED": { name: "UAE Dirham" },
  "AFN": { name: "Afghan Afghani" },
  "ALL": { name: "Albanian Lek" },
  "AMD": { name: "Armenian Dram" },
  "ANG": { name: "Netherlands Antillean Guilder" },
  "AOA": { name: "Angolan Kwanza" },
  "ARS": { name: "Argentine Peso" },
  "AUD": { name: "Australian Dollar" },
  "AWG": { name: "Aruban Florin" },
  "AZN": { name: "Azerbaijani Manat" },
  "BAM": { name: "Bosnia-Herzegovina Convertible Mark" },
  "BBD": { name: "Barbadian Dollar" },
  "BDT": { name: "Bangladeshi Taka" },
  "BGN": { name: "Bulgarian Lev" },
  "BHD": { name: "Bahraini Dinar" },
  "BIF": { name: "Burundian Franc" },
  "BMD": { name: "Bermudian Dollar" },
  "BND": { name: "Brunei Dollar" },
  "BOB": { name: "Bolivian Boliviano" },
  "BRL": { name: "Brazilian Real" },
  "BSD": { name: "Bahamian Dollar" },
  "BTN": { name: "Bhutanese Ngultrum" },
  "BWP": { name: "Botswanan Pula" },
  "BYN": { name: "Belarusian Ruble" },
  "BZD": { name: "Belize Dollar" },
  "CAD": { name: "Canadian Dollar" },
  "CDF": { name: "Congolese Franc" },
  "CHF": { name: "Swiss Franc" },
  "CLP": { name: "Chilean Peso" },
  "CNY": { name: "Chinese Yuan" },
  "COP": { name: "Colombian Peso" },
  "CRC": { name: "Costa Rican Colón" },
  "CUP": { name: "Cuban Peso" },
  "CVE": { name: "Cape Verdean Escudo" },
  "CZK": { name: "Czech Koruna" },
  "DJF": { name: "Djiboutian Franc" },
  "DKK": { name: "Danish Krone" },
  "DOP": { name: "Dominican Peso" },
  "DZD": { name: "Algerian Dinar" },
  "EGP": { name: "Egyptian Pound" },
  "ERN": { name: "Eritrean Nakfa" },
  "ETB": { name: "Ethiopian Birr" },
  "EUR": { name: "Euro" },
  "FJD": { name: "Fijian Dollar" },
  "FKP": { name: "Falkland Islands Pound" },
  "FOK": { name: "Faroese Króna" },
  "GBP": { name: "British Pound Sterling" },
  "GEL": { name: "Georgian Lari" },
  "GGP": { name: "Guernsey Pound" },
  "GHS": { name: "Ghanaian Cedi" },
  "GIP": { name: "Gibraltar Pound" },
  "GMD": { name: "Gambian Dalasi" },
  "GNF": { name: "Guinean Franc" },
  "GTQ": { name: "Guatemalan Quetzal" },
  "GYD": { name: "Guyanese Dollar" },
  "HKD": { name: "Hong Kong Dollar" },
  "HNL": { name: "Honduran Lempira" },
  "HRK": { name: "Croatian Kuna" },
  "HTG": { name: "Haitian Gourde" },
  "HUF": { name: "Hungarian Forint" },
  "IDR": { name: "Indonesian Rupiah" },
  "ILS": { name: "Israeli New Shekel" },
  "IMP": { name: "Isle of Man Pound" },
  "INR": { name: "Indian Rupee" },
  "IQD": { name: "Iraqi Dinar" },
  "IRR": { name: "Iranian Rial" },
  "ISK": { name: "Icelandic Króna" },
  "JEP": { name: "Jersey Pound" },
  "JMD": { name: "Jamaican Dollar" },
  "JOD": { name: "Jordanian Dinar" },
  "JPY": { name: "Japanese Yen" },
  "KES": { name: "Kenyan Shilling" },
  "KGS": { name: "Kyrgystani Som" },
  "KHR": { name: "Cambodian Riel" },
  "KID": { name: "Kiribati Dollar" },
  "KMF": { name: "Comorian Franc" },
  "KRW": { name: "South Korean Won" },
  "KWD": { name: "Kuwaiti Dinar" },
  "KYD": { name: "Cayman Islands Dollar" },
  "KZT": { name: "Kazakhstani Tenge" },
  "LAK": { name: "Laotian Kip" },
  "LBP": { name: "Lebanese Pound" },
  "LKR": { name: "Sri Lankan Rupee" },
  "LRD": { name: "Liberian Dollar" },
  "LSL": { name: "Lesotho Loti" },
  "LYD": { name: "Libyan Dinar" },
  "MAD": { name: "Moroccan Dirham" },
  "MDL": { name: "Moldovan Leu" },
  "MGA": { name: "Malagasy Ariary" },
  "MKD": { name: "Macedonian Denar" },
  "MMK": { name: "Myanmar Kyat" },
  "MNT": { name: "Mongolian Tögrög" },
  "MOP": { name: "Macanese Pataca" },
  "MRU": { name: "Mauritanian Ouguiya" },
  "MUR": { name: "Mauritian Rupee" },
  "MVR": { name: "Maldivian Rufiyaa" },
  "MWK": { name: "Malawian Kwacha" },
  "MXN": { name: "Mexican Peso" },
  "MYR": { name: "Malaysian Ringgit" },
  "MZN": { name: "Mozambican Metical" },
  "NAD": { name: "Namibian Dollar" },
  "NGN": { name: "Nigerian Naira" },
  "NIO": { name: "Nicaraguan Córdoba" },
  "NOK": { name: "Norwegian Krone" },
  "NPR": { name: "Nepalese Rupee" },
  "NZD": { name: "New Zealand Dollar" },
  "OMR": { name: "Omani Rial" },
  "PAB": { name: "Panamanian Balboa" },
  "PEN": { name: "Peruvian Sol" },
  "PGK": { name: "Papua New Guinean Kina" },
  "PHP": { name: "Philippine Peso" },
  "PKR": { name: "Pakistani Rupee" },
  "PLN": { name: "Polish Złoty" },
  "PYG": { name: "Paraguayan Guaraní" },
  "QAR": { name: "Qatari Riyal" },
  "RON": { name: "Romanian Leu" },
  "RSD": { name: "Serbian Dinar" },
  "RUB": { name: "Russian Ruble" },
  "RWF": { name: "Rwandan Franc" },
  "SAR": { name: "Saudi Riyal" },
  "SBD": { name: "Solomon Islands Dollar" },
  "SCR": { name: "Seychellois Rupee" },
  "SDG": { name: "Sudanese Pound" },
  "SEK": { name: "Swedish Krona" },
  "SGD": { name: "Singapore Dollar" },
  "SHP": { name: "Saint Helena Pound" },
  "SLE": { name: "Sierra Leonean Leone" },
  "SOS": { name: "Somali Shilling" },
  "SRD": { name: "Surinamese Dollar" },
  "SSP": { name: "South Sudanese Pound" },
  "STN": { name: "São Tomé and Príncipe Dobra" },
  "SYP": { name: "Syrian Pound" },
  "SZL": { name: "Eswatini Lilangeni" },
  "THB": { name: "Thai Baht" },
  "TJS": { name: "Tajikistani Somoni" },
  "TMT": { name: "Turkmenistani Manat" },
  "TND": { name: "Tunisian Dinar" },
  "TOP": { name: "Tongan Paʻanga" },
  "TRY": { name: "Turkish Lira" },
  "TTD": { name: "Trinidad and Tobago Dollar" },
  "TVD": { name: "Tuvaluan Dollar" },
  "TWD": { name: "New Taiwan Dollar" },
  "TZS": { name: "Tanzanian Shilling" },
  "UAH": { name: "Ukrainian Hryvnia" },
  "UGX": { name: "Ugandan Shilling" },
  "USD": { name: "US Dollar" },
  "UYU": { name: "Uruguayan Peso" },
  "UZS": { name: "Uzbekistani Som" },
  "VES": { name: "Venezuelan Bolívar" },
  "VND": { name: "Vietnamese Đồng" },
  "VUV": { name: "Vanuatu Vatu" },
  "WST": { name: "Samoan Tālā" },
  "XAF": { name: "Central African CFA Franc" },
  "XCD": { name: "East Caribbean Dollar" },
  "XOF": { name: "West African CFA Franc" },
  "XPF": { name: "CFP Franc" },
  "YER": { name: "Yemeni Rial" },
  "ZAR": { name: "South African Rand" },
  "ZMW": { name: "Zambian Kwacha" },
  "ZWL": { name: "Zimbabwean Dollar" },
  "CKD": { name: "Cook Islands Dollar" },
  "KPW": { name: "North Korean Won" },
  "SLL": { name: "Sierra Leonean Leone (old)" },
  "XDR": { name: "IMF Special Drawing Rights" },
}

const CURRENCIES = Object.entries(CURRENCIES_RAW).map(([code, value]) => ({
  code,
  currencyName: value.name
})).sort((a, b) => a.currencyName.localeCompare(b.currencyName))


function CurrencySearchPanel({ set, setbar }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  // reset query and focus every time panel opens
  useEffect(() => {
    if (set.isSearch) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [set.isSearch])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CURRENCIES.filter(
      c =>
        c.currencyName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    )
  }, [query])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(c => {
      const letter = c.currencyName[0].toUpperCase()
      if (!map[letter]) map[letter] = []
      map[letter].push(c)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className={`w-full h-[80vh] 
      flex flex-col justify-baseline items-center z-80
      rounded-md bg-neutral-950 border-[3px] border-gray-600 
      ${set.isSearch ? '' : 'hidden'}`}>

      {/* Search bar */}
      <div className='w-full px-3 py-2 bg-neutral-900 shrink-0'>
        <div className='w-full h-10 py-2 text-md flex gap-3 justify-baseline items-center font-bold'>
          <span className='size-6 bg-blue-700 rounded-full grid place-items-center'>
            <img
              src={back}
              alt=""
              className='size-3'
              onClick={() => set.setisSearch(false)} />
          </span>
          <h1 className='w-full h-full text-lg font-bold text-gray-300 flex justify-baseline items-center'>
            Back
          </h1>
        </div>

        <div className='flex items-center bg-neutral-800 rounded-xl px-3 py-2 gap-2 border-[1px] border-gray-700'>
          <svg className='shrink-0 text-gray-400' width='16' height='16' fill='none'
            stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
            <circle cx='11' cy='11' r='8' /><path d='m21 21-4.35-4.35' />
          </svg>
          <input
            ref={inputRef}
            type='text'
            value={query}                            
            onChange={e => setQuery(e.target.value)}   
            placeholder='Search currency or code...'
            className='w-full bg-transparent outline-none text-white text-sm placeholder-gray-500'
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className='text-gray-400 hover:text-white text-lg leading-none shrink-0'
            >×</button>
          )}
        </div>
      </div>

      {/* Currency list */}
      <div className='flex-1 w-full overflow-y-auto scrollbarhide'>
        {grouped.length === 0 ? (
          <div className='flex items-center justify-center h-32 text-gray-500 text-sm'>
            No results found
          </div>
        ) : (
          grouped.map(([letter, items]) => (
            <div key={letter}>
              <div className='px-4 pt-3 pb-1 sticky top-0 bg-neutral-950 z-10'>
                <span className='text-emerald-400 font-semibold text-sm'>{letter}</span>
                <div className='border-b border-gray-700 mt-1' />
              </div>
              {items.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    setbar.setcur_bar({
                      ...setbar.cur_Bar,
                      code: c.code,
                      Cur_name: c.currencyName
                    })
                    set.setisSearch(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3
                    hover:bg-neutral-800 transition-colors
                    ${setbar.cur_Bar?.code === c.code ? 'bg-neutral-800' : ''}`}
                >
                  <span className='text-white text-sm font-medium'>
                    {c.currencyName}
                  </span>
                  <span className='text-gray-400 text-xs font-mono tracking-widest'>
                    {c.code}
                  </span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CurrencySearchPanel