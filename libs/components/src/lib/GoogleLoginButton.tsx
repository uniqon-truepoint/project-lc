import { Button, useBoolean } from '@chakra-ui/react';
import { getApiHost } from '@project-lc/hooks';

export function GoogleLoginButton(): JSX.Element {
  return (
    <Button as="a" isFullWidth href={`${getApiHost()}/social/google/login`}>
      구글로 로그인
    </Button>
  );
}

export default GoogleLoginButton;
