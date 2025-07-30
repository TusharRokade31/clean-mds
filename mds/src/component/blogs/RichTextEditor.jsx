"use client"
import React, { useRef, useState, useMemo } from 'react';
import JoditEditor from 'jodit-react';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  height = 400,
  placeholder = "Start writing...",
  disabled = false 
}) => {
  const editor = useRef(null);

  const config = useMemo(() => ({
    readonly: disabled,
    placeholder: placeholder,
    height: height,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', '|',
      'align', '|',
      'link', 'image', 'table', '|',
      'undo', 'redo', '|',
      'fullsize', 'source'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    removeButtons: ['about'],
    style: {
      font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#374151'
    }
  }), [disabled, placeholder, height]);

  const handleChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };



  return (
    <div className="rich-text-editor-container">
      {/* Editor Container */}
      <div className="border border-gray-300 rounded-md overflow-hidden">
          <JoditEditor
            ref={editor}
            value={value}
            config={config}
            tabIndex={1}
            onBlur={(newContent) => handleChange(newContent)}
            onChange={(newContent) => handleChange(newContent)}
          />
       
      </div>
    </div>
  );
};

export default RichTextEditor;