import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
// import { java } from '@codemirror/lang-java';
// import { python } from '@codemirror/lang-python';

// This component is a code editor with syntax highlighting and a copy button
function CodeSnippet({ code, onChange, readOnly = false, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);

    setTimeout(() => setCopied(false), 2000);
  };

  // Select the appropriate language extension
  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case 'java':
        return [java()];
      case 'python':
        return [python()];
      case 'javascript':
      default:
        return [javascript({ jsx: true })];
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-600">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-3 py-1 text-xs font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <CodeMirror
        value={code}
        height="auto"
        minHeight="150px"
        maxHeight="500px"
        theme="dark"
        extensions={getLanguageExtension()}
        readOnly={readOnly}
        onChange={(value) => {
          if (onChange && !readOnly) {
            onChange(value);
          }
        }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: !readOnly,
          autocompletion: !readOnly,
        }}
        className="text-sm"
      />
    </div>
  );
}

export default CodeSnippet;