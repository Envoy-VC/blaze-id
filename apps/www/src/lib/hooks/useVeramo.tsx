import React, { useState } from 'react';

import { SecretBox } from '@veramo/kms-local';
import { useLocalStorage } from 'usehooks-ts';

import { type VeramoAgent, getAgent } from '../veramo';

const useVeramo = () => {
  const [kmsSecretKey, setKMSSecretKey] = useLocalStorage<string | null>(
    'KMS_SECRET_KEY',
    null
  );

  const [agent, setAgent] = useState<VeramoAgent>();

  const initialize = () => {
    if (kmsSecretKey) {
      const agent = getAgent(kmsSecretKey);
      setAgent(agent);
    } else {
      SecretBox.createSecretKey().then((key) => {
        setKMSSecretKey(key);
        const agent = getAgent(key);
        setAgent(agent);
      });
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  return { agent: agent as VeramoAgent };
};

export default useVeramo;
