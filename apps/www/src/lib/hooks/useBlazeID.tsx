import React from 'react';

import { useLocalStorage } from 'usehooks-ts';

const useBlazeID = () => {
  const [activeDID, setActiveDID] = useLocalStorage<string | null>(
    'activeDID',
    null
  );
  return {
    activeDID,
    setActiveDID,
  };
};

export default useBlazeID;
