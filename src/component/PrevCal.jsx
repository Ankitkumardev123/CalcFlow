import React from 'react'

function PrevCal({histry,set}) {
    const calOb=histry
  return (
    <div className='shrink-0 w-full h-20  border-b-[1px] flex flex-col gap-1 py-1 border-gray-500 ' onClick={()=>
      set(prev=>prev==""?histry?.calAns:prev+histry?.calAns)
    }>
        <p className='text-sm h-5 text-gray-600 w-full text-right tracking-wider'>{calOb?.calDate || "None"}</p>
<p className='w-full h-5 text-md text-gray-500 text-right font-semibold tracking-wider'>{calOb?.calExpr || "None"}</p>
   <p className='w-full h-5 mb-1 text-lg text-white text-right
    font-semibold tracking-wider'>{"="+calOb?.calAns || "None"}</p>
    </div>
  )
}

export default PrevCal