import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import Dialog from '../Dialog/Dialog';
import { DocumentIcon } from '../icons';
import { getUserFiles, getFile, restyleFile, downloadBase64Pdf } from '../../useAPI';
import './Files.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Date unknown';
  // Backend stores naive UTC timestamps; mark them as UTC so local time is right.
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(dateString) ? dateString : dateString + 'Z');
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STYLES = ['professional', 'minimal', 'modern'];

const templateLabel = (template) => template ? template.charAt(0).toUpperCase() + template.slice(1) : 'Unknown';

function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileError, setFileError] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [restyling, setRestyling] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    const result = await getUserFiles();
    if (result.success) {
      // Newest first: the file you just made is the one you're looking for.
      setFiles([...(result.files || [])].reverse());
    } else {
      setError(result.error || 'Your files couldn’t be loaded.');
    }
    setLoading(false);
  };

  const handleOpenFile = async (file) => {
    setSelectedFile(file);
    setFileData(null);
    setFileError('');
    setLoadingFile(true);
    const result = await getFile(file.filename);
    if (result.success) {
      setFileData(result.data);
    } else {
      setFileError(result.error || 'This file couldn’t be loaded.');
    }
    setLoadingFile(false);
  };

  const handleRestyle = async (template) => {
    setRestyling(template);
    setFileError('');
    const result = await restyleFile(selectedFile.filename, template);
    if (result.success) {
      setFileData(result.data);
      setSelectedFile((file) => ({ ...file, template }));
      setFiles((list) => list.map((f) => (f.filename === selectedFile.filename ? { ...f, template } : f)));
    } else {
      setFileError(result.error);
    }
    setRestyling('');
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
    setFileData(null);
  };

  return (
    <div className="page">
      <NavBar />
      <main className="page-main">
        <div className="page-head files-head">
          <div>
            <h1 className="page-title">Files</h1>
            <p className="page-lede">Every PDF you’ve created, newest first.</p>
          </div>
          {files.length > 0 && <Link to="/" className="btn btn-secondary btn-small">New minutes</Link>}
        </div>

        {loading && <div className="status" role="status"><span className="spinner" />Loading your files</div>}

        {!loading && error && (
          <p className="notice notice-error" role="alert">
            {error}
            <button type="button" className="btn btn-secondary btn-small notice-action" onClick={loadFiles}>Try again</button>
          </p>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="files-empty">
            <span className="files-empty-icon"><DocumentIcon /></span>
            <h2>No PDFs yet</h2>
            <p>Generate minutes from a recording or transcript, then create a PDF. It will be saved here.</p>
            <Link to="/" className="btn btn-primary">Generate your first minutes</Link>
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <ul className="panel file-list">
            {files.map((file, index) => (
              <li key={file.filename + index} className="file-row stagger" style={{ '--i': index }}>
                <span className="file-row-icon" data-template={file.template}><DocumentIcon /></span>
                <div className="file-row-info">
                  <span className="file-row-title">{file.title || 'Untitled meeting'}</span>
                  <span className="file-row-meta">
                    {formatDate(file.created_at)} · {templateLabel(file.template)} style
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => handleOpenFile(file)}
                  aria-label={`Open ${file.title || file.filename}`}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />

      {selectedFile && (
        <Dialog
          title={selectedFile.title || selectedFile.filename}
          className="dialog-wide"
          onClose={handleClosePreview}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={handleClosePreview}>Close</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => downloadBase64Pdf(fileData, selectedFile.filename)}
                disabled={!fileData}
              >
                Download PDF
              </button>
            </>
          }
        >
          <div className="restyle">
            <div className="restyle-buttons" role="group" aria-label="PDF style">
              {STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className="btn btn-secondary btn-small"
                  aria-pressed={selectedFile.template === style}
                  disabled={!selectedFile.restylable || !!restyling || loadingFile}
                  onClick={() => handleRestyle(style)}
                >
                  {restyling === style && <span className="spinner" aria-hidden="true" />}
                  {templateLabel(style)}
                </button>
              ))}
            </div>
            {!selectedFile.restylable && (
              <span className="field-hint">This PDF was made before styles could be changed. Generate it again to restyle it.</span>
            )}
          </div>
          {fileData && fileError && <p className="notice notice-error restyle-error" role="alert">{fileError}</p>}
          {loadingFile ? (
            <div className="status" role="status"><span className="spinner" />Loading the PDF</div>
          ) : fileData ? (
            <iframe src={`data:application/pdf;base64,${fileData}`} className="pdf-frame" title="PDF preview" />
          ) : (
            <p className="notice notice-error" role="alert">{fileError}</p>
          )}
        </Dialog>
      )}
    </div>
  );
}

export default Files;
