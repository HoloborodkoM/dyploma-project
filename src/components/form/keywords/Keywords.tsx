import React from 'react';
import KeywordsLogic from './KeywordsLogic';
import KeywordsUI from './KeywordsUI';

interface KeywordsProps {
  keywords: string[];
  updateKeywords: (keywords: string[]) => void;
  removeKeyword: (index: number) => void;
}

const Keywords: React.FC<KeywordsProps> = ({
  keywords,
  updateKeywords,
  removeKeyword
}) => {
  return (
    <KeywordsLogic
      keywords={keywords}
      updateKeywords={updateKeywords}
      removeKeyword={removeKeyword}
    >
      {(keywordsProps) => <KeywordsUI {...keywordsProps} />}
    </KeywordsLogic>
  );
};

export default Keywords;