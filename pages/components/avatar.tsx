import { stringify } from 'querystring';
import React from 'react';

interface Props {
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

enum Role {
  Host = 0,
  Player = 1
}

const Avatar: React.FC<Props> = ({ user, showPoints }) => {

  const isHost = user.Role === Role.Host;
  const isCurrentPlayer = user.Id === localStorage.getItem('userId');

  let text=''

  if (isHost && isCurrentPlayer) {
    text = '(You are the host)';
  } else if (isHost) {
    text = '(Host)';
  } else if (isCurrentPlayer) {
    text = '(You)';
  }

  return (

    <div className='flex items-center p-3 gap-1'>
      <span className="bg-orange-600 rounded-full text-center p-3 text-white text-bold w-12 h-12 text-l">
        {user.Name[0]}
      </span>
      <div className="text-orange-600 text-bold text-xl">{`${user.Name} ${text}`}</div>
      {showPoints && <div className="text-orange-600 text-bold text-xl">- {user.Points.toString()}</div>}

    </div>

  );
};

export default Avatar;
