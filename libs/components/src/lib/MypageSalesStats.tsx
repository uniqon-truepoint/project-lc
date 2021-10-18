import {
  Flex,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { AiFillShopping, AiFillInteraction } from 'react-icons/ai';
import { useFmOrdersStats } from '@project-lc/hooks';

export function MypageSalesStats(): JSX.Element {
  const { data } = useFmOrdersStats();

  return (
    <Grid templateColumns="1fr 1fr 1fr">
      <GridItem colStart={2}>
        <Box p={[2, 4, 4, 4]} display="flex" justifyContent="center">
          <Flex direction={['column', 'column', 'column', 'row']}>
            <Stat>
              <StatLabel fontSize="xl">
                <Flex alignItems="center">
                  <AiFillShopping />
                  주문
                </Flex>
              </StatLabel>
              <StatNumber fontSize={['3xl', '5xl', '5xl', '5xl']}>
                {data?.sales.주문.sum || 0}
                <Text ml={1} as="span" fontSize="2xl">
                  원
                </Text>
              </StatNumber>
              <StatHelpText fontSize="lg">
                총
                <Text ml={1} mr={0.5} as="span" fontSize="2xl">
                  {data?.sales.주문.count || 0}
                </Text>
                건
              </StatHelpText>
            </Stat>
          </Flex>
        </Box>
      </GridItem>
      <GridItem>
        <Box p={[2, 4, 4, 4]} display="flex" justifyContent="center">
          <Flex direction={['column', 'column', 'column', 'row']}>
            <Stat>
              <StatLabel fontSize="xl">
                <Flex alignItems="center">
                  <AiFillInteraction />
                  환불
                </Flex>
              </StatLabel>
              <StatNumber fontSize={['3xl', '5xl', '5xl', '5xl']}>
                {data?.sales.환불.sum || 0}
                <Text ml={1} as="span" fontSize="2xl">
                  원
                </Text>
              </StatNumber>
              <StatHelpText fontSize="lg">
                총
                <Text ml={1} mr={0.5} as="span" fontSize="2xl">
                  {data?.sales.환불.count || 0}
                </Text>
                건
              </StatHelpText>
            </Stat>
          </Flex>
        </Box>
      </GridItem>
    </Grid>
  );
}
