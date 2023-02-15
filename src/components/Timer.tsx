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
      onTimeout();
    }

    return () => clearInterval(intervalId);
  }, [time, onTimeout]);

  return (
  <div className="bg-green-800 rounded-full p-3 flex justify-center items-center w-7 h-7 p-7">
    <div className='text-white text-bold text-m'>{time.toString()}</div>
</div>)
};
export default Timer;