/* eslint-disable react/jsx-props-no-spreading */
import { Button, FormControl, Input, Select, Stack, Text } from '@chakra-ui/react';
import { ShippingOptType, ShippingSetType } from '@prisma/client';
import { MAX_COST } from '@project-lc/shared-types';
import { useShippingSetItemStore } from '@project-lc/stores';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KOREA_PROVINCES } from '../constants/address';
import FormControlInputWrapper from './FormControlInputWrapper';
import { ResponsiveDivider } from './ResponsiveDivider';
import { ErrorText } from './ShippingOptionIntervalApply';

function CostInputWrapper({
  children,
  id,
  suffix,
}: {
  children: React.ReactNode;
  id?: string;
  suffix: string;
}) {
  return (
    <FormControl id={id}>
      <Stack direction="row" alignItems="center">
        {children}
        <Text>{suffix}</Text>
      </Stack>
    </FormControl>
  );
}

type RepeatFormType = {
  firstSectionStart: null | number;
  firstSectionEnd: null | number;
  secondSectionStart: null | number;
  secondSectionEnd: null | number;
  firstCost: number;
  secondCost: number;
  areaName: string;
};

export function ShippingOptionRepeatApply({
  shippingSetType,
  shippingOptType,
  suffix,
}: {
  shippingSetType: ShippingSetType;
  shippingOptType: ShippingOptType;
  suffix: string;
}): JSX.Element {
  const {
    setShippingOptions,
    addShippingOption,
    delivery_limit: deliveryLimit,
  } = useShippingSetItemStore();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    control,
    formState: { errors },
  } = useForm<RepeatFormType>({
    defaultValues: {
      firstSectionStart: 1,
      firstSectionEnd: 2,
      firstCost: 2500,
      secondSectionStart: 2,
      secondSectionEnd: 1,
      secondCost: 2500,
      areaName:
        deliveryLimit === 'limit' || shippingSetType === 'add' ? '지역 선택' : '대한민국',
    },
  });

  const shippingOptionBase = {
    shipping_set_type: shippingSetType,
    shipping_opt_type: shippingOptType,
    default_yn: null,
  };

  const onSubmit = (data: RepeatFormType) => {
    const {
      firstSectionStart,
      firstSectionEnd,
      firstCost,
      secondSectionStart,
      secondSectionEnd,
      secondCost,
      areaName,
    } = data;

    // 2. shippingOption 생성
    const firstOption = {
      ...shippingOptionBase,
      section_st: firstSectionStart,
      section_ed: firstSectionEnd,
      shippingCost: {
        shipping_area_name: areaName,
        shipping_cost: firstCost,
      },
    };
    const secondOption = {
      ...shippingOptionBase,
      section_st: secondSectionStart,
      section_ed: secondSectionEnd,
      shippingCost: {
        shipping_area_name: areaName,
        shipping_cost: secondCost,
      },
    };
    const newOptions = [firstOption, secondOption];
    // 3. addShippingOption

    if (deliveryLimit === 'limit' || shippingSetType === 'add') {
      // 지역배송인 경우 추가하도록
      newOptions.forEach((opt) => addShippingOption(opt));
    } else {
      // 전국배송인 경우 1개만 설정하도록
      setShippingOptions(newOptions);
    }
  };

  useEffect(() => {
    reset();
  }, [reset, shippingOptType, deliveryLimit]);

  return (
    <>
      {errors.firstSectionStart && (
        <ErrorText>{errors.firstSectionStart.message}</ErrorText>
      )}
      {errors.firstSectionEnd && <ErrorText>{errors.firstSectionEnd.message}</ErrorText>}
      {errors.secondSectionStart && (
        <ErrorText>{errors.secondSectionStart.message}</ErrorText>
      )}
      {errors.secondSectionEnd && (
        <ErrorText>{errors.secondSectionEnd.message}</ErrorText>
      )}
      {errors.firstCost && <ErrorText>{errors.firstCost.message}</ErrorText>}
      {errors.secondCost && <ErrorText>{errors.secondCost.message}</ErrorText>}
      {errors.areaName && <ErrorText>{errors.areaName.message}</ErrorText>}

      <Stack
        direction="column"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        alignItems="center"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
      >
        <Stack w="100%" direction="row" justifyContent="space-between">
          {/* 지역 설정 셀렉트 */}
          <Controller
            name="areaName"
            control={control}
            rules={{
              validate: {
                selectArea: (v) => v !== '지역 선택' || '지역을 선택해주세요',
              },
            }}
            render={({ field }) => {
              return (
                <Select w={120} {...field}>
                  {deliveryLimit === 'limit' || shippingSetType === 'add' ? (
                    ['지역 선택', ...KOREA_PROVINCES].map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))
                  ) : (
                    <option value="대한민국">대한민국</option>
                  )}
                </Select>
              );
            }}
          />
          <Button type="submit" alignSelf="flex-start">
            적용
          </Button>
        </Stack>

        {/* 첫번째 옵션 */}
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={2}
        >
          <Stack direction="row" alignItems="center">
            <FormControlInputWrapper id="firstSectionStart" suffix={`${suffix} 이상`}>
              <Input
                type="number"
                max={MAX_COST}
                {...register('firstSectionStart', {
                  required: '시작값을 입력해주세요',
                  valueAsNumber: true,
                  validate: {
                    positive: (v) => (v && v > 0) || '양수를 입력해주세요',
                  },
                })}
              />
            </FormControlInputWrapper>
            <Text>~</Text>
            <FormControlInputWrapper id="firstSectionEnd" suffix={`${suffix} 미만`}>
              <Input
                type="number"
                max={MAX_COST}
                {...register('firstSectionEnd', {
                  valueAsNumber: true,
                  validate: {
                    positive: (v) => (v && v > 0) || '양수를 입력해주세요',
                    biggerThanSectionStart: (v) => {
                      const sectionStart = getValues('firstSectionStart');
                      return (
                        (sectionStart && v && v > sectionStart) ||
                        '시작값보다 큰 값을 입력해주세요'
                      );
                    },
                  },
                })}
              />
            </FormControlInputWrapper>
          </Stack>
          <ResponsiveDivider />
          <CostInputWrapper id="firstCost" suffix={suffix}>
            <Input
              type="number"
              max={MAX_COST}
              {...register('firstCost', {
                required: '배송비를 입력해주세요',
                valueAsNumber: true,
                validate: {
                  positive: (v) => (v && v > 0) || '양수를 입력해주세요',
                },
              })}
            />
          </CostInputWrapper>
        </Stack>
        {/* 첫번째 옵션 */}

        {/* 두번째 옵션 */}
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={2}
        >
          <Stack direction="row" alignItems="center">
            <FormControlInputWrapper id="secondSectionStart" suffix={`${suffix} 부터는`}>
              <Input
                type="number"
                max={MAX_COST}
                {...register('secondSectionStart', {
                  required: '시작값을 입력해주세요',
                  valueAsNumber: true,
                  validate: {
                    positive: (v) => (v && v > 0) || '양수를 입력해주세요',
                  },
                })}
              />
            </FormControlInputWrapper>
            <Text>~</Text>
            <FormControlInputWrapper id="secondSectionEnd" suffix={`${suffix} 당`}>
              <Input
                type="number"
                max={MAX_COST}
                {...register('secondSectionEnd', {
                  valueAsNumber: true,
                  validate: {
                    positive: (v) => (v && v > 0) || '양수를 입력해주세요',
                  },
                })}
              />
            </FormControlInputWrapper>
          </Stack>
          <ResponsiveDivider />
          <CostInputWrapper id="secondCost" suffix={suffix}>
            <Input
              type="number"
              max={MAX_COST}
              maxLength={11}
              {...register('secondCost', {
                required: '배송비를 입력해주세요',
                valueAsNumber: true,
                validate: {
                  positive: (v) => (v && v > 0) || '양수를 입력해주세요',
                },
              })}
            />
          </CostInputWrapper>
        </Stack>
        {/* 두번째 옵션 */}

        <Stack />
      </Stack>
    </>
  );
}

export default ShippingOptionRepeatApply;
