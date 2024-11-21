
import { useEffect,useState } from "react";
const useDebouce = (value,delayTime)=>{
    const [debouncedValue,setDebouncedValue] =useState(value);
    useEffect(()=>{
        let timeoutHandler=setTimeout(()=>setDebouncedValue(value),delayTime);

        return ()=>clearInterval(timeoutHandler);
    },[value,delayTime]);
    return debouncedValue;
}

export default useDebouce;