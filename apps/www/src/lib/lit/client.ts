import { LitNodeClient } from '@lit-protocol/lit-node-client';
import type { LIT_NETWORKS_KEYS } from '@lit-protocol/types';

const litNetwork: LIT_NETWORKS_KEYS = 'habanero';

const litClient = new LitNodeClient({
  litNetwork,
});

export default litClient;
