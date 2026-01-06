import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Upload from '../Upload/Upload';
import { getUser, getPdfTemplates, createPdf } from '../../useAPI';
import './Main.css';

function Main() {
  const [hasApiKey, setHasApiKey] = useState(true);
  const [loading, setLoading] = useState(true);
  const [generatedMinutes, setGeneratedMinutes] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [creatingPdf, setCreatingPdf] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfFilename, setPdfFilename] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState(null);
  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const userResult = await getUser();
      if (userResult.success) {
        const apiKey = userResult.ai_config?.api_key;
        setHasApiKey(apiKey && apiKey.trim() !== '');
      }
      
      const templateResult = await getPdfTemplates();
      if (templateResult.success) {
        setTemplates(templateResult.templates);
      }
      
      setLoading(false);
    };
    initialize();
  }, []);

  const handleMinutesGenerated = (minutes) => {
    setGeneratedMinutes(minutes);
    setEditedMinutes(JSON.parse(JSON.stringify(minutes)));
    setPdfData(null);
    setPdfFilename('');
    setPdfError('');
    setIsEditing(false);
  };

  const handleNewTranscript = () => {
    setGeneratedMinutes(null);
    setEditedMinutes(null);
    setPdfData(null);
    setPdfFilename('');
    setPdfError('');
    setIsEditing(false);
    setShowTemplateModal(false);
    setShowPdfModal(false);
  };

  const handleStartEdit = () => {
    setEditedMinutes(JSON.parse(JSON.stringify(generatedMinutes)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setGeneratedMinutes(editedMinutes);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedMinutes(JSON.parse(JSON.stringify(generatedMinutes)));
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedMinutes(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (field, index, value) => {
    setEditedMinutes(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const updateDiscussionPoint = (index, key, value) => {
    setEditedMinutes(prev => {
      const newPoints = [...prev.discussion_points];
      newPoints[index] = { ...newPoints[index], [key]: value };
      return { ...prev, discussion_points: newPoints };
    });
  };

  const updateActionItem = (index, key, value) => {
    setEditedMinutes(prev => {
      const newItems = [...prev.action_items];
      newItems[index] = { ...newItems[index], [key]: value };
      return { ...prev, action_items: newItems };
    });
  };

  const removeArrayItem = (field, index) => {
    setEditedMinutes(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addDecision = () => {
    setEditedMinutes(prev => ({
      ...prev,
      decisions: [...(prev.decisions || []), '']
    }));
  };

  const addNextStep = () => {
    setEditedMinutes(prev => ({
      ...prev,
      next_steps: [...(prev.next_steps || []), '']
    }));
  };

  const addDiscussionPoint = () => {
    setEditedMinutes(prev => ({
      ...prev,
      discussion_points: [...(prev.discussion_points || []), { topic: '', details: '' }]
    }));
  };

  const addActionItem = () => {
    setEditedMinutes(prev => ({
      ...prev,
      action_items: [...(prev.action_items || []), { task: '', owner: '', due_date: '' }]
    }));
  };

  const handleOpenTemplateModal = () => {
    setShowTemplateModal(true);
    setPdfError('');
  };

  const handleConfirmTemplate = async () => {
    if (!generatedMinutes) return;
    
    setCreatingPdf(true);
    setPdfError('');
    
    const filename = `meeting-minutes-${Date.now()}.pdf`;
    
    const result = await createPdf({
      template: selectedTemplate,
      minutes: generatedMinutes,
      filename: filename
    });
    
    if (result.success) {
      setPdfData(result.pdfData);
      setPdfFilename(result.filename);
      setShowTemplateModal(false);
      setShowPdfModal(true);
    } else {
      setPdfError(result.error || 'Failed to create PDF');
    }
    
    setCreatingPdf(false);
  };

  const handleBackToTemplates = () => {
    setShowPdfModal(false);
    setShowTemplateModal(true);
  };

  const handleBackToEdit = () => {
    setShowPdfModal(false);
    setShowTemplateModal(false);
  };

  const handleDownloadPdf = () => {
    if (!pdfData) return;
    
    const byteCharacters = atob(pdfData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFilename || 'meeting-minutes.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <NavBar />
      {!loading && !hasApiKey && (
        <div className="api-setup-banner">
          <span className="banner-icon">⚠️</span>
          <p>You haven't configured your AI API key yet.</p>
          <button onClick={() => navigate('/profile')}>Set up in Profile →</button>
        </div>
      )}
      
      {!loading && !generatedMinutes && (
        <div className="main-content">
          <Upload disabled={!hasApiKey} onMinutesGenerated={handleMinutesGenerated} />
        </div>
      )}
      
      {generatedMinutes && !showTemplateModal && !showPdfModal && (
        <div className="main-content">
          <div className="minutes-result">
            <div className="minutes-header">
              {isEditing ? (
                <input
                  type="text"
                  className="edit-title-input"
                  value={editedMinutes?.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Meeting Title"
                />
              ) : (
                <h2>📋 {generatedMinutes.title || 'Generated Meeting Minutes'}</h2>
              )}
              <div className="header-actions">
                {!isEditing && (
                  <button className="edit-btn" onClick={handleStartEdit}>
                    ✏️ Edit
                  </button>
                )}
                <button className="new-transcript-btn" onClick={handleNewTranscript}>
                  + New Transcript
                </button>
              </div>
            </div>
            
            {isEditing && (
              <div className="edit-actions-top">
                <button className="save-edit-btn" onClick={handleSaveEdit}>✅ Save Changes</button>
                <button className="cancel-edit-btn" onClick={handleCancelEdit}>Cancel</button>
              </div>
            )}
            
            <div className="minutes-content">
              <div className="minutes-meta">
                {isEditing ? (
                  <>
                    <label className="edit-label">Date:</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={editedMinutes?.date || ''}
                      onChange={(e) => updateField('date', e.target.value)}
                      placeholder="Meeting Date"
                    />
                    <label className="edit-label">Attendees (comma-separated):</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={editedMinutes?.attendees?.join(', ') || ''}
                      onChange={(e) => updateField('attendees', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      placeholder="e.g., John, Sarah, Mike"
                    />
                  </>
                ) : (
                  <>
                    <p><strong>Date:</strong> {generatedMinutes.date || 'Not specified'}</p>
                    {generatedMinutes.attendees?.length > 0 && (
                      <p><strong>Attendees:</strong> {generatedMinutes.attendees.join(', ')}</p>
                    )}
                  </>
                )}
              </div>

              <div className="minutes-section">
                <h3>Summary</h3>
                {isEditing ? (
                  <textarea
                    className="edit-textarea"
                    value={editedMinutes?.summary || ''}
                    onChange={(e) => updateField('summary', e.target.value)}
                    placeholder="Meeting summary..."
                    rows={4}
                  />
                ) : (
                  generatedMinutes.summary && <p>{generatedMinutes.summary}</p>
                )}
              </div>

              <div className="minutes-section">
                <div className="section-header">
                  <h3>Discussion Points</h3>
                  {isEditing && (
                    <button className="add-item-btn" onClick={addDiscussionPoint}>+ Add</button>
                  )}
                </div>
                {isEditing ? (
                  editedMinutes?.discussion_points?.map((point, i) => (
                    <div key={i} className="edit-discussion-point">
                      <input
                        type="text"
                        className="edit-input"
                        value={point.topic}
                        onChange={(e) => updateDiscussionPoint(i, 'topic', e.target.value)}
                        placeholder="Topic"
                      />
                      <textarea
                        className="edit-textarea-small"
                        value={point.details}
                        onChange={(e) => updateDiscussionPoint(i, 'details', e.target.value)}
                        placeholder="Details"
                        rows={2}
                      />
                      <button className="remove-item-btn" onClick={() => removeArrayItem('discussion_points', i)}>×</button>
                    </div>
                  ))
                ) : (
                  generatedMinutes.discussion_points?.map((point, i) => (
                    <div key={i} className="discussion-point">
                      <h4>{point.topic}</h4>
                      <p>{point.details}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="minutes-section">
                <div className="section-header">
                  <h3>Decisions Made</h3>
                  {isEditing && (
                    <button className="add-item-btn" onClick={addDecision}>+ Add</button>
                  )}
                </div>
                {isEditing ? (
                  editedMinutes?.decisions?.map((decision, i) => (
                    <div key={i} className="edit-list-item">
                      <input
                        type="text"
                        className="edit-input"
                        value={decision}
                        onChange={(e) => updateArrayItem('decisions', i, e.target.value)}
                        placeholder="Decision"
                      />
                      <button className="remove-item-btn" onClick={() => removeArrayItem('decisions', i)}>×</button>
                    </div>
                  ))
                ) : (
                  generatedMinutes.decisions?.length > 0 && (
                    <ul>
                      {generatedMinutes.decisions.map((decision, i) => (
                        <li key={i}>{decision}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>

              <div className="minutes-section">
                <div className="section-header">
                  <h3>Action Items</h3>
                  {isEditing && (
                    <button className="add-item-btn" onClick={addActionItem}>+ Add</button>
                  )}
                </div>
                {isEditing ? (
                  editedMinutes?.action_items?.map((item, i) => (
                    <div key={i} className="edit-action-item">
                      <input
                        type="text"
                        className="edit-input"
                        value={item.task}
                        onChange={(e) => updateActionItem(i, 'task', e.target.value)}
                        placeholder="Task"
                      />
                      <input
                        type="text"
                        className="edit-input-small"
                        value={item.owner}
                        onChange={(e) => updateActionItem(i, 'owner', e.target.value)}
                        placeholder="Owner"
                      />
                      <input
                        type="text"
                        className="edit-input-small"
                        value={item.due_date || ''}
                        onChange={(e) => updateActionItem(i, 'due_date', e.target.value)}
                        placeholder="Due Date"
                      />
                      <button className="remove-item-btn" onClick={() => removeArrayItem('action_items', i)}>×</button>
                    </div>
                  ))
                ) : (
                  generatedMinutes.action_items?.length > 0 && (
                    <div className="action-items">
                      {generatedMinutes.action_items.map((item, i) => (
                        <div key={i} className="action-item">
                          <span className="action-task">{item.task}</span>
                          <span className="action-owner">👤 {item.owner}</span>
                          {item.due_date && <span className="action-due">📅 {item.due_date}</span>}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="minutes-section">
                <div className="section-header">
                  <h3>Next Steps</h3>
                  {isEditing && (
                    <button className="add-item-btn" onClick={addNextStep}>+ Add</button>
                  )}
                </div>
                {isEditing ? (
                  editedMinutes?.next_steps?.map((step, i) => (
                    <div key={i} className="edit-list-item">
                      <input
                        type="text"
                        className="edit-input"
                        value={step}
                        onChange={(e) => updateArrayItem('next_steps', i, e.target.value)}
                        placeholder="Next step"
                      />
                      <button className="remove-item-btn" onClick={() => removeArrayItem('next_steps', i)}>×</button>
                    </div>
                  ))
                ) : (
                  generatedMinutes.next_steps?.length > 0 && (
                    <ul>
                      {generatedMinutes.next_steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="minutes-actions">
                <button className="create-pdf-btn" onClick={handleOpenTemplateModal}>
                  Create PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="modal-container template-modal">
            <div className="modal-header">
              <h2>📄 Select PDF Template</h2>
              <button className="modal-close-btn" onClick={() => setShowTemplateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Choose a template style for your meeting minutes PDF</p>
              <div className="template-grid">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="template-preview" data-template={template.id}>
                      <div className="preview-header"></div>
                      <div className="preview-line"></div>
                      <div className="preview-line short"></div>
                      <div className="preview-line"></div>
                    </div>
                    <span className="template-card-name">{template.name}</span>
                    <span className="template-card-desc">{template.description}</span>
                  </button>
                ))}
              </div>
              {pdfError && (
                <div className="pdf-error">
                  ❌ {pdfError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-confirm-btn" 
                onClick={handleConfirmTemplate}
                disabled={creatingPdf}
              >
                {creatingPdf ? (
                  <>
                    <span className="spinner"></span>
                    Creating...
                  </>
                ) : (
                  'Confirm & Create'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfModal && pdfData && (
        <div className="modal-overlay">
          <div className="modal-container pdf-modal">
            <div className="modal-header">
              <h2>📄 Your PDF is Ready</h2>
              <button className="modal-close-btn" onClick={handleBackToEdit}>×</button>
            </div>
            <div className="modal-body pdf-modal-body">
              <div className="pdf-preview-wrapper">
                <iframe 
                  src={`data:application/pdf;base64,${pdfData}`}
                  className="pdf-preview-iframe"
                  title="PDF Preview"
                />
              </div>
            </div>
            <div className="modal-footer pdf-modal-footer">
              <div className="pdf-footer-left">
                <button className="modal-back-btn" onClick={handleBackToTemplates}>
                  ← Change Template
                </button>
                <button className="modal-back-btn" onClick={handleBackToEdit}>
                  ✏️ Edit Data
                </button>
              </div>
              <div className="pdf-footer-right">
                <span className="pdf-saved-badge">✅ Saved to your files</span>
                <button className="download-pdf-btn" onClick={handleDownloadPdf}>
                  📥 Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Main;
