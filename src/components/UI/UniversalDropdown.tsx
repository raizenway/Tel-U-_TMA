'use client';

import {
  useState,
  useRef,
  useEffect,
  ReactNode,
  KeyboardEvent,
} from 'react';

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface UniversalDropdownProps {
  trigger: ReactNode;
  menuItems: MenuItem[];
  align?: 'left' | 'right';
}

export default function UniversalDropdown({
  trigger,
  menuItems,
  align = 'right',
}: UniversalDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape as any);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape as any);
    };
  }, []);

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="focus:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>

      {open && (
        <div
          className={`absolute ${alignmentClass} mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transform transition-all duration-150 origin-top ${
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          role="menu"
        >
          <ul className="py-1 text-sm text-gray-700">
            {menuItems.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                role="menuitem"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
