import React from 'react';

interface Props {
  value: string;
}

const PokerCard: React.FC<Props> = ({  value }) => {
  return (
    <div className="bg-green-700 rounded-lg shadow-lg overflow-hidden">
      <div className=" w-24 h-32 flex text-center w-5xl items-center justify-center">
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
};

export default PokerCard;
