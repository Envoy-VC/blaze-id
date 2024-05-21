import {
  CredentialStorage,
  EthStateStorage,
  type Identity,
  IdentityStorage,
  IndexedDBDataSource,
  MerkleTreeIndexedDBStorage,
  type Profile,
  W3CCredential,
  defaultEthConnectionConfig,
} from '@0xpolygonid/js-sdk';

export const dataStorage = {
  credential: new CredentialStorage(
    new IndexedDBDataSource<W3CCredential>('polygon-id-credential-store')
  ),
  identity: new IdentityStorage(
    new IndexedDBDataSource<Identity>('polygon-id-identity-store'),
    new IndexedDBDataSource<Profile>('polygon-id-profile-store')
  ),
  mt: new MerkleTreeIndexedDBStorage(40),
  states: new EthStateStorage(defaultEthConnectionConfig),
};
