import React from 'react';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import { TIER_COLORS } from './constants';
import DraggableCard from './DraggableCard';

const StepTiering = ({
  tiering, untiered, dragOver,
  onDragStart, onDrop, onDragOver, onDragLeave,
  moveItem, isTieringComplete, onSubmit,
  submitting, error
}) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Κατάταξε τις εργασίες σου</h1>
      <p className="text-gray-500 text-sm">Σύρε κάθε εργασία στο tier που επιθυμείς. Η σειρά μέσα στο tier καθορίζει την προτεραιότητα.</p>
    </div>

    {error && (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
    )}

    <div className="flex gap-4 min-h-[500px]">
      <div className="w-64 flex-shrink-0">
        <div
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 h-full"
          onDragOver={e => { e.preventDefault(); onDragOver('untiered'); }}
          onDragLeave={onDragLeave}
          onDrop={() => onDrop('untiered')}
        >
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 text-sm">Αδιάθετες</h3>
            <p className="text-xs text-gray-400">{untiered.length} εργασίες</p>
          </div>
          <div className="p-2 space-y-2">
            {untiered.map(item => (
              <DraggableCard
                key={item.tempId || item.applicationId}
                item={item}
                fromTier="untiered"
                onDragStart={onDragStart}
                onMove={moveItem}
                tiering={tiering}
              />
            ))}
            {untiered.length === 0 && (
              <p className="text-xs text-gray-300 text-center py-8">Όλες κατατάχθηκαν!</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {[1, 2, 3].map(tier => {
          const tc = TIER_COLORS[tier];
          const isOver = dragOver === tier;
          return (
            <div
              key={tier}
              className={`rounded-xl border-2 transition-all duration-200 ${tc.border} ${tc.bg} ${isOver ? 'ring-2 ring-blue-400 scale-[1.01]' : ''}`}
              onDragOver={e => { e.preventDefault(); onDragOver(tier); }}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(tier)}
            >
              <div className={`p-3 border-b ${tc.border}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${tc.label}`}>Tier {tier}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.badge}`}>
                    {tiering[tier].length}/3
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tier === 1 ? 'Πρώτη επιλογή' : tier === 2 ? 'Δεύτερη επιλογή' : 'Τρίτη επιλογή'}
                </p>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {tiering[tier].map((item, idx) => (
                  <div key={item.tempId || item.applicationId} className="relative">
                    <div className="absolute -left-1 -top-1 w-5 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center z-10">
                      <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                    </div>
                    <DraggableCard
                      item={item}
                      fromTier={tier}
                      onDragStart={onDragStart}
                      onMove={moveItem}
                      tiering={tiering}
                    />
                  </div>
                ))}
                {tiering[tier].length < 3 && (
                  <div className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center transition ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
                    <span className="text-xs text-gray-300">Σύρε εδώ</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        {isTieringComplete()
          ? <span className="text-green-600 font-medium flex items-center gap-1"><FiCheckCircle className="w-4 h-4" /> Όλες οι εργασίες κατατάχθηκαν!</span>
          : <span>{untiered.length} εργασίες αδιάθετες</span>
        }
      </div>
      <button
        onClick={onSubmit}
        disabled={!isTieringComplete() || submitting}
        className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? <><FiLoader className="w-4 h-4 animate-spin" /> Αποθήκευση...</>
          : <><FiCheckCircle className="w-4 h-4" /> Ολοκλήρωση</>
        }
      </button>
    </div>
  </div>
);

export default StepTiering;
