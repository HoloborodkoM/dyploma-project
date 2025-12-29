import React, { useState } from 'react';
import LessonTextView from '../ui/LessonTextUI';
import LessonVideoView from '../ui/LessonVideoUI';
import LessonDocumentView from '../ui/LessonDocumentUI';
import LessonTestView from '../ui/LessonTestUI';
import ModalWrapper from '@/components/course/modal/ModalWrapper';
import Spinner from '../../Spinner';
import { TranslatedText } from '@/components/TranslatedText';

interface LessonModalProps {
  open: boolean;
  onClose: () => void;
  lesson: any;
  onComplete: () => void;
  completed: boolean;
  loading: boolean;
  result?: any;
}

function getMimeTypeFromUrl(url: string): string {
  if (!url) return '';
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt': return 'text/plain';
    default: return '';
  }
}

const LessonModal: React.FC<LessonModalProps> = ({ 
  open, 
  onClose, 
  lesson, 
  onComplete, 
  completed, 
  loading, 
  result 
}) => {
  const [testFinished, setTestFinished] = useState(false);
  if (!open || !lesson) return null;

  let content = null;
  if (lesson.type === 'TEXT') {
    content = (
      <LessonTextView
        title={lesson.title}
        content={lesson.content}
        onExit={onClose}
        onComplete={onComplete}
        completed={completed}
      />
    );
  } else if (lesson.type === 'VIDEO') {
    content = (
      <LessonVideoView
        title={lesson.title}
        content={lesson.content}
        videoUrl={lesson.videoUrl}
        onExit={onClose}
        onComplete={onComplete}
        completed={completed}
      />
    );
  } else if (lesson.type === 'DOCUMENT') {
    const mimeType = lesson.type || getMimeTypeFromUrl(lesson.documentUrl);
    content = (
      <LessonDocumentView
        title={lesson.title}
        content={lesson.content}
        fileUrl={lesson.documentUrl}
        mimeType={getMimeTypeFromUrl(lesson.documentUrl)}
        onExit={onClose}
        onComplete={onComplete}
        completed={completed}
      />
    );
  } else if (lesson.type === 'TEST') {
    const parsedQuestions = (lesson.test?.questions || []).map((q: any, idx: number) => ({
      id: q.id || idx,
      text: q.question || q.text || '',
      type: (q.type || '').toLowerCase(),
      options: (q.options || []).map((opt: any, oidx: number) => ({
        id: opt.id || oidx,
        text: opt.text || '',
      })),
      correctAnswers: (q.options || []).filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id || 0),
    }));
    content = (
      <LessonTestView
        title={lesson.title}
        questions={parsedQuestions}
        onExit={onClose}
        onComplete={() => {
          setTestFinished(false);
          onComplete();
        }}
        completed={completed}
        result={result}
        onTestFinished={() => setTestFinished(true)}
      />
    );
  } else {
    content = <div>
      <TranslatedText text="Невідомий тип уроку" />
    </div>;
  }

  return (
    <ModalWrapper onClose={onClose} hideClose={testFinished}>
      {loading ? (
        <Spinner />
      ) : (
        content
      )}
    </ModalWrapper>
  );
};

export default LessonModal;