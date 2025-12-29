import React from 'react';
import CourseLessonIcon from './CourseLessonIcon';
import { TranslatedText } from '@/components/TranslatedText';

export interface Lesson {
  id: number;
  title: string;
  type: string;
  completed: boolean;
  locked: boolean;
  documentUrl?: string;
}

export interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface CourseSectionListProps {
  sections: Section[];
  onLessonClick: (lesson: Lesson) => void;
  locked: boolean;
}

const CourseSectionList: React.FC<CourseSectionListProps> = ({ 
  sections, 
  onLessonClick, 
  locked 
}) => {
  return (
    <div className="space-y-8">
      {sections.map(section => (
        <div key={section.id}>
          <h2 className="text-lg font-semibold mb-3 text-blue-800 pl-2">
            <TranslatedText text={section.title} />
          </h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {section.lessons.map(lesson => (
              <div
                key={lesson.id}
                className={`relative p-5 rounded-2xl shadow bg-white border flex items-center min-w-0 transition-all duration-300 cursor-pointer ${lesson.locked || locked ? 'opacity-50 pointer-events-none' : 'hover:shadow-2xl hover:-translate-y-1'} ${lesson.completed ? 'border-green-400' : 'border-gray-200'}`}
                onClick={() => onLessonClick(lesson)}
              >
                <CourseLessonIcon type={lesson.type} documentUrl={lesson.documentUrl} />
                <span className="ml-4 font-medium text-base flex-1 truncate">
                  <TranslatedText text={lesson.title} />
                </span>
                {lesson.completed && (
                  <span className="ml-2 text-green-600 text-xl">✔</span>
                )}
                {(lesson.locked || locked) && !lesson.completed && (
                  <span className="ml-2 text-gray-400 text-lg">🔒</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseSectionList;