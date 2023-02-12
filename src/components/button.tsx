import React from 'react';

interface Props {
  onClick: () => void;
  text: string;
  width?: string;
}

const Button: React.FC<Props> = ({ onClick, text, width }) => {
  return (
    <button onClick={onClick} className={`bg-green-700 hover:bg-green-600 text-white h-30 py-2 px-4 rounded ${width}`}>
      {text}
    </button>
  );
};

export default Button;
