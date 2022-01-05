import { Container, Divider, Heading, VStack } from '@chakra-ui/react';
import { MypageLayout } from '@project-lc/components-shared/MypageLayout';
import { PasswordSection } from '@project-lc/components-shared/PasswordSection';
import { ProfileBox } from '@project-lc/components-shared/ProfileBox';
import { SocialAccountUnlinkSection } from '@project-lc/components-shared/SocialAccountUnlinkSection';
import { AccountRemoveSection } from '@project-lc/components/AccountRemoveSection';
import React from 'react';

export function Setting(): JSX.Element {
  return (
    <MypageLayout>
      <Container maxWidth="2xl" p={6}>
        <VStack spacing={4} alignItems="stretch">
          <Heading mb={4}>내계정</Heading>
          <ProfileBox allowAvatarChange />
          <Divider />
          <PasswordSection />
          <Divider />
          <AccountRemoveSection />
          <Divider />
          <SocialAccountUnlinkSection />
          <Divider />
        </VStack>
      </Container>
    </MypageLayout>
  );
}

export default Setting;
