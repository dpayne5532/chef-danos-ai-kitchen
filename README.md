<p align="center">
  <img src="public/chefDan.png" alt="Chef Dano logo" width="220" />
</p>

<h1 align="center">Chef Dano’s AI Kitchen</h1>

<p align="center">
  Your private, no-cloud, AI-powered recipe laboratory.
</p>

<p align="center">
  <strong>Runs locally. Works offline. No telemetry. No subscriptions.</strong>
</p>

---

## 🍳 What is this?

**Chef Dano’s AI Kitchen** is a fully local AI-powered web app that generates *high-quality, beginner-friendly cooking recipes* based on what you have in your kitchen.

It runs entirely on your own hardware (tested on a Raspberry Pi 5), using open models via **Ollama**, with a clean Node.js backend and a polished web UI.

No cloud.  
No API keys.  
No data leaving your network.

---

## ✨ Features

- 🧠 **Local LLM inference** via Ollama (Gemma, Qwen, etc.)
- 🥕 Ingredient-driven recipe generation
- ⚖️ Optional dietary restrictions and taste preferences
- 🍽️ Adjustable number of servings
- 👨‍🍳 Explicit, beginner-friendly cooking instructions
- 🔥 Smart logic: the AI may omit ingredients that don’t belong
- 🌐 Clean web UI with Markdown-rendered recipes
- 📡 `/health` endpoint for system status
- ♻️ Graceful failure if the AI engine is unavailable
- 📴 Fully offline capable after initial setup

---

## 🖥️ Architecture


Everything runs locally on the same machine.

Static assets (HTML, JS, images) are served from `/public`.

---

## 🚀 Getting Started (on a Raspberry Pi)

### Prerequisites

- Raspberry Pi (Pi 5 recommended)
- Node.js 18+
- Ollama installed and running
- At least one Ollama model pulled (for example: `gemma2:2b`)

---

### Clone the repo

```bash
git clone https://github.com/dpayne5532/chef-danos-ai-kitchen.git
cd chef-danos-ai-kitchen
