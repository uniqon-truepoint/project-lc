import { Stack, Center, Divider, VStack, Text } from '@chakra-ui/react';
import { useProfile, useBroadcasterChannels } from '@project-lc/hooks';
import { useEffect } from 'react';
import { BroadcasterNickNameSection } from '../BroadcasterNickName';
import { SettingSectionLayout } from '../SettingSectionLayout';
import { BroadcasterChannelSection } from '../BroadcasterChannelSection';

export function ChannelSection({
  completeStep,
}: {
  completeStep: () => void;
}): JSX.Element {
  const profile = useProfile();
  const { data: channels } = useBroadcasterChannels(profile?.data?.id);

  useEffect(() => {
    if (channels && channels?.length > 0) {
      completeStep();
    }
  }, [channels, completeStep]);

  return (
    <Stack pt={3} pb={3} spacing={10}>
      <Center>
        <VStack spacing={0}>
          <Divider mb={3} borderWidth={0.5} />
          <Text fontSize="md" fontWeight="semibold">
            크크쇼 라이브 커머스를 매칭하기 위해서는 판매자 분들이
          </Text>
          <Text fontSize="md" fontWeight="semibold">
            방송인 분들의 채널을 확인할 수 있어야 합니다.
          </Text>
          <Text fontSize="md" fontWeight="semibold">
            현재 활동하고 있는 채널들을 모두 입력해주세요.
          </Text>
        </VStack>
      </Center>
      <Center>
        <VStack spacing={7} w={['6xl', 'xl']}>
          <BroadcasterNickNameSection />
          <Divider />
          <BroadcasterChannelSection />
          {channels && channels?.length > 0 && (
            <Text colorScheme="gray" fontWeight="thin">
              아래의 다음 버튼을 클릭하여 다음단계를 진행해주세요.
            </Text>
          )}
        </VStack>
      </Center>
    </Stack>
  );
}
