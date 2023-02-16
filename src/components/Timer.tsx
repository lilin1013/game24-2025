import exp from "constants";
import { useState, useEffect, useRef } from 'react';

type Props = {
  initialTime: number;
  onTimeout: () => void;
  isSubmit: boolean;
};

const Timer = ({ initialTime, onTimeout, isSubmit }: Props) => {
  const [time, setTime] = useState(initialTime);
  const intervalId = useRef<NodeJS.Timeout>();

  useEffect(() => {
     intervalId.current = setInterval(() => {
      setTime((time) => time - 1);
    }, 1000);

    if (time <= 0) {
      clearInterval(intervalId.current );
      onTimeout();
    }

    return () => clearInterval(intervalId.current );
  }, [time]);

  useEffect(() => {
    if (isSubmit && intervalId.current) {
      clearInterval(intervalId.current );
    }
  }, [isSubmit]);

  let bolderColor = time <= 5 ? "border-red-700" : "border-green-700";
  let textColor = time <= 5 ? "text-red-700" : "text-green-700";
  


  return (
   <div className={`bg-gray-100 rounded-full p-3 flex justify-center items-center w-7 h-7 p-7 border border-2 ${bolderColor}`}>
    <div className={`font-bold text-m ${textColor}`}>{time.toString()}</div>
</div>)
};
export default Timer;