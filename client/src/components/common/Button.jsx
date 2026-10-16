export default function Button({ text }) {
  return (
    <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 sm:w-auto sm:text-base">
      {text}
    </button>
  );
}
