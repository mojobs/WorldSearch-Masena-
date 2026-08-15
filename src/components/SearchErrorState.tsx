interface SearchErrorStateProps {
  onRetry: () => void;
}

export default function SearchErrorState({ onRetry }: SearchErrorStateProps) {
  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-8 text-center">
      <span className="text-3xl" aria-hidden="true">
        ⚠️
      </span>
      <p className="m-0 text-sm text-gray-300">
        Sorry we can not show searched country right now. Try again later or check internet connection.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="cursor-pointer rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-indigo-400 hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}
