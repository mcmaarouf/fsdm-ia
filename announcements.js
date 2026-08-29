// ==========================================
// FSDM_AI Student Dashboard - Announcements
// Google Sheets Remote Fetching
// ==========================================

const SHEET_ID = '1dpDjR7oCqcPQBw4VNGuCwWAGN8GsOiLicdbSawxLhmY';
// اسم الصفحة فـ أسفل Google Sheets (إيلا كانت بالعربية غيّرها لـ 'الورقة1')
const SHEET_NAME = 'Sheet1'; 

async function loadAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  try {
    const response = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    const data = await response.json();

    // 1. حالة الجدول الخاوي
    if (!data || data.length === 0) {
      renderEmptyState(container);
      return;
    }

    // 2. رسم بطاقات الإعلانات باللغة الأصلية المكتوبة فـ الشيت
    container.innerHTML = data.map(item => {
      const category = (item.category || 'INFO').toUpperCase().trim();
      const date = item.date || '';
      const title = item.title || '';
      const desc = item.desc || '';

      return `
        <div class="announcement-card category-${category}">
          <div class="announcement-header">
            <span class="announcement-badge">${category}</span>
            <span class="announcement-date">${date}</span>
          </div>
          <div class="announcement-body">
            <strong style="color: #ffffff; font-size: 1rem; display: block; margin-bottom: 4px;">${title}</strong>
            <p style="margin: 0; color: #a0a0a0; font-size: 0.88rem; line-height: 1.5;">${desc}</p>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading announcements from Google Sheets:', error);
    renderEmptyState(container);
  }
}

// دالة تفعيل كارت "لا توجد إعلانات"
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

// تشغيل جلب الإعلانات فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadAnnouncements);