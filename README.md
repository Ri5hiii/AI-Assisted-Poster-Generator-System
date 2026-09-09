# 🎨 PosterAI – AI-Assisted Poster Generator System

PosterAI is a web-based poster design system that helps users create professional promotional posters quickly using event information, design preferences, and AI-assisted prompts.

The system provides a simple interface where users can enter event details, select a design style and color theme, or describe their desired poster using a natural-language prompt.

---

## 🚀 Features

### ✨ AI-Assisted Poster Creation
- Generate posters from event information.
- Describe the desired design using a natural-language prompt.
- AI-assisted prompt enhancement for improving design instructions.

### 🎨 Design Customization
Users can customize:
- Event title
- Event type
- Date
- Venue
- Event description
- Target audience
- Design style
- Color theme

### 🖌️ Multiple Design Styles
The system supports different visual styles such as:
- Modern
- Minimal
- Futuristic
- Elegant
- Creative
- Corporate

### 🌈 Color Themes
Available color themes include:
- Purple
- Blue
- Red
- Green
- Orange

### 🔄 Poster Variations
Users can regenerate the poster to create different visual variations while keeping the same event information.

### 📥 Download Poster
Generated posters can be downloaded directly from the application.

### 📱 Responsive Interface
The interface is designed to work across desktop and smaller screen sizes.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │       + Vite         │
                    └──────────┬───────────┘
                               │
                         HTTP Request
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Poster Generation    │
                    │   & SVG Renderer     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Generated Poster   │
                    │     SVG / Base64     │
                    └──────────────────────┘
