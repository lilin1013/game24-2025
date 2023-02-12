import React, { useState } from 'react';

interface Props {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextBox: React.FC<Props> = ({ placeholder, value, onChange }) => {
  const [text, setText] = useState(value || '');

  return (
    <input
      className="border border-gray-400 p-2 rounded"
      type="text"
      placeholder={placeholder}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        if (onChange) {
          onChange(event);
        }
      }}
    />
  );
};

export default TextBox;
