import React from 'react';

interface CourseLessonIconProps {
  type: string;
  documentUrl?: string;
}

const iconMap: Record<string, JSX.Element> = {
  'pdf': <span role="img" aria-label="PDF">📕</span>,
  'excel': <span role="img" aria-label="Excel">📈</span>,
  'image': <span role="img" aria-label="Image">🖼️</span>,
  'video': <span role="img" aria-label="Video">🎬</span>,
  'test': <span role="img" aria-label="Test">🧩</span>,
  'text': <span role="img" aria-label="Text">📝</span>,
  'document': <span role="img" aria-label="Document">📄</span>,
  'presentation': <span role="img" aria-label="Presentation">📊</span>,
};

function getIcon(type: string, documentUrl?: string, videoUrl?: string) {
  if (type === 'VIDEO') return iconMap['video'];
  if (type === 'TEST') return iconMap['test'];
  if (type === 'TEXT') return iconMap['text'];

  if (type === 'DOCUMENT') {
    if (documentUrl && /\.(pptx?|ppt)$/i.test(documentUrl)) return iconMap['presentation'];
    if (documentUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(documentUrl)) return iconMap['image'];
    if (documentUrl && /\.(xls|xlsx)$/i.test(documentUrl)) return iconMap['excel'];
    if (documentUrl && /\.(pdf)$/i.test(documentUrl)) return iconMap['pdf'];
    if (documentUrl && /\.(docx?|doc)$/i.test(documentUrl)) return iconMap['document'];
    if (documentUrl && /\.txt$/i.test(documentUrl)) return iconMap['text'];
    return iconMap['document'];
  }
  return <span role="img" aria-label="Other">📦</span>;
}

const CourseLessonIcon: React.FC<CourseLessonIconProps> = ({ type, documentUrl }) => {
  const icon = getIcon(type, documentUrl);
  return <span className="text-2xl mr-2">{icon}</span>;
};

export default CourseLessonIcon;