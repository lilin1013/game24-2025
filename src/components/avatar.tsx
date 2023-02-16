import { stringify } from 'querystring';
import React from 'react';

interface Props {
  isHighlight?: boolean;
  user: User,
  showPoints?: boolean
}

export interface User {
  GameCode: string;
  Id: string;
  LastUpdate: string;
  Name: string;
  Points: number;
  Role: Role;
}

export enum Role {
  Host = 0,
  Player = 1
}

const Avatar: React.FC<Props> = ({ user, showPoints, isHighlight }) => {

  const isHost = user.Role === Role.Host;
  const isCurrentPlayer = user.Id === localStorage.getItem('userId');

  let text = ''

  if (isHost && isCurrentPlayer) {
    text = '(You, host)';
  } else if (isHost) {
    text = '(Host)';
  } else if (isCurrentPlayer) {
    text = '(You)';
  }

  const bgcolor = isHighlight ? 'bg-red-600' : 'bg-orange-600';
  const textcolor = isHighlight ? 'text-red-600' : 'text-orange-600';

  return (
    <div className='flex items-center p-1 gap-1'>
      <div className={`${bgcolor} rounded-full p-3 flex justify-center items-center w-7 h-7`}>
        <div className='text-white text-bold text-m'>{user.Name[0].toUpperCase()}</div>
      </div>
      <div className={`${textcolor} text-l`}>{`${user.Name} ${text}`}</div>
      {showPoints && <div className={`${textcolor} text-bold text-l`}>  {`[${user.Points.toString()} points]`} </div>}

    </div>

  );
};

export default Avatar;
