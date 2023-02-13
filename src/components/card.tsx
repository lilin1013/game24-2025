import React from 'react';

interface Props {
  value: string;
}

const PokerCard: React.FC<Props> = ({  value }) => {
  return (
    <div className="bg-green-700 rounded-lg shadow-lg overflow-hidden flex-grow">
      <div className="aspect-[3/4] flex text-center w-5xl items-center justify-center">
        <div className="lg:text-3xl font-bold text-white text-m">{value}</div>
      </div>
    </div>
  );
};

export default PokerCard;
