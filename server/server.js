require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "PosterAI Backend is running!",
    status: "success",
    mode: "DEMO",
  });
});

function escapeXml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createDemoPoster(data) {
  const {
    title = "AI EVENT",
    type = "College Event",
    date = "",
    venue = "",
    description = "An exciting college event",
    audience = "Students",
    style = "Modern",
    color = "Purple",
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

  const variationNumber = ((Number(variation) - 1) % 5) + 1;

  let decoration = "";

  if (variationNumber === 1) {
    decoration = `
      <circle
        cx="850"
        cy="170"
        r="360"
        fill="url(#glow)"
      />

      <circle
        cx="100"
        cy="1130"
        r="280"
        fill="url(#glow)"
      />
    `;
  }

  if (variationNumber === 2) {
    decoration = `
      <rect
        x="25"
        y="25"
        width="974"
        height="1230"
        rx="35"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="10"
        opacity="0.35"
      />

      <circle
        cx="100"
        cy="200"
        r="180"
        fill="url(#glow)"
      />
    `;
  }

  if (variationNumber === 3) {
    decoration = `
      <path
        d="M0 1000 L1024 350"
        stroke="${theme.primary}"
        stroke-width="180"
        opacity="0.10"
      />

      <circle
        cx="900"
        cy="150"
        r="260"
        fill="url(#glow)"
      />
    `;
  }

  if (variationNumber === 4) {
    decoration = `
      <rect
        x="100"
        y="100"
        width="824"
        height="1080"
        rx="30"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="4"
        opacity="0.7"
      />

      <rect
        x="120"
        y="120"
        width="784"
        height="1040"
        rx="25"
        fill="none"
        stroke="${theme.secondary}"
        stroke-width="2"
        opacity="0.5"
      />
    `;
  }

  if (variationNumber === 5) {
    decoration = `
      <circle
        cx="50"
        cy="100"
        r="250"
        fill="${theme.primary}"
        opacity="0.18"
      />

      <circle
        cx="980"
        cy="1150"
        r="300"
        fill="${theme.secondary}"
        opacity="0.18"
      />

      <path
        d="M0 300 Q500 600 1024 250"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="30"
        opacity="0.25"
      />
    `;
  }

  let styleDecoration = "";

  if (style === "Futuristic") {
    styleDecoration = `
      <defs>
        <pattern
          id="grid"
          width="45"
          height="45"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M45 0 L0 0 0 45"
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
    `;
  }

  if (style === "Elegant") {
    styleDecoration = `
      <rect
        x="90"
        y="90"
        width="844"
        height="1100"
        rx="40"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="3"
        opacity="0.7"
      />

      <rect
        x="110"
        y="110"
        width="804"
        height="1060"
        rx="35"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="1"
        opacity="0.4"
      />
    `;
  }

  if (style === "Creative") {
    styleDecoration = `
      <circle
        cx="120"
        cy="180"
        r="130"
        fill="${theme.primary}"
        opacity="0.35"
      />

      <circle
        cx="900"
        cy="1050"
        r="190"
        fill="${theme.secondary}"
        opacity="0.35"
      />

      <path
        d="M0 900 Q300 650 600 900 T1100 800"
        fill="none"
        stroke="${theme.primary}"
        stroke-width="25"
        opacity="0.3"
      />
    `;
  }

  if (style === "Corporate") {
    styleDecoration = `
      <rect
        x="65"
        y="65"
        width="25"
        height="1150"
        fill="${theme.primary}"
      />

      <rect
        x="65"
        y="65"
        width="894"
        height="12"
        fill="${theme.primary}"
      />
    `;
  }

  const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1024"
  height="1280"
  viewBox="0 0 1024 1280"
>

  <defs>

    <linearGradient
      id="bg"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop
        offset="0%"
        stop-color="${theme.background}"
      />

      <stop
        offset="100%"
        stop-color="#08090d"
      />
    </linearGradient>

    <radialGradient id="glow">

      <stop
        offset="0%"
        stop-color="${theme.primary}"
        stop-opacity="0.5"
      />

      <stop
        offset="100%"
        stop-color="${theme.primary}"
        stop-opacity="0"
      />

    </radialGradient>

  </defs>

  <rect
    width="1024"
    height="1280"
    fill="url(#bg)"
  />

  ${decoration}

  ${styleDecoration}

  <rect
    x="55"
    y="55"
    width="914"
    height="1170"
    rx="25"
    fill="none"
    stroke="white"
    stroke-opacity="0.10"
    stroke-width="2"
  />

  <text
    x="512"
    y="190"
    text-anchor="middle"
    fill="${theme.primary}"
    font-family="Arial, sans-serif"
    font-size="38"
    font-weight="bold"
    letter-spacing="5"
  >
    ${escapeXml(type).toUpperCase()}
  </text>

  <text
    x="512"
    y="390"
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
    y="440"
    width="100"
    height="7"
    rx="4"
    fill="${theme.primary}"
  />

  <text
    x="512"
    y="530"
    text-anchor="middle"
    fill="#c7c7d0"
    font-family="Arial, sans-serif"
    font-size="25"
  >
    ${escapeXml(description)}
  </text>

  <text
    x="512"
    y="680"
    text-anchor="middle"
    fill="white"
    font-family="Arial, sans-serif"
    font-size="30"
    font-weight="bold"
  >
    ${escapeXml(date || "Date to be announced")}
  </text>

  <text
    x="512"
    y="735"
    text-anchor="middle"
    fill="#aaaab5"
    font-family="Arial, sans-serif"
    font-size="24"
  >
    ${escapeXml(venue || "Venue to be announced")}
  </text>

  <rect
    x="260"
    y="825"
    width="504"
    height="2"
    fill="${theme.primary}"
    opacity="0.4"
  />

  <text
    x="512"
    y="900"
    text-anchor="middle"
    fill="#888894"
    font-family="Arial, sans-serif"
    font-size="18"
    letter-spacing="3"
  >
    DESIGNED FOR ${escapeXml(audience).toUpperCase()}
  </text>

  <rect
    x="330"
    y="965"
    width="364"
    height="65"
    rx="12"
    fill="${theme.primary}"
  />

  <text
    x="512"
    y="1007"
    text-anchor="middle"
    fill="white"
    font-family="Arial, sans-serif"
    font-size="21"
    font-weight="bold"
  >
    REGISTER NOW
  </text>

  <text
    x="512"
    y="1100"
    text-anchor="middle"
    fill="${theme.primary}"
    font-family="Arial, sans-serif"
    font-size="18"
    font-weight="bold"
    letter-spacing="3"
  >
    ${escapeXml(style).toUpperCase()} • AI ASSISTED
  </text>

  <text
    x="512"
    y="1160"
    text-anchor="middle"
    fill="#555560"
    font-family="Arial, sans-serif"
    font-size="15"
  >
    PosterAI • AI-Assisted Poster Design System
  </text>

</svg>
`;

  return Buffer.from(svg, "utf8").toString("base64");
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
      prompt = "",
    } = req.body;

    console.log("\n========== POSTER REQUEST ==========");
    console.log(req.body);

    const aiPrompt = `
Create a professional promotional poster.

${prompt ? `User's design request: ${prompt}` : ""}

Event: ${title}
Type: ${type}
Date: ${date}
Venue: ${venue}
Description: ${description}
Target audience: ${audience}
Design style: ${style}
Color theme: ${color}

Use strong visual hierarchy, professional typography,
attractive composition and social-media-ready design.
`;

    const imageBase64 = createDemoPoster({
      title,
      type,
      date,
      venue,
      description,
      audience,
      style,
      color,
      variation,
    });

    const imageData =
      `data:image/svg+xml;base64,${imageBase64}`;

    console.log("Poster created successfully.");
    console.log("Image length:", imageData.length);

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


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PosterAI Backend running on port ${PORT}`);
  console.log("Mode: DEMO");
});