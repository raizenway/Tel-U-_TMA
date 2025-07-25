// components/QuestionNavigation.tsx
"use client";

type Props = {
  current: number;
  total: number;
  onSelect: (index: number) => void;
};

export default function QuestionNavigation({ current, total, onSelect }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full lg:w-[200px] space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-10 h-10 rounded text-sm font-medium ${
              current === i
                ? "bg-green-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        disabled
        className="w-full mt-4 bg-gray-200 text-gray-500 py-2 rounded text-sm font-semibold cursor-not-allowed"
      >
        Finish Attempt
      </button>
    </div>
  );
}

