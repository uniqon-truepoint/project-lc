import { Box, Text } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import { LiveShoppingProgressConverter } from '../LiveShoppingProgressConverter';
import { ConfirmDialog, ConfirmDialogProps } from '../ConfirmDialog';

export function AdminLiveShoppingUpdateConfirmModal(
  props: Pick<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>,
): JSX.Element {
  const { isOpen, onClose, onConfirm } = props;
  const { watch } = useFormContext();

  return (
    <ConfirmDialog
      title="등록정보 확인"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <Box>
        <Text fontSize="xl">아래와 같이 등록하시겠습니까?</Text>

        {watch('progress') ? (
          <Text>
            진행상태 :
            <LiveShoppingProgressConverter progress={watch('progress')} />
          </Text>
        ) : null}
        {watch('broadcasterId') ? <Text>진행상태 : {watch('broadcaster')}</Text> : null}
        {watch('broadcastStartDate') ? (
          <Text>
            방송시작 시간 :{' '}
            {dayjs(watch('broadcastStartDate')).format('A YYYY/MM/DD HH:mm:ss')}
          </Text>
        ) : null}
        {watch('broadcastEndDate') ? (
          <Text>
            방송종료 시간 :{' '}
            {dayjs(watch('broadcastEndDate')).format('A YYYY/MM/DD HH:mm:ss')}
          </Text>
        ) : null}
        {watch('sellStartDate') ? (
          <Text>
            판매시작 시간 :{' '}
            {dayjs(watch('sellStartDate')).format('A YYYY/MM/DD HH:mm:ss')}
          </Text>
        ) : null}
        {watch('sellEndDate') ? (
          <Text>
            판매종료 시간 : {dayjs(watch('sellEndDate')).format('A YYYY/MM/DD HH:mm:ss')}
          </Text>
        ) : null}
        {watch('rejectionReason') ? (
          <Text>거절사유 : {watch('rejectionReason')}</Text>
        ) : null}
        {watch('videoUrl') ? <Text>영상 URL : {watch('videoUrl')}</Text> : null}
      </Box>
    </ConfirmDialog>
  );
}
