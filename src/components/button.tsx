import React from 'react';

interface Props {
  onClick: () => void;
  text: string;
  width?: string;
  loading?: boolean;
}

const Button: React.FC<Props> = ({ onClick, text, width, loading }) => {
  text = loading ? 'Submiting...' : text;
  var className = loading?'bg-green-600/75 text-white h-30 py-2 px-4 rounded':`bg-green-700 hover:bg-green-600 text-white h-30 py-2 px-4 rounded ${width}`;
  return (
    <button onClick={onClick} className={className} disabled={loading}>
      {text}
    </button>


  );
};

export default Button;
