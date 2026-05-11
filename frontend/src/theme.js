export const theme = {
  colors: {
    primary: '#1a237e',
    primaryDark: '#0d1b6e',
    primaryLight: '#283593',
    accent: '#f26522',
    accentHover: '#d4541a',
    blue: '#1565c0',
    blueHover: '#0d47a1',
    bgLight: '#f5f5f5',
    bgCard: '#ffffff',
    textDark: '#1a237e',
    textBody: '#374151',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  }
};

export const tw = {
  // Backgrounds
  navBg:          'bg-white',
  pageBg:         'bg-[#f5f5f5]',
  cardBg:         'bg-white',
  footerBg:       'bg-[#0d1b6e]',
  heroSection:    'bg-[#1a237e]',
  sectionAlt:     'bg-[#f5f5f5]',

  // Text
  heading:        'text-[#1a237e]',
  headingWhite:   'text-white',
  bodyText:       'text-gray-700',
  mutedText:      'text-gray-500',
  linkText:       'text-[#1565c0] hover:text-[#0d47a1]',

  // Buttons - Primary (navy)
  btnPrimary:     'bg-[#1a237e] hover:bg-[#0d1b6e] text-white font-semibold rounded-lg transition',
  btnPrimaryFull: 'w-full bg-[#1a237e] hover:bg-[#0d1b6e] text-white font-semibold rounded-lg transition',

  // Buttons - Accent (orange)
  btnAccent:      'bg-[#f26522] hover:bg-[#d4541a] text-white font-semibold rounded-lg transition',
  btnAccentFull:  'w-full bg-[#f26522] hover:bg-[#d4541a] text-white font-semibold rounded-lg transition',

  // Buttons - Secondary (medium blue)
  btnSecondary:   'bg-[#1565c0] hover:bg-[#0d47a1] text-white font-semibold rounded-lg transition',
  btnOutline:     'border border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-semibold rounded-lg transition',
  btnDanger:      'bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition',
  btnGhost:       'text-[#1a237e] hover:bg-[#1a237e]/10 font-medium rounded-lg transition',

  // Cards
  card:           'bg-white rounded-xl shadow-sm border border-gray-200',
  cardHover:      'bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition',

  // Inputs
  input:          'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e] focus:border-transparent',
  select:         'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]',
  textarea:       'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e] resize-none',

  // Badges
  badgeNavy:      'bg-[#1a237e] text-white text-xs font-semibold px-2 py-0.5 rounded-full',
  badgeOrange:    'bg-[#f26522] text-white text-xs font-semibold px-2 py-0.5 rounded-full',
  badgeBlue:      'bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full',
  badgeGreen:     'bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full',
  badgeYellow:    'bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full',
  badgeRed:       'bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full',

  // Alerts
  alertSuccess:   'bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm',
  alertError:     'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm',
  alertInfo:      'bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm',

  // Gradient hero (για navbar/header sections)
  gradientHero:   'bg-gradient-to-r from-[#1a237e] to-[#1565c0]',
  gradientCard:   'bg-gradient-to-br from-[#1a237e] to-[#283593]',

  // Orange accent underline (όπως το site)
  accentUnderline: 'border-b-2 border-[#f26522]',

  // Icon circle (όπως τα cards του site)
  iconCircle:     'w-14 h-14 rounded-full border-2 border-[#f26522] flex items-center justify-center text-[#f26522]',
};