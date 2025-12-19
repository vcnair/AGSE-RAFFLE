import React, { useState, useEffect, useRef } from 'https://esm.sh/react@19.0.0';
import { Volume2, VolumeX, Music, Upload, X } from 'https://esm.sh/lucide-react@0.460.0';
import { audioManager, AudioMode, AudioSettings as AudioSettingsType } from '../utils/audio';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AudioSettingsType>(audioManager.getSettings());
  const [tickFile, setTickFile] = useState<File | null>(null);
  const [winFile, setWinFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSettings(audioManager.getSettings());
      setUploadError('');
    }
  }, [isOpen]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  const handleModeChange = (mode: AudioMode) => {
    const newSettings = { ...settings, mode };
    setSettings(newSettings);
    audioManager.saveSettings(newSettings);
    
    // Play a test sound
    if (mode !== 'silent') {
      audioManager.playTick(0.1);
    }
  };

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    audioManager.saveSettings(newSettings);
  };

  const handleFileUpload = async (file: File, type: 'tick' | 'win') => {
    setUploadError('');
    
    // Validate file type by MIME type and extension
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!file.type.startsWith('audio/') || !validExtensions.includes(fileExtension)) {
      setUploadError('Please upload a valid audio file (MP3, WAV, OGG, M4A, AAC, FLAC)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }
    
    try {
      const url = URL.createObjectURL(file);
      blobUrlsRef.current.push(url);
      
      const newSettings = {
        ...settings,
        mode: 'custom' as AudioMode,
        ...(type === 'tick' ? { customTickUrl: url } : { customWinUrl: url })
      };
      setSettings(newSettings);
      audioManager.saveSettings(newSettings);
      
      if (type === 'tick') {
        setTickFile(file);
      } else {
        setWinFile(file);
      }
      
      // Test the sound
      if (type === 'tick') {
        await audioManager.playTick(0.1);
      } else {
        await audioManager.playWin();
      }
    } catch (e) {
      console.error('Failed to upload audio file:', e);
      setUploadError('Failed to load audio file. Please try a different file.');
    }
  };

  const clearCustomAudio = (type: 'tick' | 'win') => {
    const urlToRevoke = type === 'tick' ? settings.customTickUrl : settings.customWinUrl;
    if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRevoke);
      blobUrlsRef.current = blobUrlsRef.current.filter(url => url !== urlToRevoke);
    }
    
    const newSettings = {
      ...settings,
      ...(type === 'tick' ? { customTickUrl: undefined } : { customWinUrl: undefined })
    };
    
    // If both are cleared, switch back to procedural
    if (!newSettings.customTickUrl && !newSettings.customWinUrl) {
      newSettings.mode = 'procedural';
    }
    
    setSettings(newSettings);
    audioManager.saveSettings(newSettings);
    
    if (type === 'tick') {
      setTickFile(null);
    } else {
      setWinFile(null);
    }
    setUploadError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-b border-slate-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Music size={28} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Audio Settings</h2>
              <p className="text-slate-400 text-sm font-medium">Customize your raffle experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Audio Mode Selection */}
          <div>
            <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-4">
              Audio Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { mode: 'procedural' as AudioMode, label: 'Procedural', desc: 'Generated sounds' },
                { mode: 'classic' as AudioMode, label: 'Classic', desc: 'Retro arcade' },
                { mode: 'custom' as AudioMode, label: 'Custom', desc: 'Your own files' },
                { mode: 'silent' as AudioMode, label: 'Silent', desc: 'No audio' }
              ].map(({ mode, label, desc }) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    settings.mode === mode
                      ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-white text-lg">{label}</div>
                  <div className="text-slate-400 text-sm mt-1">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="flex items-center gap-3 text-sm font-bold text-amber-500 uppercase tracking-wider mb-4">
              {settings.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Custom Audio Upload */}
          {settings.mode === 'custom' && (
            <div className="space-y-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-4">
                Upload Custom Audio Files
              </div>
              
              {/* Tick Sound Upload */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Tick Sound (plays during spin)
                </label>
                {settings.customTickUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-600">
                    <Music size={20} className="text-amber-500" />
                    <span className="text-sm text-slate-300 flex-1">{tickFile?.name || 'Custom audio loaded'}</span>
                    <button
                      onClick={() => clearCustomAudio('tick')}
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-600 hover:border-amber-500 rounded-lg cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-800/50">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-400">Click to upload MP3/WAV</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'tick')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Win Sound Upload */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Win Sound (plays when winner is selected)
                </label>
                {settings.customWinUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-600">
                    <Music size={20} className="text-amber-500" />
                    <span className="text-sm text-slate-300 flex-1">{winFile?.name || 'Custom audio loaded'}</span>
                    <button
                      onClick={() => clearCustomAudio('win')}
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-600 hover:border-amber-500 rounded-lg cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-800/50">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-400">Click to upload MP3/WAV</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'win')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400">
                ⚠️ <strong>Error:</strong> {uploadError}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-blue-400">
              💡 <strong>Tip:</strong> Audio settings are saved locally in your browser. Custom audio files persist until you clear them.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950/50 border-t border-slate-700 px-8 py-6 flex justify-end gap-4">
          <button
            onClick={() => {
              // Test sounds
              audioManager.playTick(0.1);
              setTimeout(() => audioManager.playWin(), 300);
            }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
          >
            Test Sounds
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
