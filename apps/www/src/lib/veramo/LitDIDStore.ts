import type { IIdentifier } from '@veramo/core';
import { AbstractDIDStore } from '@veramo/did-manager';

class LitDIDStore extends AbstractDIDStore {
  async importDID(args: IIdentifier): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async deleteDID(args: { did: string }): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async listDIDs(args: {
    alias?: string;
    provider?: string;
  }): Promise<IIdentifier[]> {
    throw new Error('Method not implemented.');
  }

  async getDID(
    args: { did: string } | { alias: string }
  ): Promise<IIdentifier> {
    throw new Error('Method not implemented.');
  }
}

export default LitDIDStore;
