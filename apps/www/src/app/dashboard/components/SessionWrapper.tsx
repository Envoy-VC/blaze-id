import { redirect } from 'next/navigation';

import { type PropsWithChildren } from 'react';

import { getSession } from '~/lib/iron-session';

import { compareAsc } from 'date-fns';

const SessionWrapper = async ({ children }: PropsWithChildren) => {
  const session = await getSession();
  const isNotExpired =
    compareAsc(new Date(session.expires ?? 1), Date.now()) == 1;
  const validSession = session.isLoggedIn && isNotExpired;

  if (!validSession) {
    redirect('/');
  } else {
    return <>{children}</>;
  }
};

export default SessionWrapper;
