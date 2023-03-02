import { Box, NoSsr } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import {
  useConnectWalletDialog,
  useSignMessageDialog,
  useTransactions,
} from '../../hooks/app';
import {
  drawerIsOpenAtom,
  showSelectCurrencyAtom,
  showSelectLocaleAtom,
  switchNetworkChainIdAtom,
  switchNetworkOpenAtom,
} from '../../state/atoms';
import { Footer } from '../Footer';
import Navbar from '../Navbar';
const SignMessageDialog = dynamic(() => import('../dialogs/SignMessageDialog'));
const SwitchNetworkDialog = dynamic(
  () => import('../dialogs/SwitchNetworkDialog')
);
const TransactionDialog = dynamic(() => import('../dialogs/TransactionDialog'));

import { useWalletActivate } from '@dexkit/core/hooks';
import { WalletActivateParams } from '@dexkit/core/types';
import { useRouter } from 'next/router';
import AppDrawer from '../AppDrawer';

const ConnectWalletDialog = dynamic(() =>
  import('@dexkit/ui/components/ConnectWalletDialog').then(
    (c) => c.ConnectWalletDialog
  )
);

const SelectCurrencyDialog = dynamic(
  () => import('../dialogs/SelectCurrencyDialog')
);
const SelectLanguageDialog = dynamic(
  () => import('../dialogs/SelectLanguageDialog')
);

interface Props {
  children?: React.ReactNode | React.ReactNode[];
  noSsr?: boolean;
  disablePadding?: boolean;
}

const MainLayout: React.FC<Props> = ({ children, noSsr, disablePadding }) => {
  const { connector, isActive } = useWeb3React();
  const router = useRouter();

  const transactions = useTransactions();

  const [switchOpen, setSwitchOpen] = useAtom(switchNetworkOpenAtom);
  const [switchChainId, setSwitchChainId] = useAtom(switchNetworkChainIdAtom);

  const [showSelectCurrency, setShowShowSelectCurrency] = useAtom(
    showSelectCurrencyAtom
  );

  const [showSelectLocale, setShowShowSelectLocale] =
    useAtom(showSelectLocaleAtom);

  const connectWalletDialog = useConnectWalletDialog();

  const handleCloseConnectWalletDialog = () => {
    connectWalletDialog.setOpen(false);
  };

  const handleCloseTransactionDialog = () => {
    if (transactions.redirectUrl) {
      router.replace(transactions.redirectUrl);
    }
    transactions.setRedirectUrl(undefined);
    transactions.setDialogIsOpen(false);
    transactions.setHash(undefined);
    transactions.setType(undefined);
    transactions.setMetadata(undefined);
    transactions.setError(undefined);
  };

  const handleCloseSwitchNetworkDialog = () => {
    setSwitchChainId(undefined);
    setSwitchOpen(false);
  };

  const signMessageDialog = useSignMessageDialog();

  const handleCloseSignMessageDialog = () => {
    signMessageDialog.setOpen(false);
    signMessageDialog.setError(undefined);
    signMessageDialog.setIsSuccess(false);
    signMessageDialog.setMessage(undefined);
  };

  const handleCloseCurrencySelect = () => {
    setShowShowSelectCurrency(false);
  };

  const handleCloseLocaleSelect = () => {
    setShowShowSelectLocale(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      connector.activate();
      const handleNetworkChange = (newNetwork: any, oldNetwork: any) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        window.location.reload();
      };

      connector?.provider?.on('chainChanged', handleNetworkChange);

      return () => {
        connector?.provider?.removeListener(
          'chainChanged',
          handleNetworkChange
        );
      };
    }
  }, []);

  const [isDrawerOpen, setIsDrawerOpen] = useAtom(drawerIsOpenAtom);

  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const walletActivate = useWalletActivate();

  const handleActivateWallet = async (params: WalletActivateParams) => {
    await walletActivate.mutation.mutateAsync(params);
  };

  const render = () => (
    <>
      <AppDrawer open={isDrawerOpen} onClose={handleCloseDrawer} />
      <SelectCurrencyDialog
        dialogProps={{
          open: showSelectCurrency,
          onClose: handleCloseCurrencySelect,
          fullWidth: true,
          maxWidth: 'xs',
        }}
      />
      <SelectLanguageDialog
        dialogProps={{
          open: showSelectLocale,
          onClose: handleCloseLocaleSelect,
          fullWidth: true,
          maxWidth: 'xs',
        }}
      />
      <TransactionDialog
        dialogProps={{
          open: transactions.isOpen,
          onClose: handleCloseTransactionDialog,
          fullWidth: true,
          maxWidth: 'xs',
        }}
        hash={transactions.hash}
        metadata={transactions.metadata}
        type={transactions.type}
        error={transactions.error}
      />
      <SignMessageDialog
        dialogProps={{
          open: signMessageDialog.open,
          onClose: handleCloseSignMessageDialog,
          fullWidth: true,
          maxWidth: 'xs',
        }}
        error={signMessageDialog.error}
        success={signMessageDialog.isSuccess}
        message={signMessageDialog.message}
      />
      <SwitchNetworkDialog
        dialogProps={{
          open: switchOpen,
          onClose: handleCloseSwitchNetworkDialog,
          fullWidth: true,
          maxWidth: 'xs',
        }}
        chainId={switchChainId}
      />
      <ConnectWalletDialog
        DialogProps={{
          open: connectWalletDialog.isOpen,
          onClose: handleCloseConnectWalletDialog,
          fullWidth: true,
          maxWidth: 'sm',
        }}
        isActivating={walletActivate.mutation.isLoading}
        activeConnectorName={walletActivate.connectorName}
        isActive={isActive}
        activate={handleActivateWallet}
      />
      <Navbar />
      <Box sx={{ minHeight: '100vh' }} py={disablePadding ? 0 : 4}>
        {children}
      </Box>
      <Footer />
    </>
  );

  if (noSsr) {
    return <NoSsr>{render()}</NoSsr>;
  }

  return render();
};

export default MainLayout;
