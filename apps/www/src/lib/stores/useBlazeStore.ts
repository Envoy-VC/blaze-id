import { core } from '@0xpolygonid/js-sdk';
import type { IIdentifier } from '@veramo/core';
import { create } from 'zustand';

export interface State {
  activeDID: string | null;
}

export interface Actions {
  setActiveDID: (did: IIdentifier | core.DID) => void;
}

export const useBlazeStore = create<State & Actions>((set) => ({
  activeDID: null,
  setActiveDID: (did) => {
    if (did instanceof core.DID) {
      set({
        activeDID: did.id,
      });
    } else {
      set({
        activeDID: did.did,
      });
    }
  },
}));
