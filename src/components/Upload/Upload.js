import React, { useState } from 'react';
import './Upload.css';
import { processTranscript } from '../../useAPI';
import { UploadIcon, AudioIcon, DocumentIcon, CloseIcon } from '../icons';

const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|webm)$/i;
const isAudio = (file) => file.type.startsWith('audio/') || AUDIO_EXT.test(file.name);
const isValidFile = (file) => isAudio(file) || file.type === 'text/plain' || /\.txt$/i.test(file.name);

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const Upload = ({ disabled = false, onMinutesGenerated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('file');
  const [transcriptText, setTranscriptText] = useState('');
  const [processing, setProcessing] = useState(false);

  const canGenerate = !disabled && !processing && (inputMode === 'file' ? !!file : !!transcriptText.trim());

  const handleGenerate = async () => {
    setProcessing(true);
    setError('');

    const result = inputMode === 'file'
      ? await processTranscript({ file })
      : await processTranscript({ text: transcriptText });

    if (result.success) {
      onMinutesGenerated?.(result.minutes);
      setFile(null);
      setTranscriptText('');
    } else {
      setError(result.error || 'The minutes couldn’t be generated. Try again.');
    }
    setProcessing(false);
  };

  const pickFile = (picked) => {
    setError('');
    if (!picked) return;
    if (!isValidFile(picked)) {
      setError(`${picked.name} isn’t supported. Use an MP3, WAV, M4A, OGG or TXT file.`);
      return;
    }
    setFile(picked);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && !processing) pickFile(e.dataTransfer.files[0]);
  };

  return (
    <section className={`panel panel-glass upload ${disabled ? 'is-disabled' : ''}`} aria-label="New minutes">
      <div className="segmented" role="group" aria-label="Input type" data-active={inputMode}>
        <span className="segmented-thumb" aria-hidden="true" />
        <button
          type="button"
          aria-pressed={inputMode === 'file'}
          onClick={() => setInputMode('file')}
          disabled={disabled || processing}
        >
          Upload a file
        </button>
        <button
          type="button"
          aria-pressed={inputMode === 'text'}
          onClick={() => setInputMode('text')}
          disabled={disabled || processing}
        >
          Paste text
        </button>
      </div>

      {inputMode === 'file' ? (
        file ? (
          <div className="picked-file">
            <span className="picked-icon">{isAudio(file) ? <AudioIcon /> : <DocumentIcon />}</span>
            <div className="picked-info">
              <span className="picked-name">{file.name}</span>
              <span className="picked-meta">{isAudio(file) ? 'Audio' : 'Text'} · {formatFileSize(file.size)}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setFile(null)}
              disabled={processing}
              aria-label={`Remove ${file.name}`}
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <label
            className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="visually-hidden"
              accept=".txt,.mp3,.wav,.m4a,.ogg,.webm,audio/*,text/plain"
              onChange={(e) => { pickFile(e.target.files[0]); e.target.value = ''; }}
              disabled={disabled}
            />
            <span className="dropzone-icon"><UploadIcon /></span>
            <span className="dropzone-title">{isDragging ? 'Drop to add the file' : 'Drop a recording or transcript'}</span>
            <span className="dropzone-sub">or <u>choose a file</u> · MP3, WAV, M4A, OGG, TXT</span>
          </label>
        )
      ) : (
        <div className="paste">
          <label htmlFor="transcript" className="visually-hidden">Meeting transcript</label>
          <textarea
            id="transcript"
            className="input paste-area"
            placeholder="Paste the meeting transcript here"
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            disabled={disabled || processing}
          />
          <span className="paste-count">{transcriptText.length.toLocaleString()} characters</span>
        </div>
      )}

      {error && <p className="notice notice-error upload-error" role="alert">{error}</p>}

      <div className="upload-footer">
        {processing ? (
          <div className="progress" role="status">
            <span className="progress-bar" aria-hidden="true"><span /></span>
            <span className="progress-text">
              {inputMode === 'file' && file && isAudio(file)
                ? 'Transcribing the audio, then writing the minutes. Long recordings take longer.'
                : 'Writing the minutes from your transcript.'}
            </span>
          </div>
        ) : (
          <p className="upload-hint">You can review and edit everything before making the PDF.</p>
        )}
        <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={!canGenerate}>
          {processing && <span className="spinner" aria-hidden="true" />}
          {processing ? 'Generating' : 'Generate minutes'}
        </button>
      </div>
    </section>
  );
};

export default Upload;
