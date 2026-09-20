// AKM POS - Core Application Logic & Modern Mobile UI Engine (-2px Font, Zero-Overflow, Multi-Store Analytics)
const S = {
  user: null,
  csrf: '',
  stores: [],
  store: 0, // 0 = Tất cả hệ thống AKM
  cart: [],
  page: 'dashboard',
  category: 0,
  categories: [],
  cashTendered: 0
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => new Intl.NumberFormat('vi-VN').format(+n || 0) + ' ₫';
const dt = s => {
  if (!s) return '—';
  try {
    const d = new Date(s.replace(' ', 'T'));
    return isNaN(d) ? s : d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return s; }
};

// Smart Category Icon Mapper based on keywords
function getCategoryIcon(name = '', size = 16) {
  const n = String(name || '').toLowerCase();
  if (n.includes('điện thoại') || n.includes('iphone') || n.includes('samsung') || n.includes('xiaomi') || n.includes('oppo') || n.includes('phone') || n.includes('redmi') || n.includes('pixel')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`;
  }
  if (n.includes('ipad') || n.includes('tablet') || n.includes('máy tính bảng') || n.includes('tab')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
  }
  if (n.includes('laptop') || n.includes('macbook') || n.includes('máy tính') || n.includes('pc')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>`;
  }
  if (n.includes('sạc') || n.includes('cáp') || n.includes('củ sạc') || n.includes('dây') || n.includes('charger') || n.includes('cable') || n.includes('nguồn')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
  }
  if (n.includes('tai nghe') || n.includes('airpod') || n.includes('headphone') || n.includes('audio') || n.includes('earphone') || n.includes('buds')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>`;
  }
  if (n.includes('loa') || n.includes('speaker') || n.includes('sound') || n.includes('bluetooth')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>`;
  }
  if (n.includes('ốp') || n.includes('bao da') || n.includes('dán') || n.includes('cường lực') || n.includes('case') || n.includes('bảo vệ') || n.includes('skin')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  }
  if (n.includes('pin') || n.includes('dự phòng') || n.includes('powerbank') || n.includes('battery')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>`;
  }
  if (n.includes('đồng hồ') || n.includes('watch') || n.includes('smartwatch')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7.35-3.83A2 2 0 0 1 9.83 1h4.34a2 2 0 0 1 2 1.82l.35 3.83"/></svg>`;
  }
  if (n.includes('sửa chữa') || n.includes('linh kiện') || n.includes('màn hình') || n.includes('ép kính') || n.includes('camera') || n.includes('dịch vụ') || n.includes('thay thế')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
  }
  if (n.includes('vi tính') || n.includes('chuột') || n.includes('bàn phím') || n.includes('usb') || n.includes('thẻ nhớ') || n.includes('thẻ') || n.includes('lưu trữ') || n.includes('hub')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
  }
  if (n.includes('gậy') || n.includes('tự sướng') || n.includes('tripod') || n.includes('giá đỡ') || n.includes('chân đế') || n.includes('kẹp') || n.includes('kệ')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/></svg>`;
  }
  if (n.includes('sim') || n.includes('data') || n.includes('4g') || n.includes('5g') || n.includes('mạng') || n.includes('wifi')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 4.4-2.8 8.1-6.8 9.4L15 19v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v3.6A10 10 0 0 1 2 12 10 10 0 0 1 12 2Z"/></svg>`;
  }
  if (n.includes('quạt') || n.includes('tản nhiệt') || n.includes('fan')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 12c0-3 2.5-5 5-5 0 2.5-2 5-5 5Z"/><path d="M12 12c3 0 5 2.5 5 5-2.5 0-5-2-5-5Z"/><path d="M12 12c0 3-2.5 5-5 5 0-2.5 2-5 5-5Z"/><path d="M12 12c-3 0-5-2.5-5-5 2.5 0 5 2 5 5Z"/></svg>`;
  }
  if (n.includes('phụ kiện') || n.includes('khác') || n.includes('combo')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`;
}

// Comprehensive Lucide SVG Icon Engine
function icon(name, size = 16, cls = '') {
  const icons = {
    'dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    'pos': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'orders': '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-8"/><path d="M16 12h-8"/><path d="M16 16h-8"/>',
    'products': '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'categories': '<path d="m15 5 4 4"/><path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"/><path d="m8 6 2-2"/><path d="m2 22 5.5-1.5L21.17 6.83a2.82 2.82 0 0 0-4-4L3.5 16.5Z"/>',
    'inventory': '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'transfers': '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    'returns': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'repairs': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'reports': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'stores': '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>',
    'audit': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'minus': '<line x1="5" y1="12" x2="19" y2="12"/>',
    'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    'printer': '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'check': '<polyline points="20 6 9 17 4 12"/>',
    'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'backup': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    'refresh': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'bell-ring': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'
  };
  const body = icons[name] || icons['pos'];
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${body}</svg>`;
}

// Global Category Pills Scrolling & Drag-to-Scroll Helper for Desktop
window.scrollPills = function(id, delta) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollBy({ left: delta, behavior: 'smooth' });
};

window.initPillsScroll = function(id) {
  const el = document.getElementById(id);
  if (!el || el.dataset.pillsScrollInit) return;
  el.dataset.pillsScrollInit = '1';

  // 1. Mouse wheel horizontal scrolling
  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // 2. Mouse drag-to-scroll
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasMoved = false;

  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDown = true;
    hasMoved = false;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    el.classList.add('is-dragging');
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      el.classList.remove('is-dragging');
      if (hasMoved) {
        const preventClick = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener('click', preventClick, true);
        };
        window.addEventListener('click', preventClick, true);
      }
    }
  });

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMoved = true;
    }
    el.scrollLeft = scrollLeft - walk;
  });
};

let pendingRequests = 0;
let loadingTimeout = null;
function loading(on) {
  pendingRequests = Math.max(0, pendingRequests + (on ? 1 : -1));
  const el = $('#loading');
  if (!el) return;
  if (pendingRequests > 0) {
    if (!loadingTimeout) {
      loadingTimeout = setTimeout(() => {
        if (pendingRequests > 0) el.classList.remove('hidden');
      }, 250);
    }
  } else {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    el.classList.add('hidden');
  }
}

async function api(action, opt = {}) {
  if (!opt.silent) loading(true);
  try {
    let url = 'api.php';
    const [baseAction, queryStr] = action.split('?');
    url += '?action=' + encodeURIComponent(baseAction);
    if (queryStr) url += '&' + queryStr;
    if (opt.params) {
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(opt.params)) {
        if (v !== undefined && v !== null && v !== '') p.append(k, v);
      }
      const qs = p.toString();
      if (qs) url += '&' + qs;
    }
    const options = { method: opt.method || 'GET', headers: {} };
    if (options.method !== 'GET') options.headers['X-CSRF-Token'] = S.csrf;
    if (opt.body instanceof FormData) {
      options.body = opt.body;
    } else if (opt.body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(opt.body);
    }
    const r = await fetch(url, options);
    if (r.status === 401 && !['auth.login', 'auth.me'].includes(baseAction)) {
      location.reload();
      throw Error('Phiên đăng nhập đã hết hạn');
    }
    if (opt.raw) return r;
    const j = await r.json().catch(() => ({ ok: false, error: 'Phản hồi máy chủ không hợp lệ' }));
    if (!r.ok || !j.ok) throw Error(j.error || 'Có lỗi xảy ra');
    return j.data;
  } finally {
    if (!opt.silent) loading(false);
  }
}

function haptic(type = 'light') {
  if (!navigator.vibrate) return;
  try {
    if (type === 'light') navigator.vibrate(12);
    else if (type === 'success') navigator.vibrate([20, 35, 20]);
    else if (type === 'warning') navigator.vibrate([40, 30, 40]);
    else if (type === 'error') navigator.vibrate([60, 40, 60]);
    else navigator.vibrate(15);
  } catch (e) {}
}

function beepScan() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function toast(msg, type = 'normal', duration = 3000) {
  const container = $('#toast');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  let iconName = 'check';
  if (type === 'error') iconName = 'x-circle';
  else if (type === 'warning') iconName = 'alert-triangle';
  else if (type === 'info') iconName = 'info';
  else if (type === 'success' || type === 'normal') iconName = 'check-circle';

  t.innerHTML = `<span class="toast-icon">${icon(iconName, 16)}</span><span class="toast-content">${msg}</span>`;
  container.append(t);

  const timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    t.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    setTimeout(() => t.remove(), 250);
  }, duration || 3000);

  t.onclick = (e) => {
    if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
      clearTimeout(timer);
      t.remove();
    }
  };
}

function modal(html) {
  $('#modalBody').innerHTML = html;
  $('#modal').classList.remove('hidden');
}

window.closeModal = () => $('#modal').classList.add('hidden');

// Realtime Stock & UI Synchronization Engine
window._akmBroadcast = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('akm_pos_realtime') : null;
if (window._akmBroadcast) {
  window._akmBroadcast.onmessage = e => {
    if (e.data && e.data.type === 'STOCK_UPDATE') {
      window.handleStockUpdatedRealtime(e.data);
    }
  };
}

window.addEventListener('akm:stock-updated', e => {
  window.handleStockUpdatedRealtime(e.detail || {});
});

window.broadcastStockUpdated = function(detail = {}) {
  window.dispatchEvent(new CustomEvent('akm:stock-updated', { detail }));
  try {
    if (window._akmBroadcast) window._akmBroadcast.postMessage({ type: 'STOCK_UPDATE', ...detail });
  } catch (err) {}
};

window.handleStockUpdatedRealtime = function(detail = {}) {
  if (S.page === 'pos') {
    if (typeof searchPos === 'function') searchPos($('#posSearch')?.value || '');
  } else if (S.page === 'products') {
    if (typeof productRows === 'function') {
      api('products.list', { params: { all: 1, store_id: S.store || 0 }, silent: true }).then(ps => {
        window._products = ps;
        productRows($('#productSearch')?.value || '');
      }).catch(() => {});
    }
  } else if (S.page === 'orders') {
    if (typeof loadOrdersTable === 'function') loadOrdersTable();
  } else if (S.page === 'returns') {
    if (typeof loadReturnOrders === 'function') loadReturnOrders();
  } else if (S.page === 'inventory') {
    if (typeof inventory === 'function') inventory();
  }
};

window.addEventListener('focus', () => {
  if (S.page === 'pos' && typeof searchPos === 'function') {
    searchPos($('#posSearch')?.value || '');
  }
});

function initModalSheetGestures() {
  const modalEl = document.getElementById('modal');
  const card = modalEl?.querySelector('.modal-card');
  if (!modalEl || !card || modalEl.dataset.gesturesInit) return;
  modalEl.dataset.gesturesInit = '1';

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  modalEl.addEventListener('touchstart', (e) => {
    const target = e.target;
    const isHandle = target.classList.contains('sheet-drag-handle');
    const isHeader = target.closest('.modal-header');
    if ((isHandle || isHeader) && card.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      currentY = startY;
      isDragging = true;
      card.style.transition = 'none';
    }
  }, { passive: true });

  modalEl.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      card.style.transform = `translateY(${deltaY}px)`;
    }
  }, { passive: true });

  modalEl.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const deltaY = currentY - startY;
    card.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
    if (deltaY > 90) {
      card.style.transform = 'translateY(100%)';
      haptic('light');
      setTimeout(() => {
        closeModal();
        card.style.transform = '';
      }, 180);
    } else {
      card.style.transform = 'translateY(0)';
      setTimeout(() => { card.style.transform = ''; }, 250);
    }
  });
}

function initDrawerSwipeGestures() {
  const aside = document.querySelector('aside');
  if (!aside || document.body.dataset.drawerSwipeInit) return;
  document.body.dataset.drawerSwipeInit = '1';

  let startX = 0;
  let startY = 0;
  let tracking = false;

  document.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 900) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    const isOpen = aside.classList.contains('open');

    if (!isOpen && startX <= 35) {
      tracking = true;
    } else if (isOpen) {
      tracking = true;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!tracking || window.innerWidth > 900) {
      tracking = false;
      return;
    }
    tracking = false;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const isOpen = aside.classList.contains('open');
      if (!isOpen && deltaX > 50 && startX <= 35) {
        toggleDrawer(true);
        haptic('light');
      } else if (isOpen && deltaX < -50) {
        toggleDrawer(false);
        haptic('light');
      }
    }
  }, { passive: true });
}

// Grouped Navigation Structure
const navGroups = [
  {
    group: 'Bán hàng & Dịch vụ',
    items: [
      ['dashboard', 'dashboard', 'Tổng quan'],
      ['pos', 'pos', 'Bán hàng POS'],
      ['orders', 'orders', 'Hóa đơn'],
      ['returns', 'returns', 'Đổi / trả hàng'],
      ['repairs', 'repairs', 'Sửa chữa & Bảo hành']
    ]
  },
  {
    group: 'Kho & Hàng hóa',
    items: [
      ['products', 'products', 'Sản phẩm'],
      ['categories', 'categories', 'Nhóm hàng', true],
      ['inventory', 'inventory', 'Tồn kho'],
      ['transfers', 'transfers', 'Điều chuyển kho']
    ]
  },
  {
    group: 'Báo cáo & Giám sát',
    items: [
      ['reports', 'reports', 'Báo cáo kinh doanh'],
      ['notifications', 'bell', 'Thông báo & Cảnh báo']
    ]
  },
  {
    group: 'Hệ thống & Quản trị',
    adminOnly: true,
    items: [
      ['users', 'users', 'Nhân viên'],
      ['stores', 'stores', 'Chi nhánh cửa hàng'],
      ['backup', 'database', 'Sao lưu & Phục hồi'],
      ['audit', 'audit', 'Nhật ký Audit'],
      ['settings', 'settings', 'Cài đặt hệ thống']
    ]
  }
];

function buildNav() {
  const admin = S.user?.role === 'ADMIN';

  const groupsHtml = navGroups.map(g => {
    if (g.adminOnly && !admin) return '';
    const visibleItems = g.items.filter(x => !x[3] || admin);
    if (!visibleItems.length) return '';

    return `
      <div class="nav-group">
        <div class="nav-group-title">${g.group}</div>
        ${visibleItems.map(x => `
          <button class="nav-item ${S.page === x[0] ? 'active' : ''}" data-page="${x[0]}">
            <span class="nav-icon">${icon(x[1], 16)}</span>
            <span>${x[2]}</span>
          </button>
        `).join('')}
      </div>
    `;
  }).filter(Boolean).join('');

  $('#nav').innerHTML = groupsHtml;

  document.querySelectorAll('#nav .nav-item').forEach(b => {
    b.onclick = () => go(b.dataset.page);
  });

  // Mobile Bottom App Bar (5 primary quick items)
  const mobileKeys = ['dashboard', 'pos', 'orders', 'inventory', 'repairs'];
  const allItems = navGroups.flatMap(g => g.items).filter(x => !x[3] || admin);
  
  $('#mobileNav').innerHTML = allItems
    .filter(x => mobileKeys.includes(x[0]))
    .map(x => `
      <button class="mobile-nav-btn ${S.page === x[0] ? 'active' : ''}" data-page="${x[0]}">
        ${icon(x[1], 18)}
        <span>${x[2].replace('Bán hàng ', '').replace(' & Bảo hành', '')}</span>
      </button>
    `).join('');

  document.querySelectorAll('#mobileNav .mobile-nav-btn').forEach(b => {
    b.onclick = () => go(b.dataset.page);
  });
}

window.toggleLoginPassword = () => {
  const p = $('#loginPass');
  const iconEl = $('#eyeIcon');
  if (!p) return;
  if (p.type === 'password') {
    p.type = 'text';
    if (iconEl) iconEl.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  } else {
    p.type = 'password';
    if (iconEl) iconEl.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  }
};

async function login(e) {
  e.preventDefault();
  try {
    const data = Object.fromEntries(new FormData(e.target));
    const r = await api('auth.login', { method: 'POST', body: data });
    S.user = r.user;
    S.csrf = r.csrf;
    await start();
    toast(`Xin chào, ${S.user.full_name}!`);
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function start() {
  const b = await api('bootstrap');
  S.user = b.user;
  S.csrf = b.csrf;
  S.stores = b.stores || [];
  
  // Default to 0 (Tất cả hệ thống) for Admin or first store for Employee
  if (S.user.role === 'ADMIN') {
    S.store = 0;
  } else {
    S.store = S.stores[0]?.id || 0;
  }

  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');

  // Load user info
  const initial = (S.user.full_name || 'U').charAt(0).toUpperCase();
  $('#userBox').innerHTML = `
    <div class="user-avatar">${initial}</div>
    <div class="user-info">
      <b>${esc(S.user.full_name)}</b>
      <small>${S.user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên bán hàng'}</small>
    </div>
  `;

  // Branch Selector: include "Tất cả hệ thống AKM" for Admin
  const options = [];
  if (S.user.role === 'ADMIN') {
    options.push(`<option value="0" ${S.store === 0 ? 'selected' : ''}>⭐ Tất cả hệ thống AKM</option>`);
  }
  S.stores.forEach(s => {
    options.push(`<option value="${s.id}" ${s.id === S.store ? 'selected' : ''}>${esc(s.code)} · ${esc(s.name)}</option>`);
  });

  $('#storeSelect').innerHTML = options.join('');
  $('#storeSelect').onchange = () => {
    S.store = +$('#storeSelect').value;
    go(S.page);
  };

  initModalSheetGestures();
  initDrawerSwipeGestures();
  buildNav();
  window.initNotificationSystem();
  const reqPage = new URLSearchParams(location.search).get('page');
  go(reqPage || 'dashboard');
}

async function go(page) {
  S.page = page;
  buildNav();
  document.querySelector('aside')?.classList.remove('open');
  $('#drawerBackdrop')?.classList.add('hidden');

  // If user enters POS and store is 0 (All stores), switch to primary store because checkout needs a specific warehouse
  if (page === 'pos' && S.store === 0 && S.stores.length) {
    S.store = S.stores[0].id;
    if ($('#storeSelect')) $('#storeSelect').value = S.store;
    toast(`Đang bán tại kho: ${S.stores[0].name}`);
  }

  // Sync floating cart visibility
  updateFloatingCart();

  $('#content').innerHTML = `
    <div class="flex items-center justify-center p-8 text-slate-400 gap-2">
      <span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>
      <span>Đang tải ${page}...</span>
    </div>
  `;
  history.replaceState(null, '', '?page=' + encodeURIComponent(page));

  try {
    const map = {
      dashboard: dashboardV2,
      pos,
      orders,
      products,
      categories,
      inventory,
      transfers,
      returns: returnsPage,
      repairs,
      reports,
      notifications: typeof notificationsPage === 'function' ? notificationsPage : dashboardV2,
      users,
      stores,
      backup: backupView,
      audit,
      settings
    };
    await (map[page] || dashboardV2)();
  } catch (err) {
    $('#content').innerHTML = `<div class="alert danger">${icon('x', 16)} <span>${esc(err.message)}</span></div>`;
  }
}

function head(title, actions = '', subtitle = '') {
  return `
    <div class="page-head">
      <div class="page-head-title">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="page-head-actions">${actions}</div>
    </div>
  `;
}

function table(headers, rows) {
  return rows.length ? `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  ` : `<div class="card p-8 text-center text-slate-400 text-sm">Chưa có dữ liệu nào được ghi nhận</div>`;
}

function debounce(fn, t = 200) {
  let id;
  return (...a) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...a), t);
  };
}

/* =========================================================================
   POS MODULE (Tối ưu Mobile & Desktop)
   ========================================================================= */

async function pos() {
  try {
    S.categories = await api('categories.list');
  } catch (e) { S.categories = []; }

  // Ensure S.store is valid for POS
  const activeStoreId = S.store || S.stores[0]?.id || 1;

  $('#content').innerHTML = `
    <div class="pos-layout">
      <div class="pos-main-col">
        <!-- Search Bar with Instant Clear Button -->
        <div class="search-box">
          ${icon('search', 17)}
          <input id="posSearch" autocomplete="off" inputmode="search" placeholder="Tìm theo tên sản phẩm, thương hiệu, nhóm hàng...">
          <button id="posClearBtn" class="search-clear-btn hidden" onclick="clearPosSearch()">${icon('x', 14)}</button>
          <kbd>/</kbd>
        </div>

        <!-- Category Horizontal Pills Bar with Scroll Controls -->
        <div class="category-pills-wrapper">
          <button type="button" class="pills-scroll-btn prev" onclick="scrollPills('categoryPills', -220)" title="Cuộn trái">${icon('chevron-left', 16)}</button>
          <div class="category-pills" id="categoryPills">
            <button class="category-pill ${S.category === 0 ? 'active' : ''}" data-cat-id="0" onclick="selectPosCategory(0)">
              <span class="cat-pill-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg></span>
              <span>Tất cả</span>
            </button>
            ${S.categories.filter(c => +c.is_active).map(c => `
              <button class="category-pill ${S.category === c.id ? 'active' : ''}" data-cat-id="${c.id}" onclick="selectPosCategory(${c.id})">
                <span class="cat-pill-icon">${getCategoryIcon(c.name, 14)}</span>
                <span>${esc(c.name)}</span>
              </button>
            `).join('')}
          </div>
          <button type="button" class="pills-scroll-btn next" onclick="scrollPills('categoryPills', 220)" title="Cuộn phải">${icon('chevron-right', 16)}</button>
        </div>

        <!-- Sort Toolbar for POS -->
        <div class="pos-sort-bar" id="posSortBar">
          <span class="pos-sort-label">${icon('settings', 12)} Sắp xếp:</span>
          <button class="pos-sort-btn ${(!S.posSort || S.posSort === 'name_asc') ? 'active' : ''}" onclick="setPosSort('name_asc')">Tên A-Z</button>
          <button class="pos-sort-btn ${S.posSort === 'name_desc' ? 'active' : ''}" onclick="setPosSort('name_desc')">Tên Z-A</button>
          <button class="pos-sort-btn ${S.posSort === 'price_asc' ? 'active' : ''}" onclick="setPosSort('price_asc')">Giá: Thấp → Cao</button>
          <button class="pos-sort-btn ${S.posSort === 'price_desc' ? 'active' : ''}" onclick="setPosSort('price_desc')">Giá: Cao → Thấp</button>
          <button class="pos-sort-btn ${S.posSort === 'stock_desc' ? 'active' : ''}" onclick="setPosSort('stock_desc')">Tồn: Nhiều → Ít</button>
        </div>

        <!-- Product Cards Grid (Shopee 2-column) -->
        <div id="posResults" class="product-grid">
          <div class="col-span-full p-8 text-center text-slate-400">Đang tải danh mục sản phẩm...</div>
        </div>
      </div>

      <!-- Cart Panel (Desktop) -->
      <div class="cart-panel">
        <div class="cart-header">
          <h3>${icon('pos', 18)} <span>Giỏ hàng</span> <span id="cartCount" class="count-badge">0</span></h3>
          ${S.cart.length ? `<button class="text-xs text-rose-600 font-semibold hover:underline" onclick="clearCart()">Xóa tất cả</button>` : ''}
        </div>
        <div id="cartBody"></div>
      </div>
    </div>
  `;

  if (typeof initPillsScroll === 'function') {
    initPillsScroll('categoryPills');
  }

  const sInput = $('#posSearch');
  sInput.oninput = debounce(e => {
    const val = e.target.value.trim();
    $('#posClearBtn')?.classList.toggle('hidden', !val);
    searchPos(val);
  }, 140);

  renderCart();
  await searchPos('');
}

window.clearPosSearch = () => {
  const input = $('#posSearch');
  if (!input) return;
  input.value = '';
  $('#posClearBtn')?.classList.add('hidden');
  input.focus();
  searchPos('');
};

window.selectPosCategory = async catId => {
  S.category = +catId;
  document.querySelectorAll('#categoryPills .category-pill').forEach(b => {
    b.classList.toggle('active', +b.dataset.catId === S.category);
  });
  await searchPos($('#posSearch')?.value || '');
};

window.setPosSort = async sort => {
  S.posSort = sort;
  document.querySelectorAll('#posSortBar .pos-sort-btn').forEach(b => b.classList.remove('active'));
  event?.target?.classList?.add('active');
  await searchPos($('#posSearch')?.value || '');
};

window.showProductStockDetail = async (id, name) => {
  try {
    const rows = await api('inventory.product_stores', { params: { product_id: id } });
    const total = rows.reduce((sum, r) => sum + (+r.quantity || 0), 0);
    modal(`
      <div class="modal-header">
        <div class="flex items-center gap-2">
          <h2>Chi tiết tồn kho đa chi nhánh</h2>
        </div>
        <p>Sản phẩm: <b>${esc(name || '')}</b></p>
      </div>

      <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl mb-3 flex items-center justify-between">
        <span class="text-xs font-semibold text-teal-800">Tổng tồn toàn bộ hệ thống AKM:</span>
        <b class="text-base text-teal-900 font-extrabold">${total} cái</b>
      </div>

      <div class="table-wrap mb-4">
        <table>
          <thead>
            <tr>
              <th>Mã kho</th>
              <th>Tên chi nhánh</th>
              <th style="text-align:right;">Số lượng tồn</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><b class="font-mono text-slate-700">${esc(r.store_code)}</b></td>
                <td><b>${esc(r.store_name)}</b></td>
                <td style="text-align:right;"><b class="${+r.quantity <= 0 ? 'text-rose-600' : 'text-teal-700 font-bold'} text-sm">${+r.quantity > 0 ? r.quantity + ' cái' : 'Hết hàng (0)'}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="form-actions flex items-center justify-between">
        <button class="btn ghost sm" type="button" onclick="closeModal()">Đóng</button>
        <button class="btn primary sm inline-flex items-center gap-1.5" type="button" onclick="closeModal(); transferForm(${id});">
          ${icon('transfers', 15)} <span>Tạo phiếu điều chuyển ngay</span>
        </button>
      </div>
    `);
  } catch (err) {
    toast(err.message, 'error');
  }
};

