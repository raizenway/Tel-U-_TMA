'use client';

import React from 'react';

interface ContainerFormProps {
  children: React.ReactNode;
  className?: string;
}

const ContainerForm: React.FC<ContainerFormProps> = ({
  children,
  className = '',
}) => {
  return (
   <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div
          className="bg-white rounded-xl shadow-md mx-auto"
         
        >
          <div className={`bg-white rounded-xl shadow-md ${className}`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContainerForm;