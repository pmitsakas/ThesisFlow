import React from 'react';
import { FiArrowRight, FiArrowLeft, FiLoader, FiSearch, FiCheck, FiUser } from 'react-icons/fi';
import { trackColor } from './constants';

const StepBrowse = ({
  dissertations, loading, searchTerm, onSearchChange,
  selectedDissertations, maxSelections, proposalDone,
  onToggle, onSubmit, onBack, onSkip,
  submitting, error
}) => {
  const filteredDissertations = dissertations.filter(d => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return d.title.toLowerCase().includes(s) ||
      d.description?.toLowerCase().includes(s) ||
      d.code?.toLowerCase().includes(s);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg">
          <FiSearch className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {proposalDone ? 'Επίλεξε 8 ακόμα εργασίες' : 'Επίλεξε 9 εργασίες'}
        </h1>
        <p className="text-gray-500">
          {selectedDissertations.length}/{maxSelections} επιλεγμένες
          {proposalDone && <span className="ml-2 text-purple-600 font-medium">+ 1 δική σου πρόταση</span>}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Αναζήτηση..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 ${selectedDissertations.length === maxSelections ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}>
          {selectedDissertations.length}/{maxSelections}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredDissertations.map(d => {
            const isSelected = selectedDissertations.some(x => x._id === d._id);
            const isFull = selectedDissertations.length >= maxSelections && !isSelected;
            return (
              <div
                key={d._id}
                onClick={() => !isFull && onToggle(d)}
                className={`bg-white rounded-xl border-2 shadow-sm transition-all duration-200 flex flex-col cursor-pointer ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200'
                  : isFull ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1">
                      {d.tracks && d.tracks.map(t => (
                        <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trackColor(t)}`}>{t}</span>
                      ))}
                    </div>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  {d.code && <p className="text-xs text-gray-400 font-mono mb-1">{d.code}</p>}
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">{d.title}</h3>
                  {d.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{d.description}</p>}
                  {d.supervisorId && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FiUser className="w-3 h-3" />{d.supervisorId.name} {d.supervisorId.surname}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
          <FiArrowLeft className="w-4 h-4" /> Πίσω
        </button>
        <div className="flex gap-3">
          <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 transition">Παράλειψη</button>
          <button
            onClick={onSubmit}
            disabled={selectedDissertations.length !== maxSelections || submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? <><FiLoader className="w-4 h-4 animate-spin" /> Αποθήκευση...</>
              : <>Συνέχεια <FiArrowRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepBrowse;
