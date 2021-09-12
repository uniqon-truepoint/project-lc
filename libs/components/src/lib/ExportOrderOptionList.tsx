/* eslint-disable react/jsx-props-no-spreading */
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { useFmOrder, useOrderExportableCheck } from '@project-lc/hooks';
import {
  ExportOrderDto,
  FindFmOrderDetailRes,
  fmDeliveryCompanies,
} from '@project-lc/shared-types';
import { fmExportStore } from '@project-lc/stores';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { OrderDetailGoods } from '..';
import FmOrderStatusBadge from './FmOrderStatusBadge';
import TextDotConnector from './TextDotConnector';

export interface ExportOrderOptionListProps {
  orderId: string;
  orderIndex?: number;
  optionIndex?: number;
  onSubmitClick?: (id: string, idx: number) => void | Promise<void>;
  selected?: boolean;
  disableSelection?: boolean;
}
export function ExportOrderOptionList({
  orderId,
  orderIndex = 0,
  optionIndex = 0,
  onSubmitClick,
  selected = false,
  disableSelection = false,
}: ExportOrderOptionListProps) {
  const borderColor = useColorModeValue('gray.300', 'gray.500');
  const submitBtnVariant = useColorModeValue('solid', 'outline');
  const order = useFmOrder(orderId);
  const handleSelect = fmExportStore((s) => s.handleOptionSelect);

  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<ExportOrderDto[]>();

  // 주문 출고가능한 지 체크
  const { isDone, isExportable } = useOrderExportableCheck(order.data);
  // 첫 렌더링시, 해당 상품 선택
  useEffect(() => {
    if (!isDone && isExportable) {
      handleSelect(orderId, 'forceConcat');
      setValue(`${orderIndex}.orderId`, orderId);
    }
  }, [handleSelect, isDone, isExportable, orderId, orderIndex, setValue]);

  if (isDone) return null;
  if (!isExportable) return null;
  if (order.isLoading) return null;

  if (!order.data) {
    return (
      <Alert status="warning">
        <AlertIcon />
        주문 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </Alert>
    );
  }
  return (
    <Box
      pt={2}
      pb={6}
      px={4}
      border="1px solid"
      borderRadius="xl"
      borderColor={borderColor}
      boxShadow={selected ? 'outline' : undefined}
    >
      <Stack spacing={1}>
        {!disableSelection && (
          <Box>
            <Checkbox
              size="lg"
              isChecked={selected}
              onChange={() => {
                handleSelect(orderId);
              }}
            />
          </Box>
        )}
        <HStack alignItems="center" flexWrap="nowrap">
          <FmOrderStatusBadge orderStatus={order.data.step} />
          <TextDotConnector />
          <Text fontSize="sm" ml={2}>
            {order.data.order_seq}
          </Text>
          <TextDotConnector />
          <Text fontSize="sm" ml={2}>
            {dayjs(order.data.regist_date).fromNow()}
          </Text>
        </HStack>
        <HStack>
          <Text fontSize="sm">
            {order.data.recipient_address} {order.data.recipient_address_detail || ''}
          </Text>
          <Text fontSize="sm">
            {order.data.recipient_user_name} {order.data.recipient_cellphone}
          </Text>
        </HStack>
        {order.data.order_user_name === order.data.recipient_user_name &&
        order.data.order_cellphone === order.data.recipient_cellphone ? null : (
          <HStack>
            <Text fontSize="sm">
              {order.data.order_user_name} {order.data.order_cellphone}
            </Text>
          </HStack>
        )}
      </Stack>
      <Stack mt={4} direction="row" alignItems="center">
        <Stack flex={3}>
          {order.data.items.map((item, itemIndex) => (
            <ExportOrderItem
              item={item}
              orderIndex={orderIndex}
              itemIndex={itemIndex}
              selected={selected}
              optionIndex={optionIndex}
            />
          ))}
        </Stack>

        <Box flex={1}>
          <Stack>
            <FormControl isInvalid={!!errors[orderIndex]?.deliveryCompanyCode}>
              <Select
                {...register(`${orderIndex}.deliveryCompanyCode`, {
                  required: { message: '택배사를 선택하세요.', value: !!selected },
                })}
                isDisabled={!selected}
                placeholder="택배사 선택"
              >
                {Object.keys(fmDeliveryCompanies).map((company) => (
                  <option key={company} value={company}>
                    {fmDeliveryCompanies[company].name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors[orderIndex]?.deliveryCompanyCode &&
                  errors[orderIndex]?.deliveryCompanyCode?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors[orderIndex]?.deliveryNumber}>
              <Input
                {...register(`${orderIndex}.deliveryNumber`, {
                  required: {
                    message: '송장번호를 입력하세요.',
                    value: !!selected,
                  },
                })}
                placeholder="송장번호"
                isDisabled={!selected}
              />
              <FormErrorMessage>
                {errors[orderIndex]?.deliveryNumber &&
                  errors[orderIndex]?.deliveryNumber?.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              variant={submitBtnVariant}
              colorScheme="pink"
              size="sm"
              onClick={() => {
                if (onSubmitClick) onSubmitClick(orderId, orderIndex);
              }}
              type={disableSelection && selected && !onSubmitClick ? 'submit' : undefined}
              isDisabled={!isExportable || isDone || !selected}
            >
              이 주문 출고처리
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export interface ExportOrderItemProps {
  item: FindFmOrderDetailRes['items'][0];
  orderIndex: number;
  itemIndex: number;
  optionIndex: number;
  selected?: boolean;
}
export function ExportOrderItem({
  item,
  orderIndex,
  itemIndex,
  selected,
}: ExportOrderItemProps) {
  return (
    <Stack direction="row" alignItems="center">
      <Box flex={1}>
        <OrderDetailGoods orderItem={item} />
      </Box>
      <Box flex={2}>
        <Table>
          <Thead>
            <Tr>
              <Th>옵션</Th>
              <Th>총수량</Th>
              <Th>취소</Th>
              <Th>보냄</Th>
              <Th>남음</Th>
              <Th>보낼수량</Th>
            </Tr>
          </Thead>
          {item.options.map((opt, optIndex) => (
            <ExportOrderOptionItem
              item={item}
              key={opt.item_option_seq}
              option={opt}
              orderIndex={orderIndex}
              itemIndex={itemIndex}
              optionIndex={optIndex}
              selected={selected}
            />
          ))}
          <Tbody />
        </Table>
      </Box>
    </Stack>
  );
}

export interface ExportOrderOptionItemProps {
  item: FindFmOrderDetailRes['items'][0];
  option: FindFmOrderDetailRes['items'][0]['options'][0];
  orderIndex: number;
  optionIndex: number;
  itemIndex: number;
  selected?: boolean;
}
export function ExportOrderOptionItem({
  item,
  option,
  orderIndex,
  optionIndex,
  itemIndex,
  selected,
}: ExportOrderOptionItemProps) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<ExportOrderDto[]>();

  // 보낸 수량
  const sendedEa = useMemo(() => {
    const _calc = option.step55 + option.step65 + option.step75 + option.step85;
    if (_calc > option.ea) return option.ea;
    return _calc;
  }, [option.ea, option.step55, option.step65, option.step75, option.step85]);
  // 남은 수량
  const restEa = useMemo(() => {
    const _calc =
      option.ea - option.step55 - option.step65 - option.step75 - option.step85;
    if (_calc < 0) return 0;
    return _calc;
  }, [option.ea, option.step55, option.step65, option.step75, option.step85]);

  useEffect(() => {
    if (selected) {
      // 입력받지는 않지만, 필수 값 처리
      setValue(
        `${orderIndex}.exportOptions.${itemIndex + optionIndex}.itemOptionSeq`,
        option.item_option_seq,
      );
      setValue(
        `${orderIndex}.exportOptions.${itemIndex + optionIndex}.itemSeq`,
        option.item_seq,
      );
      setValue(
        `${orderIndex}.exportOptions.${itemIndex + optionIndex}.optionTitle`,
        option.title1,
      );
      setValue(
        `${orderIndex}.exportOptions.${itemIndex + optionIndex}.option1`,
        option.option1,
      );

      // 보낼 수량 기본값으로 남은 수량 만큼 설정되어 있도록 처리
      if (restEa > 0) {
        setValue(
          `${orderIndex}.exportOptions.${itemIndex + optionIndex}.exportEa`,
          restEa,
        );
      }
    }
  }, [option, optionIndex, orderIndex, setValue, restEa, selected, itemIndex]);

  return (
    <Tr key={option.title1 + option.option1}>
      <Td>
        {option.title1 && option.option1 ? (
          <Text fontSize="sm">
            {option.title1} : {option.option1}
          </Text>
        ) : (
          <Text fontSize="sm">{item.goods_name}</Text>
        )}
      </Td>
      <Td>{option.ea}</Td>
      <Td>{option.step85}</Td>
      <Td>{sendedEa}</Td>
      <Td>{restEa}</Td>
      <Td w="65px">
        <FormControl
          isInvalid={
            !!(
              errors[orderIndex]?.exportOptions &&
              errors[orderIndex]?.exportOptions?.[itemIndex + optionIndex]?.exportEa
            )
          }
        >
          <Input
            isDisabled={restEa === 0 || !selected}
            {...register(
              `${orderIndex}.exportOptions.${itemIndex + optionIndex}.exportEa`,
              {
                required: {
                  message: '보낼 수량을 입력해주세요.',
                  value: !!selected && sendedEa !== option.ea,
                },
                min: { value: 0, message: '0보다 작을 수 없습니다.' },
                max: { value: restEa, message: '남은 수량 보다 클 수 없습니다.' },
              },
            )}
            w="60px"
            placeholder={String(restEa)}
          />
          <FormErrorMessage fontSize="xs">
            {errors[orderIndex]?.exportOptions &&
              errors[orderIndex]?.exportOptions?.[optionIndex]?.exportEa &&
              errors[orderIndex]?.exportOptions?.[optionIndex]?.exportEa?.message}
          </FormErrorMessage>
        </FormControl>
      </Td>
    </Tr>
  );
}
