import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <div className='flex items-center p-5'>
      <span className="bg-green-900 rounded-full text-center p-2 text-white text-bold w-10 h-10">
        24
      </span>
      <div className='text-green-900 p-2 text-bold'>welcome to Game 24</div>
    </div>
  );
};

export default PageHeader;
