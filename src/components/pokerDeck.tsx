import React from 'react';
import Card from './card';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  value?: Array<string>;
}

const PokerDeck: React.FC<Props> = ({  value }) => {
  value = value || ['','','',''];
  const uuid = uuidv4();
  return (
    <div className="flex sm:gap-4 justify-between gap-1 sm: w-9/12 w-11/12">
        {value.map((cardValue) =><Card key={uuid} value={cardValue}></Card>)}
    </div>
  );
};

export default PokerDeck;
