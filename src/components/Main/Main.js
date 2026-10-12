import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import Upload from '../Upload/Upload';
import Dialog from '../Dialog/Dialog';
import { CloseIcon } from '../icons';
import { getUser, getPdfTemplates, createPdf, getUserFiles, downloadBase64Pdf } from '../../useAPI';
import './Main.css';

const clone = (value) => JSON.parse(JSON.stringify(value));

const HUES = ['', 'var(--c-blue)', 'var(--c-violet)', 'var(--c-teal)', 'var(--c-amber)', 'var(--c-pink)'];

function Section({ no, title, onAdd, addLabel, children }) {
  return (
    <section className="sheet-section stagger" style={{ '--i': no, '--hue': HUES[no] }}>
      <div className="sheet-section-head">
        <span className="section-no">{String(no).padStart(2, '0')}</span>
        <h2>{title}</h2>
        {onAdd && (
          <button type="button" className="btn btn-ghost btn-small sheet-add" onClick={onAdd}>
            + {addLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

const Empty = () => <p className="sheet-empty">None recorded.</p>;

function RemoveButton({ label, onClick }) {
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label={label}>
      <CloseIcon />
    </button>
  );
}

function Main() {
  const [hasApiKey, setHasApiKey] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [generatedMinutes, setGeneratedMinutes] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [creatingPdf, setCreatingPdf] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfFilename, setPdfFilename] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState(null);
  const [filesCount, setFilesCount] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const userResult = await getUser();
      if (userResult.success) {
        const apiKey = userResult.ai_config?.api_key;
        setHasApiKey(apiKey && apiKey.trim() !== '');
        setUserStats(userResult.stats);
      } else {
        setLoadError(userResult.error || 'Your account couldn’t be loaded.');
      }

      const templateResult = await getPdfTemplates();
      if (templateResult.success) {
        setTemplates(templateResult.templates);
      }

      const filesResult = await getUserFiles();
      if (filesResult.success) {
        setFilesCount(filesResult.files?.length || 0);
      }

      setLoading(false);
    };
    initialize();
  }, []);

  const handleMinutesGenerated = (minutes) => {
    setGeneratedMinutes(minutes);
    setEditedMinutes(clone(minutes));
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
    setEditedMinutes(clone(generatedMinutes));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setGeneratedMinutes(editedMinutes);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedMinutes(clone(generatedMinutes));
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

  const updateObjectItem = (field, index, key, value) => {
    setEditedMinutes(prev => {
      const newItems = [...prev[field]];
      newItems[index] = { ...newItems[index], [key]: value };
      return { ...prev, [field]: newItems };
    });
  };

  const removeArrayItem = (field, index) => {
    setEditedMinutes(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addItem = (field, empty) => {
    setEditedMinutes(prev => ({ ...prev, [field]: [...(prev[field] || []), empty] }));
  };

  const handleOpenTemplateModal = () => {
    setShowTemplateModal(true);
    setPdfError('');
  };

  const handleConfirmTemplate = async () => {
    if (!generatedMinutes) return;

    setCreatingPdf(true);
    setPdfError('');

    const result = await createPdf({
      template: selectedTemplate,
      minutes: generatedMinutes,
      filename: `meeting-minutes-${Date.now()}.pdf`
    });

    if (result.success) {
      setPdfData(result.pdfData);
      setPdfFilename(result.filename);
      setShowTemplateModal(false);
      setShowPdfModal(true);
      setFilesCount(count => count + 1);
    } else {
      setPdfError(result.error || 'The PDF couldn’t be created. Try again.');
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

  const m = isEditing ? editedMinutes : generatedMinutes;

  const renderUpload = () => (
    <>
      <div className="hero">
        <h1 className="hero-title">Turn meetings into <span className="grad">clean minutes</span></h1>
        <p className="hero-lede">
          Upload a recording or paste a transcript. Check the draft, fix what’s off, and export a PDF.
        </p>
      </div>

      {loadError && (
        <p className="notice notice-error main-notice" role="alert">
          {loadError}
          <button type="button" className="btn btn-secondary btn-small notice-action" onClick={() => window.location.reload()}>
            Reload
          </button>
        </p>
      )}

      {!hasApiKey && !loadError && (
        <p className="notice notice-warn main-notice">
          Add an API key before generating minutes. Groq’s is free.
          <Link to="/profile" className="btn btn-secondary btn-small notice-action">Open settings</Link>
        </p>
      )}

      <Upload disabled={!hasApiKey} onMinutesGenerated={handleMinutesGenerated} />

      {(filesCount > 0 || userStats?.characters_processed > 0) && (
        <section className="usage" aria-label="Your usage">
          <Link to="/files" className="usage-tile" style={{ '--hue': 'var(--c-blue)' }}>
            <span className="usage-value">{filesCount}</span>
            <span className="usage-label">{filesCount === 1 ? 'PDF saved' : 'PDFs saved'} · open files</span>
          </Link>
          <div className="usage-tile" style={{ '--hue': 'var(--c-violet)' }}>
            <span className="usage-value">{(userStats?.characters_processed || 0).toLocaleString()}</span>
            <span className="usage-label">characters processed</span>
          </div>
          <div className="usage-tile" style={{ '--hue': 'var(--c-teal)' }}>
            <span className="usage-value">{Math.round((userStats?.audio_seconds_processed || 0) / 60)}</span>
            <span className="usage-label">audio minutes</span>
          </div>
        </section>
      )}
    </>
  );

  const renderMinutes = () => (
    <>
      <div className="sheet-toolbar">
        <p className="sheet-status">{isEditing ? 'Editing minutes' : 'Draft minutes, not saved yet'}</p>
        <div className="sheet-toolbar-actions">
          {isEditing ? (
            <>
              <button type="button" className="btn btn-secondary btn-small" onClick={handleCancelEdit}>Cancel</button>
              <button type="button" className="btn btn-primary btn-small" onClick={handleSaveEdit}>Save changes</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-small" onClick={handleNewTranscript}>Start over</button>
              <button type="button" className="btn btn-secondary btn-small" onClick={handleStartEdit}>Edit</button>
            </>
          )}
        </div>
      </div>

      <article className={`panel panel-glass sheet ${isEditing ? 'is-editing' : ''}`}>
        <header className="sheet-head stagger" style={{ '--i': 0 }}>
          {isEditing ? (
            <div className="field">
              <label className="field-label" htmlFor="m-title">Title</label>
              <input id="m-title" className="input sheet-title-input" value={m.title || ''}
                onChange={(e) => updateField('title', e.target.value)} />
            </div>
          ) : (
            <h1 className="sheet-title">{m.title || 'Untitled meeting'}</h1>
          )}

          {isEditing ? (
            <div className="sheet-meta-edit">
              <div className="field">
                <label className="field-label" htmlFor="m-date">Date</label>
                <input id="m-date" className="input" value={m.date || ''}
                  onChange={(e) => updateField('date', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="m-attendees">Attendees</label>
                <input id="m-attendees" className="input" value={m.attendees?.join(', ') || ''}
                  aria-describedby="m-attendees-hint"
                  onChange={(e) => updateField('attendees', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                <span id="m-attendees-hint" className="field-hint">Separate names with commas.</span>
              </div>
            </div>
          ) : (
            <dl className="sheet-meta">
              <div><dt>Date</dt><dd>{m.date || 'Not stated'}</dd></div>
              <div><dt>Attendees</dt><dd>{m.attendees?.length ? m.attendees.join(', ') : 'Not stated'}</dd></div>
            </dl>
          )}
        </header>

        <Section no={1} title="Summary">
          {isEditing ? (
            <textarea className="input" rows={4} aria-label="Summary" value={m.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)} />
          ) : (
            m.summary ? <p className="sheet-text">{m.summary}</p> : <Empty />
          )}
        </Section>

        <Section no={2} title="Discussion"
          onAdd={isEditing && (() => addItem('discussion_points', { topic: '', details: '' }))} addLabel="Add topic">
          {isEditing ? (
            m.discussion_points?.map((point, i) => (
              <div key={i} className="edit-row">
                <div className="edit-stack">
                  <input className="input" aria-label={`Topic ${i + 1}`} placeholder="Topic" value={point.topic}
                    onChange={(e) => updateObjectItem('discussion_points', i, 'topic', e.target.value)} />
                  <textarea className="input" rows={2} aria-label={`Topic ${i + 1} details`} placeholder="What was said"
                    value={point.details} onChange={(e) => updateObjectItem('discussion_points', i, 'details', e.target.value)} />
                </div>
                <RemoveButton label={`Remove topic ${i + 1}`} onClick={() => removeArrayItem('discussion_points', i)} />
              </div>
            ))
          ) : m.discussion_points?.length ? (
            <div className="topics">
              {m.discussion_points.map((point, i) => (
                <div key={i} className="topic">
                  <h3>{point.topic}</h3>
                  <p className="sheet-text">{point.details}</p>
                </div>
              ))}
            </div>
          ) : <Empty />}
        </Section>

        <Section no={3} title="Decisions" onAdd={isEditing && (() => addItem('decisions', ''))} addLabel="Add decision">
          {isEditing ? (
            m.decisions?.map((decision, i) => (
              <div key={i} className="edit-row">
                <input className="input" aria-label={`Decision ${i + 1}`} value={decision}
                  onChange={(e) => updateArrayItem('decisions', i, e.target.value)} />
                <RemoveButton label={`Remove decision ${i + 1}`} onClick={() => removeArrayItem('decisions', i)} />
              </div>
            ))
          ) : m.decisions?.length ? (
            <ul className="sheet-list">{m.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
          ) : <Empty />}
        </Section>

        <Section no={4} title="Action items"
          onAdd={isEditing && (() => addItem('action_items', { task: '', owner: '', due_date: '' }))} addLabel="Add action">
          {isEditing ? (
            m.action_items?.map((item, i) => (
              <div key={i} className="edit-row">
                <div className="edit-action">
                  <input className="input" aria-label={`Action ${i + 1} task`} placeholder="Task" value={item.task}
                    onChange={(e) => updateObjectItem('action_items', i, 'task', e.target.value)} />
                  <input className="input" aria-label={`Action ${i + 1} owner`} placeholder="Owner" value={item.owner}
                    onChange={(e) => updateObjectItem('action_items', i, 'owner', e.target.value)} />
                  <input className="input" aria-label={`Action ${i + 1} due date`} placeholder="Due" value={item.due_date || ''}
                    onChange={(e) => updateObjectItem('action_items', i, 'due_date', e.target.value)} />
                </div>
                <RemoveButton label={`Remove action ${i + 1}`} onClick={() => removeArrayItem('action_items', i)} />
              </div>
            ))
          ) : m.action_items?.length ? (
            <table className="actions-table">
              <thead><tr><th scope="col">Task</th><th scope="col">Owner</th><th scope="col">Due</th></tr></thead>
              <tbody>
                {m.action_items.map((item, i) => (
                  <tr key={i}>
                    <td data-label="Task">{item.task}</td>
                    <td data-label="Owner">{item.owner || 'Unassigned'}</td>
                    <td data-label="Due">{item.due_date || 'No date'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty />}
        </Section>

        <Section no={5} title="Next steps" onAdd={isEditing && (() => addItem('next_steps', ''))} addLabel="Add step">
          {isEditing ? (
            m.next_steps?.map((step, i) => (
              <div key={i} className="edit-row">
                <input className="input" aria-label={`Next step ${i + 1}`} value={step}
                  onChange={(e) => updateArrayItem('next_steps', i, e.target.value)} />
                <RemoveButton label={`Remove next step ${i + 1}`} onClick={() => removeArrayItem('next_steps', i)} />
              </div>
            ))
          ) : m.next_steps?.length ? (
            <ul className="sheet-list">{m.next_steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
          ) : <Empty />}
        </Section>
      </article>

      {!isEditing && (
        <div className="sheet-footer">
          <button type="button" className="btn btn-primary" onClick={handleOpenTemplateModal}>Create PDF</button>
        </div>
      )}
    </>
  );

  return (
    <div className="page">
      <NavBar />

      {loading ? (
        <div className="status page-main" role="status"><span className="spinner" />Loading your workspace</div>
      ) : (
        <main className="page-main">
          {generatedMinutes ? renderMinutes() : renderUpload()}
        </main>
      )}

      {showTemplateModal && (
        <Dialog
          title="Choose a PDF style"
          onClose={() => setShowTemplateModal(false)}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmTemplate} disabled={creatingPdf || !templates.length}>
                {creatingPdf && <span className="spinner" aria-hidden="true" />}
                {creatingPdf ? 'Creating PDF' : 'Create PDF'}
              </button>
            </>
          }
        >
          {templates.length ? (
            <fieldset className="templates">
              <legend className="visually-hidden">PDF style</legend>
              {templates.map((template) => (
                <label key={template.id} className="template">
                  <input
                    type="radio"
                    name="template"
                    className="visually-hidden"
                    value={template.id}
                    checked={selectedTemplate === template.id}
                    onChange={() => setSelectedTemplate(template.id)}
                  />
                  <span className="template-thumb" data-template={template.id} aria-hidden="true">
                    <span className="t-title" /><span className="t-rule" />
                    <span className="t-line" /><span className="t-line short" /><span className="t-line" />
                  </span>
                  <span className="template-name">{template.name}</span>
                  <span className="template-desc">{template.description}</span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="notice notice-error">The PDF styles couldn’t be loaded. Close this and try again.</p>
          )}
          {pdfError && <p className="notice notice-error template-error" role="alert">{pdfError}</p>}
        </Dialog>
      )}

      {showPdfModal && pdfData && (
        <Dialog
          title="Your PDF is ready"
          className="dialog-wide"
          onClose={handleBackToEdit}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={handleBackToTemplates}>Change style</button>
              <button type="button" className="btn btn-ghost" onClick={handleBackToEdit}>Back to minutes</button>
              <span className="pdf-saved">Saved to your files</span>
              <button type="button" className="btn btn-primary" onClick={() => downloadBase64Pdf(pdfData, pdfFilename)}>
                Download PDF
              </button>
            </>
          }
        >
          <iframe src={`data:application/pdf;base64,${pdfData}`} className="pdf-frame" title="PDF preview" />
        </Dialog>
      )}

      {!loading && <Footer />}
    </div>
  );
}

export default Main;
