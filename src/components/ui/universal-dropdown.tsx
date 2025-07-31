'use client';

import {
  useState,
  useRef,
  useEffect,
  ReactNode,
  createContext,
  useContext,
} from 'react';

interface DropdownContextType {
  closeDropdown: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

interface UniversalDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

export default function UniversalDropdown({
  trigger,
  children,
  align = 'right',
}: UniversalDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <DropdownContext.Provider value={{ closeDropdown: () => setOpen(false) }}>
          <div
            className={`absolute ${alignmentClass} mt-2 w-48 bg-white border rounded shadow z-50`}
          >
            <ul className="py-1 text-sm text-gray-700">{children}</ul>
          </div>
        </DropdownContext.Provider>
      )}
    </div>
  );
}

interface ItemProps {
  label: string;
  onClick: () => void;
}

UniversalDropdown.Item = function DropdownItem({ label, onClick }: ItemProps) {
  const context = useContext(DropdownContext);

  const handleClick = () => {
    onClick();
    context?.closeDropdown();
  };

  return (
    <li
      onClick={handleClick}
      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    >
      {label}
    </li>
  );
};
