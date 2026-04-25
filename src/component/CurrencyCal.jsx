import React, { useEffect, useState } from 'react'
import CurrencySearchPanel from './CurrencySearchPanel.jsx'
import {back} from "../icons/images.js"

function CurrencyCal({set,show,setSear,setbar,Cur_bar,bardata,btn}) {
  
  let lastConvert=JSON.parse(localStorage.getItem("lastconverted"))
 
  const [isToOrFrom,setisToOrFrom]=useState(0)
  const [showprevs,setshowprevs]=useState({
    to:false,
    from:false
  })
  const [overwrite, setOverwrite] = useState({ to: false, from: false })
  const operators = ["+", "-", "x", "÷"]
  const [updateTime,setupdatetime]=useState('')
  const [To_code,SetTo_code]=useState(()=>
    lastConvert?
    { name:lastConvert.fromname, code:lastConvert.fromcode }
    :
    { name:"Japanese Yen", code:"JPY" }
  )

  const [From_code,SetFrom_code]=useState(()=>
    lastConvert?
    { name:lastConvert.toname, code:lastConvert.tocode, amount:lastConvert.value }
    :
    { name:"Indian Rupee", code:"INR", amount:"1" }
  )
 const [CurToMsg, setCurToMsg] = useState(To_code.amount)
  const [CurFromMsg, setCurFromMsg] = useState(From_code.amount)
  // ─── helpers ──────────────────────────────────────────────────────────────
useEffect(()=>{
  lastConvert=JSON.parse(localStorage.getItem("lastconverted"))
  SetFrom_code(()=>lastConvert?
    { name:lastConvert.fromname, code:lastConvert.fromcode, amount:lastConvert.value }
    :
    { name:"Indian Rupee", code:"INR", amount:"1" } )
    SetTo_code(()=>lastConvert?
    { name:lastConvert.toname, code:lastConvert.tocode }
    :
    { name:"Japanese Yen", code:"JPY" })
    setCurFromMsg(From_code.amount)
    
},[show,setSear.isSearch])
useEffect(()=>{
const currentMsg = isToOrFrom===0 ? CurFromMsg : CurToMsg
    const func       = isToOrFrom===0 ? setCurToMsg : setCurFromMsg
    if(currentMsg==='')
      func('')
},[CurFromMsg,CurToMsg])
  const hasOperatorOrBracket = (msg) => /[+\-x÷%()]/.test(msg)

  const handlecalculate = (fieldMsg) => {
    try {
      let expression = fieldMsg
        .replace(/(\d)\(/g, '$1*(')   // 2(3)  → 2*(3)
        .replace(/\)(\d)/g, ')*$1')   // )2    → )*2
        .replace(/\)\(/g,   ')*(')    // )(    → )*(
        .replace(/x/g,  '*')
        .replace(/÷/g,  '/')
        .replace(/%/g,  '/100')

      // strip leading junk operators (keep leading minus)
      expression = expression.replace(/^[+x÷*/]+/, '')
      // strip trailing operators
      expression = expression.replace(/[+\-x÷*/]+$/, '')
      // strip trailing open brackets
      expression = expression.replace(/\(+$/, '')

      if (!expression.trim()) return null

      // balance brackets
      const open  = (expression.match(/\(/g) || []).length
      const close = (expression.match(/\)/g) || []).length
      if (open > close) expression += ')'.repeat(open - close)

      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + expression + ')')()
      if (!isFinite(result) || isNaN(result)) return null
      return parseFloat(result.toFixed(10)).toString()
    } catch {
      return null
    }
  }

  // ─── conversion ───────────────────────────────────────────────────────────
const handleConhistory=(to,from,amount)=>{
 
  const temp={
    fromname:from.name,
    fromcode:from.code,
    value:amount,
    toname:to.name,
    tocode:to.code

  }
  localStorage.setItem("lastconverted",JSON.stringify(temp))
}
  // convert FROM → TO and put result in the inactive field
  const handleConvert = async (fromCode, toCode, rawMsg) => {
   const func=isToOrFrom==0?setCurToMsg:setCurFromMsg
    
    const evaluated = handlecalculate(rawMsg) ?? rawMsg
    const numeric   = parseFloat(evaluated)
    if(rawMsg=='') return
    if (isNaN(numeric)) return

    try {
      const data = await fetch(
        `https://fxapi.app/api/${fromCode}/${toCode}.json`
      ).then(r => r.json())
      let date=new Date(data.timestamp)
      setupdatetime(date.toLocaleString("en-US",{
        month:"short",
        day:'2-digit',
        year:'numeric',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
      }))
      if (!data?.rate) return
      const converted = (data.rate * numeric).toFixed(4)

      // always write conversion result into the OTHER field
      if (isToOrFrom === 0) {
        setCurToMsg(converted.toString())
      } else {
        setCurFromMsg(converted.toString())
      }
      handleConhistory(To_code,From_code,CurFromMsg)
    } catch (err) {
      console.error('Conversion error:', err)
    }
  }

  // ─── evaluate + convert ───────────────────────────────────────────────────

  const handleEvaluate = () => {
    const currentMsg = isToOrFrom===0 ? CurFromMsg : CurToMsg
    const func       = isToOrFrom===0 ? setCurFromMsg : setCurToMsg
    const field      = isToOrFrom===0 ? 'from' : 'to'
    const fromCode   = isToOrFrom===0 ? From_code.code : To_code.code
    const toCode     = isToOrFrom===0 ? To_code.code   : From_code.code

    const result = handlecalculate(currentMsg)
    if (result !== null) {
      // push evaluated result into active field
      func(result)
      setshowprevs(prev=>({...prev, [field]:false}))
      setOverwrite(prev=>({...prev, [field]:true}))
      // trigger conversion with the evaluated value
      handleConvert(fromCode, toCode, result)
    }
  }

  // also auto-convert whenever the active field changes (debounced)
  useEffect(()=>{
    if (!CurFromMsg && !CurToMsg) return
    const fromCode = isToOrFrom===0 ? From_code.code : To_code.code
    const toCode   = isToOrFrom===0 ? To_code.code   : From_code.code
    const rawMsg   = isToOrFrom===0 ? CurFromMsg : CurToMsg

    // only auto-convert if the expression is a clean number (no operators)
    if (hasOperatorOrBracket(rawMsg)) return

    const id = setTimeout(()=> handleConvert(fromCode, toCode, rawMsg), 300)
    return ()=> clearTimeout(id)
  },[CurFromMsg, CurToMsg, From_code.code, To_code.code])

  // ─── btn prop handler ────────────────────────────────────────────────────

  useEffect(()=>{
    if(!btn) return
    if(btn.value==="AC")  { handleAllClear(); return }
    if(btn.value==="=")   { handleEvaluate(); return }
    if(btn.value==="CUT") { handlecut();      return }
    handleclick(btn.value)
  },[btn])

  // ─── keyboard handler ─────────────────────────────────────────────────────

  useEffect(()=>{
    const handlekeydown=(e)=>{
      // don't steal keys from search input or any other input
      const tag = document.activeElement.tagName
      if(setSear.isSearch && show) return

      if(e.key==="Backspace") { handlecut();      return }
      if(e.key==="Enter")     { handleEvaluate(); return }
      if("0123456789+-*/%()".includes(e.key)){
        if(e.key==='/') { handleclick('÷'); return }
        if(e.key==='*') { handleclick('x'); return }
        handleclick(e.key)
      }
    }
    window.addEventListener("keydown", handlekeydown)
    return ()=> window.removeEventListener("keydown", handlekeydown)
  })

  // ─── bardata handler ──────────────────────────────────────────────────────

  useEffect(()=>{
    if(!bardata?.code) return
    if(setbar.whichCurbar===0){
      SetFrom_code(prev=>({ ...prev, code:bardata.code, name:bardata.Cur_name }))
    } else {
      SetTo_code({ code:bardata.code, name:bardata.Cur_name })
    }
  },[bardata])

  // ─── input handlers ───────────────────────────────────────────────────────

  const handlecut = () => {
    const func  = isToOrFrom===0 ? setCurFromMsg : setCurToMsg
    const field = isToOrFrom===0 ? 'from' : 'to'
    func(prev => prev?.slice(0, prev.length-1) || '')
    setOverwrite(prev=>({...prev, [field]:false}))
  }

  const handleAllClear = () => {
    setCurFromMsg('')
    setCurToMsg('')
    setshowprevs({ to:false, from:false })
    setOverwrite({ to:false, from:false })
  }

  const handlenum = (num) => {
    const func  = isToOrFrom===0 ? setCurFromMsg : setCurToMsg
    const field = isToOrFrom===0 ? 'from' : 'to'
    if (overwrite[field]) {
      func(num)
      setOverwrite(prev=>({...prev, [field]:false}))
      setshowprevs(prev=>({...prev, [field]:false}))
      return
    }
    func(prev => prev + num)
  }

  const handlebrackets = (bracket) => {
    const func  = isToOrFrom===0 ? setCurFromMsg : setCurToMsg
    const field = isToOrFrom===0 ? 'from' : 'to'

    func(prev => {
      const last = prev.slice(-1)
      if (bracket === "(") {
        if (!prev || operators.includes(last) || last==="(") return prev+"("
        if (prev==="0") return "("
        return prev+"("
      }
      const open  = (prev.match(/\(/g)||[]).length
      const close = (prev.match(/\)/g)||[]).length
      if (open>close && last!=="(" && !operators.includes(last))
        return prev+")"
      return prev
    })

    const currentMsg = isToOrFrom===0 ? CurFromMsg : CurToMsg
    const result = handlecalculate(currentMsg)
    if (result!==null) {
      setshowprevs(prev=>({...prev, [field]:true}))
      setOverwrite(prev=>({...prev, [field]:false}))
    }
  }

  const handleoperator = (ope) => {
    const currentMsg = isToOrFrom===0 ? CurFromMsg : CurToMsg
    const func  = isToOrFrom===0 ? setCurFromMsg : setCurToMsg
    const field = isToOrFrom===0 ? 'from' : 'to'

    if (overwrite[field]) {
      const result = handlecalculate(currentMsg)
      const base   = result!==null ? result : currentMsg
      func(base+ope)
      setOverwrite(prev=>({...prev, [field]:false}))
      setshowprevs(prev=>({...prev, [field]:false}))
      return
    }

    func(prev => {
      if (!prev) { return ope==='-' ? ope : prev }
      const last = prev.slice(-1)
      if (ope==='-' && last==="(") return prev+ope
      if (last==="(") return prev
      if (operators.includes(last)) return prev.replace(/[+\-x÷]+$/, '')+ope
      return prev+ope
    })

    const result = handlecalculate(currentMsg)
    if (result!==null) setshowprevs(prev=>({...prev, [field]:true}))
  }

  const handleclick = (btn) => {
    const field = isToOrFrom===0 ? 'from' : 'to'
    const func=isToOrFrom==0?setCurToMsg:setCurFromMsg
    func('')
    if (!isNaN(btn) || btn===".") return handlenum(btn)
    if (btn==="AC") return handleAllClear()

    if (btn==="%") {
      const currentMsg = isToOrFrom===0 ? CurFromMsg : CurToMsg
      const func = isToOrFrom===0 ? setCurFromMsg : setCurToMsg
      if (overwrite[field]) {
        const result = handlecalculate(currentMsg)
        const base   = result!==null ? result : currentMsg
        func(base+"%")
        setOverwrite(prev=>({...prev, [field]:false}))
        setshowprevs(prev=>({...prev, [field]:false}))
        return
      }
      func(prev => prev+"%")
      const result = handlecalculate(currentMsg+"%")
      if (result!==null) setshowprevs(prev=>({...prev, [field]:true}))
      return
    }

    if (btn==="=")            { handleEvaluate();    return }
    if (btn===")"||btn==="(") return handlebrackets(btn)
    return handleoperator(btn)
  }

  // ─── field switch handlers ─────────────────────────────────────────────────

  // top field = FROM (user types here)
  const handleFromClick = () => {
    if(isToOrFrom!==0){
      const result = handlecalculate(CurToMsg)
      if(result!==null && hasOperatorOrBracket(CurToMsg)){
        setCurToMsg(result)
        setshowprevs(prev=>({...prev, to:false}))
        setOverwrite(prev=>({...prev, to:true}))
      }
    }
    setisToOrFrom(0)
  }

  // bottom field = TO (shows conversion result, but also editable)
  const handleToClick = () => {
    if(isToOrFrom!==1){
      const result = handlecalculate(CurFromMsg)
      if(result!==null && hasOperatorOrBracket(CurFromMsg)){
        setCurFromMsg(result)
        setshowprevs(prev=>({...prev, from:false}))
        setOverwrite(prev=>({...prev, from:true}))
      }
    }
    setisToOrFrom(1)
  }

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className={`relative w-full h-1/2 rounded-md overflow-hidden
          bg-neutral-950 flex flex-col justify-center 
          items-center px-2 py-3
          ${show?'':'hidden'}`}>

        <div className='w-full h-8 flex justify-baseline items-center pl-1 gap-4'>
          <img 
            src={back} alt="" className='size-3' 
            onClick={()=>set(prev=>!prev)}/>
          <h1 className='text-md text-gray-400 font-semibold'>Exchange Rate</h1>
        </div>

        {/* ── FROM field (top) ── */}
        <div className='w-full h-27 flex-col gap-3 flex py-3 justify-baseline items-center'>
          <div className='w-full h-10 flex justify-baseline items-center'>
            <span className='w-full h-full flex justify-baseline items-center text-white text-xl font-bold pl-2'>
              {From_code.name}
              <span className='text-gray-500 ml-2'>{From_code.code}</span>
            </span>
            <span className='size-8 grid place-items-center rounded-full bg-cyan-600'>
              <img src={back} alt="" className='size-4 rotate-180'
                onClick={()=>{setSear.setisSearch(prev=>!prev); setbar.setCurBar(0) }}/>
            </span>
          </div>
          <div className='w-full h-8 flex flex-col'>
            <input
              type="text"
              readOnly
              onClick={handleFromClick}
              value={CurFromMsg}
              className={`w-full outline-none h-[70%] text-right
                font-semibold tracking-wide border-gray-600 text-xl
                ${isToOrFrom===0?'text-blue-400':'text-white'}`}/>
            <p className='w-full h-[60%] outline-none text-right font-semibold tracking-wide
               border-gray-600 text-sm text-gray-500'>
              {showprevs.from && hasOperatorOrBracket(CurFromMsg) && handlecalculate(CurFromMsg)!==null
                ? "="+handlecalculate(CurFromMsg) : ''}
            </p>
          </div>
        </div>

        {/* ── TO field (bottom) ── */}
        <div className='w-full h-27 border-t-[1px] pb-3
            border-gray-500 flex-col flex justify-baseline items-center'>
          <div className='w-full h-[50%] gap-4 flex-col flex py-3 justify-baseline items-center'>
            <div className='w-full h-10 flex justify-baseline items-center'>
              <span className='w-full h-full flex justify-baseline items-center text-white text-xl font-bold pl-2'>
                {To_code.name}
                <span className='text-gray-500 ml-2'>{To_code.code}</span>
              </span>
              <span className='size-8 grid place-items-center rounded-full bg-cyan-600'
                onClick={()=>{ setSear.setisSearch(prev=>!prev); setbar.setCurBar(1) }}>
                <img src={back} alt="" className='size-4 rotate-180'/>
              </span>
            </div>
            <div className='w-full h-8 flex flex-col'>
              <input
                type="text"
                readOnly
                onClick={handleToClick}
                value={CurToMsg}
                className={`w-full outline-none h-[70%] text-right
                  font-semibold tracking-wide border-gray-600 text-xl
                  ${isToOrFrom===1?'text-blue-400':'text-white'}`}/>
              <p className='w-full h-full outline-none text-right font-semibold tracking-wide
                 border-gray-600 text-sm text-gray-500'>
                {showprevs.to && hasOperatorOrBracket(CurToMsg) && handlecalculate(CurToMsg)!==null
                  ? "="+handlecalculate(CurToMsg) : ''}
              </p>
            </div>
          </div>
        </div>

        <p className='w-full h-5 grid place-items-center text-center absolute
           bottom-0 text-xs font-sans text-gray-500'>
          {'Updated at '+ updateTime}
        </p>

      </div>
    </>
  )
}

export default CurrencyCal