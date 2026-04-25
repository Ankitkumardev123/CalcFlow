import { useEffect, useState } from 'react'
import './index.css'
import { evaluate } from "mathjs";
import {cut,exchange,history} from "../src/icons/images.js"
import PrevCal from './component/PrevCal.jsx';
import CurrencyCal from './component/CurrencyCal.jsx';
import CurrencySearchPanel from './component/CurrencySearchPanel.jsx';
function App() {
  const [cal_msg, setcal_msg] = useState('')      
  const [raw_expr, setraw_expr] = useState('')     
  const [overwrite, setoverwrite] = useState(false)
  const [answer_prev, setanswer_prev] = useState('')
  const [show_prev, setshow_prev] = useState(false)
  const [ishistry,setishistry]=useState(false)
  const [isswitch,setisswitch]=useState(false)
  const [whichCurbar,setCurBar]=useState(0)
 const [btnenvent,setbtnevent]=useState(null)
  const [cur_Bar,setcur_bar]=useState({
    
    code:null,
    Cur_name:null,
})
  
  const [histroy_cal,sethistory_cal]=useState(()=>{
    let object=localStorage.getItem(history)
    if(object) return JSON.parse(object).reverse();
    return []
  })
  const [isSearch,setisSearch]=useState(false)
  const toRaw = (display) => {
    return display
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1")
      .replace(/\)\(/g, ")*(")
  }
  const handlebtnclick=(val)=>{
    setbtnevent({
      value:val,
      time:Date.now()
    })
  }
 useEffect(()=>{

    const handlekeydown=(e)=>{
      if(isswitch) return;
      if(e.key=="*" )
        handleclick("x")
      if(e.key=="/")
        handleclick("÷")
      if("0123456789+-%()".includes(e.key))
       handleclick(e.key)
      if(e.key==="Backspace")
        handlecut()
 if(e.key=="Enter" && cal_msg!='' && !isswitch) {
      handlecalculate(cal_msg)
      
 }
    }
   

 window.addEventListener("keydown",handlekeydown);
 return()=>{ window.removeEventListener("keydown",handlekeydown);}
 },)
  const handlehistory=(cal_msg,cal_ans)=>{
    const date=new Date().toDateString()
    
    const date_new=date.slice(3,date.length).trim().split(" ").toString(",")
    const history_new=[...histroy_cal,{
      calExpr:cal_msg,
      calAns:cal_ans,
      calDate:date_new,
      
    }]
    
    localStorage.setItem(history,JSON.stringify(history_new))
    sethistory_cal(()=>{
    let object=localStorage.getItem(history)
    if(object) return JSON.parse(object).reverse();
    return []
  })
  }
  
  const handlecleanexpre = (expr) => {
    let clean = toRaw(expr)
    clean = clean.replace(/x/gi, "*").replace(/÷/g, "/")
    clean = clean.replace(/^[+*/]+/, "")
    clean = clean.replace(/[+\-*/]+$/, "")
    clean = clean.replace(/\($/, "")
    return clean;
  }

  const handlecut = () => {
    if (!cal_msg) return;
    setcal_msg(prev => prev.slice(0, prev.length - 1))
    setshow_prev(false)
  }

  const operators = ["+", "-", "x", "÷"]

  useEffect(() => {
    if (show_prev) return;
    if (!cal_msg) {
      setanswer_prev("")
      return;
    }
    const timer = setTimeout(() => {
      try {
        const result = evaluate(handlepercent(handlecleanexpre(cal_msg)))
        if (isFinite(result)) {
          setanswer_prev(result.toString())
        } else {
          setanswer_prev("")
        }
      } catch {
        setanswer_prev("Error")
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [cal_msg, show_prev])

  const handleAllClear = () => {
    setcal_msg('')
    setanswer_prev('')
    setoverwrite(false)
    setshow_prev(false)
  }

  const handlenum = (num) => {
    if (overwrite) {
      setcal_msg(num);
      setoverwrite(false)
      setshow_prev(false)
      return;
    }
    setcal_msg(prev => prev === '0' ? num : prev + num);
    setshow_prev(false)
  }

  const handlebrackets = (bracket) => {
    setoverwrite(false)
    setcal_msg(prev => {
      const last = prev.slice(-1)
      if (bracket === "(") {
      
        if (!prev || operators.includes(last) || last === "(") {
          return prev + "("
        }
        if (prev === "0") return "("
        return prev + "("   
      }

      const open = (prev.match(/\(/g) || []).length
      const close = (prev.match(/\)/g) || []).length
      if (open > close && last !== "(" && !operators.includes(last))
        return prev + ")"
      return prev
    })
    setshow_prev(false)
  }

  const handlepercent = (calMsg) => {
    return calMsg
      .replace(/(\d+(?:\.\d+)?)([+\-])(\d+(?:\.\d+)?)%/g, (_, a, op, b) => {
        return `${a}${op}(${a}*${b}/100)`
      })
      .replace(/(\d+(?:\.\d+)?)([\*\/])(\d+(?:\.\d+)?)%/g, (_, a, op, b) => {
        return `${a}${op}(${b}/100)`
      })
      .replace(/(\d+\.?\d*)%/g, (_, a) => {
        return `(${a}/100)`
      })
  }

  const handleoperator = (ope) => {
    setoverwrite(false)
    setcal_msg(prev => {
      if (!prev) {
        // allow leading minus
        if (ope === '-') return ope
        return prev
      }
      const last = prev.slice(-1)
      // allow minus after opening bracket
      if (ope === '-' && last === "(") return prev + ope
      if (last === "(") return prev
      if (operators.includes(last) || last === '-') {
        // replace last operator(s)
        return prev.replace(/[+\-x÷]+$/, '') + ope
      }
      return prev + ope;
    })
    setshow_prev(false)
  }

  const handleclick = (btn) => {
    if (!isNaN(btn) || btn === ".") return handlenum(btn);
    if (btn === "%") {
      setcal_msg(prev => prev + btn);
      setshow_prev(false)
      return;
    }
    if (btn === ")" || btn === "(") return handlebrackets(btn)
    return handleoperator(btn);
  }

  const handlecalculate = (calMSg) => {
    if (!calMSg || calMSg === "Error!") return;
    try {
      const cleaned = handlepercent(handlecleanexpre(calMSg))
      const result = evaluate(cleaned);
      if (!isFinite(result)) throw new Error("Not finite")
   
      const rounded = parseFloat(result.toPrecision(12))
      
      if(rounded!=calMSg)
       handlehistory(cal_msg,rounded.toString())
     
      setcal_msg(rounded.toString())
      setoverwrite(true)
      setshow_prev(true)
     
    } catch {
      setshow_prev(false)
      setcal_msg("Error!")
      setoverwrite(true)
    }
  }

  return (
    <>
    
      <div className='w-screen z-1
       h-screen grid place-items-center '>
        <div className='calculator 2xl:w-[30vw] lg:w-[30vw] 
        sm:h-10/10.5 lg:h-10/10.5 md:h-10/10.5 md:w-[58vw] sm:w-[65vw]
w-[95vw]  bg-neutral-950 border-[3px] border-gray-700 rounded-md'>
  {/*search panel*/}
  <CurrencySearchPanel key={2}
  set={{setisSearch,isSearch}} 
  setbar={{cur_Bar,setcur_bar}} />
  <div className={`w-full h-full rounded-md  flex flex-col items-center 
  justify-baseline ${isSearch?'hidden':''}`}>
          <div className=' w-full h-2/2 bg-neutral-900  flex flex-col '>

           <CurrencyCal key={1} set={setisswitch} 
            bardata={cur_Bar} btn={btnenvent}
           setbar={{setCurBar,whichCurbar}}
            setSear={{setisSearch,isSearch}} 
           show={isswitch}/>
          <div className={`relative w-full h-29 bg-neutral-900 ${isswitch?'hidden':''} flex justify-center  items-center px-2  `}>
           
           
            <input type="text"  defaultValue={cal_msg}
             className='w-full h-10 outline-none text-right text-3xl
              text-white' />
            <p className={`w-full h-10 absolute bottom-1 text-2xl text-right p-2 text-gray-500
            `}>
              {!show_prev && answer_prev && (answer_prev === "Error" ? "=Error" : "= " + answer_prev)}</p>
              
              </div>
              <div className={`relative w-full h-12 bg-neutral-900 flex  items-center justify-baseline pl-8 gap-5 ${isswitch?'hidden':''}` }>
              <img src={history} alt="" className='size-6' onClick={()=>setishistry(prev=>!prev)} />
              <div className={`absolute w-70 h-64 rounded-xl border-[1px] overflow-hidden 
              flex flex-col border-gray-700 top-12 left-5 bg-black ${ishistry?"":"hidden"}`}>
                <div className='w-full h-full scrollbarhide flex px-2 flex-col overflow-x-hidden overflow-y-scroll '>
             {
              histroy_cal.map((histry,index)=>{
              
             return <PrevCal histry={histry} set={setcal_msg} key={(index)}  />})
             }
                </div>
                <div className={`w-full h-14  grid place-items-center text-center font-semibold 
                 ${histroy_cal.length==0?"bg-neutral-700 opacity-50":"bg-neutral-900 hover:bg-neutral-800"}
                text-xl text-white border-t-[1px] border-gray-600 `} onClick={()=>{
                  if(histroy_cal.length==0) return
                  localStorage.removeItem(history)
                  sethistory_cal([])
                }}>
              Clear history
                </div>
              </div>
              <img src={exchange} alt="" className='size-7' onClick={()=>setisswitch(prev=>!prev)} />
            </div>
          </div>
          <div className='w-full h-full  border-gray-700 flex flex-col justify-baseline items-center '>
            
            <div className='w-full h-full border-t-[3px] border-gray-700 flex flex-col justify-baseline items-center'>
              <div className='w-full h-16  flex justify-around items-center px-0 gap-1 '>
                <button className='w-16 h-12 bg-slate-900 text-xl rounded-xl font-semibold 
   text-emerald-400 hover:bg-slate-800' onClick={() => {
    if(isswitch){ 
      handlebtnclick("AC")
    return;}
   handleAllClear()
   }}>AC</button>
                <button className='w-16 h-12 bg-slate-900 text-xl rounded-xl font-semibold
     text-emerald-400 hover:bg-slate-800 grid place-items-center' onClick={() =>{ 
       if(isswitch){ 
                     handlebtnclick("CUT")
    return;}
      handlecut()}}>
      <img src={cut} alt="" className='size-10'/>
     </button>
                <button className='ope w-16 h-12 bg-slate-900 text-3xl rounded-xl font-semibold
      text-emerald-400 hover:bg-slate-800' onClick={() =>{ 
        if(isswitch){ 
         
         handlebtnclick("÷")
           return;
        }
        handleclick("÷")}}>÷</button>
                <div className='w-18 h-12 bg-slate-900 flex text-2xl rounded-xl font-semibold
      text-emerald-400 '>
                  <button className='w-full h-full hover:bg-slate-800 rounded-l-xl border-r-[1px] border-gray-700' onClick={() => {
                    if(isswitch){ 
                     handlebtnclick("(")
                      return;}
                    handleclick("(")}}>
                    (
                  </button>
                  <button className='w-full h-full hover:bg-slate-800 rounded-r-xl' onClick={() =>{
                    if(isswitch){ 
        handlebtnclick(")")
           return;
        } handleclick(")")}}>
                    )
                  </button>
                </div>
              </div>
              <div className='w-full h-16  flex justify-around items-center px-0 gap-1'>
                <button className='ope w-16 h-12 bg-neutral-800 text-xl rounded-xl font-semibold
   text-white hover:bg-neutral-700' onClick={() =>{ 
      if(isswitch){ 
           handlebtnclick("7")
                      return;}
    handleclick("7")}} >7</button>
                <button className='ope w-16 h-12 bg-neutral-800 text-xl rounded-xl font-semibold
     text-white hover:bg-neutral-700' onClick={() => {
        if(isswitch){ 
                     handlebtnclick("8")
                      return;}
      handleclick("8")}}>8</button>
                <button className='ope w-16 h-12 bg-neutral-800 text-xl 
     rounded-xl font-semibold text-white hover:bg-neutral-700' onClick={() =>{  if(isswitch){ 
                     handlebtnclick("9")
                      return;} handleclick("9")}}>9</button>
                <button className='ope  w-16 h-12 font-thin bg-slate-900
      text-2xl rounded-xl  text-emerald-400 hover:bg-slate-800' onClick={() =>{  if(isswitch){ 
                     handlebtnclick("x")
                      return;} handleclick("x")}}>x</button>
              </div>
            
              <div className='w-full h-16  flex justify-around items-center px-0 gap-1 '>
                <button className=' ope w-16 h-12 bg-neutral-800 text-xl rounded-xl 
  font-semibold text-white hover:bg-neutral-700' onClick={() =>{
      if(isswitch){ 
                     handlebtnclick("4")
                      return;} handleclick("4")}}>4</button>
                <button className=' ope w-16 h-12 bg-neutral-800
     text-xl rounded-xl font-semibold text-white hover:bg-neutral-700' onClick={() => {
        if(isswitch){ 
                     handlebtnclick("5")
                      return;}
      handleclick("5")}}>5</button>
                <button className=' ope w-16 h-12 bg-neutral-800 text-xl rounded-xl font-semibold
      text-white hover:bg-neutral-700' onClick={() => {
          if(isswitch){ 
                     handlebtnclick("6")
                      return;}
        handleclick("6")}}>6</button>
                <button className=' ope w-16 h-12 bg-slate-900 text-3xl 
     rounded-xl font-semibold text-emerald-400 hover:bg-slate-800' onClick={() => {
        if(isswitch){ 
                     handlebtnclick("-")
                      return;}
      handleclick("-")}}>-</button>
              </div>
              <div className='w-full h-16  flex justify-around items-center px-0 gap-1'>
                <button className='ope w-16 h-12 bg-neutral-800 text-xl
   rounded-xl font-semibold text-white hover:bg-neutral-700' onClick={() =>{if(isswitch){ 
                     handlebtnclick("1")
                      return;} 
                      handleclick("1")}}>1</button>
                <button className='ope w-16 h-12 bg-neutral-800 text-xl rounded-xl
     font-semibold text-white hover:bg-neutral-700' onClick={() =>{

       if(isswitch){ 
                     handlebtnclick("2")
                      return;}
      handleclick("2")}}>2</button>
                <button className='ope w-16 h-12 
     bg-neutral-800 text-xl rounded-xl font-semibold
      text-white hover:bg-neutral-700' onClick={() =>{ 
          if(isswitch){ 
                     handlebtnclick("3")
                      return;}
        handleclick("3")}}>3</button>
                <button className='ope w-16 h-12 bg-slate-900
      text-2xl rounded-xl font-semibold text-emerald-400 hover:bg-slate-800' onClick={() =>{ 
          if(isswitch){ 
                     handlebtnclick("+")
                      return;}
        handleclick("+")}}>+</button>
              </div>
              <div className='w-full h-16  flex justify-around items-center px-0  gap-1'>
                <button className={`ope w-16 h-12 bg-neutral-800 text-2xl rounded-xl font-semibold
   text-white hover:bg-neutral-700 ${isswitch?'hidden':''}`} onClick={() => handleclick("%")}>%</button>
                <button className='ope w-16 h-12 bg-neutral-800 text-xl rounded-xl font-semibold text-white
     hover:bg-neutral-700' onClick={() =>{   if(isswitch){ 
                     handlebtnclick("0")
                      return;}handleclick("0")}}>0</button>
     <button className={`ope w-16 h-12 bg-neutral-800 text-xl rounded-xl font-semibold text-white
     hover:bg-neutral-700 ${isswitch?'':'hidden'}`} onClick={() => {
        if(isswitch){ 
                     handlebtnclick("00")
                      return;}
      handleclick("00")}}>00</button>
                <button className='ope w-16 h-12 bg-neutral-800 
     text-3xl rounded-xl font-semibold text-white hover:bg-neutral-700' onClick={() => {
        if(isswitch){ 
                     handlebtnclick(".")
                      return;}
      handleclick(".")}}>.</button>
                <button className='ope w-16 h-12 bg-slate-900 text-2xl 
     rounded-xl font-semibold text-emerald-400 hover:bg-slate-800'
      onClick={() =>{ 
        if(isswitch){ 
                     handlebtnclick("=")
                      return;}
        handlecalculate(cal_msg)}}>=</button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App