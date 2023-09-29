import { ChainId } from "@dexkit/core";
import { ZrxOrder } from "@dexkit/core/services/zrx/types";
import {
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useExchangeContext } from "../../hooks";
import { useZrxCancelOrderMutation, useZrxOrderbook } from "../../hooks/zrx";
import OrdersTableRow from "./OrdersTableRow";

import {
  useConnectWalletDialog,
  useExecuteTransactionsDialog,
} from "@dexkit/ui/hooks";
import WalletIcon from "@mui/icons-material/Wallet";

export interface OrdersTable {
  chainId?: ChainId;
  account?: string;
  provider?: ethers.providers.Web3Provider;
  active?: boolean;
}

export default function OrdersTable({
  chainId,
  account,
  provider,
  active,
}: OrdersTable) {
  const { baseToken, quoteToken } = useExchangeContext();
  const orderbookQuery = useZrxOrderbook({ chainId, account });

  const cancelOrderMutation = useZrxCancelOrderMutation();

  const transactionDialog = useExecuteTransactionsDialog();

  const handleCancelOrder = useCallback(
    async (order: ZrxOrder) => {
      transactionDialog.execute([
        {
          action: async () => {
            const result = await cancelOrderMutation.mutateAsync({
              order,
              chainId,
              provider,
            });

            return { hash: result };
          },
          icon: "receipt",
          title: {
            id: "cancel.token.order",
            defaultMessage: "Cancel token order",
          },
        },
      ]);
    },
    [chainId, provider]
  );

  const connectWalletDialog = useConnectWalletDialog();

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <Typography>
          <FormattedMessage id="my.orders" defaultMessage="My Orders" />
        </Typography>
      </Box>
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage id="side" defaultMessage="Side" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="size" defaultMessage="Size" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="filled" defaultMessage="Filled" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="price" defaultMessage="Price" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="expires.in" defaultMessage="Expires in" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="actions" defaultMessage="Actions" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!active && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Stack alignItems="center" spacing={2}>
                    <Typography align="center" variant="body1">
                      <FormattedMessage
                        id="your.wallet.is.not.connected"
                        defaultMessage="Your wallet is not connected"
                      />
                    </Typography>
                    <Button
                      onClick={connectWalletDialog.handleConnectWallet}
                      startIcon={<WalletIcon />}
                      variant="contained"
                    >
                      <FormattedMessage
                        id="connect.wallet"
                        defaultMessage="Connect wallet"
                      />
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {orderbookQuery.data?.records.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography align="center" variant="body1">
                    <FormattedMessage
                      id="there.are.no.orders.to.show"
                      defaultMessage="There are no orders to show"
                    />
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {orderbookQuery.data?.records.map((record, index) => (
              <OrdersTableRow
                key={index}
                onCancel={handleCancelOrder}
                record={record}
                account={account}
                baseToken={baseToken}
                quoteToken={quoteToken}
              />
            ))}
            {orderbookQuery.isLoading &&
              new Array(2).fill(null).map((_, key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
