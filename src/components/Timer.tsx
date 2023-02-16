import exp from "constants";
import { useState, useEffect, useRef } from 'react';

type Props = {
  initialTime: number;
  onTimeout: () => void;
};

const Timer = ({ initialTime, onTimeout }: Props) => {
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

  let color = time <= 5 ? "red-700" : "green-700";

  return (
  <div className={`bg-gray-100 rounded-full p-3 flex justify-center items-center w-7 h-7 p-7 border border-2 border-${color}`}>
    <div className={`font-bold text-m text-${color}`}>{time.toString()}</div>
</div>)
};
export default Timer;