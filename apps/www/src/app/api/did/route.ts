import { NextRequest, NextResponse } from 'next/server';

import { createDID, deleteDID } from '~/lib/veramo';

type DIDBody =
  | {
      method: 'create';
    }
  | {
      method: 'delete';
      did: string;
    };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as DIDBody;

  switch (body.method) {
    case 'create': {
      const data = await createDID();
      return NextResponse.json({
        status: 'success',
        data,
      });
    }
    case 'delete': {
      const success = await deleteDID(body.did);
      return NextResponse.json({
        status: success ? 'success' : 'error',
      });
    }
  }
}
