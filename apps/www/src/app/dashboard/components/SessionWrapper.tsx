import { redirect } from 'next/navigation';

import { type PropsWithChildren } from 'react';

const SessionWrapper = async ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

export default SessionWrapper;
