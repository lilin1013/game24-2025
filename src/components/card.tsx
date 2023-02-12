import React from 'react';

interface Props {
  value: string;
}

const PokerCard: React.FC<Props> = ({  value }) => {
  return (
    <div className="w-30 h-40 bg-green-700 rounded-lg shadow-lg overflow-hidden">
      <div className="text-center p-12">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default PokerCard;
