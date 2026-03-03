import {Prism}from "react-syntax-highlighter";
// import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dracula} from 'react-syntax-highlighter/dist/esm/styles/prism';
const CodeBlock = ({ code, language }) => {
  const getLanguageColor = (lang) => {
    const colors = {
      javascript: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      python: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      typescript: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      css: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      html: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      react: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    };
    return colors[lang.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
      {/* Header with language badge */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700 flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getLanguageColor(language.toLowerCase())}`}>
          {language.toUpperCase()}
        </span>
        <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          Copy Code
        </button>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm ">
          <Prism language={language.toLowerCase()} style={dracula}>
            {code}
          </Prism>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
