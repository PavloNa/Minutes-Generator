import React from 'react';
import NavBar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import './About.css';

const STEPS = [
  {
    title: 'Add the meeting',
    body: 'Upload a recording (MP3, WAV, M4A, OGG) or a text transcript, or paste the transcript in.',
  },
  {
    title: 'Generate the minutes',
    body: 'Audio is transcribed on the server with Whisper, at no cost. The transcript is then sorted into a summary, discussion topics, decisions, action items and next steps by the AI provider you pick: Groq (free tier) or OpenAI.',
  },
  {
    title: 'Check and edit',
    body: 'Read the draft, fix names and dates, and add or remove items before anything is saved.',
  },
  {
    title: 'Create the PDF',
    body: 'Pick one of three styles (Professional, Minimal, Modern). The PDF is saved to your files and ready to download.',
  },
];

function About() {
  return (
    <div className="page">
      <NavBar />
      <main className="page-main about">
        <header className="about-head">
          <h1 className="page-title">About <span className="grad">Minutes Generator</span></h1>
          <p className="about-lede">
            A small tool for turning a meeting into written minutes you can send around. You bring the recording
            or transcript and an API key (Groq’s is free); it gives you an editable draft and a PDF.
          </p>
        </header>

        <section className="about-section" aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step">
                <span className="section-no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section" aria-labelledby="data">
          <h2 id="data">What gets stored</h2>
          <ul className="about-list">
            <li>Your account details and your API key. The key is encrypted before it’s stored.</li>
            <li>The PDFs you create, so you can open them again from Files.</li>
            <li>Usage totals: characters and audio minutes processed.</li>
            <li>Recordings are transcribed on the server and not kept. Transcripts are sent to your AI provider to write the minutes and aren’t kept in your account.</li>
          </ul>
        </section>

        <section className="about-section" aria-labelledby="stack">
          <h2 id="stack">Built with</h2>
          <p className="about-stack">React, FastAPI, MongoDB, faster-whisper for transcription, Groq or OpenAI for the minutes, ReportLab for the PDFs.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default About;
