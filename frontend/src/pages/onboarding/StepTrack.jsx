import React from 'react';
import { FiArrowRight, FiLoader } from 'react-icons/fi';
import { TRACKS, TRACK_COLORS, TRACK_LABELS } from './constants';

const StepTrack = ({ userName, onSelect, saving }) => (
  <div className="max-w-lg mx-auto px-4 py-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {userName}!</h2>
      <p className="text-gray-500">Select your academic track to get started</p>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {TRACKS.map(track => (
        <button
          key={track}
          type="button"
          onClick={() => onSelect(track)}
          disabled={saving}
          className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${TRACK_COLORS[track]}`}>{track}</span>
              <p className="mt-2 font-semibold text-gray-900">{TRACK_LABELS[track]}</p>
            </div>
            {saving
              ? <FiLoader className="w-5 h-5 animate-spin text-blue-500" />
              : <FiArrowRight className="w-5 h-5 text-gray-400" />
            }
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default StepTrack;
