import React from 'react';
import { FiArrowLeft, FiList, FiCpu } from 'react-icons/fi';

const StepMode = ({ onBrowse, onAI, onBack }) => (
  <div className="max-w-2xl mx-auto px-4 py-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">How would you like to start?</h2>
      <p className="text-gray-500">Choose how you want to submit your dissertation proposal</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <button
        type="button"
        onClick={onBrowse}
        className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition text-left bg-white shadow-sm group"
      >
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
          <FiList className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Browse existing topics</h3>
        <p className="text-sm text-gray-500">Browse available dissertations and select your preferences</p>
      </button>

      <button
        type="button"
        onClick={onAI}
        className="p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition text-left bg-white shadow-sm group"
      >
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
          <FiCpu className="w-7 h-7 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Proposal</h3>
        <p className="text-sm text-gray-500">Propose your own topic with AI assistance</p>
      </button>
    </div>
    <div className="mt-6 text-center">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto transition">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>
    </div>
  </div>
);

export default StepMode;
