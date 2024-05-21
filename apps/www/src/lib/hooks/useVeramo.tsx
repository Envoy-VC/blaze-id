import { agent } from '../veramo';

const useVeramo = () => {
  const createDID = async () => {
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr:mainnet',
    });
    return identifier;
  };

  return { agent, createDID };
};

export default useVeramo;
