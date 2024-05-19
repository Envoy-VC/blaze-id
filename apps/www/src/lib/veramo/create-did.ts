import agent from './agent';

const createDID = async () => {
  const identifier = await agent.didManagerCreate({ alias: 'default' });
  return identifier;
};

export default createDID;
