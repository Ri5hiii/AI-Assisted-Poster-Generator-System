import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Download,
  RefreshCw,
  Palette,
  Calendar,
  MapPin,
  Type,
} from "lucide-react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    title: "",
    type: "College Event",
    date: "",
    venue: "",
    description: "",
    audience: "Students",
    style: "Modern",
    color: "Purple",
  });

  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posterImage, setPosterImage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [variation, setVariation] = useState(1);
  const [promptMode, setPromptMode] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const generatePoster = async (selectedVariation = variation) => {
  if (promptMode) {
    if (!userPrompt.trim()) {
      alert("Please describe the poster first.");
      return;
    }
  } else {
    if (!form.title || !form.description) {
      alert("Please enter an event title and description.");
      return;
    }
  }

  setLoading(true);
  setGenerated(false);
  setPosterImage(null);

  try {
    const response = await fetch(
      "http://localhost:5000/api/generate-poster",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          variation: selectedVariation,
          prompt: promptMode ? userPrompt : "",
        }),
      }
    );

    const data = await response.json();

    console.log("Backend status:", response.status);
    console.log("Backend data:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
        data.message ||
        "Poster generation failed."
      );
    }

    setPosterImage(data.image);
    setAiPrompt(data.prompt);
    setGenerated(true);

  } catch (error) {
    console.error("Generation error:", error);
    alert("Could not generate the poster. Check the backend terminal.");
  } finally {
    setLoading(false);
  }
};

  const resetPoster = () => {
    setGenerated(false);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span>Poster<span className="gradient-text">AI</span></span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#create">Create</a>
          <a href="#about">About</a>
        </div>

        <button className="nav-button">
          <Sparkles size={16} />
          AI Powered
        </button>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="badge">
          <Sparkles size={15} />
          AI-ASSISTED DESIGN
        </div>

        <h1>
          Create stunning posters
          <br />
          <span className="gradient-text">with the power of AI.</span>
        </h1>

        <p>
          Transform your event ideas into professional, eye-catching posters
          in seconds.
        </p>

        <a href="#create" className="hero-button">
          <Wand2 size={19} />
          Create Your Poster
        </a>
      </section>

      {/* Generator */}
      <section className="generator-section" id="create">
        <div className="section-heading">
          <span>01</span>
          <div>
            <h2>Tell us about your event</h2>
            <p>Provide a few details and let AI handle the creativity.</p>
          </div>
        </div>
        <div className="creation-mode">
            <button
              type="button"
              className={!promptMode ? "mode-button active" : "mode-button"}
              onClick={() => setPromptMode(false)}
            >
              📋 Smart Form
            </button>
            
            <button
              type="button"
              className={promptMode ? "mode-button active" : "mode-button"}
              onClick={() => setPromptMode(true)}
            >
              ✨ AI Prompt
            </button>
          </div>
        <div className="generator-grid">

  {promptMode && (
    <div className="prompt-mode-card">
      <label>✨ Describe your poster</label>

      <textarea
        className="ai-prompt-input"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Example: Create a futuristic college hackathon poster with neon blue and purple colors, glowing technology elements, bold typography and a premium modern look."
        rows="7"
      />

      <p className="prompt-hint">
        Describe the event, style, colors, mood, audience or visual elements you want.
      </p>

      <button
        type="button"
        className="enhance-prompt-button"
        onClick={() => {
          if (!userPrompt.trim()) {
            alert("Please describe the poster first.");
            return;
          }

          setUserPrompt(
            `${userPrompt.trim()}. Create a professional promotional poster with strong visual hierarchy, attractive typography, balanced composition and social-media-ready design.`
          );
        }}
      >
        ✨ Improve My Prompt
      </button>
    </div>
  )}

  {/* Form */}
  <div className="form-card">
            <div className="field">
              <label>
                <Type size={16} />
                Event Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Tech Fest 2026"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="two-columns">
              <div className="field">
                <label>Event Type</label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option>College Event</option>
                  <option>Conference</option>
                  <option>Workshop</option>
                  <option>Festival</option>
                  <option>Business Event</option>
                  <option>Campaign</option>
                </select>
              </div>

              <div className="field">
                <label>
                  <Calendar size={16} />
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>
                <MapPin size={16} />
                Venue
              </label>

              <input
                type="text"
                name="venue"
                placeholder="e.g. Main Auditorium"
                value={form.venue}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Event Description</label>

              <textarea
                name="description"
                placeholder="Describe your event..."
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="two-columns">
              <div className="field">
                <label>Target Audience</label>

                <select
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                >
                  <option>Students</option>
                  <option>Professionals</option>
                  <option>General Public</option>
                  <option>Business Owners</option>
                </select>
              </div>

              <div className="field">
                <label>Design Style</label>

                <select
                  name="style"
                  value={form.style}
                  onChange={handleChange}
                >
                  <option>Modern</option>
                  <option>Minimal</option>
                  <option>Futuristic</option>
                  <option>Elegant</option>
                  <option>Creative</option>
                  <option>Corporate</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>
                <Palette size={16} />
                Color Theme
              </label>

              <div className="color-options">
                {["Purple", "Blue", "Red", "Green", "Orange"].map((color) => (
                  <button
                    key={color}
                    className={`color-option ${
                      form.color === color ? "selected" : ""
                    }`}
                    onClick={() =>
                      setForm({
                        ...form,
                        color,
                      })
                    }
                  >
                    <span className={`dot ${color.toLowerCase()}`}></span>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <button
            type="button"
              className="generate-button"
              onClick={() => generatePoster()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={19} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Generate Poster with AI
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="preview-area">
            <div className="preview-header">
              <div>
                <span>02</span>
                <h2>Poster Preview</h2>
              </div>

              {generated && (
                <button className="reset-button" onClick={resetPoster}>
                  <RefreshCw size={15} />
                  Regenerate
                </button>
              )}
            </div>

            <div
            className={`poster ${
              generated ? "poster-generated" : ""
            } style-${form.style.toLowerCase()} color-${form.color.toLowerCase()}`}
          >
            {!generated ? (
              <div className="empty-preview">
                <div className="empty-icon">
                  <Wand2 size={28} />
                </div>
            
                <h3>Your poster will appear here</h3>
            
                <p>
                  Fill in the details and click
                  <br />
                  "Generate Poster with AI"
                </p>
              </div>
            ) : (
              <div className="ai-poster-result">
                <img
                  src={posterImage}
                  alt="AI Generated Poster"
                  className="generated-poster-image"
                />
              </div>
            )}
          </div>

            {/* {generated && (
  <>
    <button
      className="download-button"
      onClick={() => {
        if (!posterImage) return;

        const link = document.createElement("a");
        link.href = posterImage;
        link.download = `${form.title || "AI-Poster"}.svg`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    >
      <Download size={18} />
      Download Poster
    </button>

    {aiPrompt && (
      <div className="prompt-card">
        <div className="prompt-title">
          <Sparkles size={16} />
          AI Design Prompt
        </div>

        <p>{aiPrompt}</p>
      </div>
    )}
  </>
)} */}
            {generated && (
  <>
    <button
  type="button"
  className="regenerate-button"
      onClick={() => {
        const nextVariation = variation + 1;
        setVariation(nextVariation);
        generatePoster(nextVariation);
      }}
      disabled={loading}
    >
      <RefreshCw size={17} />
      {loading ? "Generating..." : "Regenerate Variation"}
    </button>

    <button
  type="button"
  className="download-button"
      onClick={() => {
        if (!posterImage) return;

        const link = document.createElement("a");
        link.href = posterImage;
        link.download = `${form.title || "AI-Poster"}.svg`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    >
      <Download size={18} />
      Download Poster
    </button>
  </>
)}

{generated && aiPrompt && (
  <div className="prompt-card">
    <div className="prompt-title">
      <Sparkles size={16} />
      AI Design Prompt
    </div>

    <p>{aiPrompt}</p>
  </div>
)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="about">
        <div className="section-heading center">
          <span>03</span>
          <div>
            <h2>Designed for creativity</h2>
            <p>Everything you need to create professional promotional designs.</p>
          </div>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <Sparkles size={24} />
            <h3>AI Assisted</h3>
            <p>Turn simple ideas into creative visual concepts.</p>
          </div>

          <div className="feature-card">
            <Palette size={24} />
            <h3>Custom Styles</h3>
            <p>Choose colors, themes and visual styles for your poster.</p>
          </div>

          <div className="feature-card">
            <Download size={24} />
            <h3>Ready to Export</h3>
            <p>Generate and download posters ready for sharing.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2026 PosterAI • AI-Assisted Poster Design System</p>
      </footer>
    </div>
  );
}

export default App;