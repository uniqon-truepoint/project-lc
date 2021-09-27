/* eslint-disable camelcase */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Button,
  Center,
  Spinner,
  Stack,
  Text,
  theme,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  s3,
  useCreateGoodsCommonInfo,
  useProfile,
  useRegistGoods,
} from '@project-lc/hooks';
import path from 'path';
import { GoodsOptionDto, RegistGoodsDto } from '@project-lc/shared-types';
import { useRouter } from 'next/router';
import { FormProvider, NestedValue, useForm } from 'react-hook-form';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import GoodsRegistCommonInfo from './GoodsRegistCommonInfo';
import GoodsRegistDataBasic from './GoodsRegistDataBasic';
import GoodsRegistDataOptions from './GoodsRegistDataOptions';
import GoodsRegistDataSales from './GoodsRegistDataSales';
import GoodsRegistDescription from './GoodsRegistDescription';
import GoodsRegistExtraInfo from './GoodsRegistExtraInfo';
import GoodsRegistMemo from './GoodsRegistMemo';
import GoodsRegistPictures from './GoodsRegistPictures';
import GoodsRegistShippingPolicy from './GoodsRegistShippingPolicy';

export type GoodsFormOptionsType = Omit<
  GoodsOptionDto,
  'default_option' | 'option_title'
>[];

export type GoodsFormValues = Omit<RegistGoodsDto, 'options' | 'image'> & {
  options: NestedValue<GoodsFormOptionsType>;
  image?: { file: File; filename: string; id: number }[];
  option_title: string; // 옵션 제목
  common_contents_name?: string; // 공통 정보 이름
  common_contents_type: 'new' | 'load'; // 공통정보 신규 | 기존 불러오기
};

type GoodsFormSubmitDataType = Omit<GoodsFormValues, 'options'> & {
  options: Omit<GoodsOptionDto, 'option_title' | 'default_option'>[];
};

// 상품 사진, 상세설명 이미지를 s3에 업로드 -> url 리턴
export async function uploadGoodsImageToS3(
  imageFile: { file: File | Buffer; filename: string; id: number; contentType: string },
  userMail: string,
) {
  const { file, filename, contentType } = imageFile;

  const type = 'goods';
  const key = path.join(...[type, userMail, filename]);
  await s3.s3uploadFile({ key, file, contentType });
  const url = [
    'https://',
    process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    '.s3.',
    'ap-northeast-2',
    '.amazonaws.com/',
    key,
  ].join('');

  return url;
}

// 여러 상품 이미지를 s3에 업로드 후 imageDto로 변경
// 상품사진은 file 로 들어옴
async function imageFileListToImageDto(
  imageFileList: { file: File; filename: string; id: number }[],
  userMail: string,
) {
  const savedImages = await Promise.all(
    imageFileList.map((item) => {
      const { file } = item;
      return uploadGoodsImageToS3({ ...item, contentType: file.type }, userMail);
    }),
  );
  return savedImages.map((img, index) => ({
    cut_number: index,
    image: img,
  }));
}

// options 에 default_option, option_title설정
function addGoodsOptionInfo(
  options: Omit<GoodsOptionDto, 'default_option' | 'option_title'>[],
  option_title: string,
) {
  return options.map((opt, index) => ({
    ...opt,
    default_option: index === 0 ? ('y' as const) : ('n' as const),
    option_title,
  }));
}

// 상품 '상세설명' contents에서 이미지 s3에 업로드 후 src url 변경
// 상세설명 이미지는data:image 형태로 들어있음
export async function saveContentsImageToS3(contents: string, userMail: string) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(contents, 'text/html'); // textWithImages -> getValues('contents')
  const imageTags = Array.from(dom.querySelectorAll('img'));

  await Promise.all(
    imageTags.map(async (tag, index) => {
      const src = tag.getAttribute('src');
      const name = tag.dataset.fileName || '';
      if (src && src.slice(0, 4) !== 'http') {
        const imageBuffer = Buffer.from(
          src.replace(/^data:image\/\w+;base64,/, ''),
          'base64',
        );
        const fileType = src.substring('data:'.length, src.indexOf(';base64'));
        const url = await uploadGoodsImageToS3(
          { file: imageBuffer, filename: name, id: index, contentType: fileType },
          userMail,
        );
        // img src 바꾸기
        tag.setAttribute('src', url);
      }
    }),
  );

  const contentsBody = dom.body.innerHTML;
  return contentsBody;
}

