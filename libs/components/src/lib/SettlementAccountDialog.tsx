import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalOverlay,
  ModalHeader,
  Button,
  ModalFooter,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { SettlementAccountDto } from '@project-lc/shared-types';
import {
  useSettlementAccountMutation,
  SettlementInfoRefetchType,
  s3,
  useProfile,
} from '@project-lc/hooks';

import { SettlementAccountForm } from './SettlementAccountForm';

interface SettlementAccountDtoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: SettlementInfoRefetchType;
}

export type SettlementAccountFormDto = SettlementAccountDto & {
  settlementAccountImage: File | null;
};

// 계좌번호 등록 다이얼로그
export function SettlementAccountDialog(
  props: SettlementAccountDtoDialogProps,
): JSX.Element {
  const { isOpen, onClose, refetch } = props;
  const { data: profileData } = useProfile();
  const toast = useToast();
  const mutation = useSettlementAccountMutation();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setValue: setvalue,
    setError: seterror,
    clearErrors,
  } = useForm<SettlementAccountFormDto>();

  function useClose(): void {
    onClose();
    reset();
  }

  async function regist(data: SettlementAccountFormDto): Promise<void> {
    const { settlementAccountImageName, settlementAccountImage } = data;
    try {
      // s3로 이미지 저장
      const savedSettlementAccountImageName = await s3.s3UploadImage({
        filename: settlementAccountImageName,
        file: settlementAccountImage,
        type: 'settlement-account',
        userMail: profileData?.email,
      });

      if (!savedSettlementAccountImageName) {
        throw Error('S3 Error');
      }

      // 데이터 베이스에 저장
      const settlementAccount = await mutation.mutateAsync({
        ...data,
        settlementAccountImageName: savedSettlementAccountImageName,
      });

      if (!settlementAccount) {
        throw Error('정산 계좌 등록 실패');
      }
      toast({
        title: '정산 계좌 등록 완료',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: '정산 계좌 불가',
        description: '정산 계좌 등록이 완료되지 않았습니다. 잠시후 시도해주세요.',
        status: 'error',
      });
    } finally {
      refetch();
      onClose();
      reset();
    }
  }

  return (
    <Modal isOpen={isOpen} size="3xl" onClose={useClose} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(regist)}>
        <ModalHeader>정산 계좌 등록</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SettlementAccountForm
            register={register}
            errors={errors}
            seterror={seterror}
            setvalue={setvalue}
            clearErrors={clearErrors}
          />
        </ModalBody>
        <ModalFooter>
          <Button type="submit" isLoading={isSubmitting}>
            등록하기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
