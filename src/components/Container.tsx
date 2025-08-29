import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (  
        <div className="min-h-screen bg-gray-100 p-6 mt-16">
          <div className="bg-white rounded-xl shadow p-10 w-full">
            {children}
            </div>
        </div>
    );
}

export default Container;