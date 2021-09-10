import { MypageLayout, ShippingPolicyForm } from '@project-lc/components';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Text,
  Stack,
} from '@chakra-ui/react';
import React from 'react-transition-group/node_modules/@types/react';
import { useDeleteShippingGroup, useProfile } from '@project-lc/hooks';
import { useShippingGroupItemStore } from '@project-lc/stores';
import { useShippingGroupList } from '../../../../../libs/hooks/src/lib/queries/useShippingGroupList';

export function TempShippingPolicy(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: ProfileData } = useProfile();
  const { data, isLoading } = useShippingGroupList(ProfileData.email, !!ProfileData);
  const { mutateAsync } = useDeleteShippingGroup();
  const { reset } = useShippingGroupItemStore();

  const closeHandler = () => {
    reset();
    onClose();
  };

  return (
    <MypageLayout>
      <Stack spacing={8}>
        <Text>배송비정책 생성 모달창 작업을 위한 임시 페이지</Text>

        <Button onClick={onOpen} w="200px">
          배송비정책 생성 모달 열기
        </Button>

        <Text>임시 배송비목록 (삭제테스트 용)</Text>
        {!isLoading && !data && <Text>등록된 배송비 정책 없음</Text>}
        {data &&
          data.map((group) => (
            <Stack direction="row" key={group.id} alignItems="center">
              <Button size="sm" onClick={() => mutateAsync({ groupId: group.id })}>
                x
              </Button>
              <Text>배송그룹 명 : {group.shipping_group_name} , </Text>
              <Text>배송비 계산 기준 : {group.shipping_calcul_type}</Text>
            </Stack>
          ))}
      </Stack>

      <Modal isOpen={isOpen} onClose={closeHandler} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <ShippingPolicyForm onSuccess={closeHandler} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </MypageLayout>
  );
}

export default TempShippingPolicy;
