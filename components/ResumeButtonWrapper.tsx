'use client';

import * as React from 'react';
import ResumeButton from './ResumeButton';

type Props = {
  huntId: string;
  huntName: string;
  twitchId: number;
};

export default function ResumeButtonWrapper({ huntId, huntName, twitchId }: Props) {
  return (
    <div 
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
      data-resume-button
    >
      <ResumeButton huntId={huntId} huntName={huntName} twitchId={twitchId} />
    </div>
  );
}