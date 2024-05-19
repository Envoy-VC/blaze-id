import { createDID } from '~/lib/veramo';

export async function POST(request: Request) {
  const data = await createDID();
  return Response.json({
    status: 'success',
    data,
  });
}
