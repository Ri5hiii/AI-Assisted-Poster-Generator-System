require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "PosterAI Backend is running!",
    status: "success",
  });
});

// Escape text so it is safe inside SVG
function escapeXml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generate a poster locally for development/demo mode
function createDemoPoster(data) {
  const {
    title,
    type,
    date,
    venue,
    description,
    audience,
    style,
    color,
    variation = 1,
  } = data;

  const themes = {
    Purple: {
      primary: "#a855f7",
      secondary: "#7c3aed",
      background: "#100b1c",
    },
    Blue: {
      primary: "#38bdf8",
      secondary: "#2563eb",
      background: "#07121f",
    },
    Red: {
      primary: "#f87171",
      secondary: "#dc2626",
      background: "#1c0808",
    },
    Green: {
      primary: "#4ade80",
      secondary: "#16a34a",
      background: "#06150d",
    },
    Orange: {
      primary: "#fb923c",
      secondary: "#ea580c",
      background: "#1c0d05",
    },
  };

  const theme = themes[color] || themes.Purple;

  const styles = {
  Modern: {
    font: "Arial, sans-serif",
    titleSize: 76,
    titleWeight: "bold",
    radius: 35,
    pattern: "circles",
  },

  Minimal: {
    font: "Helvetica, Arial, sans-serif",
    titleSize: 68,
    titleWeight: "normal",
    radius: 10,
    pattern: "minimal",
  },

  Futuristic: {
    font: "Arial, sans-serif",
    titleSize: 72,
    titleWeight: "bold",
    radius: 0,
    pattern: "grid",
  },

  Elegant: {
    font: "Georgia, serif",
    titleSize: 70,
    titleWeight: "normal",
    radius: 45,
    pattern: "elegant",
  },

  Creative: {
    font: "Arial, sans-serif",
    titleSize: 78,
    titleWeight: "bold",
    radius: 50,
    pattern: "creative",
  },

  Corporate: {
    font: "Arial, sans-serif",
    titleSize: 62,
    titleWeight: "bold",
    radius: 8,
    pattern: "corporate",
  },
};

const selectedStyle = styles[style] || styles.Modern;
const variationNumber = Number(variation) || 1;

const variationDecor = {
  1: `
    <circle
      cx="850"
      cy="180"
      r="380"
      fill="url(#glow)"
    />
    <circle
      cx="100"
      cy="1150"
      r="300"
      fill="url(#glow)"
    />
  `,

  2: `
    <rect
      x="0"
      y="0"
      width="1024"
      height="1280"
      fill="none"
      stroke="${theme.primary}"
      stroke-width="18"
      opacity="0.35"
    />

    <circle
      cx="80"
      cy="250"
      r="180"
      fill="url(#glow)"
    />
  `,

  3: `
    <path
      d="M0 950 L1024 400"
      stroke="${theme.primary}"
      stroke-width="160"
      opacity="0.12"
    />

    <circle
      cx="900"
      cy="150"
      r="250"
      fill="url(#glow)"
    />
  `,

  4: `
    <rect
      x="120"
      y="120"
      width="784"
      height="1040"
      rx="20"
      fill="none"
      stroke="${theme.primary}"
      stroke-width="4"
      opacity="0.8"
    />

    <rect
      x="150"
      y="150"
      width="724"
      height="980"
      rx="15"
      fill="none"
      stroke="${theme.secondary}"
      stroke-width="2"
      opacity="0.5"
    />
  `,

  5: `
    <circle
      cx="50"
      cy="100"
      r="260"
      fill="${theme.primary}"
      opacity="0.18"
    />

    <circle
      cx="980"
      cy="1150"
      r="320"
      fill="${theme.secondary}"
      opacity="0.18"
    />

    <path
      d="M0 300 Q500 600 1024 250"
      fill="none"
      stroke="${theme.primary}"
      stroke-width="35"
      opacity="0.25"
    />
  `,
};

const currentVariation =
  variationDecor[((variationNumber - 1) % 5) + 1];
const variationTransforms = {
  1: "",
  2: `<g transform="translate(-90,20) rotate(-2 512 640)">`,
  3: `<g transform="translate(70,0) rotate(2 512 640)">`,
  4: `<g transform="translate(0,45) scale(0.92)">`,
  5: `<g transform="translate(0,-25) scale(1.06)">`,
};

const currentTransform =
  variationTransforms[((Number(variation) - 1) % 5) + 1];

  const svg = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1024"
    height="1280"
    viewBox="0 0 1024 1280"
  >

    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${theme.background}"/>
        <stop offset="100%" stop-color="#08090d"/>
      </linearGradient>

      <radialGradient id="glow">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect width="1024" height="1280" fill="url(#bg)"/>

${currentVariation}

${currentTransform}

${currentVariation}

${
  selectedStyle.pattern === "grid"
    ? `
      <defs>
        <pattern
          id="grid"
          width="45"
          height="45"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 45 0 L 0 0 0 45"
            fill="none"
            stroke="${theme.primary}"
            stroke-opacity="0.12"
            stroke-width="1"
          />
        </pattern>
      </defs>

      <rect
        width="1024"
        height="1280"
        fill="url(#grid)"
      />
    `
    : ""
}

${
  selectedStyle.pattern === "minimal"
    ? `
      <rect
        x="130"
        y="150"
        width="764"
        height="980"
        fill="white"
        opacity="0.96"
      />
    `
    : ""
}

${
  selectedStyle.pattern === "creative"
    ? `
      <circle
        cx="130"
        cy="180"
        r="130"
        fill="${theme.primary}"
        opacity="0.45"
      />

      <circle
        cx="880"
        cy="1050"
        r="190"
        fill="${theme.secondary}"
        opacity="0.45"
      />

      <path
        d="M0 900 Q300 650 600 900 T1200 800"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="25"
        opacity="0.25"
      />
    `
    : ""
}

${
  selectedStyle.pattern === "elegant"
    ? `
      <rect
        x="110"
        y="110"
        width="804"
        height="1060"
        rx="45"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="3"
        opacity="0.65"
      />

      <rect
        x="125"
        y="125"
        width="774"
        height="1030"
        rx="40"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="1"
        opacity="0.35"
      />
    `
    : ""
}

${
  selectedStyle.pattern === "corporate"
    ? `
      <rect
        x="80"
        y="80"
        width="25"
        height="1120"
        fill="${theme.primary}"
      />

      <rect
        x="80"
        y="80"
        width="864"
        height="12"
        fill="${theme.primary}"
      />
    `
    : ""
}

    ${
  selectedStyle.pattern === "circles" ||
  selectedStyle.pattern === "creative"
    ? `
      <circle
        cx="850"
        cy="180"
        r="380"
        fill="url(#glow)"
      />

      <circle
        cx="100"
        cy="1150"
        r="300"
        fill="url(#glow)"
      />
    `
    : ""
}

    <circle
      cx="850"
      cy="180"
      r="260"
      fill="none"
      stroke="${theme.primary}"
      stroke-opacity="0.18"
      stroke-width="2"
    />

    <circle
      cx="850"
      cy="180"
      r="190"
      fill="none"
      stroke="${theme.primary}"
      stroke-opacity="0.12"
      stroke-width="2"
    />

    <rect
      x="80"
      y="80"
      width="864"
      height="1120"
      rx="${selectedStyle.radius}"
      fill="none"
      stroke="white"
      stroke-opacity="0.10"
      stroke-width="2"
    />

    <text
      x="512"
      y="180"
      text-anchor="middle"
      fill="${theme.primary}"
      font-family="${selectedStyle.font}"
      font-size="${selectedStyle.titleSize}"
      font-weight="${selectedStyle.titleWeight}"
      letter-spacing="5"
    >
      ${escapeXml(type).toUpperCase()}
    </text>

    <text
      x="512"
      y="400"
      text-anchor="middle"
      fill="white"
      font-family="Arial, sans-serif"
      font-size="76"
      font-weight="bold"
    >
      ${escapeXml(title)}
    </text>

    <rect
      x="462"
      y="455"
      width="100"
      height="7"
      rx="4"
      fill="${theme.primary}"
    />

    <text
      x="512"
      y="545"
      text-anchor="middle"
      fill="#c7c7d0"
      font-family="Arial, sans-serif"
      font-size="25"
    >
      ${escapeXml(description)}
    </text>

    <text
      x="512"
      y="690"
      text-anchor="middle"
      fill="white"
      font-family="Arial, sans-serif"
      font-size="28"
      font-weight="bold"
    >
      ${escapeXml(date || "Date to be announced")}
    </text>

    <text
      x="512"
      y="745"
      text-anchor="middle"
      fill="#a9a9b4"
      font-family="Arial, sans-serif"
      font-size="23"
    >
      ${escapeXml(venue || "Venue to be announced")}
    </text>

    <rect
      x="260"
      y="850"
      width="504"
      height="2"
      fill="${theme.primary}"
      opacity="0.35"
    />

    <text
      x="512"
      y="930"
      text-anchor="middle"
      fill="#888894"
      font-family="Arial, sans-serif"
      font-size="18"
      letter-spacing="3"
    >
      DESIGNED FOR ${escapeXml(audience).toUpperCase()}
    </text>

    <text
      x="512"
      y="1040"
      text-anchor="middle"
      fill="${theme.primary}"
      font-family="Arial, sans-serif"
      font-size="20"
      font-weight="bold"
      letter-spacing="3"
    >
      ${escapeXml(style).toUpperCase()} • AI ASSISTED
    </text>

    <text
      x="512"
      y="1120"
      text-anchor="middle"
      fill="#555560"
      font-family="Arial, sans-serif"
      font-size="16"
    >
      PosterAI • AI-Assisted Poster Design System
    </text>
    ${currentTransform ? `</g>` : ""}
  </svg>
  `;

  return Buffer.from(svg).toString("base64");
}


app.post("/api/generate-poster", async (req, res) => {
  try {
    const {
      title,
      type,
      date,
      venue,
      description,
      audience,
      style,
      color,
      variation = 1,
    } = req.body;

    console.log("\n========== POSTER REQUEST ==========");
    console.log(req.body);

    // This is the AI prompt our system prepares.
    const aiPrompt = `
Create a professional promotional poster.

Event: ${title}
Type: ${type}
Date: ${date}
Venue: ${venue}
Description: ${description}
Target audience: ${audience}
Design style: ${style}
Color theme: ${color}

Use strong visual hierarchy, professional typography,
attractive composition and a design suitable for social media.
`;
    
    console.log("\nGenerated AI Prompt:");
    console.log(aiPrompt);

    // DEMO MODE
    // This allows development without API credits.
    const imageBase64 = createDemoPoster({
  ...req.body,
  variation,
});
    const imageData = `data:image/svg+xml;base64,${imageBase64}`;

    console.log("Poster created successfully.");
    console.log("Sending response to React...");

    res.status(200).json({
      success: true,
      mode: "demo",
      prompt: aiPrompt,
      image: imageData,
    });

    } catch (error) {
  console.error("POSTER ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Failed to generate poster.",
    error: String(error),
  });
}
});


app.listen(PORT, () => {
  console.log(`PosterAI Backend running on http://localhost:${PORT}`);
  console.log("Mode: DEMO");
});