import { type Identity, core } from '@0xpolygonid/js-sdk';
import type { IIdentifier } from '@veramo/core';
import { create } from 'zustand';

export interface State {
  activeDID: string | null;
}

export interface Actions {
  setActiveDID: (did: IIdentifier | Identity) => void;
}

export const useBlazeStore = create<State & Actions>((set) => ({
  activeDID: null,
  setActiveDID: (did) => {
    set({
      activeDID: did.did,
    });
  },
}));
