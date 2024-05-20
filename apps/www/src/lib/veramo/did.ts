import agent from './agent';

const createDID = async () => {
  const identifier = await agent.didManagerCreate({
    provider: 'did:ethr:mainnet',
  });
  return identifier;
};

const deleteDID = async (did: string) => {
  const success = await agent.didManagerDelete({
    did,
  });
  return success;
};

export { createDID, deleteDID };
