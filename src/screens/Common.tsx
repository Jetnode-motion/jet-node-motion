import React from 'react';
import {C} from '../style/tokens';
import {Txt} from '../components/Primitives';

export const StatusBar: React.FC<{dark?: boolean}> = ({dark}) => {
  const c = dark ? C.white : C.ink;
  return (
    <>
      <Txt x={56} y={40} size={26} weight={600} color={c}>
        9:41
      </Txt>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 470 + i * 10, top: 50 - (8 + i * 5), width: 6, height: 8 + i * 5, background: c, borderRadius: 1}} />
      ))}
      <div style={{position: 'absolute', left: 520, top: 30, width: 44, height: 22, borderRadius: 6, border: `2px solid ${c}`, boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 2, top: 2, width: 32, height: 14, borderRadius: 3, background: c}} />
      </div>
    </>
  );
};
