import React from 'react';
import { FiArrowLeft, FiList, FiCpu } from 'react-icons/fi';

const StepMode = ({ onBrowse, onAI, onBack }) => (
  <div className="max-w-2xl mx-auto px-4 py-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Πώς θέλεις να ξεκινήσεις;</h2>
      <p className="text-gray-500">Επέλεξε τον τρόπο δήλωσης εργασιών</p>
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
        <h3 className="text-lg font-bold text-gray-900 mb-2">Από υπάρχουσες εργασίες</h3>
        <p className="text-sm text-gray-500">Περιήγηση στις διαθέσιμες εργασίες και επιλογή 9 προτιμήσεων</p>
      </button>

      <button
        type="button"
        onClick={onAI}
        className="p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition text-left bg-white shadow-sm group"
      >
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
          <FiCpu className="w-7 h-7 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Πρόταση</h3>
        <p className="text-sm text-gray-500">Πρότεινε δική σου θεματική με AI, μετά επίλεξε 8 από τις υπάρχουσες</p>
      </button>
    </div>
    <div className="mt-6 text-center">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto transition">
        <FiArrowLeft className="w-4 h-4" /> Πίσω
      </button>
    </div>
  </div>
);

export default StepMode;
