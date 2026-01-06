import React, { useState, useEffect } from 'react';
import NavBar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import { getUserFiles, getFile } from '../../useAPI';
import './Files.css';

function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    
    const result = await getUserFiles();
    
    if (result.success) {
      setFiles(result.files || []);
    } else {
      setError(result.error || 'Failed to load files');
    }
    
    setLoading(false);
  };

  const handleOpenFile = async (file) => {
    setLoadingFile(true);
    setSelectedFile(file);
    setFileData(null);
    
    const result = await getFile(file.filename);
    
    if (result.success) {
      setFileData(result.data);
    } else {
      setError(result.error || 'Failed to load file');
      setSelectedFile(null);
    }
    
    setLoadingFile(false);
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
    setFileData(null);
  };

  const handleDownload = () => {
    if (!fileData || !selectedFile) return;
    
    const byteCharacters = atob(fileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateLabel = (template) => {
    const labels = {
      professional: '🏢 Professional',
      minimal: '✨ Minimal',
      modern: '🎨 Modern'
    };
    return labels[template] || template;
  };

  return (
    <div className="files-page-wrapper">
      <NavBar />
      <div className="files-container">
        <div className="files-header">
          <h1>📁 My Files</h1>
          <p className="files-subtitle">View and download your generated meeting minutes</p>
        </div>

        {loading && (
          <div className="files-loading">
            <div className="loading-spinner"></div>
            <p>Loading your files...</p>
          </div>
        )}

        {error && !loading && (
          <div className="files-error">
            <span>❌</span>
            <p>{error}</p>
            <button onClick={loadFiles}>Try Again</button>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="files-empty">
            <div className="empty-icon">📄</div>
            <h3>No files yet</h3>
            <p>When you create PDF meeting minutes, they'll appear here.</p>
          </div>
        )}

        {!loading && files.length > 0 && (
          <div className="files-grid">
            {files.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <h3 className="file-title">{file.title || 'Meeting Minutes'}</h3>
                  <p className="file-name">{file.filename}</p>
                  <div className="file-meta">
                    <span className="file-template">{getTemplateLabel(file.template)}</span>
                    <span className="file-date">{formatDate(file.created_at)}</span>
                  </div>
                </div>
                <div className="file-actions">
                  <button 
                    className="file-open-btn"
                    onClick={() => handleOpenFile(file)}
                  >
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="modal-overlay">
            <div className="modal-container file-preview-modal">
              <div className="modal-header">
                <h2>📄 {selectedFile.title || selectedFile.filename}</h2>
                <button className="modal-close-btn" onClick={handleClosePreview}>×</button>
              </div>
              <div className="modal-body file-modal-body">
                {loadingFile ? (
                  <div className="file-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading file...</p>
                  </div>
                ) : fileData ? (
                  <div className="pdf-preview-wrapper">
                    <iframe 
                      src={`data:application/pdf;base64,${fileData}`}
                      className="pdf-preview-iframe"
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="file-error">
                    <p>Failed to load file preview</p>
                  </div>
                )}
              </div>
              <div className="modal-footer file-modal-footer">
                <button className="modal-cancel-btn" onClick={handleClosePreview}>
                  Close
                </button>
                <button 
                  className="download-pdf-btn" 
                  onClick={handleDownload}
                  disabled={!fileData}
                >
                  📥 Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Files;
