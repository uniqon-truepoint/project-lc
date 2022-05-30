import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  Button,
  Text,
  FormControl,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useCustomerInfoMutation } from '@project-lc/hooks';
import { useForm } from 'react-hook-form';
import { parseErrorObject } from '@project-lc/utils-frontend';

type CustomerNicknameChangeDialogProps = {
  isOpen: boolean;
  userId: number;
  onClose: () => void;
  onConfirm: () => void;
};

export function CustomerNicknameChangeDialog(
  props: CustomerNicknameChangeDialogProps,
): JSX.Element {
  const { isOpen, onClose, userId } = props;
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ nickname: string }>();
  const { mutateAsync } = useCustomerInfoMutation(userId);

  const onSubmit = (formData: { nickname: string }): void => {
    const onSuccess = (): void => {
      // 성공시
      reset();
      toast({ title: '닉네임이 변경되었습니다.', status: 'success' });
      onClose();
    };
    const onError = (err?: any): void => {
      const { status, message } = parseErrorObject(err);
      toast({
        title: '닉네임 변경중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        description: status ? `code: ${status} - message: ${message}` : undefined,
        status: 'error',
      });
    };

    mutateAsync({ nickname: formData.nickname })
      .then((result) => {
        if (result) onSuccess();
        else onError();
      })
      .catch((err) => {
        console.log(err);
        onError(err);
      });
  };

  const handleCancel = (): void => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>닉네임 변경</ModalHeader>
        <ModalBody>
          <FormControl isInvalid={!!errors.nickname}>
            <Text>변경할 닉네임을 입력해주세요</Text>
            <Input isRequired {...register('nickname', { required: true })} />
            {errors.nickname && (
              <FormErrorMessage>{errors.nickname.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={2} onClick={handleCancel}>
            취소
          </Button>
          <Button colorScheme="blue" type="submit">
            변경
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CustomerNicknameChangeDialog;
