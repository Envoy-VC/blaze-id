import type {
  DIDDocument,
  IAgentContext,
  IIdentifier,
  IKey,
  IKeyManager,
  IService,
} from '@veramo/core';
import { AbstractIdentifierProvider } from '@veramo/did-manager';

export default class PolygonIDProvider extends AbstractIdentifierProvider {
  createIdentifier(
    args: { kms?: string; alias?: string; options?: any },
    context: IAgentContext<IKeyManager>
  ): Promise<Omit<IIdentifier, 'provider'>> {
    throw new Error('Method not implemented.');
  }

  updateIdentifier(
    args: {
      did: string;
      document: Partial<DIDDocument>;
      options?: { [x: string]: any } | undefined;
    },
    context: IAgentContext<IKeyManager>
  ): Promise<IIdentifier> {
    throw new Error('Method not implemented.');
  }

  deleteIdentifier(
    args: IIdentifier,
    context: IAgentContext<IKeyManager>
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  addKey(
    args: { identifier: IIdentifier; key: IKey; options?: any },
    context: IAgentContext<IKeyManager>
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IAgentContext<IKeyManager>
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  addService(
    args: { identifier: IIdentifier; service: IService; options?: any },
    context: IAgentContext<IKeyManager>
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IAgentContext<IKeyManager>
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