let posSeq = 0;
async function searchPos(q) {
  const seq = ++posSeq;
  const target = $('#posResults');
  if (!target) return;
  target.classList.add('opacity-50');
  try {
    const storeId = S.store || S.stores[0]?.id || 1;
    const params = { store_id: storeId, q, limit: 100, sort: S.posSort || 'name_asc' };
    if (S.category) params.category_id = S.category;
    const ps = await api('products.list', { params, silent: true });
    if (seq !== posSeq || !$('#posResults')) return;

    if (!ps.length) {
      target.innerHTML = `<div class="col-span-full p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">Không tìm thấy sản phẩm phù hợp</div>`;
      return;
    }

    target.innerHTML = ps.map(p => {
      const isOut = +p.quantity <= 0;
      const isLow = +p.quantity > 0 && +p.quantity <= 5;
      
      const imgHtml = p.image_path
        ? `
          <img src="${esc(p.image_path)}" alt="${esc(p.name)}" class="shopee-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="shopee-ph" style="display:none">
            <div class="shopee-ph-icon">${getCategoryIcon(p.category_name, 22)}</div>
            <span class="shopee-ph-brand">${esc(p.brand || 'AKM POS')}</span>
          </div>
        `
        : `
          <div class="shopee-ph">
            <div class="shopee-ph-icon">${getCategoryIcon(p.category_name, 22)}</div>
            <span class="shopee-ph-brand">${esc(p.brand || 'AKM POS')}</span>
          </div>
        `;

      const brandTag = p.brand ? `<span class="shopee-brand-tag">${esc(p.brand)}</span>` : '';
      const lowTag = isLow ? `<span class="shopee-stock-badge">Còn ${p.quantity}</span>` : '';
      const outOverlay = isOut ? `<div class="shopee-out-overlay"><span>HẾT HÀNG</span></div>` : '';

      return `
        <div class="shopee-card ${isOut ? 'is-out' : ''}" data-product="${encodeURIComponent(JSON.stringify({ id: +p.id, name: p.name, sku: p.sku, price: +p.selling_price, stock: +p.quantity, allow_discount: +p.allow_discount }))}">
          <div class="shopee-thumb">
            ${imgHtml}
            ${brandTag}
            ${lowTag}
            ${outOverlay}
          </div>
          <div class="shopee-body">
            ${p.brand ? `
              <div class="shopee-header-line">
                <span class="shopee-brand-pill">${esc(p.brand)}</span>
              </div>
            ` : ''}
            <div class="shopee-name" title="${esc(p.name)}">${esc(p.name)}</div>
            <div class="shopee-bottom">
              <div class="shopee-price">${money(p.selling_price)}</div>
              <div class="shopee-meta">
                <span class="shopee-stock-count">${isOut ? '<span class="text-rose-500 font-bold">Hết hàng</span>' : (isLow ? `<span class="text-amber-600 font-semibold">Kho: <b>${p.quantity}</b></span>` : `Kho: <b class="text-slate-700">${p.quantity}</b>`)}</span>
                <button class="shopee-quick-add" title="Thêm vào giỏ" ${isOut ? 'disabled' : ''}>
                  ${icon('plus', 13)}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    target.querySelectorAll('.shopee-card:not(.is-out)').forEach(el => {
      el.onclick = () => addCart(JSON.parse(decodeURIComponent(el.dataset.product)));
    });
  } catch (err) {
    if (seq === posSeq) target.innerHTML = `<div class="col-span-full alert danger">${esc(err.message)}</div>`;
  } finally {
    if (seq === posSeq) target.classList.remove('opacity-50');
  }
}

window.addCart = p => {
  const existing = S.cart.find(i => i.id === p.id);
  if (existing) {
    if (existing.qty >= p.stock) {
      haptic('error');
      return toast('Đã đạt giới hạn tồn kho của chi nhánh', 'error');
    }
    existing.qty++;
  } else {
    if (p.stock < 1) {
      haptic('error');
      return toast('Sản phẩm đã hết hàng tại kho này', 'error');
    }
    const basePrice = +(p.selling_price || p.price || 0);
    S.cart.push({ ...p, original_price: basePrice, price: basePrice, qty: 1, discount: 0, serial: '', imei: '' });
  }
  haptic('light');
  renderCart();
  toast(`+1 ${p.name}`);
};

window.cartQty = (idx, val) => {
  if (!S.cart[idx]) return;
  const q = Math.max(1, Math.min(S.cart[idx].stock, +val || 1));
  S.cart[idx].qty = q;
  haptic('light');
  renderCart();
};

window.cartPrice = (idx, val) => {
  if (!S.cart[idx]) return;
  const original = S.cart[idx].original_price !== undefined ? +S.cart[idx].original_price : +S.cart[idx].price;
  const next = parseFloat(val);
  if (isNaN(next) || next < original) {
    haptic('error');
    toast(`Không được điều chỉnh giá thấp hơn giá niêm yết (${money(original)})`, 'error');
    renderCart();
    return;
  }
  S.cart[idx].price = next;
  haptic('light');
  renderCart();
};

window.stepCartQty = (idx, delta) => {
  if (!S.cart[idx]) return;
  const next = S.cart[idx].qty + delta;
  if (next < 1) {
    window.rmCart(idx);
    return;
  }
  if (next > S.cart[idx].stock) {
    haptic('error');
    toast('Đã đạt giới hạn tồn kho', 'error');
    return;
  }
  S.cart[idx].qty = next;
  haptic('light');
  renderCart();
};

window.rmCart = idx => {
  haptic('warning');
  S.cart.splice(idx, 1);
  renderCart();
};

window.clearCart = () => {
  if (!confirm('Xóa toàn bộ sản phẩm khỏi giỏ hàng?')) return;
  haptic('warning');
  S.cart = [];
  renderCart();
};

function updateFloatingCart() {
  const bar = $('#floatingCart');
  if (!bar) return;
  if (S.page !== 'pos' || !S.cart.length) {
    bar.classList.add('hidden');
    return;
  }
  const total = S.cart.reduce((a, x) => a + x.price * x.qty - (+x.discount || 0), 0);
  const count = S.cart.reduce((a, x) => a + x.qty, 0);
  $('#floatingCartQty').textContent = count;
  $('#floatingCartTotal').textContent = money(total);
  bar.classList.remove('hidden');
}

function buildCartHtml() {
  const total = S.cart.reduce((a, x) => a + x.price * x.qty - (+x.discount || 0), 0);
  const count = S.cart.reduce((a, x) => a + x.qty, 0);

  if (!S.cart.length) {
    return `
      <div class="py-10 text-center text-slate-400 flex flex-col items-center gap-2">
        ${icon('pos', 32, 'text-slate-300')}
        <span>Giỏ hàng trống</span>
        <small class="text-xs">Chạm vào sản phẩm để thêm vào đơn</small>
      </div>
    `;
  }

  const payMethod = window._currentPaymentMethod || 'CASH';
  const cashGiven = S.cashTendered || total;
  const changeDue = Math.max(0, cashGiven - total);

  return `
    <div class="cart-list">
      ${S.cart.map((x, i) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <b class="truncate" title="${esc(x.name)}">${esc(x.name)}</b>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-slate-500 font-medium">Đơn giá:</span>
              <input type="number" min="${x.original_price || x.price}" step="any" value="${x.price}" class="input font-bold text-teal-800" style="width:96px;height:24px;min-height:auto;padding:0 6px;font-size:12px;text-align:right;background:#f0fdfa;border:1px solid #99f6e4;border-radius:5px;" onchange="cartPrice(${i}, this.value)" title="Điều chỉnh giá bán (Chỉ được tăng giá)">
              <span class="text-[11px] text-teal-800 font-bold">₫</span>
            </div>
          </div>
          <div class="cart-stepper">
            <button type="button" onclick="stepCartQty(${i}, -1)">–</button>
            <input type="number" min="1" max="${x.stock}" value="${x.qty}" onchange="cartQty(${i}, this.value)">
            <button type="button" onclick="stepCartQty(${i}, 1)">+</button>
          </div>
          <div class="cart-item-total">${money(x.price * x.qty - (x.discount || 0))}</div>
          <button type="button" class="cart-item-rm" title="Xóa món" onclick="rmCart(${i})">${icon('trash', 14)}</button>
        </div>
      `).join('')}
    </div>

    <!-- Summary & Payment -->
    <div class="cart-summary">
      <div class="summary-row">
        <span>Tạm tính (${count} món)</span>
        <span>${money(S.cart.reduce((a, x) => a + x.price * x.qty, 0))}</span>
      </div>
      <div class="summary-row">
        <span>Chiết khấu đơn hàng</span>
        <input type="number" id="cartDiscount" min="0" placeholder="0 ₫" value="${S.cart[0]?.discount || 0}" style="max-width:110px;text-align:right;padding:4px 8px;height:32px;min-height:auto;font-size:12px;border-radius:6px;" onchange="applyGlobalDiscount(this.value)">
      </div>
      <div class="summary-row total">
        <span>Tổng thanh toán</span>
        <span class="text-teal-800 font-bold text-base">${money(total)}</span>
      </div>
    </div>

    <!-- Payment Method Selector -->
    <div class="payment-tabs">
      <button type="button" class="payment-tab ${payMethod === 'CASH' ? 'active' : ''}" onclick="selectPaymentMethod('CASH')">
        ${icon('orders', 15)}
        <span>Tiền mặt</span>
      </button>
      <button type="button" class="payment-tab ${payMethod === 'BANK_TRANSFER' ? 'active' : ''}" onclick="selectPaymentMethod('BANK_TRANSFER')">
        ${icon('transfers', 15)}
        <span>Chuyển khoản</span>
      </button>
      <button type="button" class="payment-tab ${payMethod === 'CARD' ? 'active' : ''}" onclick="selectPaymentMethod('CARD')">
        ${icon('audit', 15)}
        <span>Thẻ POS</span>
      </button>
    </div>

    <button type="button" class="btn primary wide mt-3" style="min-height:46px;font-size:14px;letter-spacing:0.3px;" onclick="checkout()">
      ${icon('check', 18)}
      <span>HOÀN TẤT BÁN HÀNG (${money(total)})</span>
    </button>
  `;
}

function renderCart() {
  const total = S.cart.reduce((a, x) => a + x.price * x.qty - (+x.discount || 0), 0);
  const count = S.cart.reduce((a, x) => a + x.qty, 0);

  if ($('#cartCount')) $('#cartCount').textContent = count;
  updateFloatingCart();

  const cartHtml = buildCartHtml();

  // Desktop cart panel
  const desktopCart = $('#cartBody');
  if (desktopCart) desktopCart.innerHTML = cartHtml;

  // Mobile Bottom Sheet modal
  const mobileCart = $('#mobileCartBody');
  if (mobileCart) {
    mobileCart.innerHTML = cartHtml;
  }
}

window.selectPaymentMethod = m => {
  window._currentPaymentMethod = m;
  renderCart();
};

window.setCashTendered = amt => {
  S.cashTendered = +amt;
  renderCart();
};

window.applyGlobalDiscount = val => {
  const d = Math.max(0, +val || 0);
  if (S.cart.length) S.cart[0].discount = d;
  renderCart();
};

// Mobile Bottom Sheet Cart
window.openMobileCart = () => {
  if (!S.cart.length) return toast('Giỏ hàng chưa có sản phẩm', 'warning');
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="cart-header mb-3">
      <h3>${icon('pos', 18)} <span>Chi tiết giỏ hàng (${S.cart.reduce((a, x) => a + x.qty, 0)} món)</span></h3>
      ${S.cart.length ? `<button class="text-xs text-rose-600 font-semibold" onclick="clearCart();closeModal();">Xóa giỏ</button>` : ''}
    </div>
    <div id="mobileCartBody"></div>
  `);
  renderCart();
};

window.checkout = async () => {
  if (!S.cart.length) return toast('Giỏ hàng trống', 'error');
  try {
    const payMethod = window._currentPaymentMethod || 'CASH';
    const storeId = S.store || S.stores[0]?.id || 1;
    const r = await api('sales.create', {
      method: 'POST',
      body: {
        store_id: storeId,
        payment_method: payMethod,
        items: S.cart.map(x => ({
          product_id: x.id,
          quantity: x.qty,
          custom_price: x.price,
          unit_price: x.price,
          discount_amount: x.discount || 0,
          serial_number: x.serial || null,
          imei: x.imei || null
        }))
      }
    });

    closeModal();
    S.cart = [];
    renderCart();

    // ⚡ Realtime stock update on POS grid immediately without page refresh
    if (typeof searchPos === 'function') {
      await searchPos($('#posSearch')?.value || '');
    }
    if (typeof window.broadcastStockUpdated === 'function') {
      window.broadcastStockUpdated({ storeId, orderCode: r.order_code });
    }

    // Fetch and show Thermal Receipt
    const detail = await api('sales.detail', { params: { id: r.id } });
    showReceipt(detail);
    haptic('success');
    toast(`Đã tạo ${r.order_code} thành công!`);

    // 🔔 Trigger instant iOS Native Notification & Banner
    window.showMobilePushBanner({
      id: r.id || Date.now(),
      title: `🛍️ Đơn mới · +${formatMoney(detail.total_amount || 0)}`,
      message: `[${store.name || 'Chi nhánh'}] Đã xuất đơn ${r.order_code} thành công (${payName})`,
      type: 'SALE_NEW',
      severity: 'SUCCESS',
      link_type: 'orders',
      link_id: r.id
    }, true);
    if (typeof window.checkNotifications === 'function') window.checkNotifications(false);
  } catch (err) {
    haptic('error');
    toast(err.message, 'error');
  }
};

/* =========================================================================
   RECEIPT & THERMAL PRINTER
   ========================================================================= */

window.showReceipt = o => {
  const store = S.stores.find(s => s.id === +o.store_id) || {};
  const items = o.items || [];
  const payments = o.payments || [];
  const payMethod = payments[0]?.method || 'CASH';
  const payName = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', CARD: 'Thẻ ngân hàng' }[payMethod] || payMethod;

  const html = `
    <div class="receipt-paper" id="printableReceipt">
      <div class="receipt-header">
        <h2>${esc(store.name || o.store_name || 'AKM MOBILE')}</h2>
        <div>${esc(store.address || o.store_address || '')}</div>
        <div>Hotline: ${esc(store.phone || o.store_phone || '028 7300 1001')}</div>
        <div style="margin-top:5px;font-weight:700;">HÓA ĐƠN BÁN LẺ</div>
      </div>

      <div class="receipt-meta">
        <div>Mã HĐ: <b>${esc(o.order_code)}</b></div>
        <div>Ngày: ${dt(o.created_at)}</div>
        <div>Thu ngân: ${esc(o.full_name || 'Nhân viên')}</div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr>
            <th style="text-align:left">Sản phẩm</th>
            <th style="text-align:center">SL</th>
            <th style="text-align:right">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(it => `
            <tr>
              <td>
                <b>${esc(it.product_name_snapshot)}</b>
                ${it.imei ? `<br><small>IMEI: ${esc(it.imei)}</small>` : ''}
              </td>
              <td style="text-align:center">${it.quantity}</td>
              <td style="text-align:right">${money(it.total_amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="receipt-totals">
        <div class="row"><span>Tạm tính:</span><span>${money(o.subtotal)}</span></div>
        ${+o.discount_amount > 0 ? `<div class="row"><span>Giảm giá:</span><span>-${money(o.discount_amount)}</span></div>` : ''}
        <div class="row grand-total"><span>TỔNG TIỀN:</span><span>${money(o.total_amount)}</span></div>
        <div class="row" style="margin-top:5px;"><span>Thanh toán:</span><span>${payName}</span></div>
      </div>

      <div class="receipt-footer">
        <p>Cảm ơn quý khách đã mua sắm tại AKM Mobile!</p>
        <p>Vui lòng giữ hóa đơn để được hỗ trợ bảo hành và đổi trả.</p>
        <p style="margin-top:5px;font-size:9.5px;color:#94a3b8;">pos.anhkhoamobile.com</p>
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-2 mt-4">
      <button class="btn secondary sm" onclick="closeModal()">Đóng</button>
      ${S.user.role === 'ADMIN' && o.status === 'COMPLETED' ? `
        <button class="btn danger sm" onclick="closeModal(); cancelOrder(${o.id});" title="Hủy hóa đơn này">
          ${icon('trash', 14)}
          <span>Hủy hóa đơn</span>
        </button>
      ` : ''}
      ${o.status === 'COMPLETED' ? `
        <button class="btn warning sm" onclick="closeModal(); openReturn(${o.id});" style="background:#f59e0b;color:#fff;border-color:#d97706;" title="Đổi hoặc trả hàng từ hóa đơn này">
          ${icon('returns', 15)}
          <span>Đổi / Trả hàng</span>
        </button>
      ` : ''}
      <button class="btn primary sm" onclick="printReceipt()">
        ${icon('printer', 16)}
        <span>In hóa đơn (K80/K58)</span>
      </button>
    </div>
  `;

  modal(html);
  const pMirror = $('#thermalReceipt');
  if (pMirror) pMirror.innerHTML = $('#printableReceipt')?.outerHTML || '';
};

window.printReceipt = () => {
  const pMirror = $('#thermalReceipt');
  if (pMirror) pMirror.innerHTML = $('#printableReceipt')?.outerHTML || '';
  window.print();
};

/* =========================================================================
   ORDERS MODULE (Theo dõi hóa đơn theo chi nhánh được chọn từ Head Navigator)
   ========================================================================= */

window._ordersCache = [];
window._orderStatusFilter = 'ALL';

async function orders() {
  const currentStore = S.store ?? 0;
  const currentStoreObj = S.stores.find(s => s.id === +currentStore);
  const storeLabel = +currentStore === 0 ? 'Toàn hệ thống' : (currentStoreObj ? currentStoreObj.name : 'Chi nhánh hiện tại');

  $('#content').innerHTML = head(
    'Quản lý Hóa đơn',
    '',
    `Chi nhánh: <b class="text-teal-800">${esc(storeLabel)}</b> · Danh sách hóa đơn bán hàng (Nhấp vào dòng để xem chi tiết / đổi trả / hủy)`
  ) + `
    <div class="card mb-4">
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Quick Status Filter Pills -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button type="button" class="chart-range-btn ${(!window._orderStatusFilter || window._orderStatusFilter === 'ALL') ? 'active' : ''}" onclick="filterOrdersStatus('ALL')">Tất cả</button>
          <button type="button" class="chart-range-btn ${window._orderStatusFilter === 'COMPLETED' ? 'active' : ''}" onclick="filterOrdersStatus('COMPLETED')">Hoàn tất</button>
          <button type="button" class="chart-range-btn ${window._orderStatusFilter === 'CANCELLED' ? 'active' : ''}" onclick="filterOrdersStatus('CANCELLED')">Đã hủy</button>
        </div>

        <!-- Search Box -->
        <div class="search-box mb-0 flex-1 min-w-[220px]">
          ${icon('search', 16)}
          <input id="ordersSearchInput" placeholder="Tìm theo mã HĐ, tên sản phẩm, thu ngân..." oninput="debounce(filterOrdersList, 150)()">
          <button id="ordersClearBtn" class="search-clear-btn hidden" onclick="clearOrdersSearch()">${icon('x', 14)}</button>
        </div>
      </div>
    </div>

    <div id="ordersTableWrap">
      <div class="p-8 text-center text-slate-400">Đang tải danh sách hóa đơn...</div>
    </div>
  `;

  await loadOrdersTable();
}

window.filterOrdersStatus = status => {
  window._orderStatusFilter = status;
  filterOrdersList();
};

window.clearOrdersSearch = () => {
  const input = $('#ordersSearchInput');
  if (input) {
    input.value = '';
    $('#ordersClearBtn')?.classList.add('hidden');
    filterOrdersList();
  }
};

async function loadOrdersTable() {
  const target = $('#ordersTableWrap');
  if (!target) return;
  try {
    const params = {};
    if (S.store !== undefined && S.store !== null) {
      params.store_id = S.store;
    }
    const rows = await api('sales.list', { params });
    window._ordersCache = rows;
    filterOrdersList();
  } catch (err) {
    target.innerHTML = `<div class="alert danger">${esc(err.message)}</div>`;
  }
}

function formatInvoiceStock(o) {
  const isAllStores = !S.store || S.store === 0;

  if (isAllStores && o.all_stores_stock_summary) {
    const raw = String(o.all_stores_stock_summary);
    return `<span class="invoice-stock-tag in-stock" title="Tồn kho theo từng chi nhánh (Kho 1 | Kho 2 | ...)">${icon('inventory', 11)} Tồn: <b>${esc(raw)}</b></span>`;
  }

  const stockStr = o.stock_summary;
  if (!stockStr && o.current_inventory_total === undefined) {
    return `<span class="invoice-stock-tag neutral">Tồn kho: —</span>`;
  }
  const qty = +stockStr || 0;
  if (qty > 0) {
    return `<span class="invoice-stock-tag in-stock" title="Tồn kho tại chi nhánh hiện tại">${icon('inventory', 11)} Tồn kho: ${qty}</span>`;
  } else {
    return `<span class="invoice-stock-tag out-stock" title="Hết hàng tại chi nhánh hiện tại">${icon('alert', 11)} Hết hàng (0)</span>`;
  }
}

function filterOrdersList() {
  const target = $('#ordersTableWrap');
  if (!target) return;
  const q = ($('#ordersSearchInput')?.value || '').trim().toLowerCase();
  $('#ordersClearBtn')?.classList.toggle('hidden', !q);
  const statusFilter = window._orderStatusFilter || 'ALL';

  let list = (window._ordersCache || []).filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (!q) return true;
    const term = `${o.order_code || ''} ${o.store_name || ''} ${o.full_name || ''} ${o.total_amount || ''} ${o.items_summary || ''}`.toLowerCase();
    return term.includes(q);
  });

  if (!list.length) {
    target.innerHTML = `
      <div class="card p-10 text-center text-slate-400">
        <div class="mb-2">${icon('orders', 32, 'text-slate-300 inline-block')}</div>
        <p class="font-medium">Không tìm thấy hóa đơn nào phù hợp với bộ lọc</p>
        <span class="text-xs text-slate-400">Thử đổi chi nhánh hoặc từ khóa tìm kiếm</span>
      </div>
    `;
    return;
  }

  target.innerHTML = `
    <div class="invoice-list-wrap">
      ${list.map(o => {
        const itemsText = o.items_summary || 'Sản phẩm bán lẻ';
        const stockHtml = formatInvoiceStock(o);
        const isCancelled = o.status === 'CANCELLED';

        return `
          <div class="invoice-card-row ${isCancelled ? 'cancelled' : ''}" onclick="viewOrderDetail(${o.id})" title="Nhấp để xem chi tiết hóa đơn #${esc(o.order_code)}">
            <!-- Cột trái: 2 dòng -->
            <div class="invoice-col-left">
              <!-- Dòng 1: Mã HĐ - Thời gian bán -->
              <div class="invoice-line-top-left">
                <span class="invoice-code">${esc(o.order_code)}</span>
                <span class="invoice-dot">•</span>
                <span class="invoice-time">${dt(o.created_at)}</span>
                ${isCancelled ? `<span class="badge danger text-[10px] py-0 px-1.5 ml-1">Đã hủy</span>` : ''}
                ${+S.store === 0 ? `<span class="badge" style="font-size:10px;padding:0 5px;background:#f1f5f9;color:#475569;margin-left:4px;">${esc(o.store_name)}</span>` : ''}
              </div>
              <!-- Dòng 2: Tên sản phẩm x Số lượng -->
              <div class="invoice-line-bottom-left">
                <span class="invoice-product-names" title="${esc(itemsText)}">${esc(itemsText)}</span>
              </div>
            </div>

            <!-- Cột phải: 2 dòng -->
            <div class="invoice-col-right">
              <!-- Dòng 1: Tổng tiền -->
              <div class="invoice-line-top-right">
                <span class="invoice-total ${isCancelled ? 'line-through text-slate-400' : ''}">${money(o.total_amount)}</span>
              </div>
              <!-- Dòng 2: Tồn kho hiện tại đối với sản phẩm -->
              <div class="invoice-line-bottom-right">
                ${stockHtml}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.viewOrderDetail = async id => {
  try {
    const o = await api('sales.detail', { params: { id } });
    showReceipt(o);
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.cancelOrder = id => {
  modal(`
    <div class="modal-header">
      <h2>Xác nhận hủy hóa đơn #${id}</h2>
      <p>Hủy hóa đơn sẽ tự động hoàn trả số lượng hàng vào kho chi nhánh và ghi vết Audit Log.</p>
    </div>
    <form onsubmit="doCancel(event, ${id})">
      <label>
        <span>Lý do hủy hóa đơn (Bắt buộc)</span>
        <textarea name="reason" placeholder="Ví dụ: Khách đổi ý, sai thông tin thanh toán..." required autofocus></textarea>
      </label>
      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Đóng</button>
        <button class="btn danger" type="submit">Xác nhận hủy & Hoàn tồn</button>
      </div>
    </form>
  `);
};

window.doCancel = async (e, id) => {
  e.preventDefault();
  try {
    await api('sales.cancel', {
      method: 'POST',
      body: { id, reason: new FormData(e.target).get('reason') }
    });
    closeModal();
    toast('Đã hủy hóa đơn và hoàn tồn thành công');
    orders();
  } catch (err) {
    toast(err.message, 'error');
  }
};

/* =========================================================================
   DASHBOARD MODULE (Bộ lọc cửa hàng & Tất cả hệ thống AKM)
   ========================================================================= */

function compactMoney(val) {
  if (!val) return '0 ₫';
  if (val >= 1000000000) return (val / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
  if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + ' tr';
  if (val >= 1000) return (val / 1000).toFixed(0) + ' k';
  return val + ' ₫';
}

window._chartRange = window._chartRange || 14;

window.setChartRange = function(rangeDays) {
  window._chartRange = +rangeDays;
  const container = document.getElementById('dashboardLineChartWrap');
  if (container && window._dashboardTrendRows) {
    container.innerHTML = renderLineChartInner(window._dashboardTrendRows);
  }
};

function lineChart(rows) {
  window._dashboardTrendRows = rows;
  return `<div id="dashboardLineChartWrap">${renderLineChartInner(rows)}</div>`;
}

function renderLineChartInner(allRows) {
  if (!allRows || !allRows.length) return `<div class="p-8 text-center text-slate-400">Chưa có số liệu</div>`;
  const range = window._chartRange || 14;
  const rows = allRows.slice(-range);
  
  const w = 750, h = 240;
  const pLeft = 65, pRight = 25, pTop = 25, pBottom = 38;
  const plotW = w - pLeft - pRight;
  const plotH = h - pTop - pBottom;
  
  const revenues = rows.map(x => +x.revenue || 0);
  const orders = rows.map(x => +x.orders || 0);
  const max = Math.max(1, ...revenues);
  const total = revenues.reduce((a, b) => a + b, 0);
  const totalOrders = orders.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / Math.max(1, rows.length));
  const aov = totalOrders > 0 ? Math.round(total / totalOrders) : 0;
  const peakIdx = revenues.indexOf(max);

  // Period Growth calculation
  let growthBadge = '';
  if (rows.length >= 4) {
    const half = Math.floor(rows.length / 2);
    const prevHalfSum = rows.slice(0, half).reduce((a, x) => a + (+x.revenue || 0), 0);
    const curHalfSum = rows.slice(-half).reduce((a, x) => a + (+x.revenue || 0), 0);
    if (prevHalfSum > 0) {
      const gPct = (((curHalfSum - prevHalfSum) / prevHalfSum) * 100);
      const isUp = gPct >= 0;
      growthBadge = `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
        ${isUp ? '↗ +' : '↘ '}${Math.abs(gPct).toFixed(1)}%
      </span>`;
    } else if (curHalfSum > 0) {
      growthBadge = `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">↗ +100%</span>`;
    }
  }

  const ptsArr = rows.map((x, i) => {
    const cx = pLeft + i * (plotW / Math.max(1, rows.length - 1));
    const cy = pTop + plotH - ((+x.revenue || 0) / max) * plotH;
    const prevRev = i > 0 ? (+rows[i - 1].revenue || 0) : null;
    let dodPct = '';
    if (prevRev !== null) {
      if (prevRev > 0) {
        const d = (((+x.revenue - prevRev) / prevRev) * 100);
        dodPct = (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
      } else if (+x.revenue > 0) {
        dodPct = '+100%';
      } else {
        dodPct = '0%';
      }
    }
    return { cx, cy, x, dodPct, aov: (+x.orders > 0 ? Math.round(+x.revenue / +x.orders) : 0) };
  });

  const pts = ptsArr.map(p => `${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');

  // Y-axis grid lines (100%, 66%, 33%, 0%)
  const yTicks = [
    { ratio: 1, val: max, y: pTop },
    { ratio: 0.66, val: max * 0.66, y: pTop + plotH * 0.34 },
    { ratio: 0.33, val: max * 0.33, y: pTop + plotH * 0.67 },
    { ratio: 0, val: 0, y: pTop + plotH }
  ];

  return `
    <div class="chart-container" id="chartMainContainer">
      <!-- Top Toolbar with Timeframe Filter & KPI Summary -->
      <div class="flex flex-wrap items-center justify-between gap-2 px-1 mb-2 text-xs border-b border-slate-100 pb-2">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Doanh thu ${range} ngày:</span>
            <b class="text-teal-700 font-bold text-sm">${money(total)}</b>
          </div>
          ${growthBadge}
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <span>TB:</span> <b class="text-slate-700 font-semibold">${compactMoney(avg)}/ngày</b> · 
            <span>Đơn:</span> <b class="text-slate-700 font-semibold">${totalOrders}</b> · 
            <span>AOV:</span> <b class="text-slate-700 font-semibold">${compactMoney(aov)}</b>
          </div>
          <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button type="button" class="chart-range-btn ${range === 7 ? 'active' : ''}" onclick="setChartRange(7)">7 ngày</button>
            <button type="button" class="chart-range-btn ${range === 14 ? 'active' : ''}" onclick="setChartRange(14)">14 ngày</button>
            <button type="button" class="chart-range-btn ${range === 30 ? 'active' : ''}" onclick="setChartRange(30)">30 ngày</button>
          </div>
        </div>
      </div>

      <!-- Floating Interactive Tooltip -->
      <div id="chartTooltip" class="chart-tooltip-wrap hidden"></div>

      <svg class="line-chart-svg" id="revenueLineChartSvg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block;">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f766e" stop-opacity="0.32"/>
            <stop offset="60%" stop-color="#0f766e" stop-opacity="0.10"/>
            <stop offset="100%" stop-color="#0f766e" stop-opacity="0.00"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f766e" flood-opacity="0.3"/>
          </filter>
        </defs>

        <!-- Y-Axis Grid Lines & Value Labels -->
        ${yTicks.map(t => `
          <g class="chart-grid-row">
            <line x1="${pLeft}" y1="${t.y.toFixed(1)}" x2="${w - pRight}" y2="${t.y.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="${t.ratio === 0 ? '0' : '4,4'}"/>
            <text x="${pLeft - 10}" y="${(t.y + 3.5).toFixed(1)}" fill="#64748b" font-size="10.5" font-weight="500" text-anchor="end">${compactMoney(t.val)}</text>
          </g>
        `).join('')}

        <!-- Gradient Area Fill under the Curve -->
        <path d="M${pLeft},${pTop + plotH} L${pts.replaceAll(' ', ' L')} L${(w - pRight).toFixed(1)},${pTop + plotH} Z" fill="url(#areaGrad)"/>

        <!-- Main Trend Line -->
        <polyline points="${pts}" fill="none" stroke="#0f766e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

        <!-- Active Hover Guide Line -->
        <line id="chartGuideLine" x1="0" y1="${pTop}" x2="0" y2="${pTop + plotH}" stroke="#0f766e" stroke-width="1.5" stroke-dasharray="3,3" class="hidden" opacity="0.6"/>

        <!-- Data Point Dots & Labels -->
        ${ptsArr.map((p, i) => {
          const isPeak = i === peakIdx && +p.x.revenue > 0;
          const dateLabel = new Date(p.x.day + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          const showXLabel = range <= 10 ? true : (range <= 16 ? (i % 2 === 0 || i === rows.length - 1) : (i % 4 === 0 || i === rows.length - 1));
          return `
            <g class="chart-point-group" data-idx="${i}">
              <circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="${isPeak ? '5' : '3.5'}" fill="#ffffff" stroke="${isPeak ? '#f59e0b' : '#0f766e'}" stroke-width="${isPeak ? '2.8' : '2.2'}">
              </circle>
              ${isPeak ? `
                <text x="${p.cx.toFixed(1)}" y="${(p.cy - 9).toFixed(1)}" fill="#b45309" font-size="10" font-weight="700" text-anchor="middle">👑 ${compactMoney(p.x.revenue)}</text>
              ` : ''}
              ${showXLabel ? `
                <text x="${p.cx.toFixed(1)}" y="${(h - 10).toFixed(1)}" fill="#64748b" font-size="9.5" font-weight="500" text-anchor="middle">
                  ${dateLabel}
                </text>
              ` : ''}
              <!-- Transparent larger target for easier hover/touch -->
              <circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="14" fill="transparent" class="cursor-pointer"
                onmouseenter="showChartTooltip(event, ${i}, ${p.cx}, ${p.cy})"
                onmouseleave="hideChartTooltip()">
              </circle>
            </g>
          `;
        }).join('')}
      </svg>
    </div>
  `;
}

window.showChartTooltip = function(e, idx, cx, cy) {
  const range = window._chartRange || 14;
  const rows = (window._dashboardTrendRows || []).slice(-range);
  const item = rows[idx];
  if (!item) return;

  const tooltip = document.getElementById('chartTooltip');
  const container = document.getElementById('chartMainContainer');
  const guideLine = document.getElementById('chartGuideLine');
  if (!tooltip || !container) return;

  const fullDate = new Date(item.day + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  const aov = +item.orders > 0 ? Math.round(+item.revenue / +item.orders) : 0;
  
  let dodText = '';
  if (idx > 0) {
    const prev = +rows[idx - 1].revenue || 0;
    if (prev > 0) {
      const pct = (((+item.revenue - prev) / prev) * 100);
      dodText = `<span style="color:${pct >= 0 ? '#4ade80' : '#f87171'}">(${pct >= 0 ? '↗ +' : '↘ '}${Math.abs(pct).toFixed(1)}% so với hôm trước)</span>`;
    }
  }

  tooltip.innerHTML = `
    <div style="font-weight:700; color:#cbd5e1; margin-bottom:4px; font-size:11.5px;">📅 ${esc(fullDate)}</div>
    <div style="font-size:13px; font-weight:800; color:#2dd4bf; margin-bottom:3px;">💰 ${money(item.revenue)} ${dodText}</div>
    <div style="display:flex; gap:10px; color:#e2e8f0; font-size:11px;">
      <span>📦 <b>${item.orders || 0}</b> đơn</span>
      <span>🎯 AOV: <b>${money(aov)}</b></span>
    </div>
  `;

  const leftPct = (cx / 750) * 100;
  const topPct = (cy / 240) * 100;

  tooltip.style.left = leftPct + '%';
  tooltip.style.top = topPct + '%';
  tooltip.classList.remove('hidden');

  if (guideLine) {
    guideLine.setAttribute('x1', cx);
    guideLine.setAttribute('x2', cx);
    guideLine.classList.remove('hidden');
  }
};

window.hideChartTooltip = function() {
  const tooltip = document.getElementById('chartTooltip');
  const guideLine = document.getElementById('chartGuideLine');
  if (tooltip) tooltip.classList.add('hidden');
  if (guideLine) guideLine.classList.add('hidden');
};

function paymentDonut(rows) {
  const colors = { CASH: '#0f766e', BANK_TRANSFER: '#2563eb', CARD: '#f59e0b' };
  const names = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', CARD: 'Thẻ POS' };
  const total = rows.reduce((a, x) => a + (+x.amount), 0) || 1;
  let at = 0;
  const parts = rows.map(x => {
    const from = at;
    at += (+x.amount / total) * 360;
    return `${colors[x.method] || '#94a3b8'} ${from}deg ${at}deg`;
  });

  return `
    <div class="donut-container">
      <div class="donut-pie" style="background:conic-gradient(${parts.join(',') || '#e2e8f0 0 360deg'})"></div>
      <div class="donut-legend">
        ${rows.map(x => `
          <div class="legend-item">
            <span class="legend-color" style="background:${colors[x.method] || '#94a3b8'}"></span>
            <span>${names[x.method] || x.method}: <b>${Math.round((+x.amount / total) * 100)}%</b></span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function rankedBars(rows) {
  const max = Math.max(1, ...rows.map(x => +x.quantity));
  return rows.length ? `
    <div class="rank-bars-list">
      ${rows.slice(0, 6).map((x, i) => `
        <div class="rank-bar-row">
          <span class="rank-num">${i + 1}</span>
          <div class="rank-info">
            <div class="flex justify-between text-xs">
              <b class="truncate max-w-[180px]">${esc(x.name)}</b>
              <span>${x.quantity} cái</span>
            </div>
            <div class="rank-track">
              <div class="rank-fill" style="width:${Math.max(5, (+x.quantity / max) * 100)}%"></div>
            </div>
          </div>
          <b class="text-xs font-bold text-slate-800">${money(x.revenue)}</b>
        </div>
      `).join('')}
    </div>
  ` : `<div class="p-6 text-center text-slate-400">Chưa có giao dịch bán</div>`;
}

async function dashboardV2() {
  // Pass store_id: S.store (if S.store === 0, backend aggregates all stores for Admin)
  const d = await api('reports.overview', { params: { store_id: S.store } });
  const k = d.kpi || {};

  const currentStoreName = S.store === 0
    ? 'Toàn bộ chuỗi AKM Mobile'
    : (S.stores.find(s => s.id === S.store)?.name || 'Chi nhánh hiện tại');

  $('#content').innerHTML = head(
    'Tổng quan Hoạt động',
    `<button class="btn secondary sm" onclick="go('reports')">${icon('reports', 15)} <span>Xem báo cáo chi tiết</span></button>`,
    `Đang xem số liệu: <b class="text-teal-800">${esc(currentStoreName)}</b>`
  ) + `
    <!-- Store Filter Pills Bar (Xem từng cửa hàng & Tất cả hệ thống AKM) -->
    <div class="store-filter-bar">
      ${S.user.role === 'ADMIN' ? `
        <button class="store-filter-pill ${S.store === 0 ? 'active' : ''}" onclick="setDashboardStore(0)">
          ⭐ Tất cả hệ thống AKM
        </button>
      ` : ''}
      ${S.stores.map(s => `
        <button class="store-filter-pill ${S.store === s.id ? 'active' : ''}" onclick="setDashboardStore(${s.id})">
          ${esc(s.code)} · ${esc(s.name)}
        </button>
      `).join('')}
    </div>

    <!-- Top KPI Grid -->
    <div class="grid-kpi modern">
      <div class="kpi-card accent-teal">
        <div class="kpi-icon-wrap">${icon('pos', 20)}</div>
        <div class="kpi-data">
          <small>Tổng doanh thu hôm nay</small>
          <strong>${money(k.revenue)}</strong>
          <em>🛒 Bán: ${compactMoney(k.sales_revenue || 0)} · 🛠️ Sửa: ${compactMoney(k.repair_revenue || 0)}</em>
        </div>
      </div>

      <div class="kpi-card accent-blue">
        <div class="kpi-icon-wrap">${icon('orders', 20)}</div>
        <div class="kpi-data">
          <small>Giao dịch hoàn tất</small>
          <strong>${k.orders || 0} <span class="text-xs font-normal text-slate-500">đơn</span> + ${k.repairs_completed || 0} <span class="text-xs font-normal text-slate-500">sửa</span></strong>
          <em>${k.items_sold || 0} sản phẩm đã bán</em>
        </div>
      </div>

      <div class="kpi-card accent-orange">
        <div class="kpi-icon-wrap">${icon('returns', 20)}</div>
        <div class="kpi-data">
          <small>Đổi / Trả hàng hóa</small>
          <strong class="text-rose-600">${k.returns || 0} <span class="text-xs font-normal text-slate-500">vụ</span></strong>
          <em class="text-rose-700 font-semibold">Hoàn: ${money(k.returns_total || 0)} (${k.returns_items_qty || 0} cái)</em>
        </div>
      </div>

      <div class="kpi-card accent-violet">
        <div class="kpi-icon-wrap">${icon('inventory', 20)}</div>
        <div class="kpi-data">
          <small>Tổng tồn kho toàn chuỗi</small>
          <strong>${k.inventory || 0}</strong>
          <em class="text-amber-600 font-semibold">${d.low_stock?.length || 0} mục sắp hết</em>
        </div>
      </div>
    </div>

    <!-- Revenue Sources & Stream Distribution Breakdown -->
    <div class="card mb-4">
      <div class="card-header">
        <div class="card-title">${icon('reports', 16)} <span>Cơ cấu doanh thu theo nguồn (Hôm nay)</span></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
        <div class="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-teal-600 text-white grid place-items-center">${icon('pos', 20)}</div>
            <div>
              <div class="text-xs font-bold text-teal-900">Bán sản phẩm & Phụ kiện</div>
              <div class="text-xs text-teal-700">${k.orders || 0} đơn hàng · ${k.items_sold || 0} sản phẩm</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-base font-extrabold text-teal-950">${money(k.sales_revenue || 0)}</div>
            <div class="text-xs text-teal-600 font-semibold">${k.revenue > 0 ? Math.round(((k.sales_revenue || 0) / k.revenue) * 100) : 0}% tổng DT</div>
          </div>
        </div>

        <div class="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 text-white grid place-items-center">${icon('repairs', 20)}</div>
            <div>
              <div class="text-xs font-bold text-blue-900">Dịch vụ sửa chữa & Thay thế</div>
              <div class="text-xs text-blue-700">${k.repairs_completed || 0} máy hoàn thành</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-base font-extrabold text-blue-950">${money(k.repair_revenue || 0)}</div>
            <div class="text-xs text-blue-600 font-semibold">${k.revenue > 0 ? Math.round(((k.repair_revenue || 0) / k.revenue) * 100) : 0}% tổng DT</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row (Fluid Responsive) -->
    <div class="dashboard-analytics-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('reports', 16)} <span>Doanh thu 14 ngày gần nhất</span></div>
        </div>
        ${lineChart(d.trend || [])}
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('audit', 16)} <span>Cơ cấu thanh toán (30 ngày)</span></div>
        </div>
        ${paymentDonut(d.payment_mix || [])}
      </div>
    </div>

    <!-- Returns & Exchanges Detail Log -->
    ${(d.returns_detail && d.returns_detail.length) ? `
      <div class="card mb-4 border-rose-200">
        <div class="card-header">
          <div class="card-title text-rose-700">${icon('returns', 16)} <span>Chi tiết các vụ việc đổi / trả hàng gần đây</span></div>
          <span class="badge danger">${d.returns_detail.length} vụ việc</span>
        </div>
        ${table(
          ['Mã phiếu trả', 'Hóa đơn gốc', 'Chi nhánh', 'Mặt hàng & SL trả', 'Tiền hoàn', 'Lý do & Nhân viên', 'Ngày tạo'],
          d.returns_detail.map(r => [
            `<b class="text-rose-700 font-mono">${esc(r.return_code)}</b>`,
            `<b>${esc(r.order_code)}</b>`,
            esc(r.store_name),
            `<div class="text-xs max-w-[280px] font-medium text-slate-800">${esc(r.items_summary || '—')}</div>`,
            `<b class="text-rose-600">${money(r.total_amount)}</b>`,
            `<div><span>${esc(r.reason)}</span><br><small class="text-slate-400">NV: ${esc(r.staff_name)}</small></div>`,
            dt(r.created_at)
          ])
        )}
      </div>
    ` : ''}

    <!-- Products & Low Stock Row (3-Column Interactive Card Layout) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <!-- TOP 10 SẢN PHẨM BÁN CHẠY -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('products', 16)} <span>Top 10 sản phẩm bán chạy</span></div>
          <span class="badge info">${(d.top_products || []).length} sản phẩm</span>
        </div>
        <div class="product-list-container">
          ${!(d.top_products && d.top_products.length) ? `
            <div class="p-8 text-center text-xs text-slate-400">Chưa có dữ liệu bán hàng trong 30 ngày qua</div>
          ` : (d.top_products || []).slice(0, 10).map((x, idx) => {
            const isAllStores = !S.store || S.store === 0;
            const imgUrl = x.image_path || x.image_url;
            const imgHtml = imgUrl
              ? `<img src="${esc(imgUrl)}" alt="${esc(x.name)}" class="prod-thumb-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="prod-thumb-fallback" style="display:none">${getCategoryIcon(x.category_name, 20)}</div>`
              : `<div class="prod-thumb-fallback">${getCategoryIcon(x.category_name, 20)}</div>`;

            const rankBadge = idx === 0
              ? '<span class="absolute -top-1.5 -left-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm bg-amber-500 text-white">#1</span>'
              : (idx === 1
                ? '<span class="absolute -top-1.5 -left-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm bg-slate-400 text-white">#2</span>'
                : (idx === 2
                  ? '<span class="absolute -top-1.5 -left-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm bg-amber-700 text-white">#3</span>'
                  : `<span class="absolute -top-1.5 -left-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">#${idx + 1}</span>`));

            let stockTagHtml = '';
            if (isAllStores && x.all_stores_stock) {
              stockTagHtml = `<span class="prod-stock-tag in-stock" title="Tồn kho theo từng chi nhánh">${icon('inventory', 11)} Tồn: <b>${esc(x.all_stores_stock)}</b></span>`;
            } else {
              const isAvail = +(x.stock ?? 0) > 0;
              stockTagHtml = isAvail
                ? `<span class="prod-stock-tag ${+x.stock <= 5 ? 'out-stock' : 'in-stock'}">${icon('inventory', 11)} Tồn: ${x.stock}</span>`
                : `<span class="prod-stock-tag out-stock">${icon('alert', 11)} Hết hàng (0)</span>`;
            }

            return `
              <div class="product-row-card" onclick="showProductStockDetail(${x.product_id}, '${esc(x.name).replace(/'/g, "\\'")}')" title="Nhấp để xem chi tiết tồn kho các chi nhánh">
                <!-- Cột 1: Thumbnail + Rank (20% width) -->
                <div class="prod-col-thumb relative">
                  <div class="prod-thumb-box" style="width:48px;height:48px;min-width:48px;">
                    ${imgHtml}
                  </div>
                  ${rankBadge}
                </div>

                <!-- Cột 2: Tên sản phẩm & Đã bán (40% width) -->
                <div class="prod-col-info">
                  <div class="prod-name-line">
                    <span class="prod-name-text" title="${esc(x.name)}">${esc(x.name)}</span>
                  </div>
                  <div class="prod-cat-line">
                    <span class="text-xs text-teal-800 font-bold">🛒 Đã bán: ${x.quantity} cái</span>
                  </div>
                </div>

                <!-- Cột 3: Doanh thu & Tồn kho (40% width) -->
                <div class="prod-col-pricing">
                  <div class="prod-price-line">
                    <span class="prod-price-text">${money(x.revenue)}</span>
                  </div>
                  <div class="prod-stock-line">
                    ${stockTagHtml}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- CẢNH BÁO SẮP HẾT HÀNG -->
      <div class="card border-amber-200">
        <div class="card-header">
          <div class="card-title text-amber-700">
            ${icon('inventory', 16)} <span>Cảnh báo sắp hết hàng (Tồn &le; ${d.low_stock_threshold})</span>
          </div>
          <span class="badge warning">${(d.low_stock || []).length} mặt hàng</span>
        </div>
        <div class="product-list-container">
          ${!(d.low_stock && d.low_stock.length) ? `
            <div class="p-8 text-center text-xs text-slate-400">
              <p>Tuyệt vời! Tất cả mặt hàng đều đảm bảo mức tồn kho an toàn.</p>
            </div>
          ` : (d.low_stock || []).slice(0, 15).map(x => {
            const isAllStores = !S.store || S.store === 0;
            const imgUrl = x.image_path || x.image_url;
            const imgHtml = imgUrl
              ? `<img src="${esc(imgUrl)}" alt="${esc(x.name)}" class="prod-thumb-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="prod-thumb-fallback" style="display:none">${getCategoryIcon(x.category_name, 20)}</div>`
              : `<div class="prod-thumb-fallback">${getCategoryIcon(x.category_name, 20)}</div>`;

            const isOut = +x.quantity <= 0;
            let stockTagHtml = '';
            if (isAllStores && x.all_stores_stock) {
              const totalNum = +(x.total_stock ?? x.quantity);
              stockTagHtml = totalNum <= 0
                ? `<span class="prod-stock-tag out-stock">${icon('alert', 11)} Hết hàng (0)</span>`
                : `<span class="prod-stock-tag ${isOut ? 'out-stock' : 'in-stock'}" title="Tồn kho theo từng chi nhánh">${icon('inventory', 11)} Tồn: <b>${esc(x.all_stores_stock)}</b></span>`;
            } else {
              stockTagHtml = isOut
                ? `<span class="prod-stock-tag out-stock">${icon('alert', 11)} Hết hàng (0)</span>`
                : `<span class="prod-stock-tag out-stock">${icon('alert', 11)} Còn ${x.quantity} cái</span>`;
            }

            return `
              <div class="product-row-card border-amber-200 hover:border-amber-400" onclick="showProductStockDetail(${x.product_id}, '${esc(x.name).replace(/'/g, "\\'")}')" title="Nhấp để xem chi tiết tồn kho & điều chuyển hàng">
                <!-- Cột 1: Thumbnail + Cảnh báo (20% width) -->
                <div class="prod-col-thumb relative">
                  <div class="prod-thumb-box" style="width:48px;height:48px;min-width:48px;">
                    ${imgHtml}
                  </div>
                  <span class="absolute -top-1.5 -left-1 text-[11px] p-0.5 rounded-full bg-rose-500 text-white shadow-sm flex items-center justify-center">${icon('alert', 11)}</span>
                </div>

                <!-- Cột 2: Tên sản phẩm & Chi nhánh (40% width) -->
                <div class="prod-col-info">
                  <div class="prod-name-line">
                    <span class="prod-name-text" title="${esc(x.name)}">${esc(x.name)}</span>
                  </div>
                  <div class="prod-cat-line">
                    <span class="text-xs text-amber-900 font-semibold flex items-center gap-1">${icon('store', 12)} ${esc(x.store_name || x.store_code || 'Kho')}</span>
                  </div>
                </div>

                <!-- Cột 3: Tồn tại kho & Tổng tồn chuỗi (40% width) -->
                <div class="prod-col-pricing">
                  <div class="prod-price-line">
                    ${stockTagHtml}
                  </div>
                  <div class="prod-stock-line">
                    <span class="text-[11px] text-slate-500 font-medium">Chuỗi: <b class="text-teal-800">${x.total_stock ?? x.quantity} cái</b></span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

window.setDashboardStore = stId => {
  S.store = +stId;
  if ($('#storeSelect')) $('#storeSelect').value = S.store;
  dashboardV2();
};

/* =========================================================================
   REPAIRS MODULE (Phiếu sửa chữa & Gallery & Timeline)
   ========================================================================= */

async function repairs() {
  const rows = await api('repairs.list');
  window._repairList = rows;

  $('#content').innerHTML = head(
    'Phiếu sửa chữa thiết bị',
    `<button class="btn primary sm" onclick="repairForm()">${icon('plus', 16)} <span>Tạo phiếu sửa</span></button>`,
    'Tiếp nhận, xử lý và theo dõi tiến độ sửa chữa điện thoại, linh kiện theo từng chi nhánh'
  ) + table(
    ['Mã phiếu', 'Chi nhánh', 'Khách hàng', 'Điện thoại', 'Thiết bị', 'Phí dịch vụ', 'Kỹ thuật viên', 'Trạng thái', 'Hẹn trả', 'Ghi chú', 'Ảnh', 'Thao tác'],
    rows.map(r => [
      `<b class="text-teal-700 font-mono">${esc(r.repair_code)}</b>`,
      `<span class="badge info font-semibold">${esc(r.store_name)}</span>`,
      esc(r.customer_name),
      `<a class="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline" href="tel:${esc(r.customer_phone)}">${icon('phone', 12)} ${esc(r.customer_phone)}</a>`,
      esc(r.device_name),
      `<b class="text-slate-900 font-bold">${money(r.fee || 0)}</b>`,
      esc(r.technician_name || 'Chưa gán'),
      `<span class="badge ${r.status}">${formatRepairStatus(r.status)}</span>`,
      dt(r.expected_return_at),
      r.staff_note ? `<span class="text-xs text-slate-600 block max-w-[160px] truncate" title="${esc(r.staff_note)}">${esc(r.staff_note)}</span>` : '<span class="text-slate-300">—</span>',
      `<span class="inline-flex items-center gap-1 font-semibold text-slate-600">${icon('camera', 13)} ${r.image_count}</span>`,
      `
        <button class="btn secondary sm" onclick="repairDetail(${r.id})">
          ${icon('eye', 13)} <span>Xử lý</span>
        </button>
      `
    ])
  );
}

function formatRepairStatus(st) {
  const map = {
    RECEIVED: 'Tiếp nhận',
    INSPECTING: 'Đang kiểm tra',
    REPAIRING: 'Đang sửa',
    WAITING_PARTS: 'Chờ linh kiện',
    COMPLETED: 'Đã xong',
    WAITING_PICKUP: 'Chờ nhận',
    RETURNED: 'Đã trả máy'
  };
  return map[st] || st;
}

window.repairDetail = async id => {
  try {
    const r = await api('repairs.detail', { params: { id } });
    const users = await api('users.list').catch(() => []);
    const techs = users.filter(u => +u.is_active);

    const statuses = [
      ['RECEIVED', 'Tiếp nhận'],
      ['INSPECTING', 'Đang kiểm tra'],
      ['REPAIRING', 'Đang sửa chữa'],
      ['WAITING_PARTS', 'Chờ linh kiện'],
      ['COMPLETED', 'Đã sửa xong'],
      ['WAITING_PICKUP', 'Chờ khách nhận'],
      ['RETURNED', 'Đã trả khách']
    ];

    const imagesHtml = (r.images || []).map(img => `
      <div class="repair-thumb" onclick="openLightbox('${esc(img.file_path)}')">
        <img src="${esc(img.file_path)}" alt="Ảnh sửa chữa">
      </div>
    `).join('');

    modal(`
      <div class="modal-header">
        <div class="flex items-center gap-2">
          <h2>Phiếu sửa chữa · ${esc(r.repair_code)}</h2>
          <span class="badge ${r.status}">${formatRepairStatus(r.status)}</span>
        </div>
        <p>Chi nhánh tiếp nhận: <b>${esc(r.store_name)}</b> · Ngày nhận: ${dt(r.received_at)}</p>
      </div>

      <form onsubmit="saveRepairStatus(event, ${r.id})">
        <div class="form-grid">
          <div>
            <label>Khách hàng
              <input value="${esc(r.customer_name)}" disabled>
            </label>
          </div>
          <div>
            <label>Số điện thoại
              <div class="flex gap-2">
                <input value="${esc(r.customer_phone)}" disabled>
                <a class="btn primary sm" href="tel:${esc(r.customer_phone)}">${icon('phone', 13)}</a>
              </div>
            </label>
          </div>
          <div>
            <label>Thiết bị / Model
              <input value="${esc(r.device_name)}" disabled>
            </label>
          </div>
          <div>
            <label>Số IMEI
              <input value="${esc(r.imei || 'Không có')}" disabled>
            </label>
          </div>
          <div class="full">
            <label>Tình trạng máy lúc nhận
              <textarea disabled>${esc(r.device_condition || '—')}</textarea>
            </label>
          </div>
          <div class="full">
            <label>Yêu cầu sửa chữa & Thay linh kiện
              <textarea name="repair_request">${esc(r.repair_request)}</textarea>
            </label>
          </div>
          <div class="full">
            <label class="font-bold text-amber-800">Ghi chú của nhân viên / Kỹ thuật viên (Ghi chú nội bộ)
              <textarea name="staff_note" rows="2" placeholder="vd: Mật khẩu mở máy 123456, linh kiện đã đặt, lưu ý giữ lại cáp zin...">${esc(r.staff_note || '')}</textarea>
            </label>
          </div>
          <div>
            <label>Chi phí dịch vụ / Báo giá (VNĐ)
              <input name="fee" type="number" min="0" step="1000" value="${r.fee || 0}" required>
            </label>
          </div>
          <div>
            <label>Cập nhật trạng thái
              <select name="status">
                ${statuses.map(([k, v]) => `<option value="${k}" ${r.status === k ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </label>
          </div>
          <div>
            <label>Kỹ thuật viên phụ trách
              <select name="technician_id">
                <option value="">Chưa chỉ định</option>
                ${techs.map(t => `<option value="${t.id}" ${+r.technician_id === +t.id ? 'selected' : ''}>${esc(t.full_name)}</option>`).join('')}
              </select>
            </label>
          </div>
          <div>
            <label>Ngày hẹn trả khách
              <input name="expected_return_at" type="datetime-local" value="${r.expected_return_at ? r.expected_return_at.replace(' ', 'T').slice(0, 16) : ''}">
            </label>
          </div>
        </div>

        <!-- Photo Gallery -->
        <div class="mt-3 pt-3 border-t border-slate-200">
          <div class="flex items-center justify-between mb-2">
            <b class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              ${icon('camera', 14)} Ảnh thiết bị (${(r.images || []).length}/5 ảnh)
            </b>
            <small class="text-xs text-slate-400">Tối đa 5 ảnh, nén &lt; 400KB</small>
          </div>

          <div class="repair-gallery">
            ${imagesHtml}
            ${(r.images || []).length < 5 ? `
              <label class="upload-box-tile" title="Chụp ảnh từ camera hoặc tải ảnh lên">
                ${icon('camera', 18)}
                <span>+ Thêm ảnh</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" class="hidden" onchange="uploadRepairPhoto(event, ${r.id})">
              </label>
            ` : ''}
          </div>
        </div>

        <div class="form-actions">
          <button class="btn secondary" type="button" onclick="closeModal()">Đóng</button>
          <button class="btn primary" type="submit">Cập nhật phiếu</button>
        </div>
      </form>
    `);
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.openLightbox = url => {
  const box = document.createElement('div');
  box.className = 'modal';
  box.style.background = 'rgba(0,0,0,0.85)';
  box.innerHTML = `
    <div style="position:relative;max-width:90vw;max-height:90vh;">
      <button class="modal-close" style="background:#fff;" onclick="this.closest('.modal').remove()">×</button>
      <img src="${esc(url)}" style="max-width:100%;max-height:85vh;border-radius:10px;display:block;margin:auto;">
    </div>
  `;
  document.body.append(box);
};

window.uploadRepairPhoto = async (e, repairId) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('repair_id', repairId);
  fd.append('image', file);
  try {
    await api('repairs.upload', { method: 'POST', body: fd });
    toast('Đã tải ảnh lên thành công');
    repairDetail(repairId);
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.saveRepairStatus = async (e, id) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const r = (window._repairList || []).find(x => +x.id === +id) || {};
  try {
    await api('repairs.save', {
      method: 'POST',
      body: {
        id,
        store_id: r.store_id || S.store || 1,
        customer_name: r.customer_name,
        customer_phone: r.customer_phone,
        device_name: r.device_name,
        imei: r.imei,
        device_condition: r.device_condition,
        repair_request: d.repair_request || r.repair_request,
        staff_note: d.staff_note !== undefined ? d.staff_note : (r.staff_note || null),
        fee: Math.max(0, +d.fee || 0),
        status: d.status,
        technician_id: d.technician_id || null,
        received_at: r.received_at,
        expected_return_at: d.expected_return_at || null
      }
    });
    closeModal();
    toast('Đã cập nhật tiến độ sửa chữa');
    repairs();

    // 🔔 Trigger instant notification for repair update
    window.showMobilePushBanner({
      id: id || Date.now(),
      title: d.status === 'COMPLETED' ? `✅ Sửa xong: ${r.device_name || 'Thiết bị'}` : `🔧 Cập nhật sửa: ${r.device_name || 'Thiết bị'}`,
      message: `Khách: ${r.customer_name || 'Khách'} · ${d.status === 'COMPLETED' ? 'Đã hoàn tất sửa chữa, sẵn sàng giao máy' : 'Trạng thái: ' + d.status}`,
      type: d.status === 'COMPLETED' ? 'REPAIR_COMPLETE' : 'REPAIR_UPDATE',
      severity: d.status === 'COMPLETED' ? 'SUCCESS' : 'INFO',
      link_type: 'repairs',
      link_id: id
    }, true);
    if (typeof window.checkNotifications === 'function') window.checkNotifications(false);
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.repairForm = () => {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const defaultStoreId = S.store || S.stores[0]?.id || 1;

  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2>${icon('repairs', 20)} <span>Tiếp nhận sửa chữa mới</span></h2>
      <p>Nhập thông tin khách hàng, chi nhánh tiếp nhận và ghi nhận tình trạng máy ban đầu</p>
    </div>
    <form onsubmit="saveNewRepair(event)">
      <!-- 0. Chi nhánh nhận máy -->
      <div class="form-section">
        <div class="form-section-title">${icon('stores', 14)} <span>1. Chi nhánh tiếp nhận máy</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Chọn chi nhánh nhận máy (Bắt buộc)
              <select name="store_id" required>
                ${S.stores.map(s => `<option value="${s.id}" ${+s.id === +defaultStoreId ? 'selected' : ''}>${esc(s.code)} · ${esc(s.name)}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- 1. Khách hàng -->
      <div class="form-section">
        <div class="form-section-title">${icon('users', 14)} <span>2. Thông tin khách hàng liên hệ</span></div>
        <div class="form-grid">
          <div>
            <label>Họ và tên khách hàng (Bắt buộc)
              <input name="customer_name" placeholder="vd: Anh Tuấn, Chị Lan..." required autofocus>
            </label>
          </div>
          <div>
            <label>Số điện thoại liên hệ (Bắt buộc)
              <input name="customer_phone" type="tel" inputmode="tel" placeholder="0901234567" required>
            </label>
          </div>
        </div>
      </div>

      <!-- 2. Thiết bị & Tình trạng -->
      <div class="form-section">
        <div class="form-section-title">${icon('products', 14)} <span>3. Thiết bị & Tình trạng máy lúc nhận</span></div>
        <div class="form-grid">
          <div>
            <label>Tên thiết bị / Model máy (Bắt buộc)
              <input name="device_name" placeholder="vd: iPhone 14 Pro Max, S23 Ultra..." required>
            </label>
          </div>
          <div>
            <label>Số IMEI / Serial (Nếu có)
              <input name="imei" placeholder="vd: 354928012345678">
            </label>
          </div>
          <div class="full">
            <label>Tình trạng ngoại quan & Lỗi ban đầu
              <textarea name="device_condition" rows="2" placeholder="Trầy xước viền, vỡ kính lưng, loa rè, không nhận sạc..."></textarea>
            </label>
          </div>
        </div>
      </div>

      <!-- 3. Yêu cầu, Ghi chú & Báo giá -->
      <div class="form-section">
        <div class="form-section-title">${icon('audit', 14)} <span>4. Dịch vụ sửa chữa, Ghi chú & Hẹn trả</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Yêu cầu dịch vụ & Thay linh kiện (Bắt buộc)
              <textarea name="repair_request" rows="2" placeholder="vd: Ép kính màn hình, thay pin Pisen chính hãng..." required></textarea>
            </label>
          </div>
          <div class="full">
            <label class="font-bold text-amber-800">Ghi chú của nhân viên (Ghi chú nội bộ, mật khẩu máy, lưu ý linh kiện...)
              <textarea name="staff_note" rows="2" placeholder="vd: Mật khẩu màn hình: 123456, khách cần gấp trước 18h, giữ lại ốp lưng và thẻ nhớ..."></textarea>
            </label>
          </div>
          <div class="full">
            <label>Chi phí dự kiến / Báo giá khách hàng (VNĐ)
              <input name="fee" type="number" min="0" step="1000" placeholder="vd: 350000" value="0">
            </label>
          </div>
          <div>
            <label>Thời gian tiếp nhận máy
              <input name="received_at" type="datetime-local" value="${now}" required>
            </label>
          </div>
          <div>
            <label>Hẹn giờ trả khách (Dự kiến)
              <input name="expected_return_at" type="datetime-local">
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy bỏ</button>
        <button class="btn primary" type="submit">${icon('check', 16)} <span>Lưu phiếu tiếp nhận</span></button>
      </div>
    </form>
  `);
};

window.saveNewRepair = async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  d.store_id = +d.store_id || S.store || S.stores[0]?.id || 1;
  d.fee = Math.max(0, +d.fee || 0);
  d.status = 'RECEIVED';
  try {
    const r = await api('repairs.save', { method: 'POST', body: d });
    closeModal();
    toast(`Đã tạo phiếu sửa chữa #${r.id}`);
    repairs();

    // 🔔 Trigger instant notification for repair creation
    window.showMobilePushBanner({
      id: r.id || Date.now(),
      title: `🔧 Tiếp nhận sửa: ${d.device_name}`,
      message: `Khách: ${d.customer_name} (${d.customer_phone}) · Yêu cầu: ${d.repair_request}`,
      type: 'REPAIR_CREATE',
      severity: 'INFO',
      link_type: 'repairs',
      link_id: r.id
    }, true);
    if (typeof window.checkNotifications === 'function') window.checkNotifications(false);
  } catch (err) {
    toast(err.message, 'error');
  }
};

/* =========================================================================
   TRANSFERS MODULE (Điều chuyển kho & Tra tồn đa chi nhánh)
   ========================================================================= */

async function transfers() {
  const rows = await api('transfers.list');
  $('#content').innerHTML = head(
    'Điều chuyển hàng liên chi nhánh',
    `<button class="btn primary sm" onclick="transferForm()">${icon('plus', 16)} <span>Tạo phiếu xin hàng</span></button>`,
    'Xin hàng và điều phối tồn kho giữa các chi nhánh AKM'
  ) + table(
    ['Mã phiếu', 'Kho gửi', 'Kho nhận', 'Mặt hàng & SL', 'Người tạo', 'Trạng thái', 'Ngày yêu cầu', 'Thao tác'],
    rows.map(x => {
      const itemsText = (x.items || []).map(it => `
        <div><b>${esc(it.name)}</b>: <b>${it.quantity}</b> cái <small class="text-slate-400">· Kho nguồn còn ${it.from_store_stock}</small></div>
      `).join('') || '—';

      const canDecide = S.user.role === 'ADMIN' && x.status === 'REQUESTED';

      return [
        `<b class="text-teal-700 font-mono">${esc(x.transfer_code)}</b>`,
        esc(x.from_store),
        esc(x.to_store),
        itemsText,
        esc(x.requested_name),
        `<span class="badge ${x.status}">${x.status === 'COMPLETED' ? 'Đã chuyển' : x.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}</span>`,
        dt(x.requested_at),
        canDecide ? `
          <div class="flex gap-2">
            <button class="btn primary sm" onclick="decideTransfer(${x.id}, 'approve')">Duyệt</button>
            <button class="btn danger sm" onclick="decideTransfer(${x.id}, 'reject')">Từ chối</button>
          </div>
        ` : '—'
      ];
    })
  );
}

/* =========================================================================
   MOBILE & PWA SMART PRODUCT PICKER COMPONENT
   ========================================================================= */

window._smartPickers = {};

window.renderSmartProductPicker = function({
  containerId,
  products = [],
  selectedId = null,
  inputName = 'product_id',
  placeholder = 'Tìm sản phẩm theo tên, thương hiệu, nhóm hàng...',
  onSelect = () => {},
  showCategories = true,
  maxDisplay = 60
}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const state = {
    products: products || [],
    filtered: [...(products || [])],
    selectedId: selectedId ? +selectedId : null,
    searchQuery: '',
    selectedCategory: 0,
    isExpanded: !selectedId,
  };

  function getSelectedProduct() {
    return state.products.find(p => +p.id === +state.selectedId) || null;
  }

  function filterProducts() {
    const q = (state.searchQuery || '').toLowerCase().trim();
    state.filtered = state.products.filter(p => {
      if (state.selectedCategory !== 0 && +p.category_id !== +state.selectedCategory) return false;
      if (!q) return true;
      const term = `${p.name || ''} ${p.category_name || ''} ${p.brand || ''}`.toLowerCase();
      return term.includes(q);
    });
  }

  function render() {
    const selected = getSelectedProduct();

    if (selected && !state.isExpanded) {
      // Pinned selected card view
      const imgHtml = selected.image_path
        ? `<img src="${esc(selected.image_path)}" alt="${esc(selected.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"><div class="picker-item-thumb" style="display:none">${getCategoryIcon(selected.category_name, 18)}</div>`
        : getCategoryIcon(selected.category_name, 18);

      container.innerHTML = `
        <div class="smart-product-picker">
          <input type="hidden" name="${esc(inputName)}" id="${container.id}_hiddenInput" value="${selected.id}">
          <div class="picker-selected-card">
            <div class="picker-selected-info">
              <div class="picker-item-thumb">${imgHtml}</div>
              <div class="picker-item-details">
                <div class="picker-item-name">${esc(selected.name)}</div>
                <div class="picker-item-sub">
                  ${selected.brand ? `<span class="prod-brand-badge">${esc(selected.brand)}</span>` : ''}
                  ${selected.category_name ? `<span class="badge" style="font-size:9.5px;padding:1px 5px;background:#f1f5f9;color:#475569;">${esc(selected.category_name)}</span>` : ''}
                  <span class="picker-item-price">${money(selected.selling_price)}</span>
                </div>
              </div>
            </div>
            <button type="button" class="picker-change-btn" onclick="window._smartPickers['${container.id}'].toggleExpand(true)" title="Tìm & chọn sản phẩm khác">
              ${icon('search', 12)}
              <span>Đổi SP</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Expanded search & list view
    filterProducts();
    const displayList = state.filtered.slice(0, maxDisplay);
    const categories = S.categories || [];

    container.innerHTML = `
      <div class="smart-product-picker">
        <input type="hidden" name="${esc(inputName)}" id="${container.id}_hiddenInput" value="${state.selectedId || ''}">
        
        <!-- Live Search Box -->
        <div class="picker-search-wrap">
          ${icon('search', 15, 'search-icon')}
          <input type="text" class="picker-search-input" placeholder="${esc(placeholder)}" value="${esc(state.searchQuery)}" oninput="window._smartPickers['${container.id}'].onSearch(this.value)">
          ${state.searchQuery ? `<button type="button" class="picker-clear-btn" onclick="window._smartPickers['${container.id}'].clearSearch()">${icon('x', 14)}</button>` : ''}
        </div>

        <!-- Quick Category Chips -->
        ${showCategories && categories.length ? `
          <div class="picker-cats-bar">
            <button type="button" class="picker-cat-chip ${state.selectedCategory === 0 ? 'active' : ''}" onclick="window._smartPickers['${container.id}'].selectCategory(0)">
              Tất cả (${state.products.length})
            </button>
            ${categories.filter(c => +c.is_active).map(c => `
              <button type="button" class="picker-cat-chip ${state.selectedCategory === +c.id ? 'active' : ''}" onclick="window._smartPickers['${container.id}'].selectCategory(${c.id})">
                ${getCategoryIcon(c.name, 12)}
                <span>${esc(c.name)}</span>
              </button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Product Results Scrollable List -->
        <div class="picker-results-list">
          ${!displayList.length ? `
            <div class="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Không tìm thấy sản phẩm nào phù hợp với từ khóa "${esc(state.searchQuery)}"
            </div>
          ` : displayList.map(p => {
            const isSel = +p.id === +state.selectedId;
            const isAvail = +(p.quantity ?? 1) > 0;
            const imgHtml = p.image_path
              ? `<img src="${esc(p.image_path)}" alt="${esc(p.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"><div class="picker-item-thumb" style="display:none">${getCategoryIcon(p.category_name, 18)}</div>`
              : getCategoryIcon(p.category_name, 18);

            return `
              <div class="picker-item-card ${isSel ? 'selected' : ''}" onclick="window._smartPickers['${container.id}'].selectProduct(${p.id})">
                <div class="picker-item-thumb">${imgHtml}</div>
                <div class="picker-item-details">
                  <div class="picker-item-name">${esc(p.name)}</div>
                  <div class="picker-item-sub">
                    ${p.brand ? `<span class="prod-brand-badge">${esc(p.brand)}</span>` : ''}
                    ${p.category_name ? `<span class="badge" style="font-size:9.5px;padding:1px 5px;background:#f1f5f9;color:#475569;">${esc(p.category_name)}</span>` : ''}
                  </div>
                </div>
                <div class="picker-item-price-col">
                  <span class="picker-item-price">${money(p.selling_price)}</span>
                  ${p.quantity !== undefined ? `
                    <span class="picker-item-stock ${isAvail ? 'in-stock' : 'out-stock'}">
                      ${isAvail ? `Tồn: ${p.quantity}` : 'Hết hàng'}
                    </span>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  window._smartPickers[container.id] = {
    onSearch(q) {
      state.searchQuery = q;
      render();
      const inp = container.querySelector('.picker-search-input');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    },
    clearSearch() {
      state.searchQuery = '';
      render();
    },
    selectCategory(catId) {
      state.selectedCategory = +catId;
      render();
    },
    selectProduct(pid) {
      state.selectedId = +pid;
      state.isExpanded = false;
      render();
      const p = getSelectedProduct();
      if (typeof onSelect === 'function') onSelect(p);
    },
    toggleExpand(expanded) {
      state.isExpanded = expanded;
      render();
    },
    getSelectedId() {
      return state.selectedId;
    }
  };

  render();
};

window._transferState = {
  products: [],
  selectedProductId: null,
  selectedProduct: null,
  storeStocks: [],
  fromStoreId: null,
  toStoreId: null,
  maxAvailableStock: 0,
};

window.transferForm = async (preSelectedProductId) => {
  const ps = await api('products.list', { params: { limit: 300, all: 1 } });
  const defaultToStore = S.store || S.stores[0]?.id || 1;
  window._transferState = {
    products: ps,
    selectedProductId: preSelectedProductId ? +preSelectedProductId : null,
    selectedProduct: null,
    storeStocks: [],
    fromStoreId: null,
    toStoreId: defaultToStore,
    maxAvailableStock: 0,
  };

  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <div class="flex items-center gap-2">
        <h2>Tạo phiếu điều chuyển kho</h2>
        <span class="badge info font-semibold">Quy trình điều chuyển</span>
      </div>
      <p class="text-xs text-slate-500">Chọn sản phẩm ➔ Xem tồn kho các chi nhánh ➔ Chọn kho xuất khả dụng ➔ Chọn kho đích ➔ Hoàn tất (Chờ duyệt)</p>
    </div>

    <form id="transferModalForm" onsubmit="saveTransfer(event)">
      <!-- STEP 1: CHỌN SẢN PHẨM (SMART PRODUCT PICKER) -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold inline-flex items-center justify-center">1</span>
            <span>Chọn sản phẩm cần điều chuyển</span>
            <span class="text-rose-500">*</span>
          </span>
          <span id="transferProductStatusTag" class="text-[11px] text-slate-400 font-normal">Chưa chọn sản phẩm</span>
        </label>
        
        <div id="transferProductPickerContainer"></div>
      </div>

      <!-- STEP 2: HIỂN THỊ CÁC KHO AVAILABLE & CHỌN KHO KHẢ QUAN (KHO XUẤT) -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold inline-flex items-center justify-center">2</span>
            <span>Chọn kho xuất (Kho nguồn có sẵn hàng)</span>
            <span class="text-rose-500">*</span>
          </span>
          <span id="transferSourceHint" class="text-[11px] text-teal-800 font-semibold"></span>
        </label>

        <div id="transferStoresContainer" class="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl min-h-[90px]">
          <div class="text-center py-4 text-xs text-slate-400">
            ${icon('inventory', 24, 'inline-block text-slate-300 mb-1')}
            <p>Vui lòng chọn sản phẩm ở Bước 1 để kiểm tra tồn kho các chi nhánh</p>
          </div>
        </div>
      </div>

      <!-- STEP 3: CHỌN KHO ĐÍCH (KHO NHẬN) -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold inline-flex items-center justify-center">3</span>
            <span>Chọn kho đích (Chi nhánh nhận hàng)</span>
            <span class="text-rose-500">*</span>
          </span>
          <span class="text-[11px] text-slate-500 font-normal">Khác kho xuất</span>
        </label>

        <select id="transferToStoreSelect" name="to_store_id" class="w-full text-sm font-medium border border-slate-300 rounded-xl p-2.5 bg-white focus:border-teal-500 shadow-sm" onchange="onTransferToStoreChange(+this.value)" required>
          <option value="">-- Chọn chi nhánh nhận hàng --</option>
          ${S.stores.map(s => `
            <option value="${s.id}" ${+s.id === +defaultToStore ? 'selected' : ''}>${esc(s.name)} (${esc(s.code)})</option>
          `).join('')}
        </select>
      </div>

      <!-- STEP 4: SỐ LƯỢNG & GHI CHÚ & HOÀN TẤT -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span class="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold inline-flex items-center justify-center">4</span>
            <span>Số lượng & Lý do điều chuyển</span>
          </span>
          <span id="transferMaxStockHint" class="text-xs font-semibold text-teal-800"></span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Số lượng chuyển (cái):</label>
            <div class="flex items-center gap-1.5">
              <button type="button" class="btn ghost sm px-3 font-bold border border-slate-300 bg-white hover:bg-slate-100" onclick="stepTransferQty(-1)">-</button>
              <input id="transferQtyInput" name="quantity" type="number" min="1" max="9999" value="1" class="input font-bold text-center text-teal-900 bg-white" style="width:70px;" oninput="updateTransferSummary()" required>
              <button type="button" class="btn ghost sm px-3 font-bold border border-slate-300 bg-white hover:bg-slate-100" onclick="stepTransferQty(1)">+</button>
              <button type="button" class="btn secondary sm text-xs px-2 py-1" onclick="setTransferMaxQty()" title="Chuyển toàn bộ số lượng khả dụng">Tối đa</button>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Trạng thái phiếu khi lập:</label>
            <div class="flex items-center gap-1.5 py-1">
              <span class="badge warning font-semibold text-xs px-2.5 py-1">⏳ Chờ duyệt (REQUESTED)</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú / Lý do điều chuyển:</label>
          <div class="flex flex-wrap gap-1 mb-1.5">
            <button type="button" class="btn ghost sm text-[10px] py-0.5 px-1.5 bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-800" onclick="fillTransferNote('Bổ sung tồn kho do chi nhánh hết hàng')">Hết hàng cục bộ</button>
            <button type="button" class="btn ghost sm text-[10px] py-0.5 px-1.5 bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-800" onclick="fillTransferNote('Khách đặt cọc cần máy gấp')">Khách đặt gấp</button>
            <button type="button" class="btn ghost sm text-[10px] py-0.5 px-1.5 bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-800" onclick="fillTransferNote('Cân bằng tồn kho chuỗi định kỳ')">Cân bằng kho</button>
          </div>
          <input id="transferNoteInput" name="request_note" type="text" class="input text-xs w-full bg-white" placeholder="Ví dụ: Khách tại chi nhánh cần gấp, chuyển từ kho tổng sang...">
        </div>
      </div>

      <!-- ROUTE SUMMARY BANNER -->
      <div id="transferSummaryBanner" class="p-3 bg-teal-50 border border-teal-200 rounded-xl mb-4 text-xs">
        <div class="font-bold text-teal-900 mb-1">Tóm tắt lệnh điều chuyển:</div>
        <div class="text-slate-600">Vui lòng chọn sản phẩm và kho xuất để xem tóm tắt</div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Đóng</button>
        <button id="transferSubmitBtn" class="btn primary" type="submit" disabled>
          ${icon('transfers', 15)}
          <span>Hoàn tất phiếu (Trạng thái chờ duyệt)</span>
        </button>
      </div>
    </form>
  `);

  window.renderSmartProductPicker({
    containerId: 'transferProductPickerContainer',
    products: ps,
    selectedId: preSelectedProductId ? +preSelectedProductId : null,
    placeholder: 'Tìm kiếm sản phẩm điều chuyển (theo tên, thương hiệu)...',
    onSelect: p => {
      window.onTransferProductChange(p ? p.id : null);
    }
  });

  if (preSelectedProductId) {
    window.onTransferProductChange(+preSelectedProductId);
  }
};

window.onTransferProductChange = async pid => {
  const container = document.getElementById('transferStoresContainer');
  const tag = document.getElementById('transferProductStatusTag');
  if (!container) return;

  if (!pid) {
    window._transferState.selectedProductId = null;
    window._transferState.selectedProduct = null;
    window._transferState.storeStocks = [];
    window._transferState.fromStoreId = null;
    container.innerHTML = `
      <div class="text-center py-4 text-xs text-slate-400">
        ${icon('inventory', 24, 'inline-block text-slate-300 mb-1')}
        <p>Vui lòng chọn sản phẩm ở Bước 1 để kiểm tra tồn kho các chi nhánh</p>
      </div>
    `;
    if (tag) tag.textContent = 'Chưa chọn sản phẩm';
    updateTransferSummary();
    return;
  }

  const p = window._transferState.products.find(x => +x.id === +pid);
  window._transferState.selectedProductId = pid;
  window._transferState.selectedProduct = p;
  if (tag && p) tag.innerHTML = `<b class="text-teal-800">${esc(p.name)}</b>`;

  container.innerHTML = `
    <div class="text-center py-3 text-xs text-teal-700">
      <span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
      <span>Đang tra cứu số lượng tồn kho trên toàn chuỗi...</span>
    </div>
  `;

  try {
    const stores = await api('inventory.product_stores', { params: { product_id: pid } });
    window._transferState.storeStocks = stores;

    const availableStores = stores.filter(s => +s.quantity > 0);

    if (!stores.length) {
      container.innerHTML = `<div class="p-3 text-xs text-center text-slate-400">Không có dữ liệu kho của sản phẩm này</div>`;
      updateTransferSummary();
      return;
    }

    if (!availableStores.length) {
      container.innerHTML = `
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          ${icon('alert-triangle', 18, 'text-amber-600 flex-shrink-0')}
          <div>
            <b>Tất cả các chi nhánh đều đang hết mặt hàng này (0 cái)!</b>
            <p class="text-[11px] text-amber-700 mt-0.5">Không có kho nào khả dụng để xuất hàng điều chuyển.</p>
          </div>
        </div>
      `;
      window._transferState.fromStoreId = null;
      updateTransferSummary();
      return;
    }

    // Render interactive store cards
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        ${stores.map(s => {
          const qty = +s.quantity || 0;
          const isAvail = qty > 0;
          return `
            <div id="transferStoreCard_${s.store_id}" class="p-2.5 rounded-xl border transition-all cursor-pointer ${isAvail ? 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-sm' : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'}" onclick="${isAvail ? `selectTransferSourceStore(${s.store_id})` : ''}">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span id="transferStoreCheck_${s.store_id}" class="w-4 h-4 rounded-full border border-slate-300 inline-flex items-center justify-center text-[10px] bg-white"></span>
                  <span>${esc(s.store_name)}</span>
                </span>
                <span class="badge ${isAvail ? (qty > 5 ? 'success' : 'warning') : ''}" style="font-size:10.5px;">
                  ${isAvail ? `Tồn: ${qty} cái` : 'Hết hàng (0)'}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 flex items-center justify-between">
                <span>${esc(s.store_code || '')}</span>
                <span class="text-[10.5px] ${isAvail ? 'text-teal-700 font-semibold' : 'text-slate-400'}">${isAvail ? 'Bấm chọn xuất' : 'Không khả dụng'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Auto select the first store with available stock or highest stock
    const bestStore = availableStores.reduce((max, s) => (+s.quantity > +max.quantity ? s : max), availableStores[0]);
    if (bestStore) {
      selectTransferSourceStore(bestStore.store_id);
    }
  } catch (err) {
    container.innerHTML = `<div class="p-3 text-xs text-rose-500 text-center">${esc(err.message)}</div>`;
  }
};

window.selectTransferSourceStore = storeId => {
  window._transferState.fromStoreId = storeId;
  const storeObj = (window._transferState.storeStocks || []).find(s => +s.store_id === +storeId);
  const qty = +(storeObj?.quantity || 0);
  window._transferState.maxAvailableStock = qty;

  // Update card highlights
  (window._transferState.storeStocks || []).forEach(s => {
    const card = document.getElementById('transferStoreCard_' + s.store_id);
    const check = document.getElementById('transferStoreCheck_' + s.store_id);
    if (!card) return;
    if (+s.store_id === +storeId) {
      card.classList.add('bg-teal-50', 'border-teal-600', 'ring-2', 'ring-teal-500/20');
      card.classList.remove('bg-white', 'border-slate-200');
      if (check) {
        check.className = 'w-4 h-4 rounded-full bg-teal-700 text-white inline-flex items-center justify-center text-[10px] font-bold';
        check.textContent = '✓';
      }
    } else {
      card.classList.remove('bg-teal-50', 'border-teal-600', 'ring-2', 'ring-teal-500/20');
      if (+s.quantity > 0) card.classList.add('bg-white', 'border-slate-200');
      if (check) {
        check.className = 'w-4 h-4 rounded-full border border-slate-300 inline-flex items-center justify-center text-[10px] bg-white';
        check.textContent = '';
      }
    }
  });

  // Update hint
  const hint = document.getElementById('transferSourceHint');
  if (hint && storeObj) {
    hint.textContent = `Đã chọn: ${storeObj.store_name} (Có ${qty} cái)`;
  }

  // Update quantity input limits
  const qtyInp = document.getElementById('transferQtyInput');
  const maxHint = document.getElementById('transferMaxStockHint');
  if (qtyInp) {
    qtyInp.max = qty;
    if (+qtyInp.value > qty) qtyInp.value = qty;
    if (+qtyInp.value < 1 && qty > 0) qtyInp.value = 1;
  }
  if (maxHint) {
    maxHint.textContent = `Tối đa: ${qty} cái`;
  }

  // Synchronize destination store selector
  const toSel = document.getElementById('transferToStoreSelect');
  if (toSel) {
    Array.from(toSel.options).forEach(opt => {
      if (+opt.value === +storeId) {
        opt.disabled = true;
        opt.textContent = `${opt.textContent.replace(' (Kho xuất hiện tại)', '')} (Kho xuất hiện tại)`;
      } else {
        opt.disabled = false;
        opt.textContent = opt.textContent.replace(' (Kho xuất hiện tại)', '');
      }
    });

    if (+toSel.value === +storeId || !toSel.value) {
      const otherOpt = Array.from(toSel.options).find(o => o.value && !o.disabled);
      if (otherOpt) toSel.value = otherOpt.value;
    }
    window._transferState.toStoreId = +toSel.value;
  }

  updateTransferSummary();
};

window.onTransferToStoreChange = toStoreId => {
  window._transferState.toStoreId = toStoreId;
  updateTransferSummary();
};

window.stepTransferQty = delta => {
  const inp = document.getElementById('transferQtyInput');
  if (!inp) return;
  const cur = +inp.value || 1;
  const max = window._transferState.maxAvailableStock || 9999;
  const next = Math.max(1, Math.min(max, cur + delta));
  inp.value = next;
  updateTransferSummary();
};

window.setTransferMaxQty = () => {
  const inp = document.getElementById('transferQtyInput');
  if (!inp) return;
  const max = window._transferState.maxAvailableStock || 1;
  inp.value = max;
  updateTransferSummary();
};

window.fillTransferNote = text => {
  const inp = document.getElementById('transferNoteInput');
  if (inp) {
    inp.value = text;
    inp.focus();
  }
};

window.updateTransferSummary = () => {
  const banner = document.getElementById('transferSummaryBanner');
  const btn = document.getElementById('transferSubmitBtn');
  if (!banner || !btn) return;

  const { selectedProduct, fromStoreId, toStoreId, maxAvailableStock, storeStocks } = window._transferState;
  const qty = +(document.getElementById('transferQtyInput')?.value || 1);

  if (!selectedProduct) {
    banner.className = 'p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs text-slate-500';
    banner.innerHTML = `<div class="font-semibold text-slate-600">Bước 1: Vui lòng chọn sản phẩm cần điều chuyển</div>`;
    btn.disabled = true;
    return;
  }

  if (!fromStoreId || maxAvailableStock <= 0) {
    banner.className = 'p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-900';
    banner.innerHTML = `<div class="font-semibold">Bước 2: Vui lòng chọn kho xuất có sẵn hàng (Tồn > 0)</div>`;
    btn.disabled = true;
    return;
  }

  if (!toStoreId || +fromStoreId === +toStoreId) {
    banner.className = 'p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-900';
    banner.innerHTML = `<div class="font-semibold">Bước 3: Vui lòng chọn kho đích khác kho xuất</div>`;
    btn.disabled = true;
    return;
  }

  if (qty <= 0 || qty > maxAvailableStock) {
    banner.className = 'p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4 text-xs text-rose-900';
    banner.innerHTML = `<div class="font-semibold">Số lượng chuyển (${qty}) vượt quá tồn khả dụng (${maxAvailableStock})</div>`;
    btn.disabled = true;
    return;
  }

  const fromStoreObj = (storeStocks || []).find(s => +s.store_id === +fromStoreId);
  const toStoreObj = S.stores.find(s => +s.id === +toStoreId);

  banner.className = 'p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs text-emerald-950';
  banner.innerHTML = `
    <div class="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>Xác nhận thông tin điều chuyển:</span>
    </div>
    <div class="flex items-center gap-2 flex-wrap font-medium text-slate-800 mb-2">
      <span class="px-2 py-1 bg-white rounded-lg border border-teal-300 font-bold text-teal-800 flex items-center gap-1">
        ${icon('stores', 12)} ${esc(fromStoreObj?.store_name || 'Kho nguồn')} (Còn ${maxAvailableStock})
      </span>
      <span class="text-teal-600 font-extrabold text-sm">➔</span>
      <span class="px-2 py-1 bg-white rounded-lg border border-emerald-300 font-bold text-emerald-800 flex items-center gap-1">
        ${icon('stores', 12)} ${esc(toStoreObj?.name || 'Kho đích')}
      </span>
    </div>
    <div class="text-[11.5px] text-slate-600 bg-white/80 p-2 rounded-lg border border-emerald-100 flex items-center justify-between flex-wrap gap-2">
      <div>Sản phẩm: <b>${esc(selectedProduct.name)}</b> · SL chuyển: <b class="text-emerald-700 text-sm font-extrabold">${qty}</b> cái</div>
      <div>Trạng thái: <span class="badge warning font-semibold">Chờ duyệt (REQUESTED)</span></div>
    </div>
  `;

  btn.disabled = false;
};

window.saveTransfer = async e => {
  e.preventDefault();
  const { selectedProductId, fromStoreId, toStoreId, maxAvailableStock } = window._transferState;
  const qty = +(document.getElementById('transferQtyInput')?.value || 1);
  const note = (document.getElementById('transferNoteInput')?.value || '').trim();

  if (!selectedProductId) return toast('Vui lòng chọn sản phẩm cần điều chuyển', 'error');
  if (!fromStoreId) return toast('Vui lòng chọn kho xuất khả dụng', 'error');
  if (!toStoreId || +fromStoreId === +toStoreId) return toast('Kho nguồn và kho đích phải khác nhau', 'error');
  if (qty < 1 || qty > maxAvailableStock) return toast(`Số lượng chuyển phải từ 1 đến ${maxAvailableStock}`, 'error');

  try {
    const r = await api('transfers.create', {
      method: 'POST',
      body: {
        from_store_id: +fromStoreId,
        to_store_id: +toStoreId,
        request_note: note,
        items: [{ product_id: +selectedProductId, quantity: qty }]
      }
    });
    closeModal();
    toast(`Đã tạo phiếu điều chuyển ${r.transfer_code} (Trạng thái: Chờ duyệt)`);
    transfers();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.decideTransfer = async (id, decision) => {
  const isApprove = decision === 'approve';
  const reason = isApprove ? '' : prompt('Nhập lý do từ chối phiếu xin hàng:') || 'Admin từ chối';
  if (!isApprove && !reason) return;

  if (!confirm(isApprove ? 'Xác nhận DUYỆT điều chuyển hàng? Tồn kho sẽ được trừ tại kho gửi và cộng vào kho nhận.' : 'Từ chối phiếu xin hàng này?')) return;

  try {
    await api('transfers.decide', {
      method: 'POST',
      body: { id, decision, reason }
    });
    toast(isApprove ? 'Đã duyệt điều chuyển thành công' : 'Đã từ chối phiếu xin hàng');
    transfers();
  } catch (err) {
    toast(err.message, 'error');
  }
};

/* =========================================================================
   RETURNS MODULE (Đổi / Trả hàng hóa & Hoàn tồn tự động)
   ========================================================================= */

async function returnsPage() {
  const currentStoreName = S.store === 0 ? 'Tất cả hệ thống AKM' : (S.stores.find(s => s.id === S.store)?.name || 'Chi nhánh hiện tại');
  $('#content').innerHTML = head(
    'Đổi / Trả hàng hóa',
    '',
    `Chi nhánh: <b class="text-teal-800">${esc(currentStoreName)}</b> · Tiếp nhận đổi trả sản phẩm, tính tiền hoàn và cập nhật tồn kho tự động`
  ) + `
    <div class="card mb-4">
      <div class="card-title mb-2">
        ${icon('search', 16)} <span>Tìm kiếm hóa đơn bán hàng cần đổi trả</span>
      </div>
      <div class="flex gap-2 flex-wrap">
        <div class="search-box mb-0 flex-1">
          ${icon('search', 16)}
          <input id="returnOrderSearch" placeholder="Nhập mã hóa đơn (vd: HD260831...) hoặc tên thu ngân, chi nhánh...">
        </div>
        <select id="returnOrderSort" class="w-auto" style="min-width:140px;max-width:180px;">
          <option value="date_desc">Ngày mới nhất</option>
          <option value="date_asc">Ngày cũ nhất</option>
          <option value="amount_desc">Tổng tiền cao nhất</option>
        </select>
      </div>
      <div id="returnOrders" class="mt-3"></div>
    </div>

    <div class="card">
      <div class="card-title mb-2">${icon('returns', 16)} <span>Lịch sử đổi / trả gần đây</span></div>
      <div id="returnHistory"></div>
    </div>
  `;

  $('#returnOrderSearch').oninput = debounce(loadReturnOrders, 160);
  $('#returnOrderSort').onchange = loadReturnOrders;

  const h = await api('returns.list');
  $('#returnHistory').innerHTML = table(
    ['Mã phiếu trả', 'Hóa đơn gốc', 'Chi nhánh', 'Thu ngân', 'Tiền hoàn trả', 'Lý do', 'Ngày tạo', 'Thao tác'],
    h.map(x => [
      `<b class="text-rose-700 font-mono">${esc(x.return_code)}</b>`,
      `<span class="font-bold text-teal-800 font-mono cursor-pointer hover:underline" onclick="viewOrderDetail(${x.order_id})">${esc(x.order_code)}</span>`,
      esc(x.store_name),
      esc(x.full_name),
      `<b class="text-rose-600 font-bold">${money(x.total_amount)}</b>`,
      esc(x.reason),
      dt(x.created_at),
      `<button class="btn secondary sm" onclick="viewReturnDetail(${x.id})">${icon('eye', 13)} <span>Chi tiết</span></button>`
    ])
  );

  loadReturnOrders();
}

async function loadReturnOrders() {
  const target = $('#returnOrders');
  if (!target) return;
  const q = $('#returnOrderSearch')?.value || '';
  const sort = $('#returnOrderSort')?.value || 'date_desc';
  const storeId = S.store || 0;
  try {
    const list = await api('sales.search', { params: { q, sort, store_id: storeId }, silent: true });
    if (!list.length) {
      target.innerHTML = `<div class="p-6 text-center text-slate-400">Không tìm thấy hóa đơn nào phù hợp</div>`;
      return;
    }
    target.innerHTML = table(
      ['Mã hóa đơn', 'Chi nhánh', 'Thu ngân', 'Giá trị', 'Ngày mua', 'Trạng thái', 'Thao tác'],
      list.map(o => [
        `<b class="text-teal-800 font-mono cursor-pointer hover:underline" onclick="openReturn(${o.id})">${esc(o.order_code)}</b>`,
        esc(o.store_name),
        esc(o.full_name),
        money(o.total_amount),
        dt(o.created_at),
        `<span class="badge ${o.status}">${o.status}</span>`,
        o.status === 'COMPLETED' ? `
          <button class="btn primary sm" onclick="openReturn(${o.id})">
            ${icon('returns', 13)} <span>Chọn đổi trả</span>
          </button>
        ` : '<span class="text-xs text-slate-400">Đã hủy</span>'
      ])
    );
  } catch (e) {
    target.innerHTML = `<div class="alert danger">${esc(e.message)}</div>`;
  }
}

window.openReturn = async id => {
  try {
    const o = await api('sales.detail', { params: { id } });
    const storeProducts = await api('products.list', { params: { store_id: o.store_id || S.store, limit: 500, all: 1 } }).catch(() => []);
    
    window._returnOrder = o;
    window._returnItems = o.items || [];
    window._returnMode = 'refund'; // 'refund' | 'exchange'
    window._exchangeCart = []; // [{ id, name, selling_price, stock, qty }]
    window._exchangeAvailableProducts = storeProducts || [];
    window._exchangeSearchQ = '';

    // Check total returnable items
    const totalReturnable = (o.items || []).reduce((sum, it) => {
      const ret = +it.returned_quantity || 0;
      return sum + Math.max(0, (+it.quantity || 0) - ret);
    }, 0);

    modal(`
      <div class="sheet-drag-handle"></div>
      <div class="modal-header">
        <div class="flex items-center gap-2">
          <h2>Tạo phiếu đổi / trả hàng</h2>
          <span class="badge warning font-mono">${esc(o.order_code)}</span>
        </div>
        <p>Chi nhánh: <b>${esc(o.store_name)}</b> · Ngày mua: ${dt(o.created_at)} · Thu ngân: ${esc(o.full_name || 'Nhân viên')}</p>
      </div>

      <!-- Mode Selection Tabs -->
      <div class="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
        <button type="button" id="returnModeTabRefund" class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white text-teal-800 shadow-sm border border-slate-200" onclick="switchReturnMode('refund')">
          ${icon('returns', 15)} <span>Trả hàng hoàn tiền</span>
        </button>
        <button type="button" id="returnModeTabExchange" class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900" onclick="switchReturnMode('exchange')">
          ${icon('transfers', 15)} <span>Đổi sang SP khác</span>
        </button>
      </div>

      <form onsubmit="saveReturn(event, ${o.id})">
        <!-- Return Items Section -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              ${icon('returns', 14, 'text-rose-600')}
              <span>1. Chọn mặt hàng khách muốn trả lại:</span>
            </label>
            <span class="text-[11px] text-slate-500 font-medium">Tự cộng lại tồn kho</span>
          </div>

          <div class="table-wrap mb-2 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th style="text-align:center">Đã mua</th>
                  <th style="text-align:center">Đã trả</th>
                  <th style="text-align:right">Đơn giá</th>
                  <th style="text-align:center;min-width:140px;">SL đổi trả</th>
                </tr>
              </thead>
              <tbody>
                ${(o.items || []).map(it => {
                  const purchased = +it.quantity || 0;
                  const alreadyReturned = +it.returned_quantity || 0;
                  const maxReturn = Math.max(0, purchased - alreadyReturned);
                  const isFullyReturned = maxReturn <= 0;

                  return `
                    <tr class="${isFullyReturned ? 'bg-slate-50 opacity-60' : ''}">
                      <td>
                        <b class="text-slate-900">${esc(it.product_name_snapshot)}</b>
                        ${it.imei ? `<br><small class="text-slate-400 font-mono">IMEI: ${esc(it.imei)}</small>` : ''}
                      </td>
                      <td style="text-align:center"><b>${purchased}</b></td>
                      <td style="text-align:center"><span class="${alreadyReturned > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}">${alreadyReturned}</span></td>
                      <td style="text-align:right" class="font-mono">${money(it.unit_price)}</td>
                      <td style="text-align:center">
                        ${isFullyReturned ? `
                          <span class="inline-block text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Đã trả hết</span>
                        ` : `
                          <div class="flex items-center justify-center gap-1">
                            <button type="button" class="btn ghost sm px-2 py-0.5" onclick="stepReturnQty(${it.id}, -1)">-</button>
                            <input id="ret_qty_${it.id}" name="q_${it.id}" type="number" min="0" max="${maxReturn}" value="0" data-price="${it.unit_price}" style="width:52px;text-align:center;padding:4px;min-height:auto;font-weight:bold;" oninput="updateReturnCalculation()">
                            <button type="button" class="btn ghost sm px-2 py-0.5" onclick="stepReturnQty(${it.id}, 1, ${maxReturn})">+</button>
                            <button type="button" class="btn secondary sm text-[10px] px-1.5 py-0.5" onclick="setReturnMax(${it.id}, ${maxReturn})" title="Trả toàn bộ số lượng còn lại">Max</button>
                          </div>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Exchange Section (Visible only when Mode === 'exchange') -->
        <div id="exchangeSection" class="hidden mb-4 p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xs font-bold text-sky-900 flex items-center gap-1.5">
              ${icon('transfers', 14, 'text-sky-600')}
              <span>2. Chọn sản phẩm đổi mới từ kho hiện hành:</span>
            </label>
            <span class="text-[11px] text-sky-700">Tự trừ tồn kho khi hoàn tất</span>
          </div>

          <!-- Product search for exchange -->
          <div class="relative mb-2">
            <input type="text" id="exchangeProdSearch" class="input text-xs pl-8 bg-white border-sky-300 focus:border-sky-500 w-full" placeholder="Tìm kiếm sản phẩm trong kho để đổi..." oninput="onSearchExchangeProduct(this.value)">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">${icon('search', 14)}</span>
          </div>

          <!-- Quick Dropdown Results for Exchange -->
          <div id="exchangeSearchResults" class="max-h-44 overflow-y-auto bg-white border border-sky-200 rounded-xl mb-3 shadow-sm divide-y divide-slate-100 hidden"></div>

          <!-- Exchange Cart Table -->
          <div id="exchangeCartContainer">
            <div class="p-3 text-center text-xs text-sky-700 bg-sky-100/50 rounded-lg border border-sky-200/80">
              Chưa chọn sản phẩm đổi mới nào. Hãy tìm kiếm ở ô trên và bấm "+" để thêm.
            </div>
          </div>
        </div>

        <!-- Financial Summary / Refund box -->
        <div id="refundSummaryBox" class="p-3 bg-amber-50/80 border border-amber-200 rounded-xl mb-3">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ${icon('returns', 16)}
              </div>
              <div>
                <label for="customReturnTotal" class="text-xs font-bold text-slate-800 block cursor-pointer">
                  Tổng tiền hoàn trả lại khách (₫) <span class="text-rose-500">*</span>
                </label>
                <span class="text-[11px] text-slate-500">Tự động tính theo SP, nhân viên có thể nhập chỉnh sửa số tiền</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input id="customReturnTotal" name="total_amount" type="number" min="0" step="any" value="0" class="input font-mono font-bold text-base text-right text-emerald-700 bg-white border-slate-300 focus:border-teal-500 shadow-sm" style="width:160px;" placeholder="0" required>
              <button type="button" class="btn ghost sm text-[11px] text-slate-500 hover:text-teal-700" onclick="resetReturnTotalCalc()" title="Tính lại chuẩn theo đơn giá sản phẩm">Tự tính</button>
            </div>
          </div>
        </div>

        <!-- Exchange Financial Balance Box (Visible when Mode === 'exchange') -->
        <div id="exchangeBalanceBox" class="hidden p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
            <div class="p-2 bg-white rounded-lg border border-slate-200">
              <span class="text-slate-500 block">Tổng tiền hàng trả:</span>
              <b id="exReturnSum" class="text-slate-800 font-mono text-sm">0₫</b>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200">
              <span class="text-slate-500 block">Tổng tiền hàng đổi mới:</span>
              <b id="exNewSum" class="text-sky-700 font-mono text-sm">0₫</b>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200" id="exDiffContainer">
              <span class="text-slate-500 block" id="exDiffLabel">Chênh lệch:</span>
              <b id="exDiffValue" class="text-emerald-700 font-mono text-sm font-extrabold">0₫</b>
            </div>
          </div>
          <div class="text-[11.5px] text-slate-500" id="exDiffNote">
            Hệ thống sẽ tự động cập nhật tồn kho (+ hàng trả, - hàng đổi mới).
          </div>
        </div>

        <!-- Reason Section with Quick Tags -->
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-700 mb-1">
            <span>Lý do đổi / trả hàng (Bắt buộc)</span>
          </label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <button type="button" class="btn ghost sm text-[11px] py-0.5 px-2 bg-slate-100 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onclick="fillReturnReason('Sản phẩm lỗi kỹ thuật / ngoại quan')">Hàng lỗi kỹ thuật</button>
            <button type="button" class="btn ghost sm text-[11px] py-0.5 px-2 bg-slate-100 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onclick="fillReturnReason('Khách muốn đổi sang dòng sản phẩm khác')">Đổi sang SP khác</button>
            <button type="button" class="btn ghost sm text-[11px] py-0.5 px-2 bg-slate-100 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onclick="fillReturnReason('Sai màu sắc / thông số kỹ thuật')">Sai mẫu / màu</button>
            <button type="button" class="btn ghost sm text-[11px] py-0.5 px-2 bg-slate-100 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onclick="fillReturnReason('Khách đổi ý trả hàng nguyên vẹn')">Khách đổi ý</button>
          </div>
          <textarea id="returnReasonTextarea" name="reason" rows="2" placeholder="Ví dụ: Sản phẩm bị lỗi cảm ứng, khách muốn đổi sang máy khác hoặc hoàn tiền..." required autofocus></textarea>
        </div>

        <div class="form-actions">
          <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
          <button class="btn primary" id="returnSubmitBtn" type="submit" ${totalReturnable <= 0 ? 'disabled' : ''}>
            ${icon('returns', 14)}
            <span id="returnSubmitText">Xác nhận đổi trả & Hoàn tồn</span>
          </button>
        </div>
      </form>
    `);
    updateReturnCalculation();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.switchReturnMode = mode => {
  window._returnMode = mode;
  const isEx = mode === 'exchange';
  
  const tabRefund = document.getElementById('returnModeTabRefund');
  const tabExchange = document.getElementById('returnModeTabExchange');
  const exSec = document.getElementById('exchangeSection');
  const refundBox = document.getElementById('refundSummaryBox');
  const balanceBox = document.getElementById('exchangeBalanceBox');
  const subText = document.getElementById('returnSubmitText');

  if (tabRefund && tabExchange) {
    if (isEx) {
      tabRefund.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900';
      tabExchange.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-sky-700 text-white shadow-sm';
    } else {
      tabRefund.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white text-teal-800 shadow-sm border border-slate-200';
      tabExchange.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900';
    }
  }

  if (exSec) exSec.classList.toggle('hidden', !isEx);
  if (refundBox) refundBox.classList.toggle('hidden', isEx);
  if (balanceBox) balanceBox.classList.toggle('hidden', !isEx);

  if (subText) {
    subText.textContent = isEx ? 'Xác nhận đổi hàng & Cập nhật kho' : 'Xác nhận trả hàng & Hoàn tồn';
  }

  if (isEx) {
    renderExchangeCart();
    renderExchangeSearchResults('');
  }
  updateReturnCalculation();
};

window.onSearchExchangeProduct = q => {
  renderExchangeSearchResults(q);
};

window.renderExchangeSearchResults = q => {
  const container = document.getElementById('exchangeSearchResults');
  if (!container) return;
  const term = (q || '').trim().toLowerCase();
  if (!term) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  const termNonAccent = nonAccent(term);
  const matches = (window._exchangeAvailableProducts || []).filter(p => {
    const text = `${p.name || ''} ${p.brand || ''} ${p.category_name || ''}`.toLowerCase();
    const textNonAccent = nonAccent(text);
    return text.includes(term) || textNonAccent.includes(termNonAccent);
  }).slice(0, 15);

  if (!matches.length) {
    container.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">Không tìm thấy sản phẩm phù hợp trong kho</div>`;
    container.classList.remove('hidden');
    return;
  }

  container.innerHTML = matches.map(p => {
    const inCart = (window._exchangeCart || []).find(x => +x.id === +p.id);
    const currQty = inCart ? inCart.qty : 0;
    const stock = p.quantity !== undefined ? +p.quantity : 999;
    const canAdd = currQty < stock && stock > 0;

    return `
      <div class="p-2.5 flex items-center justify-between gap-2 hover:bg-sky-50/50 transition-colors">
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-slate-800 truncate">${esc(p.name)}</div>
          <div class="flex items-center gap-2 text-[11px] text-slate-500">
            <span class="font-mono text-teal-700 font-bold">${money(p.selling_price)}</span>
            <span>· Tồn kho: <b class="${stock <= 0 ? 'text-rose-600' : (stock <= 3 ? 'text-amber-600' : 'text-slate-700')}">${stock > 0 ? stock : 'Hết hàng'}</b></span>
            ${p.category_name ? `<span class="badge" style="font-size:9px;padding:1px 4px;">${esc(p.category_name)}</span>` : ''}
          </div>
        </div>
        <button type="button" class="btn ${canAdd ? 'primary' : 'secondary'} sm text-xs px-2.5 py-1" onclick="addExchangeItem(${p.id})" ${canAdd ? '' : 'disabled'}>
          ${icon('plus', 12)} <span>${inCart ? `Đã chọn (${currQty})` : '+ Chọn đổi'}</span>
        </button>
      </div>
    `;
  }).join('');
  container.classList.remove('hidden');
};

window.addExchangeItem = productId => {
  const pid = +productId;
  let p = (window._exchangeAvailableProducts || []).find(x => +x.id === pid)
    || (S.products || []).find(x => +x.id === pid)
    || (window._products || []).find(x => +x.id === pid);
  if (!p) return toast('Không tìm thấy thông tin sản phẩm', 'error');
  
  const stock = p.quantity !== undefined ? +p.quantity : 999;
  if (stock <= 0) {
    return toast(`Sản phẩm "${p.name}" hiện đã hết hàng trong kho`, 'warning');
  }

  if (!window._exchangeCart) window._exchangeCart = [];
  const existing = window._exchangeCart.find(x => +x.id === pid);
  if (existing) {
    if (existing.qty < stock) {
      existing.qty += 1;
      toast(`Đã tăng SL đổi: ${p.name} (${existing.qty})`);
    } else {
      toast(`Kho chỉ còn ${stock} sản phẩm "${p.name}"`, 'warning');
    }
  } else {
    window._exchangeCart.push({
      id: +p.id,
      name: p.name,
      selling_price: +p.selling_price || 0,
      stock: stock,
      qty: 1
    });
    toast(`Đã thêm sản phẩm đổi: ${p.name}`);
  }
  renderExchangeCart();
  renderExchangeSearchResults(document.getElementById('exchangeProdSearch')?.value || '');
  updateReturnCalculation();
};

window.removeExchangeItem = productId => {
  const pid = +productId;
  window._exchangeCart = (window._exchangeCart || []).filter(x => +x.id !== pid);
  renderExchangeCart();
  renderExchangeSearchResults(document.getElementById('exchangeProdSearch')?.value || '');
  updateReturnCalculation();
};

window.stepExchangeQty = (productId, delta) => {
  const pid = +productId;
  const item = (window._exchangeCart || []).find(x => +x.id === pid);
  if (!item) return;
  const next = item.qty + delta;
  if (next <= 0) {
    window.removeExchangeItem(pid);
  } else if (next > item.stock) {
    toast(`Kho chỉ còn ${item.stock} sản phẩm`, 'warning');
  } else {
    item.qty = next;
    renderExchangeCart();
    updateReturnCalculation();
  }
};

window.renderExchangeCart = () => {
  const container = document.getElementById('exchangeCartContainer');
  if (!container) return;
  const cart = window._exchangeCart || [];
  if (!cart.length) {
    container.innerHTML = `
      <div class="p-3 text-center text-xs text-sky-700 bg-sky-100/50 rounded-lg border border-sky-200/80">
        Chưa chọn sản phẩm đổi mới nào. Hãy tìm kiếm ở ô trên và bấm "+" để thêm.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap border border-sky-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <table class="text-xs">
        <thead>
          <tr class="bg-sky-100/60">
            <th>Mặt hàng đổi mới</th>
            <th style="text-align:right">Đơn giá</th>
            <th style="text-align:center">SL đổi</th>
            <th style="text-align:right">Thành tiền</th>
            <th style="text-align:center;width:40px;"></th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(it => `
            <tr>
              <td><b class="text-slate-900">${esc(it.name)}</b></td>
              <td style="text-align:right" class="font-mono">${money(it.selling_price)}</td>
              <td style="text-align:center">
                <div class="flex items-center justify-center gap-1">
                  <button type="button" class="btn ghost sm px-1.5 py-0.5" onclick="stepExchangeQty(${it.id}, -1)">-</button>
                  <b class="w-6 text-center">${it.qty}</b>
                  <button type="button" class="btn ghost sm px-1.5 py-0.5" onclick="stepExchangeQty(${it.id}, 1)">+</button>
                </div>
              </td>
              <td style="text-align:right" class="font-mono font-bold text-sky-700">${money(it.qty * it.selling_price)}</td>
              <td style="text-align:center">
                <button type="button" class="btn ghost sm text-rose-500 hover:text-rose-700 p-1" onclick="removeExchangeItem(${it.id})" title="Bỏ chọn">${icon('trash', 13)}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

window.stepReturnQty = (itemId, delta, maxVal) => {
  const inp = document.getElementById('ret_qty_' + itemId);
  if (!inp) return;
  const current = +inp.value || 0;
  const max = maxVal !== undefined ? maxVal : (+inp.max || 9999);
  const next = Math.max(0, Math.min(max, current + delta));
  inp.value = next;
  updateReturnCalculation();
};

window.setReturnMax = (itemId, maxVal) => {
  const inp = document.getElementById('ret_qty_' + itemId);
  if (!inp) return;
  inp.value = maxVal;
  updateReturnCalculation();
};

window.fillReturnReason = text => {
  const area = document.getElementById('returnReasonTextarea');
  if (!area) return;
  area.value = text;
  area.focus();
};

window.updateReturnCalculation = () => {
  const inputs = document.querySelectorAll('input[id^="ret_qty_"]');
  let returnTotal = 0;
  inputs.forEach(inp => {
    const qty = +inp.value || 0;
    const price = +inp.dataset.price || 0;
    returnTotal += qty * price;
  });

  const exchangeCart = window._exchangeCart || [];
  const exchangeTotal = exchangeCart.reduce((sum, it) => sum + (it.qty * it.selling_price), 0);

  const elRefund = document.getElementById('customReturnTotal');
  if (elRefund && window._returnMode !== 'exchange') {
    elRefund.value = returnTotal;
  }

  // Update Exchange Balance Box
  const exRetEl = document.getElementById('exReturnSum');
  const exNewEl = document.getElementById('exNewSum');
  const exDiffEl = document.getElementById('exDiffValue');
  const exDiffLabel = document.getElementById('exDiffLabel');
  const exDiffNote = document.getElementById('exDiffNote');

  if (exRetEl) exRetEl.textContent = money(returnTotal);
  if (exNewEl) exNewEl.textContent = money(exchangeTotal);

  if (exDiffEl && exDiffLabel) {
    const diff = exchangeTotal - returnTotal;
    if (diff > 0) {
      exDiffLabel.textContent = 'Khách cần bù thêm:';
      exDiffEl.textContent = '+' + money(diff);
      exDiffEl.className = 'text-rose-600 font-mono text-sm font-extrabold';
      if (exDiffNote) exDiffNote.textContent = 'Khách hàng thanh toán thêm số tiền chênh lệch khi nhận hàng mới.';
    } else if (diff < 0) {
      exDiffLabel.textContent = 'Cửa hàng hoàn lại:';
      exDiffEl.textContent = money(Math.abs(diff));
      exDiffEl.className = 'text-emerald-700 font-mono text-sm font-extrabold';
      if (exDiffNote) exDiffNote.textContent = 'Cửa hàng hoàn tiền chênh lệch cho khách do hàng mới có giá thấp hơn.';
    } else {
      exDiffLabel.textContent = 'Chênh lệch:';
      exDiffEl.textContent = '0₫ (Đổi ngang)';
      exDiffEl.className = 'text-sky-700 font-mono text-sm font-extrabold';
      if (exDiffNote) exDiffNote.textContent = 'Hai sản phẩm có giá trị ngang nhau, không phát sinh chênh lệch tiền.';
    }
  }
};

window.resetReturnTotalCalc = () => {
  window.updateReturnCalculation();
};

window.saveReturn = async (e, orderId) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const reason = (fd.get('reason') || '').trim();
  if (!reason) return toast('Vui lòng nhập lý do đổi trả hàng', 'error');

  const items = (window._returnItems || []).map(x => ({
    order_item_id: +x.id,
    quantity: +fd.get('q_' + x.id)
  })).filter(x => x.quantity > 0);

  if (!items.length) return toast('Vui lòng chọn số lượng đổi trả ít nhất 1 sản phẩm', 'error');

  const isExchange = window._returnMode === 'exchange';
  const exchangeItems = isExchange ? (window._exchangeCart || []) : [];

  if (isExchange && !exchangeItems.length) {
    return toast('Vui lòng chọn ít nhất 1 sản phẩm đổi mới từ kho', 'error');
  }

  const body = {
    order_id: orderId,
    reason,
    items,
    exchange_items: exchangeItems.map(it => ({
      product_id: it.id,
      quantity: it.qty,
      unit_price: it.selling_price
    }))
  };

  if (!isExchange) {
    const customTotal = parseFloat(fd.get('total_amount'));
    if (!isNaN(customTotal) && customTotal >= 0) {
      body.total_amount = customTotal;
    }
  }

  try {
    const r = await api('returns.create', {
      method: 'POST',
      body
    });
    closeModal();
    if (isExchange) {
      toast(`Đã tạo phiếu đổi hàng ${r.return_code} thành công`);
    } else {
      toast(`Đã tạo phiếu trả ${r.return_code} · Hoàn ${money(r.total)}`);
    }
    
    // ⚡ Broadcast realtime stock & UI refresh
    if (typeof window.broadcastStockUpdated === 'function') {
      window.broadcastStockUpdated({ orderId, returnCode: r.return_code });
    }

    if (S.page === 'returns') {
      returnsPage();
    } else if (S.page === 'orders') {
      orders();
    } else if (S.page === 'inventory') {
      inventory();
    }
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.viewReturnDetail = async id => {
  try {
    const r = await api('returns.detail', { params: { id } });
    const hasExchange = r.exchange_items && r.exchange_items.length > 0;
    const returnSum = (r.items || []).reduce((s, it) => s + (+it.amount || 0), 0);
    const exchangeSum = (r.exchange_items || []).reduce((s, it) => s + (+it.total_amount || 0), 0);

    modal(`
      <div class="sheet-drag-handle"></div>
      <div class="modal-header">
        <div class="flex items-center gap-2">
          <h2>Chi tiết phiếu ${hasExchange ? 'đổi hàng' : 'trả hàng'} · ${esc(r.return_code)}</h2>
          <span class="badge ${hasExchange ? 'info' : 'warning'}">${hasExchange ? 'Đổi hàng' : 'Trả hàng'}</span>
        </div>
        <p>Hóa đơn gốc: <b>${esc(r.order_code)}</b> · Chi nhánh: ${esc(r.store_name)} · Thu ngân: ${esc(r.staff_name)}</p>
      </div>

      <!-- Returned Items Table -->
      <div class="mb-3">
        <div class="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          ${icon('returns', 13, 'text-rose-600')}
          <span>Mặt hàng hoàn trả (+ tồn kho):</span>
        </div>
        <div class="table-wrap border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style="text-align:center">Số lượng</th>
                <th style="text-align:right">Tiền trả</th>
              </tr>
            </thead>
            <tbody>
              ${(r.items || []).map(it => `
                <tr>
                  <td><b>${esc(it.product_name)}</b></td>
                  <td style="text-align:center"><b>${it.quantity}</b></td>
                  <td style="text-align:right"><b class="text-rose-600 font-mono">${money(it.amount)}</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${hasExchange ? `
        <!-- Exchange Items Table -->
        <div class="mb-3">
          <div class="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            ${icon('transfers', 13, 'text-sky-600')}
            <span>Mặt hàng đổi mới lấy từ kho (- tồn kho):</span>
          </div>
          <div class="table-wrap border border-sky-200 rounded-xl overflow-hidden shadow-sm">
            <table>
              <thead>
                <tr class="bg-sky-50">
                  <th>Sản phẩm mới</th>
                  <th style="text-align:right">Đơn giá</th>
                  <th style="text-align:center">Số lượng</th>
                  <th style="text-align:right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${r.exchange_items.map(it => `
                  <tr>
                    <td><b>${esc(it.product_name)}</b></td>
                    <td style="text-align:right" class="font-mono">${money(it.unit_price)}</td>
                    <td style="text-align:center"><b>${it.quantity}</b></td>
                    <td style="text-align:right"><b class="text-sky-700 font-mono">${money(it.total_amount)}</b></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Exchange Summary Card -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs mb-3">
          <div>
            <span class="text-slate-500 block">Tiền hàng trả:</span>
            <b class="font-mono text-slate-800">${money(returnSum)}</b>
          </div>
          <div>
            <span class="text-slate-500 block">Tiền hàng đổi mới:</span>
            <b class="font-mono text-sky-700">${money(exchangeSum)}</b>
          </div>
          <div>
            <span class="text-slate-500 block">${exchangeSum > returnSum ? 'Khách bù thêm:' : 'Hoàn lại khách:'}</span>
            <b class="font-mono text-base ${exchangeSum > returnSum ? 'text-rose-600' : 'text-emerald-600'} font-extrabold">
              ${exchangeSum > returnSum ? '+' + money(exchangeSum - returnSum) : money(Math.max(0, returnSum - exchangeSum))}
            </b>
          </div>
        </div>
      ` : `
        <div class="flex justify-between items-center p-3 bg-rose-50 border border-rose-200 rounded-xl mb-3">
          <span class="text-xs font-bold text-rose-800">Tổng tiền hoàn trả khách:</span>
          <span class="text-base font-extrabold text-rose-600 font-mono">${money(r.total_amount)}</span>
        </div>
      `}

      <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-3">
        <b>Lý do:</b> ${esc(r.reason)}<br>
        <span class="text-slate-400">Thời gian tạo: ${dt(r.created_at)}</span>
      </div>

      <div class="form-actions">
        <button class="btn primary" onclick="closeModal()">Đóng</button>
      </div>
    `);
  } catch (err) {
    toast(err.message, 'error');
  }
};

/* =========================================================================
   INVENTORY MODULE (Tồn kho & Sổ kho Stock Ledger)
   ========================================================================= */

window._currentInventoryTab = 'stock';
window._invCategory = 0;
window._invSort = 'stock_desc';
window._invSearchQ = '';

async function inventory() {
  const tab = window._currentInventoryTab || 'stock';
  const isAdmin = S.user.role === 'ADMIN';
  const isAllStores = S.store === 0;
  const storeId = S.store !== undefined ? S.store : (S.stores[0]?.id || 1);
  const storeName = isAllStores ? '⭐ Toàn bộ hệ thống AKM' : (S.stores.find(s => s.id === storeId)?.name || 'Chi nhánh hiện tại');

  $('#content').innerHTML = head(
    'Quản lý Tồn kho',
    isAdmin ? `
      <button class="btn secondary sm" onclick="exportStoreProductsCurrent()">${icon('download', 15)} <span>Tải Excel SP</span></button>
      <button class="btn primary sm" onclick="adjustForm()">${icon('plus', 15)} <span>Điều chỉnh tồn kho</span></button>
    ` : '',
    `Theo dõi số lượng hàng thực tế và lịch sử biến động kho · <b class="text-teal-800">${esc(storeName)}</b>`
  ) + `
    <div class="flex gap-2 mb-3 border-b border-slate-200 pb-2">
      <button class="btn ${tab === 'stock' ? 'primary' : 'ghost'} sm" onclick="switchInventoryTab('stock')">
        ${icon('inventory', 15)} <span>Tồn kho hiện tại</span>
      </button>
      <button class="btn ${tab === 'ledger' ? 'primary' : 'ghost'} sm" onclick="switchInventoryTab('ledger')">
        ${icon('clock', 15)} <span>Sổ kho (Stock Ledger)</span>
      </button>
    </div>
    <div id="inventoryContent"></div>
  `;

  if (tab === 'stock') {
    const [rows, cats] = await Promise.all([
      api('inventory.list', { params: { store_id: storeId } }),
      api('categories.list').catch(() => [])
    ]);

    window._inventoryRows = rows || [];
    window._inventoryCategories = cats || [];
    const allCount = (window._inventoryRows || []).length;
    const stableCount = (window._inventoryRows || []).filter(x => {
      const isSlow = +x.quantity > 0 && (!x.last_sale || Date.now() - new Date(x.last_sale) > 7 * 864e5);
      return +x.quantity > 5 && !isSlow;
    }).length;
    const lowCount = (window._inventoryRows || []).filter(x => +x.quantity > 0 && +x.quantity <= 5).length;
    const outCount = (window._inventoryRows || []).filter(x => +x.quantity <= 0).length;
    const slowCount = (window._inventoryRows || []).filter(x => +x.quantity > 0 && (!x.last_sale || Date.now() - new Date(x.last_sale) > 7 * 864e5)).length;
    const currStatus = window._invStatus || 'all';

    $('#inventoryContent').innerHTML = `
      <div class="pos-main-col">
        <!-- Category Horizontal Pills Bar for Inventory with Scroll Controls -->
        <div class="category-pills-wrapper">
          <button type="button" class="pills-scroll-btn prev" onclick="scrollPills('inventoryCategoryPills', -220)" title="Cuộn trái">${icon('chevron-left', 16)}</button>
          <div class="category-pills" id="inventoryCategoryPills">
            <button class="category-pill ${window._invCategory === 0 ? 'active' : ''}" data-cat-id="0" onclick="selectInventoryCategory(0)">
              <span class="cat-pill-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg></span>
              <span>Tất cả (${window._inventoryRows.length})</span>
            </button>
            ${window._inventoryCategories.filter(c => +c.is_active).map(c => {
              const count = window._inventoryRows.filter(p => +p.category_id === +c.id).length;
              return `
                <button class="category-pill ${window._invCategory === c.id ? 'active' : ''}" data-cat-id="${c.id}" onclick="selectInventoryCategory(${c.id})">
                  <span class="cat-pill-icon">${getCategoryIcon(c.name, 14)}</span>
                  <span>${esc(c.name)} (${count})</span>
                </button>
              `;
            }).join('')}
          </div>
          <button type="button" class="pills-scroll-btn next" onclick="scrollPills('inventoryCategoryPills', 220)" title="Cuộn phải">${icon('chevron-right', 16)}</button>
        </div>

        <!-- Search Box with Clear Button -->
        <div class="search-box">
          ${icon('search', 18)}
          <input id="inventorySearch" placeholder="Tìm theo tên sản phẩm, thương hiệu, nhóm hàng..." value="${esc(window._invSearchQ || '')}">
          <button id="invClearBtn" class="search-clear-btn ${window._invSearchQ ? '' : 'hidden'}" onclick="clearInventorySearch()">${icon('x', 14)}</button>
        </div>

        <!-- Status Filter Bar for Inventory -->
        <div class="pos-sort-bar" id="inventoryStatusBar" style="margin-bottom:8px;">
          <span class="pos-sort-label">${icon('filter', 12)} Trạng thái:</span>
          <button class="pos-sort-btn ${currStatus === 'all' ? 'active' : ''}" onclick="setInventoryStatus('all', this)">Tất cả (${allCount})</button>
          <button class="pos-sort-btn ${currStatus === 'stable' ? 'active' : ''}" onclick="setInventoryStatus('stable', this)"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:5px;"></span>Ổn định (${stableCount})</button>
          <button class="pos-sort-btn ${currStatus === 'low_stock' ? 'active' : ''}" onclick="setInventoryStatus('low_stock', this)"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:5px;"></span>Sắp hết (${lowCount})</button>
          <button class="pos-sort-btn ${currStatus === 'out_of_stock' ? 'active' : ''}" onclick="setInventoryStatus('out_of_stock', this)"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;margin-right:5px;"></span>Hết hàng (${outCount})</button>
          <button class="pos-sort-btn ${currStatus === 'slow_moving' ? 'active' : ''}" onclick="setInventoryStatus('slow_moving', this)"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#6366f1;margin-right:5px;"></span>Chậm bán (&gt;7 ngày) (${slowCount})</button>
        </div>

        <!-- Sort Toolbar for Inventory -->
        <div class="pos-sort-bar" id="inventorySortBar">
          <span class="pos-sort-label">${icon('settings', 12)} Sắp xếp:</span>
          <button class="pos-sort-btn ${(!window._invSort || window._invSort === 'stock_desc') ? 'active' : ''}" onclick="setInventorySort('stock_desc', this)">Tồn: Nhiều → Ít</button>
          <button class="pos-sort-btn ${window._invSort === 'stock_asc' ? 'active' : ''}" onclick="setInventorySort('stock_asc', this)">Tồn: Ít → Nhiều</button>
          <button class="pos-sort-btn ${window._invSort === 'name_asc' ? 'active' : ''}" onclick="setInventorySort('name_asc', this)">Tên A-Z</button>
          <button class="pos-sort-btn ${window._invSort === 'name_desc' ? 'active' : ''}" onclick="setInventorySort('name_desc', this)">Tên Z-A</button>
          <button class="pos-sort-btn ${window._invSort === 'last_sale' ? 'active' : ''}" onclick="setInventorySort('last_sale', this)">Bán gần nhất</button>
        </div>

        <div id="inventoryTable"></div>
      </div>
    `;

    if (typeof initPillsScroll === 'function') {
      initPillsScroll('inventoryCategoryPills');
    }

    const sInput = $('#inventorySearch');
    if (sInput) {
      sInput.oninput = debounce(e => {
        const val = e.target.value.trim();
        $('#invClearBtn')?.classList.toggle('hidden', !val);
        window._invSearchQ = val;
        renderInventoryRows(val);
      }, 140);
    }

    renderInventoryRows(window._invSearchQ || '');
  } else {
    const ledger = await api('inventory.ledger', { params: { store_id: storeId } });
    const moveMap = {
      SALE: { name: 'Bán hàng', cls: 'badge danger' },
      RETURN: { name: 'Đổi / trả', cls: 'badge success' },
      TRANSFER_OUT: { name: 'Xuất chuyển kho', cls: 'badge danger' },
      TRANSFER_IN: { name: 'Nhập chuyển kho', cls: 'badge success' },
      MANUAL_ADJUSTMENT: { name: 'Điều chỉnh thủ công', cls: 'badge warning' },
      CANCEL_ORDER_REVERSAL: { name: 'Hủy đơn hoàn tồn', cls: 'badge info' },
      INITIAL_IMPORT: { name: 'Nhập đầu kỳ', cls: 'badge success' }
    };

    const headers = isAllStores
      ? ['Thời gian', 'Chi nhánh', 'Sản phẩm', 'Loại biến động', 'Trước', 'Thay đổi', 'Sau', 'Người thực hiện', 'Lý do']
      : ['Thời gian', 'Sản phẩm', 'Loại biến động', 'Trước', 'Thay đổi', 'Sau', 'Người thực hiện', 'Lý do'];

    $('#inventoryContent').innerHTML = table(
      headers,
      ledger.map(l => {
        const mv = moveMap[l.movement_type] || { name: l.movement_type, cls: 'badge' };
        const chg = +l.quantity_change;
        const chgStr = chg > 0 ? `<b class="text-emerald-600">+${chg}</b>` : `<b class="text-rose-600">${chg}</b>`;

        const row = [
          dt(l.created_at),
          `<b>${esc(l.name)}</b>`,
          `<span class="${mv.cls}">${mv.name}</span>`,
          l.quantity_before,
          chgStr,
          `<b>${l.quantity_after}</b>`,
          esc(l.full_name),
          esc(l.reason || '—')
        ];
        if (isAllStores) {
          row.splice(1, 0, `<span class="badge info">${esc(l.store_name || 'Chi nhánh')}</span>`);
        }
        return row;
      })
    );
  }
}

window.clearInventorySearch = () => {
  const input = $('#inventorySearch');
  if (!input) return;
  input.value = '';
  $('#invClearBtn')?.classList.add('hidden');
  window._invSearchQ = '';
  input.focus();
  renderInventoryRows('');
};

window.selectInventoryCategory = catId => {
  window._invCategory = +catId;
  document.querySelectorAll('#inventoryCategoryPills .category-pill').forEach(b => {
    b.classList.toggle('active', +b.dataset.catId === window._invCategory);
  });
  renderInventoryRows($('#inventorySearch')?.value || '');
};

window.setInventoryStatus = (status, btn) => {
  window._invStatus = status;
  document.querySelectorAll('#inventoryStatusBar .pos-sort-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderInventoryRows($('#inventorySearch')?.value || '');
};

window.setInventorySort = (sort, btn) => {
  window._invSort = sort;
  document.querySelectorAll('#inventorySortBar .pos-sort-btn').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else if (event?.target?.classList?.contains('pos-sort-btn')) {
    event.target.classList.add('active');
  }
  renderInventoryRows($('#inventorySearch')?.value || '');
};

function renderInventoryRows(q = '') {
  const qClean = q.trim().toLowerCase();
  const qNonAccent = nonAccent(qClean);
  const filterStatus = window._invStatus || 'all';

  let list = (window._inventoryRows || []).filter(x => {
    const isSlow = x.quantity > 0 && (!x.last_sale || Date.now() - new Date(x.last_sale) > 7 * 864e5);
    const isOut = +x.quantity <= 0;
    const isLow = +x.quantity > 0 && +x.quantity <= 5;
    const isStable = +x.quantity > 5 && !isSlow;

    const term = `${x.name || ''} ${x.brand || ''} ${x.category_name || ''}`.toLowerCase();
    const termNonAccent = nonAccent(term);
    const matchesQ = !qClean || term.includes(qClean) || termNonAccent.includes(qNonAccent);
    const matchesCat = !window._invCategory || +x.category_id === window._invCategory;

    let matchesStatus = true;
    if (filterStatus === 'stable') matchesStatus = isStable;
    else if (filterStatus === 'low_stock') matchesStatus = isLow;
    else if (filterStatus === 'out_of_stock') matchesStatus = isOut;
    else if (filterStatus === 'slow_moving') matchesStatus = isSlow;

    return matchesQ && matchesCat && matchesStatus;
  });

  const sort = window._invSort || 'stock_desc';
  list.sort((a, b) => {
    const aSlow = a.quantity > 0 && (!a.last_sale || Date.now() - new Date(a.last_sale) > 7 * 864e5);
    const bSlow = b.quantity > 0 && (!b.last_sale || Date.now() - new Date(b.last_sale) > 7 * 864e5);
    const aLow = +a.quantity <= 5;
    const bLow = +b.quantity <= 5;

    if (sort === 'stock_desc') return (+b.quantity || 0) - (+a.quantity || 0);
    if (sort === 'stock_asc') return (+a.quantity || 0) - (+b.quantity || 0);
    if (sort === 'status_low') {
      if (aLow !== bLow) return aLow ? -1 : 1;
      return (+a.quantity || 0) - (+b.quantity || 0);
    }
    if (sort === 'status_slow') {
      if (aSlow !== bSlow) return aSlow ? -1 : 1;
      return (+b.quantity || 0) - (+a.quantity || 0);
    }
    if (sort === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'vi');
    if (sort === 'name_desc') return (b.name || '').localeCompare(a.name || '', 'vi');
    if (sort === 'last_sale') {
      const tA = a.last_sale ? new Date(a.last_sale).getTime() : 0;
      const tB = b.last_sale ? new Date(b.last_sale).getTime() : 0;
      return tB - tA;
    }
    return 0;
  });

  if (!list.length) {
    $('#inventoryTable').innerHTML = `
      <div class="card p-10 text-center text-slate-400">
        <div class="mb-2">${icon('inventory', 32, 'text-slate-300 inline-block')}</div>
        <p class="font-medium text-sm">Không tìm thấy sản phẩm nào trong kho</p>
        <small>Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục</small>
      </div>
    `;
    return;
  }

  $('#inventoryTable').innerHTML = table(
    ['Sản phẩm', 'Danh mục', 'Số lượng tồn', 'Bán gần nhất', 'Trạng thái'],
    list.map(x => {
      const isSlow = x.quantity > 0 && (!x.last_sale || Date.now() - new Date(x.last_sale) > 7 * 864e5);
      const isOut = +x.quantity <= 0;
      const isLow = +x.quantity > 0 && +x.quantity <= 5;
      const statusBadge = isOut
        ? `<span class="badge danger">Hết hàng</span>`
        : isLow
        ? `<span class="badge danger">Sắp hết (${x.quantity})</span>`
        : isSlow
        ? `<span class="badge WAITING_PARTS">Chậm bán (>7 ngày)</span>`
        : `<span class="badge COMPLETED">Ổn định</span>`;

      return [
        `<div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 grid place-items-center text-slate-500 font-bold shrink-0">
            ${getCategoryIcon(x.category_name, 16)}
          </div>
          <div>
            <b class="text-slate-900 block">${esc(x.name)}</b>
            ${x.brand ? `<span class="prod-brand-badge">${esc(x.brand)}</span>` : ''}
          </div>
        </div>`,
        esc(x.category_name || '—'),
        `<button type="button" class="btn ghost sm text-teal-700 font-bold inline-flex items-center gap-1 hover:bg-teal-50 px-2 py-0.5 rounded cursor-pointer transition-colors" title="Bấm để xem chi tiết tồn kho từng chi nhánh" onclick="showProductStockDetail(${x.product_id}, '${esc(x.name).replace(/'/g, "\\'")}')">
           <b class="text-sm ${x.quantity <= 0 ? 'text-rose-600' : 'text-slate-900'}">${x.quantity}</b>
           <small class="text-teal-600 font-normal">🔍 Chi tiết</small>
         </button>`,
        dt(x.last_sale),
        statusBadge
      ];
    })
  );
}

window.switchInventoryTab = tab => {
  window._currentInventoryTab = tab;
  inventory();
};

window.adjustForm = async () => {
  const storeId = S.store || S.stores[0]?.id || 1;
  const ps = await api('products.list', { params: { store_id: storeId, limit: 300, all: 1 } });
  window._adjustSelectedProduct = ps[0] || null;

  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <div class="flex items-center gap-2">
        <h2>Điều chỉnh số lượng tồn kho</h2>
        <span class="badge info">Kiểm kê kho</span>
      </div>
      <p class="text-xs text-slate-500">Cập nhật số tồn thực tế và ghi vết vào Sổ kho (Stock Ledger). Dành cho Quản trị viên.</p>
    </div>
    <form onsubmit="doAdjust(event)">
      <div class="form-grid">
        <div class="full">
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>Chọn mặt hàng điều chỉnh</span>
              <span class="text-rose-500">*</span>
            </span>
          </label>
          <div id="adjustProductPickerContainer"></div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Số lượng tồn mới thực tế
            <input name="new_quantity" id="adjustNewQty" type="number" min="0" value="${window._adjustSelectedProduct?.quantity || 0}" class="input font-bold text-teal-900" oninput="updateAdjustPreview()" required>
          </label>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Chênh lệch điều chỉnh
            <input id="adjustDiffPreview" value="0" class="input font-bold bg-slate-100 text-slate-700" disabled>
          </label>
        </div>

        <div class="full">
          <label class="block text-xs font-bold text-slate-700 mb-1">Lý do điều chỉnh (Bắt buộc)
            <textarea name="reason" rows="2" class="input text-xs w-full" placeholder="Ví dụ: Kiểm kho phát hiện hàng hỏng, hao hụt, chênh lệch thực tế..." required></textarea>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn primary" type="submit">
          ${icon('check', 14)}
          <span>Xác nhận điều chỉnh</span>
        </button>
      </div>
    </form>
  `);

  window.renderSmartProductPicker({
    containerId: 'adjustProductPickerContainer',
    products: ps,
    selectedId: ps[0]?.id || null,
    placeholder: 'Tìm kiếm mặt hàng cần điều chỉnh (theo tên, nhóm hàng)...',
    onSelect: p => {
      window._adjustSelectedProduct = p;
      const newQtyEl = document.getElementById('adjustNewQty');
      if (newQtyEl && p) {
        newQtyEl.value = p.quantity ?? 0;
      }
      updateAdjustPreview();
    }
  });

  updateAdjustPreview();
};

window.updateAdjustPreview = () => {
  const p = window._adjustSelectedProduct;
  const newQtyEl = $('#adjustNewQty');
  const diffEl = $('#adjustDiffPreview');
  if (!newQtyEl || !diffEl) return;
  const current = +(p?.quantity || 0);
  const target = +newQtyEl.value || 0;
  const diff = target - current;
  diffEl.value = (diff > 0 ? '+' : '') + diff + ` (Từ ${current} → ${target})`;
};

window.doAdjust = async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  if (!d.product_id) {
    toast('Vui lòng chọn sản phẩm cần điều chỉnh', 'error');
    return;
  }
  d.store_id = S.store || S.stores[0]?.id || 1;
  try {
    await api('inventory.adjust', { method: 'POST', body: d });
    closeModal();
    toast('Đã điều chỉnh tồn kho thành công');
    inventory();
  } catch (err) {
    toast(err.message, 'error');
  }
};

/* =========================================================================
   REPORTS & SETTINGS & AUDIT
   ========================================================================= */

async function reports() {
  const today = new Date().toISOString().slice(0, 10);
  const from = $('#reportFrom')?.value || today;
  const to = $('#reportTo')?.value || today;
  const d = await api('reports.dashboard', { params: { from, to, store_id: S.store } });

  const currentStoreName = S.store === 0
    ? 'Toàn bộ chuỗi AKM Mobile'
    : (S.stores.find(s => s.id === S.store)?.name || 'Chi nhánh hiện tại');

  $('#content').innerHTML = head(
    'Báo cáo Bán hàng & Hiệu quả',
    S.user.role === 'ADMIN' ? `<button class="btn primary sm" onclick="location.href='api.php?action=reports.export'">${icon('orders', 15)} <span>Xuất Excel / CSV</span></button>` : '',
    `Phân tích doanh số: <b class="text-teal-800">${esc(currentStoreName)}</b>`
  ) + `
    <!-- Store Filter Pills Bar for Reports -->
    <div class="store-filter-bar">
      ${S.user.role === 'ADMIN' ? `
        <button class="store-filter-pill ${S.store === 0 ? 'active' : ''}" onclick="setReportStore(0)">
          ⭐ Tất cả hệ thống AKM
        </button>
      ` : ''}
      ${S.stores.map(s => `
        <button class="store-filter-pill ${S.store === s.id ? 'active' : ''}" onclick="setReportStore(${s.id})">
          ${esc(s.code)} · ${esc(s.name)}
        </button>
      `).join('')}
    </div>

    <div class="card mb-4">
      <div class="flex gap-2 items-end flex-wrap">
        <label class="flex-1" style="min-width:140px;">
          <span>Từ ngày</span>
          <input id="reportFrom" type="date" value="${from}">
        </label>
        <label class="flex-1" style="min-width:140px;">
          <span>Đến ngày</span>
          <input id="reportTo" type="date" value="${to}">
        </label>
        <button class="btn primary sm" style="height:36px;" onclick="reports()">Lọc dữ liệu</button>
      </div>
    </div>

    <div class="grid-kpi modern mb-4">
      <div class="kpi-card accent-teal">
        <div class="kpi-data">
          <small>Tổng doanh thu kỳ này</small>
          <strong>${money(d.revenue)}</strong>
          <em>🛒 Bán: ${compactMoney(d.sales_revenue || 0)} · 🛠️ Sửa: ${compactMoney(d.repair_revenue || 0)}</em>
        </div>
      </div>
      <div class="kpi-card accent-blue">
        <div class="kpi-data">
          <small>Giao dịch hoàn tất</small>
          <strong>${d.orders || 0} <span class="text-xs font-normal text-slate-500">đơn</span> + ${d.repairs_completed || 0} <span class="text-xs font-normal text-slate-500">sửa</span></strong>
          <em>${d.items_sold || 0} sản phẩm đã bán</em>
        </div>
      </div>
      <div class="kpi-card accent-orange">
        <div class="kpi-data">
          <small>Đổi / Trả hàng trong kỳ</small>
          <strong class="text-rose-600">${d.returns || 0} <span class="text-xs font-normal text-slate-500">vụ</span></strong>
          <em class="text-rose-700 font-semibold">Hoàn: ${money(d.returns_total || 0)} (${d.returns_items_qty || 0} cái)</em>
        </div>
      </div>
      <div class="kpi-card accent-violet">
        <div class="kpi-data">
          <small>Tổng tồn kho hiện tại</small>
          <strong>${d.inventory || 0}</strong>
          <em class="text-slate-500">${d.repairs_in_progress || 0} máy đang sửa</em>
        </div>
      </div>
    </div>

    <!-- Revenue Sources Breakdown -->
    <div class="card mb-4">
      <div class="card-header">
        <div class="card-title">${icon('reports', 16)} <span>Chi tiết cơ cấu doanh thu theo nguồn</span></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
        <div class="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-teal-600 text-white grid place-items-center">${icon('pos', 20)}</div>
            <div>
              <div class="text-xs font-bold text-teal-900">Doanh thu Bán sản phẩm & Phụ kiện</div>
              <div class="text-xs text-teal-700">${d.orders || 0} đơn hàng · ${d.items_sold || 0} sản phẩm</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-base font-extrabold text-teal-950">${money(d.sales_revenue || 0)}</div>
            <div class="text-xs text-teal-600 font-semibold">${d.revenue > 0 ? Math.round(((d.sales_revenue || 0) / d.revenue) * 100) : 0}% tổng DT</div>
          </div>
        </div>

        <div class="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 text-white grid place-items-center">${icon('repairs', 20)}</div>
            <div>
              <div class="text-xs font-bold text-blue-900">Doanh thu Dịch vụ sửa chữa & Thay thế</div>
              <div class="text-xs text-blue-700">${d.repairs_completed || 0} máy hoàn thành</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-base font-extrabold text-blue-950">${money(d.repair_revenue || 0)}</div>
            <div class="text-xs text-blue-600 font-semibold">${d.revenue > 0 ? Math.round(((d.repair_revenue || 0) / d.revenue) * 100) : 0}% tổng DT</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Returns List in Period -->
    ${(d.returns_list && d.returns_list.length) ? `
      <div class="card mb-4 border-rose-200">
        <div class="card-header">
          <div class="card-title text-rose-700">${icon('returns', 16)} <span>Chi tiết các vụ việc đổi / trả hàng trong kỳ báo cáo</span></div>
          <span class="badge danger">${d.returns_list.length} vụ việc</span>
        </div>
        ${table(
          ['Mã phiếu trả', 'Hóa đơn gốc', 'Chi nhánh', 'Mặt hàng & SL trả', 'Tiền hoàn', 'Lý do & Nhân viên', 'Ngày tạo'],
          d.returns_list.map(r => [
            `<b class="text-rose-700 font-mono">${esc(r.return_code)}</b>`,
            `<b>${esc(r.order_code)}</b>`,
            esc(r.store_name),
            `<div class="text-xs max-w-[280px] font-medium text-slate-800">${esc(r.items_summary || '—')}</div>`,
            `<b class="text-rose-600">${money(r.total_amount)}</b>`,
            `<div><span>${esc(r.reason)}</span><br><small class="text-slate-400">NV: ${esc(r.staff_name)}</small></div>`,
            dt(r.created_at)
          ])
        )}
      </div>
    ` : ''}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('products', 16)} <span>Sản phẩm bán nhiều nhất</span></div>
          <span class="badge info">${(d.top_products || []).length} sản phẩm</span>
        </div>
        <div class="product-list-container">
          ${!(d.top_products && d.top_products.length) ? `
            <div class="p-8 text-center text-xs text-slate-400">Chưa có dữ liệu bán hàng trong kỳ này</div>
          ` : (d.top_products || []).map((x, idx) => `
            <div class="product-row-card" onclick="showProductStockDetail(${x.product_id}, '${esc(x.name).replace(/'/g, "\\'")}')" title="Nhấp để xem chi tiết tồn kho các chi nhánh">
              <div class="prod-col-thumb relative">
                <div class="prod-thumb-box" style="width:46px;height:46px;min-width:46px;">
                  <div class="prod-thumb-fallback">${getCategoryIcon(x.name, 20)}</div>
                </div>
                <span class="absolute -top-1.5 -left-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">#${idx + 1}</span>
              </div>
              <div class="prod-col-info">
                <div class="prod-name-line">
                  <span class="prod-name-text" title="${esc(x.name)}">${esc(x.name)}</span>
                </div>
                <div class="prod-cat-line">
                  <span class="text-xs text-teal-800 font-bold">🛒 Đã bán: ${x.quantity}</span>
                </div>
              </div>
              <div class="prod-col-pricing">
                <div class="prod-price-line">
                  <span class="prod-price-text">${money(x.revenue)}</span>
                </div>
                <div class="prod-stock-line">
                  <span class="prod-stock-tag ${+x.stock <= 5 ? 'out-stock' : 'in-stock'}">${icon('inventory', 11)} Tồn: ${x.stock ?? 0}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card border-amber-200">
        <div class="card-header">
          <div class="card-title text-amber-700">${icon('clock', 16)} <span>Hàng chậm luân chuyển (&ge; 7 ngày)</span></div>
          <span class="badge warning">${(d.slow_moving || []).length} mặt hàng</span>
        </div>
        <div class="product-list-container">
          ${!(d.slow_moving && d.slow_moving.length) ? `
            <div class="p-8 text-center text-xs text-slate-400">Không có mặt hàng nào tồn đọng lâu ngày</div>
          ` : (d.slow_moving || []).map(x => `
            <div class="product-row-card border-amber-200" onclick="showProductStockDetail(${x.id || x.product_id || 0}, '${esc(x.name).replace(/'/g, "\\'")}')" title="Nhấp để xem chi tiết tồn kho">
              <div class="prod-col-thumb relative">
                <div class="prod-thumb-box" style="width:46px;height:46px;min-width:46px;">
                  <div class="prod-thumb-fallback">${getCategoryIcon(x.name, 20)}</div>
                </div>
                <span class="absolute -top-1 -left-1 text-[11px] text-amber-500">${icon('clock', 13)}</span>
              </div>
              <div class="prod-col-info">
                <div class="prod-name-line">
                  <span class="prod-name-text" title="${esc(x.name)}">${esc(x.name)}</span>
                </div>
                <div class="prod-cat-line">
                  <span class="text-[11px] text-slate-500 font-medium">${esc(x.category_name || 'Hàng tồn lâu')}</span>
                </div>
              </div>
              <div class="prod-col-pricing">
                <div class="prod-price-line">
                  <span class="prod-stock-tag out-stock">${icon('inventory', 11)} Tồn đọng: ${x.quantity}</span>
                </div>
                <div class="prod-stock-line">
                  <span class="text-[10.5px] text-slate-400">Chưa bán > 7 ngày</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

window.setReportStore = stId => {
  S.store = +stId;
  if ($('#storeSelect')) $('#storeSelect').value = S.store;
  reports();
};

window._auditTab = window._auditTab || 'system';

window.setAuditTab = tab => {
  window._auditTab = tab;
  audit();
};

window.cleanupAuditLogs = async () => {
  if (!confirm('Bạn có chắc muốn dọn dẹp toàn bộ nhật ký hoạt động và mail logs cũ hơn 7 ngày?')) return;
  loading(true);
  try {
    const res = await api('audit.cleanup', { method: 'POST' });
    toast(res.message || 'Đã dọn dẹp nhật ký thành công');
    await audit();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading(false);
  }
};

async function audit() {
  const currentTab = window._auditTab || 'system';
  let auditRows = [];
  let mailRows = [];

  if (currentTab === 'system') {
    auditRows = await api('audit.list').catch(() => []);
  } else {
    mailRows = await api('mail.logs').catch(() => []);
  }

  const headerHtml = head(
    'Nhật ký Hệ thống (Audit & Mail Logs)',
    `
      <div class="flex items-center gap-2">
        <button class="btn secondary sm" onclick="cleanupAuditLogs()" title="Dọn dẹp nhật ký quá 7 ngày">
          ${icon('trash', 14)} <span>Dọn dẹp nhật ký > 7 ngày</span>
        </button>
        <button class="btn secondary sm" onclick="audit()" title="Làm mới">
          ${icon('refresh', 14)} <span>Làm mới</span>
        </button>
      </div>
    `,
    `Tự động lưu vết toàn bộ giao dịch, sửa chữa, mail và tự động dọn dẹp sau 7 ngày để tối ưu cơ sở dữ liệu`
  );

  const tabsHtml = `
    <div class="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
      <button class="btn sm ${currentTab === 'system' ? 'primary' : 'secondary'}" onclick="setAuditTab('system')">
        ${icon('audit', 15)} <span>📋 Nhật ký Hoạt động Toàn hệ thống (${currentTab === 'system' ? auditRows.length : '...'})</span>
      </button>
      <button class="btn sm ${currentTab === 'mail' ? 'primary' : 'secondary'}" onclick="setAuditTab('mail')">
        ${icon('mail', 15)} <span>✉️ Nhật ký Gửi Email (${currentTab === 'mail' ? mailRows.length : '...'})</span>
      </button>
    </div>
  `;

  let tableHtml = '';
  if (currentTab === 'system') {
    tableHtml = table(['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Địa chỉ IP', 'Mô tả chi tiết'], auditRows.map(x => [
      dt(x.created_at),
      `<span class="font-bold text-slate-800">${esc(x.full_name || 'Hệ thống / Cron')}</span>`,
      `<span class="badge info">${esc(x.action)}</span>`,
      esc((x.entity_type || '') + (x.entity_id ? ' #' + x.entity_id : '')),
      `<span class="font-mono text-xs text-slate-500">${esc(x.ip_address || '—')}</span>`,
      `<span class="text-xs text-slate-700 font-medium">${esc(x.description || '—')}</span>`
    ]));
  } else {
    tableHtml = table(['Thời gian', 'Người thực hiện', 'Email Người nhận', 'Tiêu đề Thư', 'Giao thức', 'Trạng thái', 'Chi tiết / Ghi chú lỗi'], mailRows.map(m => [
      dt(m.created_at),
      `<span class="font-bold text-slate-800">${esc(m.full_name || 'Hệ thống / Cron')}</span>`,
      `<b class="text-teal-700 font-mono text-xs">${esc(m.to_email)}</b>`,
      `<span class="font-medium text-slate-900 text-xs">${esc(m.subject)}</span>`,
      `<span class="badge ${m.driver === 'smtp' ? 'info' : 'secondary'} font-mono uppercase text-[10px]">${esc(m.driver)}</span>`,
      m.status === 'SUCCESS' ? '<span class="badge success">✅ Thành công</span>' : '<span class="badge danger">❌ Thất bại</span>',
      m.status === 'SUCCESS' ? '<span class="text-emerald-600 text-xs font-semibold">Đã gửi</span>' : `<span class="text-rose-600 text-xs font-medium">${esc(m.error_message || 'Lỗi không xác định')}</span>`
    ]));
  }

  $('#content').innerHTML = headerHtml + tabsHtml + tableHtml;
}

async function settings() {
  const d = await api('settings.get');
  const demoV = +(d.demo_seed_version || 0);
  const sections = d.daily_report_sections ? (typeof d.daily_report_sections === 'string' ? JSON.parse(d.daily_report_sections) : d.daily_report_sections) : {
    sec_revenue: '1',
    sec_low_stock: '1',
    sec_top_products: '1',
    sec_payment_methods: '1'
  };

  const hasSmtp = Boolean(d.smtp_host && d.smtp_host.trim());

  $('#content').innerHTML = head('Cài đặt Hệ thống', '', 'Cấu hình tham số nghiệp vụ, máy chủ SMTP, tự động gửi báo cáo và quản lý dữ liệu') + `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      <!-- 1. Cấu hình vận hành -->
      <div class="card">
        <div class="card-header"><div class="card-title">${icon('settings', 16)} <span>1. Cấu hình vận hành & Bán hàng</span></div></div>
        <form onsubmit="saveSettings(event)">
          <div class="form-grid">
            <div>
              <label>Cho phép giảm giá đơn hàng
                <select name="discount_enabled">
                  <option value="1" ${d.discount_enabled !== '0' ? 'selected' : ''}>Bật (Cho phép chiết khấu)</option>
                  <option value="0" ${d.discount_enabled === '0' ? 'selected' : ''}>Tắt (Không cho chiết khấu)</option>
                </select>
              </label>
            </div>
            <div>
              <label>Ngưỡng cảnh báo sắp hết hàng
                <input name="low_stock_threshold" type="number" min="0" value="${esc(d.low_stock_threshold || 5)}" placeholder="5">
              </label>
            </div>
            <div class="full">
              <label>Số ngày chưa có giao dịch để báo hàng chậm
                <input name="slow_moving_days" type="number" min="1" value="${esc(d.slow_moving_days || 7)}" placeholder="7">
              </label>
            </div>
          </div>
          <button class="btn primary wide mt-3">${icon('check', 15)} <span>Lưu cấu hình vận hành</span></button>
        </form>
      </div>

      <!-- 2. Cấu hình Máy chủ Gửi Mail (SMTP) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title text-teal-800">${icon('mail', 16)} <span>2. Cấu hình Máy chủ Gửi Mail (SMTP)</span></div>
          <span class="badge ${hasSmtp ? 'success' : 'warning'} font-bold">${hasSmtp ? '🟢 Đã cấu hình' : '⚠️ Chưa cấu hình'}</span>
        </div>
        <form onsubmit="saveSmtpSettings(event)">
          <div class="form-grid">
            <div>
              <label>Máy chủ SMTP Host
                <input name="smtp_host" value="${esc(d.smtp_host || 'smtp.tino.vn')}" placeholder="smtp.tino.vn" required>
              </label>
            </div>
            <div>
              <label>Cổng Port (587 cho TLS, 465 cho SSL)
                <input name="smtp_port" type="number" value="${esc(d.smtp_port || 587)}" placeholder="587" required>
              </label>
            </div>
            <div>
              <label>Giao thức bảo mật (Mã hóa)
                <select name="smtp_encryption">
                  <option value="tls" ${(d.smtp_encryption || 'tls') === 'tls' ? 'selected' : ''}>STARTTLS (Cổng 587 - Khuyên dùng)</option>
                  <option value="ssl" ${d.smtp_encryption === 'ssl' ? 'selected' : ''}>SSL (Cổng 465)</option>
                  <option value="none" ${d.smtp_encryption === 'none' ? 'selected' : ''}>Không mã hóa</option>
                </select>
              </label>
            </div>
            <div>
              <label>Tài khoản / Email đăng nhập SMTP
                <input name="smtp_username" value="${esc(d.smtp_username || 'admin@pnnmedia.vn')}" placeholder="admin@pnnmedia.vn">
              </label>
            </div>
            <div class="full">
              <label>Mật khẩu SMTP
                <input name="smtp_password" type="password" value="${esc(d.smtp_password || '4Za68_Du%kCc^u+^')}" placeholder="••••••••">
                <small class="text-slate-400 font-normal">Mật khẩu tài khoản email gửi tin trên máy chủ SMTP</small>
              </label>
            </div>
            <div>
              <label>Email người gửi (From Email)
                <input name="mail_from_email" value="${esc(d.mail_from_email || 'admin@pnnmedia.vn')}" placeholder="admin@pnnmedia.vn">
              </label>
            </div>
            <div>
              <label>Tên hiển thị người gửi
                <input name="mail_from_name" value="${esc(d.mail_from_name || 'AKM POS - Anh Khoa Mobile')}" placeholder="AKM POS - Anh Khoa Mobile">
              </label>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <button class="btn primary flex-1" type="submit">${icon('check', 15)} <span>Lưu cấu hình SMTP</span></button>
            <button class="btn secondary" type="button" onclick="testSmtpModal(${JSON.stringify(d).replace(/"/g, '&quot;')})">
              ${icon('send', 15)} <span>⚡ Kiểm tra & Chuẩn đoán SMTP</span>
            </button>
          </div>
        </form>
      </div>

      <!-- 3. Tự động gửi Email báo cáo cuối ngày -->
      <div class="card">
        <div class="card-header">
          <div class="card-title text-teal-800">${icon('calendar', 16)} <span>3. Tự động gửi Email Báo cáo Doanh số</span></div>
        </div>
        
        ${!hasSmtp ? `
          <div class="p-3 mb-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span><b>Lưu ý:</b> Bạn chưa cấu hình Máy chủ SMTP ở mục (2). Hãy lưu thông tin SMTP trước khi bấm gửi thử email.</span>
          </div>
        ` : ''}

        <form onsubmit="saveReportSettings(event)">
          <div class="form-grid">
            <div>
              <label>Trạng thái gửi tự động
                <select name="daily_report_enabled" id="reportEnabledSelect">
                  <option value="1" ${d.daily_report_enabled === '1' ? 'selected' : ''}>🟢 Đang BẬT gửi tự động</option>
                  <option value="0" ${d.daily_report_enabled !== '1' ? 'selected' : ''}>⚪ Đang TẮT</option>
                </select>
              </label>
            </div>
            <div>
              <label>Thời gian gửi hàng ngày
                <input name="daily_report_time" type="time" value="${esc(d.daily_report_time || '21:30')}" required>
              </label>
            </div>
            <div class="full">
              <label>Danh sách Email nhận báo cáo <small class="text-slate-400 font-normal">(Phân cách bằng dấu phẩy)</small>
                <input name="daily_report_recipients" value="${esc(d.daily_report_recipients || '')}" placeholder="admin@anhkhoamobile.com, ketoan@anhkhoamobile.com" required>
              </label>
            </div>
            <div class="full">
              <label class="font-semibold text-slate-700 mb-1 block">Nội dung đính kèm trong báo cáo:</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-500 font-medium">
                  <input type="checkbox" name="sec_revenue" ${sections.sec_revenue ? 'checked' : ''} style="width:auto;min-height:auto;">
                  <span>💰 Doanh thu & Tổng đơn hàng</span>
                </label>
                <label class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-500 font-medium">
                  <input type="checkbox" name="sec_low_stock" ${sections.sec_low_stock ? 'checked' : ''} style="width:auto;min-height:auto;">
                  <span>⚠️ Cảnh báo tồn kho sắp hết</span>
                </label>
                <label class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-500 font-medium">
                  <input type="checkbox" name="sec_top_products" ${sections.sec_top_products ? 'checked' : ''} style="width:auto;min-height:auto;">
                  <span>🏆 Top sản phẩm bán chạy</span>
                </label>
                <label class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-teal-500 font-medium">
                  <input type="checkbox" name="sec_payment_methods" ${sections.sec_payment_methods ? 'checked' : ''} style="width:auto;min-height:auto;">
                  <span>💳 Cơ cấu nguồn thanh toán</span>
                </label>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <button class="btn primary flex-1" type="submit">${icon('check', 15)} <span>Lưu thiết lập báo cáo</span></button>
            <button class="btn secondary" type="button" onclick="previewDailyReport()">${icon('eye', 15)} <span>Xem trước</span></button>
            <button class="btn secondary" type="button" onclick="testSendDailyReport()">${icon('send', 15)} <span>Gửi thử ngay</span></button>
          </div>
        </form>
      </div>

      <!-- 4. Quản lý & Xuất / Nhập Dữ liệu Hệ thống -->
      <div class="card">
        <div class="card-header"><div class="card-title text-slate-900">${icon('database', 16)} <span>4. Xuất & Nhập Dữ liệu (Import / Export)</span></div></div>
        
        <div class="space-y-3">
          <!-- Xuất dữ liệu -->
          <div>
            <span class="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">⬇️ Xuất dữ liệu ra file (Export CSV / SQL):</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" class="btn secondary sm flex items-center justify-between text-left" onclick="openExportProductsStoreModal()">
                <span>📦 Danh mục Sản phẩm (Theo kho)</span>
                <span class="text-teal-700 font-bold font-mono text-[10px]">.XLS / .CSV</span>
              </button>
              <a href="api.php?action=export.inventory" target="_blank" class="btn secondary sm flex items-center justify-between text-left">
                <span>🏢 Tồn kho chi nhánh</span>
                <span class="text-slate-400 font-mono text-[10px]">.CSV</span>
              </a>
              <a href="api.php?action=export.orders" target="_blank" class="btn secondary sm flex items-center justify-between text-left">
                <span>🧾 Danh sách Hóa đơn</span>
                <span class="text-slate-400 font-mono text-[10px]">.CSV</span>
              </a>
              <a href="api.php?action=export.backup_sql" target="_blank" class="btn primary sm flex items-center justify-between text-left">
                <span>💾 Sao lưu Full Database</span>
                <span class="text-teal-200 font-mono text-[10px]">.SQL</span>
              </a>
            </div>
          </div>

          <!-- Nhập dữ liệu -->
          <div class="pt-2 border-t border-slate-100">
            <span class="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">⬆️ Nhập & Khôi phục dữ liệu (Import):</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" class="btn secondary sm flex items-center justify-between text-left" onclick="importProductsCSVModal()">
                <span>📂 Import file CSV Sản phẩm</span>
                <span class="text-teal-700 font-bold">Thao tác</span>
              </button>
              <button type="button" class="btn secondary sm flex items-center justify-between text-left" onclick="syncKiotVietProducts(this)">
                <span>⚡ Đồng bộ 100 SP KiotViet</span>
                <span class="text-teal-700 font-bold">Nạp</span>
              </button>
              <button type="button" class="btn danger sm col-span-full flex items-center justify-between text-left" onclick="restoreBackupModal()">
                <span>🔄 Phục hồi dữ liệu từ bản sao lưu SQL</span>
                <span class="text-rose-200 font-bold">Restore</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Cấu hình hiển thị cột dữ liệu Sản phẩm -->
      <div class="card lg:col-span-2">
        <div class="card-header">
          <div class="card-title text-teal-800">${icon('products', 16)} <span>5. Cấu hình hiển thị cột dữ liệu Sản phẩm</span></div>
          <span class="badge info font-bold">Danh mục hàng hóa</span>
        </div>
        <p class="text-xs text-slate-500 mb-3">Tùy chỉnh bật/tắt các cột thông tin hiển thị trên bảng danh sách sản phẩm để tối ưu diện tích và luồng quản lý của bạn.</p>
        <form id="settingsProdColsForm" onsubmit="event.preventDefault(); saveProdColsFromSettings(this);">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-4">
            ${(window.PRODUCT_COLUMNS || [
              { id: 'image', label: 'Ảnh', default: true },
              { id: 'name', label: 'Tên sản phẩm', default: true },
              { id: 'category', label: 'Nhóm hàng', default: true },
              { id: 'cost_price', label: 'Giá vốn', default: true },
              { id: 'selling_price', label: 'Giá bán niêm yết', default: true },
              { id: 'stock', label: 'Tồn kho', default: true },
              { id: 'discount', label: 'Giảm giá', default: true },
              { id: 'status', label: 'Trạng thái', default: true },
              { id: 'actions', label: 'Thao tác', default: true }
            ]).map(c => {
              const currentCols = typeof window.getProductColumnsConfig === 'function' ? window.getProductColumnsConfig() : {};
              const isChecked = currentCols[c.id] !== undefined ? currentCols[c.id] : c.default;
              return `
                <label class="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 select-none transition-colors">
                  <input type="checkbox" name="${c.id}" ${isChecked ? 'checked' : ''} style="width:16px;height:16px;min-height:auto;cursor:pointer;">
                  <span>${esc(c.label)}</span>
                </label>
              `;
            }).join('')}
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button type="button" class="btn ghost sm" onclick="resetDefaultProdColsInSettings()">${icon('transfers', 13)} <span>Khôi phục mặc định</span></button>
            <button type="submit" class="btn primary sm">${icon('check', 14)} <span>Lưu cấu hình cột</span></button>
          </div>
        </form>
      </div>

      <!-- 6. Công cụ bảo trì & Dữ liệu mẫu -->
      <div class="card lg:col-span-2">
        <div class="card-header"><div class="card-title">${icon('audit', 16)} <span>6. Công cụ bảo trì & Tối ưu</span></div></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <b>Chuẩn hóa UTF-8 Database</b>
              <p class="text-xs text-slate-500 mt-1 mb-2">Chuyển toàn bộ bảng sang utf8mb4_unicode_ci để sửa triệt để lỗi dấu tiếng Việt.</p>
            </div>
            <button class="btn secondary sm self-start" onclick="repairEncoding()">Chuẩn hóa UTF-8</button>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <b>Dữ liệu trải nghiệm mở rộng (Demo Seed)</b>
              <p class="text-xs text-slate-500 mt-1 mb-2">Khởi tạo 4 chi nhánh AKM Mobile, 44 sản phẩm phân nhóm, tồn kho, hóa đơn và phiếu sửa chữa.</p>
            </div>
            <button class="btn primary sm self-start" onclick="seedDemo()" ${demoV >= 3 ? 'disabled' : ''}>
              ${demoV >= 3 ? 'Đã cài đặt dữ liệu mẫu' : 'Nạp dữ liệu mẫu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.saveProdColsFromSettings = function(form) {
  if (!form) return;
  const config = {};
  const list = window.PRODUCT_COLUMNS || [
    { id: 'image', label: 'Ảnh', default: true },
    { id: 'name', label: 'Tên sản phẩm', default: true },
    { id: 'category', label: 'Nhóm hàng', default: true },
    { id: 'cost_price', label: 'Giá vốn', default: true },
    { id: 'selling_price', label: 'Giá bán niêm yết', default: true },
    { id: 'stock', label: 'Tồn kho', default: true },
    { id: 'discount', label: 'Giảm giá', default: true },
    { id: 'status', label: 'Trạng thái', default: true },
    { id: 'actions', label: 'Thao tác', default: true }
  ];
  list.forEach(c => {
    config[c.id] = form.querySelector(`input[name="${c.id}"]`)?.checked || false;
  });
  if (typeof window.saveProductColumnsConfig === 'function') {
    window.saveProductColumnsConfig(config);
  } else {
    localStorage.setItem('akm_prod_columns', JSON.stringify(config));
    toast('Đã lưu cấu hình hiển thị cột sản phẩm!');
  }
};

window.resetDefaultProdColsInSettings = function() {
  const form = document.getElementById('settingsProdColsForm');
  const list = window.PRODUCT_COLUMNS || [
    { id: 'image', label: 'Ảnh', default: true },
    { id: 'name', label: 'Tên sản phẩm', default: true },
    { id: 'category', label: 'Nhóm hàng', default: true },
    { id: 'cost_price', label: 'Giá vốn', default: true },
    { id: 'selling_price', label: 'Giá bán niêm yết', default: true },
    { id: 'stock', label: 'Tồn kho', default: true },
    { id: 'discount', label: 'Giảm giá', default: true },
    { id: 'status', label: 'Trạng thái', default: true },
    { id: 'actions', label: 'Thao tác', default: true }
  ];
  const def = {};
  list.forEach(c => {
    def[c.id] = c.default;
    const input = form?.querySelector(`input[name="${c.id}"]`);
    if (input) input.checked = c.default;
  });
  if (typeof window.saveProductColumnsConfig === 'function') {
    window.saveProductColumnsConfig(def);
  } else {
    localStorage.setItem('akm_prod_columns', JSON.stringify(def));
    toast('Đã khôi phục các cột mặc định!');
  }
};

window.saveSettings = async e => {
  e.preventDefault();
  try {
    await api('settings.save', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
    toast('Đã lưu cấu hình vận hành');
  } catch (err) { toast(err.message, 'error'); }
};

window.saveSmtpSettings = async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f);
  try {
    await api('settings.save', { method: 'POST', body: data });
    toast('Đã lưu cấu hình máy chủ SMTP thành công');
    settings();
  } catch (err) { toast(err.message, 'error'); }
};

window.saveReportSettings = async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = {
    daily_report_enabled: f.get('daily_report_enabled'),
    daily_report_time: f.get('daily_report_time'),
    daily_report_recipients: f.get('daily_report_recipients'),
    daily_report_sections: JSON.stringify({
      sec_revenue: f.has('sec_revenue') ? 1 : 0,
      sec_low_stock: f.has('sec_low_stock') ? 1 : 0,
      sec_top_products: f.has('sec_top_products') ? 1 : 0,
      sec_payment_methods: f.has('sec_payment_methods') ? 1 : 0
    })
  };
  try {
    await api('settings.save', { method: 'POST', body: data });
    toast('Đã lưu thiết lập tự động gửi báo cáo Email');
  } catch (err) { toast(err.message, 'error'); }
};

window.previewDailyReport = async () => {
  try {
    const f = document.querySelector('form[onsubmit="saveReportSettings(event)"]');
    const sections = f ? {
      sec_revenue: f.querySelector('input[name="sec_revenue"]')?.checked ? 1 : 0,
      sec_low_stock: f.querySelector('input[name="sec_low_stock"]')?.checked ? 1 : 0,
      sec_top_products: f.querySelector('input[name="sec_top_products"]')?.checked ? 1 : 0,
      sec_payment_methods: f.querySelector('input[name="sec_payment_methods"]')?.checked ? 1 : 0
    } : {};
    
    const r = await api('reports.preview_daily', { method: 'POST', body: { sections } });
    modal(`
      <div class="modal-header">
        <h2>${icon('eye', 18)} Xem trước Báo cáo Doanh số Cuối ngày</h2>
        <p>Bản xem trước mẫu Email được hệ thống gửi tự động</p>
      </div>
      <div class="max-h-[70vh] overflow-y-auto p-2 bg-slate-100 rounded-xl border border-slate-200">
        ${r.html}
      </div>
      <div class="form-actions mt-4">
        <button class="btn primary" type="button" onclick="closeModal()">Đóng xem trước</button>
      </div>
    `);
  } catch (err) { toast(err.message, 'error'); }
};

window.testSendDailyReport = async () => {
  const f = document.querySelector('form[onsubmit="saveReportSettings(event)"]');
  const recipients = f?.querySelector('input[name="daily_report_recipients"]')?.value?.trim();
  if (!recipients) {
    toast('Vui lòng nhập email nhận báo cáo', 'error');
    return;
  }
  if (!confirm(`Gửi thử nghiệm báo cáo ngày hôm nay tới: ${recipients}?`)) return;
  loading(true);
  try {
    const sections = {
      sec_revenue: f.querySelector('input[name="sec_revenue"]')?.checked ? 1 : 0,
      sec_low_stock: f.querySelector('input[name="sec_low_stock"]')?.checked ? 1 : 0,
      sec_top_products: f.querySelector('input[name="sec_top_products"]')?.checked ? 1 : 0,
      sec_payment_methods: f.querySelector('input[name="sec_payment_methods"]')?.checked ? 1 : 0
    };
    const r = await api('reports.test_send_daily', { method: 'POST', body: { recipients, sections } });
    if (r.success || r.sent) {
      toast(r.message || 'Đã gửi báo cáo thử nghiệm thành công');
    } else {
      toast(r.message || 'Chưa gửi được email', 'warning');
    }
  } catch (err) { toast(err.message, 'error'); }
  finally { loading(false); }
};

window.testSmtpModal = (d = {}) => {
  const defaultTo = d.daily_report_recipients?.split(',')?.[0]?.trim() || d.smtp_username || S.user.email || '';
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2>${icon('send', 18)} Kiểm tra & Chuẩn đoán Kết nối SMTP</h2>
      <p>Kiểm tra Socket kết nối trực tiếp, bắt tay mã hóa TLS/SSL, xác thực tài khoản và gửi thử email</p>
    </div>

    <form onsubmit="runSmtpDiagnosis(event)">
      <div class="form-section">
        <div class="form-section-title">${icon('mail', 14)} <span>Nhập địa chỉ Email nhận thư kiểm tra</span></div>
        <div class="form-grid">
          <div class="full">
            <label>Email người nhận Test (Bắt buộc)
              <input name="test_recipient" type="email" value="${esc(defaultTo)}" placeholder="admin@anhkhoamobile.com" required autofocus>
            </label>
          </div>
        </div>
      </div>

      <div id="smtpDiagLogBox" class="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs max-h-[300px] overflow-y-auto hidden">
        <div id="smtpDiagOutput" class="space-y-1"></div>
      </div>

      <div class="form-actions mt-4">
        <button class="btn secondary" type="button" onclick="closeModal()">Đóng</button>
        <button class="btn primary" type="submit" id="btnRunSmtpTest">
          ${icon('refresh', 14)} <span>Bắt đầu kiểm tra kết nối</span>
        </button>
      </div>
    </form>
  `);
};

window.runSmtpDiagnosis = async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = $('#btnRunSmtpTest');
  const logBox = $('#smtpDiagLogBox');
  const output = $('#smtpDiagOutput');
  const testRecipient = form.querySelector('input[name="test_recipient"]')?.value?.trim();

  if (!testRecipient) {
    toast('Vui lòng nhập email nhận test', 'error');
    return;
  }

  // Get current SMTP values from settings form if visible
  const smtpForm = document.querySelector('form[onsubmit="saveSmtpSettings(event)"]');
  const smtpData = smtpForm ? {
    smtp_host: smtpForm.querySelector('input[name="smtp_host"]')?.value?.trim(),
    smtp_port: smtpForm.querySelector('input[name="smtp_port"]')?.value?.trim(),
    smtp_encryption: smtpForm.querySelector('select[name="smtp_encryption"]')?.value,
    smtp_username: smtpForm.querySelector('input[name="smtp_username"]')?.value?.trim(),
    smtp_password: smtpForm.querySelector('input[name="smtp_password"]')?.value,
    mail_from_email: smtpForm.querySelector('input[name="mail_from_email"]')?.value?.trim(),
    mail_from_name: smtpForm.querySelector('input[name="mail_from_name"]')?.value?.trim(),
    test_recipient: testRecipient
  } : { test_recipient: testRecipient };

  logBox.classList.remove('hidden');
  output.innerHTML = '<div class="text-teal-400">⚡ Đang khởi tạo kết nối socket kiểm tra máy chủ SMTP...</div>';
  btn.disabled = true;
  btn.innerHTML = `${icon('refresh', 14)} <span>Đang kiểm tra...</span>`;

  try {
    const res = await api('settings.test_smtp', { method: 'POST', body: smtpData });
    const logs = res.logs || [];
    output.innerHTML = logs.map(l => {
      let colorClass = 'text-slate-300';
      if (l.includes('✅') || l.includes('🎉') || l.includes('thành công')) colorClass = 'text-emerald-400 font-semibold';
      else if (l.includes('❌') || l.includes('LỖI') || l.includes('thất bại')) colorClass = 'text-rose-400 font-semibold';
      else if (l.startsWith('  ➜')) colorClass = 'text-cyan-300';
      return `<div class="${colorClass}">${esc(l)}</div>`;
    }).join('');

    if (res.ok) {
      toast(res.message || 'Kết nối SMTP thành công!');
    } else {
      toast(res.error || 'Kiểm tra SMTP thất bại', 'error');
    }
  } catch (err) {
    output.innerHTML += `<div class="text-rose-400 font-bold mt-2">❌ LỖI: ${esc(err.message)}</div>`;
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${icon('refresh', 14)} <span>Kiểm tra lại</span>`;
  }
};

window.importProductsCSVModal = function() {
  if (typeof importForm === 'function') {
    importForm();
  }
};

window.restoreBackupModal = function() {
  modal(`
    <div class="modal-header">
      <h2 class="text-rose-700">${icon('database', 18)} Phục hồi Cơ sở Dữ liệu từ file SQL</h2>
      <p class="text-rose-600 font-semibold">⚠️ Cảnh báo: Thao tác này sẽ ghi đè cấu trúc và dữ liệu hiện tại bằng file sao lưu đã chọn.</p>
    </div>
    <form onsubmit="executeRestoreBackup(event)">
      <div class="form-section">
        <label class="block text-xs font-medium text-slate-700 mb-2">Chọn file sao lưu (.sql):
          <input type="file" name="file" accept=".sql" required class="mt-1 block w-full text-xs">
        </label>
      </div>
      <div class="form-actions">
        <button class="btn secondary" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn danger" type="submit">Bắt đầu phục hồi dữ liệu</button>
      </div>
    </form>
  `);
};

window.executeRestoreBackup = async e => {
  e.preventDefault();
  if (!confirm('Bạn có chắc chắn muốn phục hồi cơ sở dữ liệu từ file này?')) return;
  try {
    const r = await api('system.restore_backup', { method: 'POST', body: new FormData(e.target) });
    closeModal();
    toast(r.message || 'Đã phục hồi dữ liệu thành công');
    setTimeout(() => location.reload(), 1200);
  } catch (err) { toast(err.message, 'error'); }
};

window.repairEncoding = async () => {
  if (!confirm('Chuẩn hóa toàn bộ bảng sang UTF-8?')) return;
  try {
    const r = await api('system.repair_encoding', { method: 'POST', body: {} });
    toast(r.message);
  } catch (err) { toast(err.message, 'error'); }
};

window.seedDemo = async () => {
  if (!confirm('Khởi tạo bộ dữ liệu demo trải nghiệm? Dữ liệu hiện tại sẽ được giữ nguyên.')) return;
  try {
    const r = await api('system.seed_demo', { method: 'POST', body: {} });
    toast(r.message);
    settings();
  } catch (err) { toast(err.message, 'error'); }
};

// Global Hotkeys & Event Listeners
document.addEventListener('keydown', e => {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) {
    const input = $('#posSearch') || $('#productSearch');
    if (input) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  }
});

// App Startup & Drawer Logic
$('#loginForm').onsubmit = login;
$('#logoutBtn').onclick = async () => {
  try {
    await api('auth.logout', { method: 'POST' });
    location.reload();
  } catch (err) { toast(err.message, 'error'); }
};

function toggleDrawer(force) {
  const aside = document.querySelector('aside');
  const open = force ?? !aside.classList.contains('open');
  aside.classList.toggle('open', open);
  $('#drawerBackdrop').classList.toggle('hidden', !open);
}

$('#menuBtn').onclick = () => toggleDrawer();
$('#drawerBackdrop').onclick = () => toggleDrawer(false);

// Live Clock
setInterval(() => {
  const el = $('#clock');
  if (el) el.textContent = new Date().toLocaleString('vi-VN');
}, 1000);

// PWA Online & Offline Realtime Network Status Listeners
window.addEventListener('online', () => {
  haptic('success');
  toast('🟢 Đã khôi phục kết nối mạng Internet!', 'success');
});

window.addEventListener('offline', () => {
  haptic('error');
  toast('⚠️ Bạn đang ngoại tuyến. Dữ liệu sẽ được đồng bộ khi có mạng lại.', 'error');
});

// PWA Install Prompt & iOS Guide
let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  const btn = $('#installBtn');
  if (btn) btn.hidden = false;
});

$('#installBtn').onclick = async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $('#installBtn').hidden = true;
  } else {
    window.openIosInstallGuide();
  }
};

window.openIosInstallGuide = function() {
  modal(`
    <div class="sheet-drag-handle"></div>
    <div class="modal-header">
      <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
        ${icon('sparkles', 18)} <span>Cài đặt AKM POS trên Thiết bị</span>
      </h2>
      <p class="text-xs text-slate-500">Mở ứng dụng toàn màn hình, tốc độ phản hồi cực nhanh như ứng dụng Native</p>
    </div>
    <div class="my-4 space-y-2.5 text-xs text-slate-700">
      <div class="flex items-start gap-3 p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
        <div class="w-6 h-6 rounded-full bg-teal-600 text-white font-bold grid place-items-center flex-shrink-0 text-[11px]">1</div>
        <div>
          <b class="text-slate-900 block mb-0.5">Dành cho iPhone / iPad (Safari)</b>
          <span>Nhấn nút Chia sẻ (<b>Share</b> 📤) ở thanh dưới cùng Safari &rarr; Chọn <b>"Thêm vào MH chính"</b> (Add to Home Screen ➕) &rarr; Nhấn <b>"Thêm"</b> (Add).</span>
        </div>
      </div>
      <div class="flex items-start gap-3 p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
        <div class="w-6 h-6 rounded-full bg-teal-600 text-white font-bold grid place-items-center flex-shrink-0 text-[11px]">2</div>
        <div>
          <b class="text-slate-900 block mb-0.5">Dành cho Android (Chrome / Edge)</b>
          <span>Nhấn vào menu 3 chấm <b>⋮</b> góc trên bên phải &rarr; Chọn <b>"Cài đặt ứng dụng"</b> hoặc <b>"Thêm vào Màn hình chính"</b>.</span>
        </div>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn primary wide" onclick="closeModal()">Đã hiểu</button>
    </div>
  `);
};

// Check iOS non-standalone mode to offer install button
const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
if (isIos && !isStandalone) {
  const btn = $('#installBtn');
  if (btn) {
    btn.textContent = '📲 Cài đặt App (PWA)';
    btn.hidden = false;
  }
}

// ==========================================
// NOTIFICATION & MOBILE PUSH HEADS-UP ENGINE
// ==========================================

let notifPollTimer = null;
let lastKnownUnreadCount = 0;
let lastKnownMaxId = 0;
let flyoutLoadedItems = [];
let audioCtxInstance = null;

// 1. Web Audio API Notification Synthesizer (Zero file lag, offline-ready, auto-unlock)
function getAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtxInstance) {
      audioCtxInstance = new AudioCtx();
    }
    if (audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume().catch(() => {});
    }
    return audioCtxInstance;
  } catch (e) {
    return null;
  }
}

// Auto unlock audio context on first user interaction
const unlockAudioOnUserGesture = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  ['click', 'touchstart', 'keydown'].forEach(ev => {
    document.removeEventListener(ev, unlockAudioOnUserGesture);
  });
};
['click', 'touchstart', 'keydown'].forEach(ev => {
  document.addEventListener(ev, unlockAudioOnUserGesture, { passive: true, once: true });
});

window.playNotificationChime = function() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonious chord: F5 (698.46Hz) -> A5 (880Hz) -> C6 (1046.5Hz)
    const notes = [
      { freq: 698.46, start: now, dur: 0.35, gain: 0.12 },
      { freq: 880.00, start: now + 0.08, dur: 0.45, gain: 0.15 },
      { freq: 1046.50, start: now + 0.16, dur: 0.65, gain: 0.18 }
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, n.start);

      gain.gain.setValueAtTime(0, n.start);
      gain.gain.linearRampToValueAtTime(n.gain, n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, n.start + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(n.start);
      osc.stop(n.start + n.dur);
    });
  } catch (e) {}
};

// 2. Format Relative Date / Time Ago
window.timeAgo = function(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(/-/g, '/'));
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 30) return 'Vừa xong';
  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return `Hôm qua ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

// 3. Get Notification Icon & Class by Type & Severity
window.getNotifTypeConfig = function(type, severity) {
  const sev = (severity || 'INFO').toLowerCase();
  let iconName = 'bell';
  let badgeColor = 'info';

  if (type === 'SALE_NEW' || type === 'SALE_ALERT') {
    iconName = 'pos';
    badgeColor = 'success';
  } else if (type === 'ORDER_CANCELLED') {
    iconName = 'x-circle';
    badgeColor = 'danger';
  } else if (type === 'RETURN_CREATED') {
    iconName = 'returns';
    badgeColor = 'warning';
  } else if (type.includes('TRANSFER')) {
    iconName = 'transfers';
    badgeColor = (type.includes('DECISION') && severity === 'DANGER') ? 'danger' : (severity === 'SUCCESS' ? 'success' : 'info');
  } else if (type === 'LOW_STOCK' || type === 'STOCK_OUT') {
    iconName = 'alert-triangle';
    badgeColor = 'danger';
  } else if (type === 'STOCK_ADJUST') {
    iconName = 'inventory';
    badgeColor = 'info';
  } else if (type.startsWith('REPAIR')) {
    iconName = 'repairs';
    badgeColor = type === 'REPAIR_COMPLETE' ? 'success' : (type.includes('OVERDUE') ? 'danger' : 'info');
  } else if (type === 'BACKUP') {
    iconName = 'database';
    badgeColor = 'info';
  } else if (type === 'BROADCAST' || type === 'SYSTEM') {
    iconName = 'sparkles';
    badgeColor = 'info';
  } else {
    badgeColor = sev === 'danger' ? 'danger' : (sev === 'warning' ? 'warning' : (sev === 'success' ? 'success' : 'info'));
  }

  return { iconName, sev: badgeColor };
};

// 4. In-App Mobile Push Banner Display with Touch / Swipe-up Gesture & Web Push
window.showMobilePushBanner = function(notif, isForceTest = false) {
  let container = document.getElementById('mobilePushContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'mobilePushContainer';
    container.className = 'mobile-push-container';
    document.body.appendChild(container);
  }

  const notifUniqueKey = 'akm_notif_seen_' + (notif.id || (notif.title + '_' + notif.created_at));
  if (!isForceTest && sessionStorage.getItem(notifUniqueKey)) {
    return; // Prevent duplicate popup in current session
  }
  sessionStorage.setItem(notifUniqueKey, '1');

  const conf = window.getNotifTypeConfig(notif.type, notif.severity);
  const bannerId = 'push_banner_' + (notif.id || Date.now());

  // Haptic physical vibration on iOS Native & Mobile PWA
  window.triggerCapacitorHaptics(conf.sev === 'danger' ? 'ERROR' : (conf.sev === 'warning' ? 'WARNING' : 'SUCCESS'));

  // Audio synthesizer chime
  window.playNotificationChime();

  const targetUrl = notif.link_type === 'orders' && notif.link_id
    ? `./?page=orders&id=${notif.link_id}`
    : (notif.link_type ? `./?page=${notif.link_type}` : './?page=notifications');

  // 1. Trigger iOS Native Local Notifications (Lock screen, System banner, Sound)
  window.triggerCapacitorLocalNotification(notif, targetUrl);

  // 2. Trigger OS Desktop / Mobile PWA Push Notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const iconUrl = new URL('assets/icon-192.png', window.location.href).href;

      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(notif.title, {
            body: notif.message,
            icon: iconUrl,
            badge: iconUrl,
            vibrate: [120, 60, 120, 60, 180],
            tag: 'akm_notif_' + (notif.id || Date.now()),
            renotify: true,
            data: { url: targetUrl }
          });
        }).catch(() => {
          try {
            new Notification(notif.title, { body: notif.message, icon: iconUrl });
          } catch (err) {}
        });
      } else {
        try {
          new Notification(notif.title, { body: notif.message, icon: iconUrl });
        } catch (err) {}
      }
    } catch (e) {}
  }

  const banner = document.createElement('div');
  banner.id = bannerId;
  banner.className = 'mobile-push-banner';
  banner.innerHTML = `
    <div class="mobile-push-drag"></div>
    <div class="mobile-push-top">
      <div class="mobile-push-brand">
        <span class="brand-badge ${conf.sev}">A</span>
        <span>AKM POS · ${esc(notif.store_name || 'Toàn hệ thống')}</span>
      </div>
      <span class="mobile-push-time">${window.timeAgo(notif.created_at || new Date().toISOString())}</span>
    </div>
    <div class="mobile-push-content">
      <div class="mobile-push-icon ${conf.sev}">
        ${icon(conf.iconName, 20)}
      </div>
      <div class="mobile-push-texts">
        <div class="mobile-push-title">${esc(notif.title)}</div>
        <div class="mobile-push-desc">${esc(notif.message)}</div>
      </div>
    </div>
    <div class="mobile-push-progress"></div>
  `;

  // Touch gesture for Swipe-Up to Dismiss
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  banner.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  banner.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY < 0) {
      banner.style.transform = `translateY(${deltaY}px) scale(0.98)`;
    }
  }, { passive: true });

  banner.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const deltaY = currentY - startY;
    if (deltaY < -25) {
      dismissBanner();
    } else {
      banner.style.transform = '';
    }
  }, { passive: true });

  function dismissBanner() {
    banner.classList.add('swiping-up');
    setTimeout(() => {
      banner.remove();
    }, 280);
  }

  // Click banner to navigate
  banner.onclick = () => {
    if (isDragging) return;
    dismissBanner();
    if (notif.link_type) {
      if (notif.link_type === 'orders' && notif.link_id) {
        orderDetail(notif.link_id);
      } else if (notif.link_type === 'repairs' && notif.link_id) {
        openRepairDetail(notif.link_id);
      } else if (notif.link_type === 'inventory') {
        go('inventory');
      } else if (notif.link_type === 'transfers') {
        go('transfers');
      } else {
        go(notif.link_type);
      }
    } else {
      go('notifications');
    }
    if (notif.id) window.markNotificationRead(notif.id);
  };

  container.appendChild(banner);

  // Trigger smooth entrance animation
  requestAnimationFrame(() => {
    banner.classList.add('show');
  });

  // Auto dismiss after 6.5s
  setTimeout(() => {
    if (banner.parentElement) dismissBanner();
  }, 6500);
};

// 5. Polling & Sync Unread Counts
window._lastKnownMaxId = window._lastKnownMaxId || 0;
window._lastKnownUnreadCount = window._lastKnownUnreadCount || 0;

window.checkNotifications = async function(isInitial = false) {
  if (!S.user) return;
  try {
    const res = await api('notifications.unread_count', { silent: true });
    const unreadCount = Number(res.unread_count || 0);
    const maxId = Number(res.max_id || 0);

    const badge = document.getElementById('notifBadge');
    const bellBtn = document.getElementById('notifBellBtn');
    const flyoutUnread = document.getElementById('flyoutUnreadCount');

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    if (flyoutUnread) {
      if (unreadCount > 0) {
        flyoutUnread.textContent = `${unreadCount} mới`;
        flyoutUnread.classList.remove('hidden');
      } else {
        flyoutUnread.classList.add('hidden');
      }
    }

    // Check if new notifications arrived since last check
    if (!isInitial && window._lastKnownMaxId > 0 && maxId > window._lastKnownMaxId) {
      if (bellBtn) {
        bellBtn.classList.add('ringing');
        setTimeout(() => bellBtn.classList.remove('ringing'), 900);
      }

      const latestItems = res.latest || [];
      const newItems = latestItems.filter(x => Number(x.id) > window._lastKnownMaxId);
      if (newItems.length > 0) {
        newItems.forEach((item, index) => {
          setTimeout(() => {
            window.showMobilePushBanner(item, true);
          }, index * 800);
        });
      } else if (latestItems.length > 0) {
        window.showMobilePushBanner(latestItems[0], true);
      } else {
        window.playNotificationChime();
      }
    }

    window._lastKnownUnreadCount = unreadCount;
    window._lastKnownMaxId = maxId;
  } catch (err) {}
};

// 6. Flyout Popover Toggling & Loading
window.toggleNotifFlyout = function(e) {
  if (e) e.stopPropagation();
  const flyout = document.getElementById('notifFlyout');
  if (!flyout) return;

  const isHidden = flyout.classList.contains('hidden');
  if (isHidden) {
    flyout.classList.remove('hidden');
    window.loadFlyoutNotifications('all');
  } else {
    flyout.classList.add('hidden');
  }
};

window.closeNotifFlyout = function() {
  const flyout = document.getElementById('notifFlyout');
  if (flyout) flyout.classList.add('hidden');
};

window.filterFlyoutTab = function(tab, btn) {
  document.querySelectorAll('.notif-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.loadFlyoutNotifications(tab);
};

window.loadFlyoutNotifications = async function(filter = 'all') {
  const listEl = document.getElementById('notifFlyoutList');
  if (!listEl) return;

  listEl.innerHTML = `
    <div class="notif-empty">
      <span class="spinner" style="width:18px;height:18px;border-width:2px;"></span>
      <span>Đang tải...</span>
    </div>
  `;

  try {
    const res = await api('notifications.list', { params: { limit: 15, filter } });
    const items = res.items || [];
    flyoutLoadedItems = items;

    if (!items.length) {
      listEl.innerHTML = `
        <div class="notif-empty">
          <div style="color:#cbd5e1;">${icon('bell', 28)}</div>
          <p style="margin:0; font-weight:500; color:#64748b;">Không có thông báo nào</p>
          <span style="font-size:11px; color:#94a3b8;">Hệ thống đang hoạt động ổn định</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(n => {
      const conf = window.getNotifTypeConfig(n.type, n.severity);
      return `
        <div class="notif-item ${!+n.is_read ? 'unread' : ''}" onclick="window.onNotifItemClick(${n.id})">
          <div class="notif-item-icon ${conf.sev}">
            ${icon(conf.iconName, 16)}
          </div>
          <div class="notif-item-body">
            <div class="notif-item-title">
              <span>${esc(n.title)}</span>
              ${!+n.is_read ? '<span class="notif-unread-dot"></span>' : ''}
            </div>
            <div class="notif-item-desc">${esc(n.message)}</div>
            <div class="notif-item-meta">
              <span>${window.timeAgo(n.created_at)}</span>
              ${n.store_name ? `<span class="notif-item-store">${esc(n.store_name)}</span>` : ''}
            </div>
          </div>
          <div class="notif-item-actions" onclick="event.stopPropagation()">
            ${!+n.is_read ? `
              <button type="button" class="notif-mini-btn" title="Đánh dấu đã đọc" onclick="window.markNotificationRead(${n.id}, event)">
                ${icon('check', 13)}
              </button>
            ` : ''}
            <button type="button" class="notif-mini-btn" title="Xóa thông báo" onclick="window.deleteNotification(${n.id}, event)">
              ${icon('trash', 13)}
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    listEl.innerHTML = `<div class="notif-empty" style="color:#ef4444;">${esc(err.message)}</div>`;
  }
};

window.onNotifItemClick = function(id) {
  const n = flyoutLoadedItems.find(x => +x.id === +id);
  window.closeNotifFlyout();
  if (!n) return;
  window.markNotificationRead(id);

  if (n.link_type === 'orders' && n.link_id) {
    orderDetail(n.link_id);
  } else if (n.link_type === 'repairs' && n.link_id) {
    openRepairDetail(n.link_id);
  } else if (n.link_type === 'inventory') {
    go('inventory');
  } else if (n.link_type === 'transfers') {
    go('transfers');
  } else if (n.link_type) {
    go(n.link_type);
  } else {
    go('notifications');
  }
};

window.markNotificationRead = async function(id, e) {
  if (e) e.stopPropagation();
  try {
    await api('notifications.mark_read', { method: 'POST', body: { id } });
    window.checkNotifications(true);
    const activeTab = document.querySelector('.notif-tab-btn.active')?.dataset.tab || 'all';
    window.loadFlyoutNotifications(activeTab);
    if (S.page === 'notifications' && typeof window.loadNotificationCenter === 'function') {
      window.loadNotificationCenter();
    }
  } catch (err) {}
};

window.markAllNotificationsRead = async function(e) {
  if (e) e.stopPropagation();
  try {
    await api('notifications.mark_read', { method: 'POST', body: { all: 1 } });
    toast('Đã đánh dấu tất cả là đã đọc');
    window.checkNotifications(true);
    const activeTab = document.querySelector('.notif-tab-btn.active')?.dataset.tab || 'all';
    window.loadFlyoutNotifications(activeTab);
    if (S.page === 'notifications' && typeof window.loadNotificationCenter === 'function') {
      window.loadNotificationCenter();
    }
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.deleteNotification = async function(id, e) {
  if (e) e.stopPropagation();
  try {
    await api('notifications.delete', { method: 'POST', body: { id } });
    window.checkNotifications(true);
    const activeTab = document.querySelector('.notif-tab-btn.active')?.dataset.tab || 'all';
    window.loadFlyoutNotifications(activeTab);
    if (S.page === 'notifications' && typeof window.loadNotificationCenter === 'function') {
      window.loadNotificationCenter();
    }
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.urlBase64ToUint8Array = function(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

window.subscribeUserToWebPush = async function(interactive = false) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.pushManager) return false;

    // Get VAPID Public Key from server
    const vapidRes = await api('push.vapid_public_key', { silent: true });
    if (!vapidRes || !vapidRes.public_key) return false;

    const applicationServerKey = window.urlBase64ToUint8Array(vapidRes.public_key);

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
    }

    const subJson = sub.toJSON();
    if (!subJson.endpoint || !subJson.keys) return false;

    // Store subscription on backend
    await api('push.subscribe', {
      method: 'POST',
      body: {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        store_id: S.store_id || null
      },
      silent: true
    });

    if (interactive) {
      toast('🟢 Đã kết nối thông báo ngầm từ máy chủ (kể cả khi bạn tắt ứng dụng)!', 'success');
    }
    return true;
  } catch (err) {
    console.warn('Push subscription failed:', err);
    return false;
  }
};

window.requestNotificationPermission = async function() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (!('Notification' in window)) {
    if (isIOS && !isStandalone) {
      window.showIosPwaInstallGuide();
      return false;
    }
    toast('Trình duyệt này chưa hỗ trợ Web Push Notification', 'warning');
    return false;
  }

  if (Notification.permission === 'granted') {
    toast('✅ Đã kích hoạt quyền thông báo đẩy trên thiết bị này!', 'success');
    window.playNotificationChime();
    await window.subscribeUserToWebPush(true);
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        const iconUrl = new URL('assets/icon-192.png', window.location.href).href;
        reg.showNotification('AKM POS · Đã kích hoạt thông báo nền', {
          body: 'Bạn sẽ nhận thông báo đơn hàng và cảnh báo ngay cả khi đóng ứng dụng.',
          icon: iconUrl,
          badge: iconUrl,
          tag: 'akm_notif_test'
        });
      }).catch(() => {});
    }
    return true;
  }

  if (Notification.permission === 'denied') {
    toast('⚠️ Bạn đã chặn quyền thông báo. Hãy vào Cài đặt trang web hoặc Safari để cho phép lại.', 'warning', 6000);
    return false;
  }

  try {
    let perm;
    if (Notification.requestPermission.length > 0) {
      perm = await new Promise(resolve => Notification.requestPermission(resolve));
    } else {
      perm = await Notification.requestPermission();
    }

    if (perm === 'granted') {
      toast('🟢 Đã kích hoạt thông báo đẩy PWA thành công!', 'success');
      window.playNotificationChime();
      await window.subscribeUserToWebPush(true);
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(reg => {
          const iconUrl = new URL('assets/icon-192.png', window.location.href).href;
          reg.showNotification('AKM POS · Kích hoạt thành công', {
            body: 'Hệ thống đã kết nối thông báo đơn hàng, tồn kho và sửa chữa ngầm!',
            icon: iconUrl,
            badge: iconUrl,
            tag: 'akm_notif_welcome'
          });
        }).catch(() => {});
      }
      return true;
    } else {
      toast('⚠️ Bạn đã từ chối cấp quyền thông báo', 'warning');
      return false;
    }
  } catch (err) {
    toast('Lỗi khi xin quyền thông báo: ' + (err.message || err), 'error');
    return false;
  }
};

/* =========================================================================
   PWA Installation Prompt & Guides
   ========================================================================= */
window._deferredPwaPrompt = null;

window.showIosPwaInstallGuide = function() {
  const modalBody = document.getElementById('modalBody');
  const modal = document.getElementById('modal');
  if (!modalBody || !modal) return;

  modalBody.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <img src="assets/icon-192.png" alt="AKM POS" style="width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 10px; box-shadow: 0 4px 12px rgba(15,118,110,0.3);">
      <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 4px;">Cài đặt AKM POS vào iPhone</h3>
      <p style="font-size: 12.5px; color: #64748b; margin: 0;">Sử dụng toàn màn hình & Nhận thông báo đẩy đơn hàng tức thì</p>
    </div>

    <div class="pwa-guide-step">
      <div class="pwa-step-num">1</div>
      <div class="pwa-step-text">
        Nhấn vào biểu tượng <b>Chia sẻ (Share) ⎋</b> ở thanh điều hướng dưới cùng của trình duyệt <b>Safari</b>.
      </div>
    </div>

    <div class="pwa-guide-step">
      <div class="pwa-step-num">2</div>
      <div class="pwa-step-text">
        Cuộn xuống danh sách tùy chọn và chọn <b>"Thêm vào Màn hình chính" (Add to Home Screen)</b>.
      </div>
    </div>

    <div class="pwa-guide-step">
      <div class="pwa-step-num">3</div>
      <div class="pwa-step-text">
        Nhấn nút <b>"Thêm" (Add)</b> ở góc trên bên phải để hoàn tất. Mở app từ màn hình chính và bật thông báo!
      </div>
    </div>

    <button type="button" class="btn btn-primary" style="width: 100%; margin-top: 8px; padding: 12px;" onclick="closeModal()">
      Đã hiểu, đóng hướng dẫn
    </button>
  `;

  modal.classList.remove('hidden');
};

window.initPwaInstallPrompt = function() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) return; // Already installed as PWA

  const banner = document.getElementById('pwaInstallBanner');
  if (!banner) return;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Listen for beforeinstallprompt on Android / Chrome / Edge
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._deferredPwaPrompt = e;
    
    if (localStorage.getItem('akm_pwa_dismissed') === '1') return;

    banner.innerHTML = `
      <div class="pwa-install-brand">
        <img src="assets/icon-192.png" alt="AKM POS" class="pwa-install-icon">
        <div class="pwa-install-texts">
          <div class="pwa-install-title">Cài đặt App AKM POS</div>
          <div class="pwa-install-desc">Nhận thông báo đơn hàng & Dùng toàn màn hình</div>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button type="button" class="pwa-install-btn" onclick="window.triggerPwaInstall()">Cài đặt</button>
        <button type="button" class="pwa-install-close" onclick="window.dismissPwaBanner()" aria-label="Đóng">✕</button>
      </div>
    `;
    banner.classList.remove('hidden');
  });

  // For iOS Safari (non-standalone)
  if (isIOS && !window.Capacitor) {
    if (localStorage.getItem('akm_pwa_dismissed') === '1') return;
    
    setTimeout(() => {
      banner.innerHTML = `
        <div class="pwa-install-brand">
          <img src="assets/icon-192.png" alt="AKM POS" class="pwa-install-icon">
          <div class="pwa-install-texts">
            <div class="pwa-install-title">Cài đặt App AKM POS</div>
            <div class="pwa-install-desc">Thêm vào MH chính để nhận thông báo đẩy</div>
          </div>
        </div>
        <div class="pwa-install-actions">
          <button type="button" class="pwa-install-btn" onclick="window.showIosPwaInstallGuide()">Hướng dẫn</button>
          <button type="button" class="pwa-install-close" onclick="window.dismissPwaBanner()" aria-label="Đóng">✕</button>
        </div>
      `;
      banner.classList.remove('hidden');
    }, 2500);
  }
};

window.triggerPwaInstall = async function() {
  if (window._deferredPwaPrompt) {
    window._deferredPwaPrompt.prompt();
    const { outcome } = await window._deferredPwaPrompt.userChoice;
    if (outcome === 'accepted') {
      toast('🎉 Đang cài đặt AKM POS vào màn hình chính...', 'success');
      window.dismissPwaBanner();
    }
    window._deferredPwaPrompt = null;
  }
};

window.dismissPwaBanner = function() {
  const banner = document.getElementById('pwaInstallBanner');
  if (banner) banner.classList.add('hidden');
  localStorage.setItem('akm_pwa_dismissed', '1');
};

/* =========================================================================
   Offline Network Indicator
   ========================================================================= */
window.initOfflineDetector = function() {
  const banner = document.getElementById('offlineBanner');
  
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      if (banner) banner.classList.remove('hidden');
    } else {
      if (banner && !banner.classList.contains('hidden')) {
        banner.classList.add('hidden');
        toast('🟢 Đã khôi phục kết nối mạng internet!', 'success');
        if (typeof window.checkNotifications === 'function') {
          window.checkNotifications(false);
        }
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  if (!navigator.onLine && banner) {
    banner.classList.remove('hidden');
  }
};

// Native Capacitor Bridge & Dynamic Plugin Resolver
window.getCapPlugin = function(name) {
  if (typeof window.Capacitor === 'undefined') return null;
  if (window.Capacitor.Plugins && window.Capacitor.Plugins[name]) {
    return window.Capacitor.Plugins[name];
  }
  if (typeof window.Capacitor.registerPlugin === 'function') {
    try {
      const plugin = window.Capacitor.registerPlugin(name);
      if (plugin) {
        if (!window.Capacitor.Plugins) window.Capacitor.Plugins = {};
        window.Capacitor.Plugins[name] = plugin;
        return plugin;
      }
    } catch (e) {
      console.warn('[Capacitor] registerPlugin failed for ' + name, e);
    }
  }
  return null;
};

window.triggerCapacitorHaptics = function(type = 'SUCCESS') {
  const haptics = window.getCapPlugin('Haptics');
  if (haptics && typeof haptics.notification === 'function') {
    try {
      const t = String(type).toUpperCase();
      haptics.notification({ type: t === 'DANGER' || t === 'ERROR' ? 'ERROR' : (t === 'WARNING' ? 'WARNING' : 'SUCCESS') }).catch(() => {});
    } catch (e) {}
  } else if ('vibrate' in navigator) {
    try { navigator.vibrate([120, 60, 120]); } catch (e) {}
  }
};

window.triggerCapacitorLocalNotification = async function(notif, targetUrl) {
  const localNotif = window.getCapPlugin('LocalNotifications');
  if (!localNotif) return false;

  try {
    const rawId = Number(notif.id) || Date.now();
    const safeId = Math.floor(Math.abs(rawId)) % 2147483647 || (Math.floor(Math.random() * 900000) + 100000);
    
    // Ensure permission is granted
    if (typeof localNotif.checkPermissions === 'function') {
      const status = await localNotif.checkPermissions().catch(() => null);
      if (status && status.display !== 'granted' && typeof localNotif.requestPermissions === 'function') {
        await localNotif.requestPermissions().catch(() => null);
      }
    }

    await localNotif.schedule({
      notifications: [
        {
          id: safeId,
          title: String(notif.title || 'AKM POS'),
          body: String(notif.message || 'Bạn có thông báo mới'),
          sound: 'default',
          extra: { url: targetUrl || './?page=notifications' }
        }
      ]
    });
    return true;
  } catch (err) {
    console.warn('[Capacitor] LocalNotification schedule error:', err);
    return false;
  }
};

window.testLocalNotification = async function(e) {
  if (e) e.stopPropagation();
  toast('🔔 Đang phát thông báo thử nghiệm...', 'info');

  const testNotif = {
    id: Date.now() % 1000000,
    title: '🛍️ Đơn hàng mới · +1.850.000₫',
    message: '[Chi nhánh 1] Thu ngân vừa chốt đơn thành công · Khách hàng Nguyễn Văn A',
    type: 'SALE_NEW',
    severity: 'SUCCESS',
    link_type: 'orders'
  };

  // 1. Create a real database notification entry on backend
  try {
    api('notifications.send', {
      method: 'POST',
      body: {
        title: testNotif.title,
        message: testNotif.message,
        severity: 'SUCCESS',
        type: 'SALE_NEW',
        link_type: 'orders'
      },
      silent: true
    }).catch(() => {});
  } catch (err) {}

  // 2. Trigger iOS Native Local Notification
  await window.triggerCapacitorLocalNotification(testNotif, './?page=orders');

  // 3. iOS Native Haptics Vibration
  window.triggerCapacitorHaptics('SUCCESS');

  // 4. Audio Chime & In-App Pop-Up Banner
  window.playNotificationChime();
  window.showMobilePushBanner(testNotif, true);

  // 5. Update unread count badge
  setTimeout(() => {
    window.checkNotifications(false);
  }, 400);
};

window.initNotificationSystem = function() {
  // 1. Initialize Capacitor iOS Native Local Notifications & Haptics
  const localNotif = window.getCapPlugin('LocalNotifications');
  if (localNotif) {
    try {
      if (typeof localNotif.requestPermissions === 'function') {
        localNotif.requestPermissions().then(status => {
          if (status && (status.display === 'granted' || status.display === 'prompt-with-rationale')) {
            if (!sessionStorage.getItem('akm_ios_notif_welcomed')) {
              sessionStorage.setItem('akm_ios_notif_welcomed', '1');
              setTimeout(() => {
                localNotif.schedule({
                  notifications: [
                    {
                      id: 99999,
                      title: '🎉 AKM POS · Thông báo iOS đã sẵn sàng!',
                      body: 'Bạn sẽ nhận thông báo đơn hàng và cảnh báo sửa chữa tức thì.',
                      sound: 'default',
                      extra: { url: './?page=dashboard' }
                    }
                  ]
                }).catch(() => {});
              }, 800);
            }
          }
        }).catch(() => {});
      }

      if (typeof localNotif.addListener === 'function') {
        localNotif.addListener('localNotificationActionPerformed', (notification) => {
          const extra = notification?.notification?.extra || {};
          if (extra.url) {
            try {
              const u = new URL(extra.url, window.location.href);
              const page = u.searchParams.get('page') || 'notifications';
              const id = u.searchParams.get('id');
              if (typeof window.go === 'function') {
                window.go(page, id ? { id } : null);
              }
            } catch (err) {}
          }
        });
      }
    } catch (e) {}
  }

  // 2. Resume listener when app switches to foreground on iOS
  const capApp = window.getCapPlugin('App');
  if (capApp && typeof capApp.addListener === 'function') {
    try {
      capApp.addListener('appStateChange', (state) => {
        if (state && state.isActive) {
          window.checkNotifications(false);
        }
      });
    } catch (e) {}
  }

  window.checkNotifications(true);
  if (notifPollTimer) clearInterval(notifPollTimer);
  notifPollTimer = setInterval(() => window.checkNotifications(false), 8000);

  // Auto scan on system boot
  setTimeout(() => {
    api('notifications.scan', { method: 'POST', silent: true }).then(() => {
      window.checkNotifications(true);
    }).catch(() => {});
  }, 3000);

  // Auto sync Web Push Subscription if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    setTimeout(() => {
      window.subscribeUserToWebPush(false);
    }, 4000);
  }

  // Close flyout on click outside
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('notifBellWrap');
    if (wrap && !wrap.contains(e.target)) {
      window.closeNotifFlyout();
    }
  });

  // Check notifications on window focus & visibility change & online
  window.addEventListener('focus', () => {
    window.checkNotifications(false);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      window.checkNotifications(false);
    }
  });
  window.addEventListener('online', () => {
    window.checkNotifications(false);
  });

  // Cross-tab Realtime Sync via BroadcastChannel
  if (window._akmBroadcast) {
    window._akmBroadcast.addEventListener('message', e => {
      if (e.data && (e.data.type === 'STOCK_UPDATE' || e.data.type === 'NOTIF_SYNC')) {
        window.checkNotifications(false);
      }
    });
  }

  // Service Worker message listener for notification clicks
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'NOTIF_CLICK_NAV' && e.data.url) {
        try {
          const u = new URL(e.data.url);
          const page = u.searchParams.get('page') || 'notifications';
          const id = u.searchParams.get('id');
          if (typeof window.go === 'function') {
            window.go(page, id ? { id } : null);
          }
        } catch (err) {}
      }
    });
  }

  // Initialize Offline Network Detector & Smart PWA Installation
  window.initOfflineDetector();
  window.initPwaInstallPrompt();

  // Proactive Push Permission Prompt for Admin on Mobile PWA
  if (S.user?.role === 'ADMIN' && 'Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      if (!sessionStorage.getItem('notif_admin_prompt')) {
        sessionStorage.setItem('notif_admin_prompt', '1');
        toast(`🔔 <b>Admin</b>: Hãy <a href="javascript:void(0)" onclick="requestNotificationPermission()">bật thông báo đẩy PWA</a> để nhận ngay các thông báo bán hàng & doanh thu tức thì!`, 'info', 10000);
      }
    }, 4500);
  }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// Initial Auto-Auth
api('auth.me', { silent: true }).then(r => {
  S.user = r.user;
  S.csrf = r.csrf;
  start();
}).catch(() => {});



