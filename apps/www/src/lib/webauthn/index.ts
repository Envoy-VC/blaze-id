import { client } from '@passwordless-id/webauthn';

interface RegisterProps {
  username: string;
  challenge: string;
}

export const register = async ({ username, challenge }: RegisterProps) => {
  const registration = await client.register(username, challenge, {
    authenticatorType: 'auto',
    userVerification: 'required',
    timeout: 60000,
    attestation: true,
    debug: false,
  });
  return registration;
};
