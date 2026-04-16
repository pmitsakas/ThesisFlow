import React from 'react';
import { FiUser } from 'react-icons/fi';
import { trackColor } from './constants';

const DraggableCard = ({ item, fromTier, onDragStart, onMove, tiering }) => {
  const d = item.dissertation;

  const availableTargets = ['untiered', 1, 2, 3].filter(t => {
    if (t === fromTier) return false;
    if (t === 'untiered') return true;
    return tiering[t].length < 3;
  });

  return (
    <div
      draggable
      onDragStart={() => onDragStart(item, fromTier)}
      className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition select-none"
    >
      <div className="flex flex-wrap gap-1 mb-1.5">
        {d.tracks && d.tracks.map(t => (
          <span key={t} className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${trackColor(t)}`}>{t}</span>
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1.5">{d.title}</p>
      {d.supervisorId && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <FiUser className="w-3 h-3" />{d.supervisorId.name} {d.supervisorId.surname}
        </p>
      )}
      {availableTargets.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {availableTargets.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onMove(item, fromTier, t)}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition"
            >
              {t === 'untiered' ? '↩' : `T${t}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraggableCard;
