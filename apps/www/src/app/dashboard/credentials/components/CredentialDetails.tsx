'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';

import { getKYCAgeProofRequest } from '~/lib/credentials';
import { useBlazeID, usePolygonID, useVeramo } from '~/lib/hooks';
import { truncate } from '~/lib/utils';

import { W3CCredential } from '@0xpolygonid/js-sdk';
import { useLiveQuery } from 'dexie-react-hooks';
import { getHighlighterCore } from 'shiki/core';
import getWasm from 'shiki/wasm';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';

import { Copy, ShieldCheck } from 'lucide-react';

interface Props {
  id: string;
  type: 'polygonid' | 'veramo';
}

const CredentialDetails = ({ id, type }: Props) => {
  const { getCredentialByHash } = useVeramo();
  const { getCredential, verifyCredential } = usePolygonID();
  const { activeDID } = useBlazeID();

  const [verifiedProof, setProof] = useState<string | null>(null);

  const getFormattedCode = async (value: string) => {
    const highlighter = await getHighlighterCore({
      langs: [import('shiki/langs/json.mjs')],
      loadWasm: getWasm,
    });
    await highlighter.loadTheme(import('shiki/themes/catppuccin-latte.mjs'));

    const code = highlighter.codeToHtml(value, {
      lang: 'json',
      theme: 'catppuccin-latte',
    });
    return code;
  };

  const credential = useLiveQuery(async () => {
    if (type === 'polygonid') {
      const cred = await getCredential(id.replaceAll('%3A', ':'));
      return cred;
    } else {
      return await getCredentialByHash(id.replaceAll('%3A', ':'));
    }
  }, [id]);

  if (credential instanceof W3CCredential) {
    const {
      type,
      proof,
      issuanceDate,
      expirationDate,
      issuer,
      credentialSubject,
    } = credential;
    const proofType = (proof as object[] as { type: string }[])[0]!.type;
    return (
      <div className='mx-auto my-12 flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white'>
        <div className='flex w-full flex-row items-center justify-between gap-2 px-4 py-4'>
          <div className='text-xl font-semibold'>{type[1]}</div>
          <Button
            variant='outline'
            className='flex items-center gap-2'
            onClick={async () => {
              const id = toast.loading('Verifying Credentials...');
              try {
                if (!activeDID || !activeDID.startsWith('did:polygonid')) {
                  throw new Error('No Active Polygon ID found');
                }
                const req = getKYCAgeProofRequest();
                const { proof, success } = await verifyCredential(
                  req,
                  credential,
                  activeDID
                );
                if (!success) {
                  throw new Error('Credential Verification Failed');
                }
                const code = await getFormattedCode(
                  JSON.stringify(proof, null, 2)
                );
                setProof(code);
                toast.success('Credentials Verified', { id });
              } catch (error) {
                console.log(error);
                toast.error((error as Error).message, { id });
              }
            }}
          >
            <ShieldCheck size={16} />
            Prove Credential
          </Button>
        </div>
        <div className='m-4 flex flex-col rounded-xl bg-[#F2F4F7] p-4 text-sm'>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Proof Type</div>
            <div className='font-medium'>{proofType}</div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Issue Date</div>
            <div className='font-medium'>
              {new Date(issuanceDate ?? '').toLocaleString()}
            </div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Expiration Date</div>
            <div className='font-medium'>
              {new Date(expirationDate ?? '').toLocaleString()}
            </div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Issuer</div>
            <div className='flex flex-row items-center gap-2'>
              {truncate(issuer, 36, false)}
              <Button
                variant='link'
                className='m-0 h-4 w-4 p-0'
                onClick={() => {
                  navigator.clipboard.writeText(issuer);
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className='m-4 flex flex-col rounded-xl bg-[#F2F4F7] p-4 text-sm'>
          <div className='text-base font-medium'>Credential Subject</div>
          {Object.entries(credentialSubject).map(([key, value]) => {
            return (
              <div className='flex flex-row items-center justify-between gap-2'>
                <div className='font-medium text-neutral-400'>{key}</div>
                <div className='flex flex-row items-center gap-2'>
                  {truncate(String(value), 36, false)}
                  {String(value).length > 36 && (
                    <Button
                      variant='link'
                      className='m-0 h-4 w-4 p-0'
                      onClick={() => {
                        navigator.clipboard.writeText(String(value));
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className='mx-auto py-4'>
          <QRCode value={JSON.stringify(credential)} size={256 * 2} />
        </div>
        {verifiedProof && (
          <div className='w-full py-2'>
            <div className='px-4 py-4 text-lg font-medium'>
              Credential Proof
            </div>
            <div
              className='mx-auto h-[40rem] w-full max-w-[630px] overflow-scroll rounded-xl bg-[#EFF1F5] p-2'
              dangerouslySetInnerHTML={{
                __html: verifiedProof,
              }}
            ></div>
          </div>
        )}
      </div>
    );
  } else if (!!credential) {
    const { type, proof, issuanceDate, expirationDate, credentialSubject } =
      credential;
    const issuer =
      typeof credential.issuer === 'string'
        ? credential.issuer
        : credential.issuer.id;
    return (
      <div className='mx-auto my-12 flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white'>
        <div className='flex w-full flex-row items-center justify-between gap-2 px-4 py-2'>
          <div className='text-xl font-semibold'>
            {typeof type === 'string' ? type : type![1]}
          </div>
          <Button variant='outline'>
            <ShieldCheck size={16} />
            Prove Credential
          </Button>
        </div>
        <div className='m-4 flex flex-col rounded-xl bg-[#F2F4F7] p-4 text-sm'>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Proof Type</div>
            <div className='font-medium'>{proof?.type}</div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Issue Date</div>
            <div className='font-medium'>
              {new Date(issuanceDate ?? '').toLocaleString()}
            </div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Expiration Date</div>
            <div className='font-medium'>
              {new Date(expirationDate ?? '').toLocaleString()}
            </div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2'>
            <div className='font-medium text-neutral-400'>Issuer</div>
            <div className='flex flex-row items-center gap-2'>
              {truncate(issuer, 36, false)}
              <Button
                variant='link'
                className='m-0 h-4 w-4 p-0'
                onClick={() => {
                  navigator.clipboard.writeText(issuer);
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className='m-4 flex flex-col rounded-xl bg-[#F2F4F7] p-4 text-sm'>
          <div className='text-base font-medium'>Credential Subject</div>
          {Object.entries(credentialSubject).map(([key, value]) => {
            return (
              <div className='flex flex-row items-center justify-between gap-2'>
                <div className='font-medium text-neutral-400'>{key}</div>
                <div className='flex flex-row items-center gap-2'>
                  {truncate(String(value), 36, false)}
                  {String(value).length > 36 && (
                    <Button
                      variant='link'
                      className='m-0 h-4 w-4 p-0'
                      onClick={() => {
                        navigator.clipboard.writeText(String(value));
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className='mx-auto py-4'>
          <QRCode value={JSON.stringify(credential)} size={256 * 2} />
        </div>
      </div>
    );
  }
};

export default CredentialDetails;
