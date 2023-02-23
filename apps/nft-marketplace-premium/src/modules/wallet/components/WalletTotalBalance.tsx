import { ethers } from 'ethers';
import { useMemo } from 'react';
import { FormattedNumber } from 'react-intl';
import { ChainId } from '../../../constants/enum';
import { useERC20BalancesQuery } from '../../../hooks/balances';
import { useCoinPricesQuery, useCurrency } from '../../../hooks/currency';
import { useIsBalanceVisible } from '../../../hooks/misc';

interface Props {
  chainId?: ChainId;
}

export function WalletTotalBalance({ chainId }: Props) {
  const isBalancesVisible = useIsBalanceVisible();
  const currency = useCurrency();

  const coinPricesQuery = useCoinPricesQuery({
    includeNative: true,
    chainId: chainId,
  });
  const tokenBalancesQuery = useERC20BalancesQuery(undefined, chainId);

  const totalBalance = useMemo(() => {
    if (tokenBalancesQuery.data && coinPricesQuery.data) {
      const prices = coinPricesQuery.data;

      const tokenBalances = tokenBalancesQuery.data.map((tb) => {
        return {
          balanceUnits: ethers.utils.formatUnits(tb.balance, tb.token.decimals),
          address: tb.token.address.toLowerCase(),
        };
      });

      const tokenValues = tokenBalances
        .filter((t) => prices[t.address])
        .map((t) => Number(t.balanceUnits) * prices[t.address][currency]);

      if (tokenValues && tokenValues.length) {
        return (
          <FormattedNumber
            value={tokenValues.reduce((p, c) => p + c)}
            style="currency"
            currency={currency}
          />
        );
      } else {
        ('----.--');
      }
    }
  }, [tokenBalancesQuery.data, coinPricesQuery.data, currency]);

  return <>{isBalancesVisible ? totalBalance : '-------'}</>;
}
