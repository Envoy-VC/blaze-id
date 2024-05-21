import React, { useState } from 'react';

import { useLocalStorage } from 'usehooks-ts';

import { type VeramoAgent, getAgent } from '../veramo';

const useVeramo = () => {
  const [kmsSecretKey] = useLocalStorage<string | null>('KMS_SECRET_KEY', null);

  const [agent, setAgent] = useState<VeramoAgent>();

  const createDID = async () => {
    if (!agent) return;
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr:mainnet',
    });
    return identifier;
  };

  const initialize = () => {
    if (kmsSecretKey) {
      const agent = getAgent(kmsSecretKey);
      setAgent(agent);
      return agent;
    }
  };

  React.useEffect(() => {
    if (kmsSecretKey) {
      initialize();
    }
  }, [kmsSecretKey]);

  return { agent: agent as VeramoAgent, createDID };
};

export default useVeramo;
