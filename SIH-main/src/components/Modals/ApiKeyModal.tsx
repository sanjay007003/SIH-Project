import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, Satellite, ShieldCheck } from 'lucide-react';
import { firmsService } from '../../services/firmsService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [keyInput, setKeyInput] = useState<string>(firmsService.getApiKey());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    firmsService.setApiKey(keyInput);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onKeyUpdated();
      onClose();
    }, 800);
  };

  const handleClear = () => {
    firmsService.setApiKey('');
    setKeyInput('');
    onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tactical-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-tactical-900 border border-tactical-700 rounded-xl shadow-2xl p-6 font-sans text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-tactical-800">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              NASA FIRMS API INTEGRATION KEY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-tactical-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            PYRO-SENTRY directly queries the NASA EOSDIS FIRMS API (Fire Information for Resource Management System) to ingest near real-time VIIRS (SNPP / NOAA-20 / NOAA-21) and MODIS active fire detections.
          </p>

          <div className="bg-tactical-950 p-3 rounded-lg border border-tactical-800 space-y-2">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block">
              ENTER YOUR NASA FIRMS MAP_KEY:
            </span>
            <input
              type="text"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="e.g. 8f92a10b42c673e9..."
              className="w-full px-3 py-2 bg-tactical-900 border border-tactical-700 rounded text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <a
                href="https://firms.modaps.eosdis.nasa.gov/api/map_key"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center"
              >
                <span>Get free NASA MAP_KEY</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              {keyInput && (
                <button
                  onClick={handleClear}
                  className="text-rose-400 hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-cyan-950/40 rounded-lg border border-cyan-500/30 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-cyan-200">
              <strong>Offline & Demo Mode:</strong> If no API key is provided, the platform automatically feeds high-resolution simulated telemetry across India's strategic industrial & forestry corridors.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-tactical-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-tactical-800 hover:bg-tactical-700 text-slate-300 text-xs font-mono rounded-lg transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-600/30"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>KEY SAVED!</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>SAVE & CONNECT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
