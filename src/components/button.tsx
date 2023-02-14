import React from 'react';

interface Props {
  onClick: () => void;
  text: string;
  width?: string;
  loading?: boolean;
  type?: ButtonType
}
export enum ButtonType{
  Primary,
  Secondary,
  Disabled
}

const Button: React.FC<Props> = ({ onClick, text, width, loading, type }) => {
  type = type ?? ButtonType.Primary;
  text = loading ? 'Submiting...' : text;
  var className = `h-30 py-2 px-4 rounded ${width} `;
  
  if(type === ButtonType.Secondary){
    className = className + 'text-green-700 border border-green-700 bg-gray-200 hover:bg-gray-350';
  }
  else if(type === ButtonType.Disabled){
    className = className + 'bg-green-600/75 text-white';
  }else{
    const plus = loading? 'bg-green-600/75 text-white':`bg-green-700 hover:bg-green-600 text-white`;
    className = className + plus;
  
  }

  return (
    <button onClick={onClick} className={className} disabled={loading||type===ButtonType.Disabled}>
      {text}
    </button>


  );
};

export default Button;
