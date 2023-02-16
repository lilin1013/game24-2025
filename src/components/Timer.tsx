import exp from "constants";
import { useState, useEffect } from "react";

type Props = {
  initialTime: number;
  onTimeout: () => void;
};

const Timer = ({ initialTime, onTimeout }: Props) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((time) => time - 1);
    }, 1000);

    if (time <= 0) {
      clearInterval(intervalId);
      setTime(20)
      onTimeout();
    }

    return () => clearInterval(intervalId);
  }, [time, onTimeout]);

  return (
  <div className="bg-gray-100 rounded-full p-3 flex justify-center items-center w-7 h-7 p-7 border border-w-2 border-green-700">
    <div className='text-bold text-m text-green-700'>{time.toString()}</div>
</div>)
};
export default Timer;