export function GoodsRegistForm(): JSX.Element {
  const { data: profileData } = useProfile();
  const { mutateAsync, isLoading } = useRegistGoods();
  const { mutateAsync: createGoodsCommonInfo } = useCreateGoodsCommonInfo();
  const toast = useToast();
  const router = useRouter();

  const methods = useForm<GoodsFormValues>({
    defaultValues: {
      common_contents_type: 'new',
      option_title: '',
      image: [],
      options: [
        {
          option_type: 'direct',
          option1: '',
          consumer_price: 0,
          price: 0,
          option_view: 'Y',
          supply: {
            stock: 0,
          },
        },
      ],
      option_use: '1',
      // 이하 fm_goods 기본값
      goods_view: 'look',
      shipping_policy: 'shop',
      goods_shipping_policy: 'unlimit',
      shipping_weight_policy: 'shop',
      option_view_type: 'divide',
      option_suboption_use: '0',
      member_input_use: '0',
    },
  });
  const { handleSubmit } = methods;

  const regist = async (data: GoodsFormSubmitDataType) => {
    if (!profileData) return;
    const userMail = profileData.email;

    const {
      image,
      options,
      option_title,
      common_contents_name,
      common_contents_type,
      common_contents,
      max_purchase_ea,
      min_purchase_ea,
      shippingGroupId,
      contents,
      ...goodsData
    } = data;

    let goodsDto: RegistGoodsDto = {
      ...goodsData,
      common_contents: '',
      options: addGoodsOptionInfo(options, option_title),
      option_use: options.length > 1 ? '1' : '0',
      max_purchase_ea: Number(max_purchase_ea) || 0,
      min_purchase_ea: Number(min_purchase_ea) || 0,
      shippingGroupId: Number(shippingGroupId) || undefined,
      image:
        image && image.length > 0 ? await imageFileListToImageDto(image, userMail) : [],
    };

    // 상세설명을 입력한 경우
    if (contents && contents !== '<p><br></p>') {
      const contentsBody = await saveContentsImageToS3(contents, userMail);
      goodsDto = {
        ...goodsDto,
        contents: contentsBody,
        contents_mobile: contentsBody,
      };
    } else {
      // 상세설명을 입력하지 않은 경우 - 상품 수정 기능이 없는 동안 필수값으로 설정함
      // TODO: 수정기능 추가 후 옵셔널 값으로 변경하기
      toast({ title: '상세설명을 입력해주세요', status: 'warning' });
      return;
    }

    // 공통정보 신규생성 & 공통정보를 입력한 경우
    if (
      common_contents_type === 'new' &&
      !!common_contents &&
      common_contents !== '<p><br></p>'
    ) {
      // 공통정보 생성 -> 해당 아이디를 commonInfoId에 추가
      const commonInfoBody = await saveContentsImageToS3(common_contents, userMail);
      const res = await createGoodsCommonInfo({
        info_name: common_contents_name || '',
        info_value: commonInfoBody,
      });

      goodsDto = {
        ...goodsDto,
        goodsInfoId: res.data.id,
        common_contents: commonInfoBody,
      };
    } else if (!data.goodsInfoId) {
      // 상품 공통정보 없는 경우 (신규등록 안함 & 기존정보 불러오기도 안함) - 상품 수정 기능이 없는 동안 필수값으로 설정함
      // TODO: 수정기능 추가 후 옵셔널 값으로 변경하기
      toast({
        title: '상품 공통 정보를 입력하거나 기존 정보를 불러와서 등록해주세요',
        status: 'warning',
      });
      return;
    }

    if (!shippingGroupId) {
      // 배송비정책 그룹을 선택하지 않은 경우
      // TODO: 수정기능 추가 후 옵셔널 값으로 변경하기(if문 삭제)
      toast({
        title: '배송비 정책을 선택해주세요',
        status: 'warning',
      });
      return;
    }

    mutateAsync(goodsDto)
      .then((res) => {
        toast({
          title: '상품을 성공적으로 등록하였습니다',
        });
        router.push('/mypage/goods');
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: '상품 등록 중 오류가 발생하였습니다',
          status: 'error',
        });
      });
  };

  return (
    <FormProvider {...methods}>
      <Stack p={2} spacing={5} as="form" onSubmit={handleSubmit(regist)}>
        <Stack
          py={4}
          mx={-2}
          direction="row"
          position="sticky"
          bgColor={useColorModeValue('white', 'gray.800')}
          top="0px"
          left="0px"
          right="0px"
          justifyContent="space-between"
          zIndex={theme.zIndices.sticky}
        >
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => router.push('/mypage/goods')}
          >
            상품목록 돌아가기
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            등록
          </Button>
        </Stack>

        {/* 기본정보 */}
        <GoodsRegistDataBasic />

        {/* 판매정보 */}
        <GoodsRegistDataSales />

        {/* 판매 옵션 */}
        <GoodsRegistDataOptions />

        {/* 상품사진 - (다이얼로그)여러 이미지 등록 가능, 최대 8개 */}
        <GoodsRegistPictures />

        {/* 상세설명 -  (다이얼로그, 에디터 필요) 에디터로 글/이미지 동시 등록, 이미지는 최대 20mb 제한, 주로 이미지로 등록함 */}
        <GoodsRegistDescription />

        {/* 상품 공통 정보 => 교환/반품/배송에 표시됨 (다이얼로그, 에디터 필요) 에디터로 글/이미지 동시 등록,
      내가 생성한 공통정보 조회, 선택기능 포함  */}
        <GoodsRegistCommonInfo />

        {/* 배송비 (내가 생성한 배송정책 조회 기능 + 선택 기능 포함), 배송정책 등록 다이얼로그와 연결 */}
        <GoodsRegistShippingPolicy />

        {/* 기타정보 - 최소, 최대구매수량 */}
        <GoodsRegistExtraInfo />

        {/* 메모 - textArea */}
        <GoodsRegistMemo />

        {isLoading && (
          <Center
            position="fixed"
            mt={0}
            top="0px"
            bottom="0px"
            left="0px"
            right="0px"
            bg="gray.400"
            opacity="0.5"
            flexDirection="column"
          >
            <Spinner />
            <Text>상품을 등록중입니다...</Text>
          </Center>
        )}
      </Stack>
    </FormProvider>
  );
}

export default GoodsRegistForm;
