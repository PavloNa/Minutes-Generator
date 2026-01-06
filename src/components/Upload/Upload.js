import React, { useState, useRef } from 'react';
import './Upload.css';
import { processTranscript } from '../../useAPI';

const ACCEPTED_TYPES = {
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/m4a', 'audio/webm'],
  text: ['text/plain']
};

const Upload = ({ disabled = false, onMinutesGenerated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [transcriptText, setTranscriptText] = useState('');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleGenerate = async () => {
    setProcessing(true);
    setError('');
    
    let result;
    
    if (inputMode === 'file' && files.length > 0) {
      // Process first file (for now, single file)
      result = await processTranscript({ file: files[0] });
    } else if (inputMode === 'text' && transcriptText.trim()) {
      result = await processTranscript({ text: transcriptText });
    } else {
      setError('No content to process');
      setProcessing(false);
      return;
    }
    
    if (result.success) {
      if (onMinutesGenerated) {
        onMinutesGenerated(result.minutes);
      }
      // Clear after successful generation
      setFiles([]);
      setTranscriptText('');
    } else {
      setError(result.error || 'Failed to generate minutes');
    }
    
    setProcessing(false);
  };

  const isValidFile = (file) => {
    const allAccepted = [...ACCEPTED_TYPES.audio, ...ACCEPTED_TYPES.text];
    return allAccepted.includes(file.type) || 
           file.name.endsWith('.txt') || 
           file.name.endsWith('.mp3') || 
           file.name.endsWith('.wav') ||
           file.name.endsWith('.m4a') ||
           file.name.endsWith('.ogg');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    setError('');
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(isValidFile);
    
    if (validFiles.length !== droppedFiles.length) {
      setError('Some files were rejected. Only audio and text files are accepted.');
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e) => {
    setError('');
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidFile);
    
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were rejected. Only audio and text files are accepted.');
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      return '🎵';
    }
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="upload-container">
      <div className="input-mode-toggle">
        <button 
          className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => !disabled && setInputMode('file')}
          disabled={disabled}
        >
          📁 Upload File
        </button>
        <button 
          className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => !disabled && setInputMode('text')}
          disabled={disabled}
        >
          ✏️ Type Transcript
        </button>
      </div>

      {inputMode === 'file' ? (
        <>
          <div 
            className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.mp3,.wav,.m4a,.ogg,audio/*,text/plain"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={disabled}
            />
            <div className="dropzone-content">
              <span className="dropzone-icon">{isDragging ? '📥' : '📁'}</span>
              <p className="dropzone-title">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="dropzone-subtitle">or click to browse</p>
              <p className="dropzone-formats">Supported: Audio (MP3, WAV, M4A, OGG) and Text (TXT)</p>
            </div>
          </div>
          <p className="upload-description">Drop in a transcript file to generate a PDF</p>

          {error && (
            <div className="upload-error">
              <span className="upload-error-icon">⚠️</span>
              <p className="upload-error-text">{error}</p>
            </div>
          )}

          {files.length > 0 && !disabled && (
            <div className="files-list">
              <h3>Selected Files</h3>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-icon">{getFileIcon(file)}</span>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button className="file-remove" onClick={() => removeFile(index)}>×</button>
                </div>
              ))}
              <button className="upload-btn" onClick={handleGenerate} disabled={processing}>
                {processing ? 'Processing...' : 'Generate Minutes'}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={`transcript-input-container ${disabled ? 'disabled' : ''}`}>
            <textarea
              className="transcript-textarea"
              placeholder="Paste or type your meeting transcript here..."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              disabled={disabled}
            />
            <div className="textarea-footer">
              <span className="char-count">{transcriptText.length.toLocaleString()} characters</span>
            </div>
          </div>
          <p className="upload-description">Type or paste your transcript to generate a PDF</p>
          
          {error && (
            <div className="upload-error">
              <span className="upload-error-icon">⚠️</span>
              <p className="upload-error-text">{error}</p>
            </div>
          )}

          {transcriptText.trim() && !disabled && (
            <div className="transcript-actions">
              <button className="upload-btn" onClick={handleGenerate} disabled={processing}>
                {processing ? 'Processing...' : 'Generate Minutes'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Upload;