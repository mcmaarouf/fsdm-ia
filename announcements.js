// ==========================================
// FSDM_AI Student Dashboard - Announcements
// Google Sheets Remote Fetching
// ==========================================

const SHEET_ID = '1dpDjR7oCqcPQBw4VNGuCwWAGN8GsOiLicdbSawxLhmY';
const SHEET_NAME = 'Sheet1';

// ==========================================
// ألوان كل نوع (Category) — بدل الكلمات هنا
// باش تطابق بالضبط الكلمات لي كتكتبها فـ Google Sheet
// ==========================================
function getCategoryColor(category) {
  const colors = {
    'إعلانات إدارية': '#3b82f6',  // أزرق
    'إدارية': '#3b82f6',
    'مهم': '#ef4444',             // أحمر
    'مهمة': '#ef4444',
    'عاجل': '#ef4444',
    'إخبار': '#22c55e',           // أخضر
    'إخبارات': '#22c55e',
    'خبر': '#22c55e',
    'امتحانات': '#fe5805',        // برتقالي
    'امتحان': '#fe5805',
    'INFO': '#3b82f6'
  };
  return colors[category] || '#94a3b8'; // لون رمادي افتراضي إلا ماكانش النوع معروف
}

async function loadAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  try {
    const response = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`);

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      renderEmptyState(container);
      return;
    }

    container.innerHTML = data.map(item => {
      // قراءة الأعمدة مع دعم الحروف الكبيرة وصغيرة لضمان عدم ضياع أي بيانات
      const category = (item.category || item.Category || 'INFO').trim();
      const date = item.date || item.Date || '';
      const title = item.title || item.Title || '';
      const desc = item.Content || item.content || item.desc || '';
      const link = item.link || item.Link || '#';
      const badgeColor = getCategoryColor(category);

      return `
        <div class="announcement-card" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <div class="announcement-header" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span class="announcement-badge" style="background: ${badgeColor}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${category}</span>
            <span class="announcement-date" style="color: #94a3b8; font-size: 0.85rem;">${date}</span>
          </div>
          <div class="announcement-body">
            <strong style="color: #ffffff; font-size: 1.05rem; display: block; margin-bottom: 6px;">${title}</strong>
            <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">${desc}</p>
            ${link !== '#' ? `<a href="${link}" target="_blank" style="display: inline-block; margin-top: 10px; color: #60a5fa; font-size: 0.85rem; text-decoration: none;">رابط الإعلان ↗</a>` : ''}
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading announcements from Google Sheets:', error);
    renderEmptyState(container);
  }
}

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-announcements panel">
      <div class="empty-icon">◌</div>
      <h2>لا توجد إعلانات حالياً</h2>
      <p>لا توجد أي إعلانات جديدة في الوقت الحالي.</p>
      <span class="mono">ANNOUNCEMENTS // CLEAR</span>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadAnnouncements);
