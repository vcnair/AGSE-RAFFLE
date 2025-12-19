<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1-MwV6su3h3RDIPWCXPjiEc6Nn2I8NtUA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

### Audio Customization

The AGSE Raffle app now includes customizable audio settings! Access them by clicking the volume icon in the bottom-right corner of the main screen.

**Audio Modes:**
- **Procedural** (Default): Synthesized sounds using Web Audio API
- **Classic**: Retro arcade-style sounds for a nostalgic feel
- **Custom**: Upload your own audio files (MP3/WAV)
- **Silent**: Completely mute all audio

**How to Use Custom Audio:**
1. Click the volume icon to open Audio Settings
2. Select "Custom" mode
3. Upload audio files for:
   - **Tick Sound**: Plays during the raffle spin
   - **Win Sound**: Plays when a winner is selected
4. Adjust the volume slider (0-100%)
5. Click "Test Sounds" to preview your changes
6. Click "Done" to save

**Features:**
- Settings are saved locally in your browser
- Volume control works with all audio modes
- Custom audio files persist until manually cleared
- Fallback to procedural audio if custom files fail to load

**Tips:**
- Use short audio clips (< 1 second) for tick sounds
- Win sounds can be longer (1-3 seconds recommended)
- Supported formats: MP3, WAV, OGG, and other browser-compatible audio formats
