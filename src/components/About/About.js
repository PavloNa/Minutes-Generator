import React from 'react';
import NavBar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-bg-orb"></div>
      <NavBar />
      <div className="about-container">
        <div className="about-hero">
          <h1>📋 About Minutes Generator</h1>
          <p className="about-tagline">Transform your meeting recordings into professional minutes in seconds</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>✨ What is Minutes Generator?</h2>
            <p>
              Minutes Generator is an AI-powered meeting minutes generator that saves you hours of manual work. 
              Whether you have a long audio recording of a team meeting or a rough transcript, our app 
              instantly transforms it into beautifully structured, professional meeting minutes ready 
              for sharing with your team.
            </p>
          </section>

          <section className="about-section">
            <h2>🚀 How It Works</h2>
            <div className="how-it-works">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Upload Your Content</h3>
                  <p>
                    Simply drag and drop an audio file (MP3, WAV, M4A) or paste your meeting transcript. 
                    You can also upload text files directly.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>AI Processing</h3>
                  <p>
                    Our advanced AI (powered by OpenAI's Whisper for transcription and GPT-4 for analysis) 
                    processes your content, identifying key discussion points, decisions, action items, 
                    and next steps.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Review & Edit</h3>
                  <p>
                    Review the generated minutes, make any adjustments, and fine-tune the content 
                    to match your exact needs with our intuitive editing interface.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Export as PDF</h3>
                  <p>
                    Choose from multiple professional templates and download your meeting minutes 
                    as a beautifully formatted PDF ready to share with stakeholders.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>🎯 Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">🎙️</span>
                <h3>Audio Transcription</h3>
                <p>Upload audio files and get accurate transcriptions using state-of-the-art AI.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🤖</span>
                <h3>Smart Analysis</h3>
                <p>AI automatically identifies key topics, decisions, and action items.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">✏️</span>
                <h3>Easy Editing</h3>
                <p>Full control to edit and refine your minutes before exporting.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📄</span>
                <h3>Multiple Templates</h3>
                <p>Choose from Professional, Minimal, or Modern PDF styles.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">☁️</span>
                <h3>Cloud Storage</h3>
                <p>All your generated minutes are saved and accessible anytime.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔐</span>
                <h3>Secure & Private</h3>
                <p>Your API key, your data. We don't store your meeting content.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>🛠️ Built With</h2>
            <div className="tech-stack">
              <span className="tech-badge">React</span>
              <span className="tech-badge">FastAPI</span>
              <span className="tech-badge">MongoDB</span>
              <span className="tech-badge">OpenAI Whisper</span>
              <span className="tech-badge">GPT-4</span>
              <span className="tech-badge">ReportLab</span>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;
