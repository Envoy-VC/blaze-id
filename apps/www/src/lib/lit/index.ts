import { Wallet, ethers } from 'ethers';
import { env } from '~/env';

import { litClient } from '../stores/useLitStore';

export const getCapacityDelegationAuthSig = async ({
  delegateeAddresses,
}: {
  delegateeAddresses: string[];
}) => {
  const provider = ethers.providers.getDefaultProvider(1);
  const wallet = new Wallet(env.NEXT_PUBLIC_CAPACITY_CREDITS_PK, provider);
  const { capacityDelegationAuthSig } =
    await litClient.createCapacityDelegationAuthSig({
      uses: '1000',
      dAppOwnerWallet: wallet,
      capacityTokenId: '1319',
      delegateeAddresses: delegateeAddresses,
    });
  return { capacityDelegationAuthSig };
};
