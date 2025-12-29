export function cleanUndefined(obj: Record<string, any>) {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
}

export function swapSectionFiles(obj: Record<string, any>, idxA: number, idxB: number) {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (key.startsWith(`${idxA}-`)) {
      newObj[key.replace(`${idxA}-`, `${idxB}-`)] = obj[key];
    } else if (key.startsWith(`${idxB}-`)) {
      newObj[key.replace(`${idxB}-`, `${idxA}-`)] = obj[key];
    } else {
      newObj[key] = obj[key];
    }
  });
  return cleanUndefined(newObj);
}

export function swapSectionErrors(errors: Record<string, any>, idxA: number, idxB: number) {
  const newErrors: Record<string, any> = {};
  Object.keys(errors).forEach(key => {
    if (key.startsWith(`section-${idxA}`)) {
      newErrors[key.replace(`section-${idxA}`, `section-${idxB}`)] = errors[key];
    } else if (key.startsWith(`section-${idxB}`)) {
      newErrors[key.replace(`section-${idxB}`, `section-${idxA}`)] = errors[key];
    } else if (key.match(new RegExp(`^(lesson|content)-${idxA}-`))) {
      newErrors[key.replace(`${idxA}-`, `${idxB}-`)] = errors[key];
    } else if (key.match(new RegExp(`^(lesson|content)-${idxB}-`))) {
      newErrors[key.replace(`${idxB}-`, `${idxA}-`)] = errors[key];
    } else {
      newErrors[key] = errors[key];
    }
  });
  return cleanUndefined(newErrors);
}

export function removeSectionPendingFiles(pendingFiles: Record<string, any>, sectionIdx: number) {
  const newPendingFiles = { ...pendingFiles };
  Object.keys(newPendingFiles).forEach(key => {
    if (key.startsWith(`${sectionIdx}-`)) {
      delete newPendingFiles[key];
    }
  });
  return cleanUndefined(newPendingFiles);
}

export function swapLessonFiles(obj: Record<string, any>, sectionIdx: number, idxA: number, idxB: number) {
  const newObj = { ...obj };
  const keyA = `${sectionIdx}-${idxA}`;
  const keyB = `${sectionIdx}-${idxB}`;
  const temp = newObj[keyA];
  newObj[keyA] = newObj[keyB];
  newObj[keyB] = temp;
  return cleanUndefined(newObj);
}

export function swapLessonErrors(errors: Record<string, any>, sectionIdx: number, idxA: number, idxB: number) {
  const newErrors = { ...errors };
  ['lesson', 'content'].forEach(type => {
    const keyA = `${type}-${sectionIdx}-${idxA}`;
    const keyB = `${type}-${sectionIdx}-${idxB}`;
    const temp = newErrors[keyA];
    newErrors[keyA] = newErrors[keyB];
    newErrors[keyB] = temp;
  });
  return cleanUndefined(newErrors);
}

export function removeLessonPendingFile(pendingFiles: Record<string, any>, sectionIdx: number, lessonIdx: number) {
  const newPendingFiles = { ...pendingFiles };
  delete newPendingFiles[`${sectionIdx}-${lessonIdx}`];
  return cleanUndefined(newPendingFiles);
} 