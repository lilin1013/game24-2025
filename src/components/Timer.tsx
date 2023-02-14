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

  return <div>Time remaining: {time}s</div>;
};
export default Timer;