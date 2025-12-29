export function cleanUndefined(obj: Record<string, any>) {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
}

export function swapStepFiles(obj: Record<string, any>, idxA: number, idxB: number) {
  const newObj = { ...obj };
  const keyA = `${idxA}`;
  const keyB = `${idxB}`;
  const temp = newObj[keyA];
  newObj[keyA] = newObj[keyB];
  newObj[keyB] = temp;
  return cleanUndefined(newObj);
}

export function swapStepErrors(errors: Record<string, any>, idxA: number, idxB: number) {
  const newErrors = { ...errors };
  ['title', 'content', 'videoUrl'].forEach(type => {
    const keyA = `step-${type}-${idxA}`;
    const keyB = `step-${type}-${idxB}`;
    const temp = newErrors[keyA];
    newErrors[keyA] = newErrors[keyB];
    newErrors[keyB] = temp;
  });
  return cleanUndefined(newErrors);
}