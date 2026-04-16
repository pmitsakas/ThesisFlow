export const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT':    'bg-blue-100 text-blue-800',
  'BI':    'bg-green-100 text-green-800',
};

export const trackColor = (t) => TRACK_COLORS[t] || 'bg-gray-100 text-gray-800';

export const TRACKS = ['AI&DS', 'WT', 'BI'];

export const TRACK_LABELS = {
  'AI&DS': 'Artificial Intelligence & Data Science',
  'WT':    'Web Technologies',
  'BI':    'Business Informatics',
};

export const TIER_COLORS = {
  1: { border: 'border-yellow-400', bg: 'bg-yellow-50', label: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  2: { border: 'border-blue-400',   bg: 'bg-blue-50',   label: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800'   },
  3: { border: 'border-gray-400',   bg: 'bg-gray-50',   label: 'text-gray-600',   badge: 'bg-gray-100 text-gray-700'   },
};
