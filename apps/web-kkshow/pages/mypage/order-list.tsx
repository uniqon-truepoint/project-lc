import { Center, Spinner } from '@chakra-ui/react';
import CustomerMypageLayout from '@project-lc/components-web-kkshow/mypage/CustomerMypageLayout';
import CustomerOrderList from '@project-lc/components-web-kkshow/mypage/orderList/CustomerOrderList';
import { useProfile } from '@project-lc/hooks';
import { useRouter } from 'next/router';

export function OrderList(): JSX.Element {
  const { data, isLoading } = useProfile();
  const router = useRouter();
  if (isLoading)
    return (
      <CustomerMypageLayout>
        <Center>
          <Spinner />
        </Center>
      </CustomerMypageLayout>
    );
  if (!data || !data.id) {
    router.push('/login');
  }
  return (
    <CustomerMypageLayout>
      <CustomerOrderList customerId={data.id} />
    </CustomerMypageLayout>
  );
}

export default OrderList;
