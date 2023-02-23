import {
  Box,
  Button,
  Container,
  createTheme,
  Divider,
  Drawer,
  Grid,
  IconButton,
  responsiveFontSizes,
  Stack,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dynamic from 'next/dynamic';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Close from '@mui/icons-material/Close';
import { useWeb3React } from '@web3-react/core';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { useAtomValue } from 'jotai';
import { NextSeo } from 'next-seo';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import * as Yup from 'yup';
import theDefaultConfig from '../../../../../config/wizard.default.app.json';
import AppConfirmDialog from '../../../../components/AppConfirmDialog';
import Wallet from '../../../../components/icons/Wallet';
import { PageHeader } from '../../../../components/PageHeader';
import { IS_STAGING } from '../../../../constants';
import { useConnectWalletDialog } from '../../../../hooks/app';

import {
  useSendConfigMutation,
  useWhitelabelConfigQuery,
} from '../../../../hooks/whitelabel';
import { getTheme } from '../../../../theme';
import { AppConfig } from '../../../../types/config';
import { customThemeAtom } from '../../state';
const SignConfigDialog = dynamic(() => import('../dialogs/SignConfigDialog'));
import { PagePreviewPaper } from '../sections/PagePreviewPaper';
import ThemePreview from '../ThemePreview';
import { WelcomeMessage } from '../WelcomeMessage';

const defaultConfig = theDefaultConfig as AppConfig;

interface Props {
  slug?: string;
  isSwapWizard?: boolean;
}

interface CreateMarketplace {
  name: string;
  email: string;
}

const FormSchema: Yup.SchemaOf<CreateMarketplace> = Yup.object().shape({
  email: Yup.string().email().required(),
  name: Yup.string().required(),
});

export function CreateWizardContainer({ slug, isSwapWizard }: Props) {
  const { formatMessage } = useIntl();
  const customTheme = useAtomValue(customThemeAtom);
  const { isActive } = useWeb3React();
  const connectWalletDialog = useConnectWalletDialog();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const clonedConfigQuery = useWhitelabelConfigQuery({ slug });

  const sendConfigMutation = useSendConfigMutation({});

  const [selectedThemeId, setSelectedThemeId] = useState<string>();

  const currentPage = useMemo(() => {
    if (clonedConfigQuery.data && clonedConfigQuery.data.config) {
      const clonedConfig = JSON.parse(
        clonedConfigQuery.data.config
      ) as AppConfig;
      if (clonedConfig.pages['home']) {
        return clonedConfig.pages['home'];
      } else {
        return defaultConfig.pages['home'];
      }
    }
    return defaultConfig.pages['home'];
  }, [clonedConfigQuery.data]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [showSendingConfig, setShowSendingConfig] = useState(false);

  const [showConfirmSendConfig, setShowConfirmSendConfig] = useState(false);

  // Pages forms
  const handleCloseConfirmSendConfig = () => {
    setShowConfirmSendConfig(false);
  };

  const handleConfirmSendConfig = async () => {
    setShowConfirmSendConfig(false);
    setShowSendingConfig(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleShowPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleCloseSendingConfig = () => {
    setShowSendingConfig(false);
    sendConfigMutation.reset();
  };

  const selectedTheme = useMemo(() => {
    if (selectedThemeId !== undefined) {
      if (selectedThemeId === 'custom') {
        return responsiveFontSizes(createTheme(customTheme));
      }

      return responsiveFontSizes(getTheme(selectedThemeId).theme);
    }
  }, [selectedThemeId, customTheme]);

  const renderThemePreview = () => {
    if (selectedTheme) {
      return <ThemePreview selectedTheme={selectedTheme} />;
    }
  };

  return (
    <>
      <Drawer open={isPreviewOpen} onClose={handleClosePreview}>
        <Box
          sx={(theme) => ({ minWidth: `${theme.breakpoints.values.sm / 2}px` })}
        >
          <Box sx={{ p: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              alignContent="center"
              justifyContent="space-between"
            >
              <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
                <FormattedMessage
                  id="theme.preview"
                  defaultMessage="Theme Preview"
                />
              </Typography>
              <IconButton onClick={handleClosePreview}>
                <Close />
              </IconButton>
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>{renderThemePreview()}</Box>
        </Box>
      </Drawer>

      <NextSeo
        title={
          isSwapWizard
            ? formatMessage({
                id: 'swap.setup',
                defaultMessage: 'Swap Setup',
              })
            : formatMessage({
                id: 'marketplace.setup',
                defaultMessage: 'Marketplace Setup',
              })
        }
      />
      <AppConfirmDialog
        dialogProps={{
          open: showConfirmSendConfig,
          maxWidth: 'xs',
          fullWidth: true,
          onClose: handleCloseConfirmSendConfig,
        }}
        onConfirm={handleConfirmSendConfig}
      >
        <Stack>
          <Typography variant="h5" align="center">
            <FormattedMessage
              id="send.settings"
              defaultMessage="Send settings"
            />
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary">
            <FormattedMessage
              id="do.you.really.want.to.send.this.marketplace.settings"
              defaultMessage="Do you really want to send it?"
            />
          </Typography>
        </Stack>
      </AppConfirmDialog>
      <SignConfigDialog
        dialogProps={{
          open: showSendingConfig,
          maxWidth: 'xs',
          fullWidth: true,
          onClose: handleCloseSendingConfig,
        }}
        isLoading={sendConfigMutation.isLoading}
        isSuccess={sendConfigMutation.isSuccess}
        error={sendConfigMutation.error}
        data={sendConfigMutation.data}
      />
      <Container maxWidth={'xl'}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack
              direction="row"
              alignItems="center"
              alignContent="center"
              justifyContent="space-between"
            >
              <PageHeader
                breadcrumbs={[
                  {
                    caption: (
                      <FormattedMessage id="admin" defaultMessage="Admin" />
                    ),
                    uri: '/admin',
                  },
                  {
                    caption: isSwapWizard ? (
                      <FormattedMessage
                        id="swap.apps"
                        defaultMessage="Swap apps"
                      />
                    ) : (
                      <FormattedMessage
                        id="marketplaces"
                        defaultMessage="Marketplaces"
                      />
                    ),
                    uri: '/admin',
                  },
                  {
                    caption: (
                      <FormattedMessage id="create" defaultMessage="Create" />
                    ),
                    uri: isSwapWizard ? '/admin/create-swa´p' : '/admin/create',
                    active: true,
                  },
                ]}
              />
              {isMobile && (
                <Button
                  onClick={handleShowPreview}
                  size="small"
                  variant="outlined"
                >
                  <FormattedMessage id="preview" defaultMessage="Preview" />
                </Button>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={12}>
            <WelcomeMessage />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="body2">
              <FormattedMessage
                id="start.for.free"
                defaultMessage="Start for free"
              />
            </Typography>
            <Typography variant="h5">
              {isSwapWizard ? (
                <FormattedMessage
                  id="create.your.swap.app"
                  defaultMessage="Create your Swap app"
                />
              ) : (
                <FormattedMessage
                  id="create.your.marketplace"
                  defaultMessage="Create your Marketplace"
                />
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={2}>
              <Formik
                validationSchema={FormSchema}
                onSubmit={(values, { setSubmitting }) => {
                  let clonedConfig = {};
                  if (clonedConfigQuery.data) {
                    clonedConfig = JSON.parse(clonedConfigQuery.data.config);
                  }
                  const submitConfig = {
                    ...defaultConfig,
                    ...clonedConfig,
                    ...values,
                  };
                  setShowSendingConfig(true);
                  sendConfigMutation.mutateAsync({
                    config: submitConfig,
                    email: values.email,
                  });
                  setSubmitting(false);
                }}
                enableReinitialize={true}
                initialValues={{
                  name: '',
                  email: '',
                  domain: '',
                }}
              >
                {({ isValid }) => (
                  <Form>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Field
                          component={TextField}
                          fullWidth
                          name="name"
                          label={
                            isSwapWizard ? (
                              <FormattedMessage
                                id="name.of.your.swap.app"
                                defaultMessage="Name of your swap app"
                              />
                            ) : (
                              <FormattedMessage
                                id="name.of.your.marketplace"
                                defaultMessage="Name of your marketplace"
                              />
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          component={TextField}
                          fullWidth
                          name="email"
                          label={
                            <FormattedMessage
                              id="email.to.receive.notifications"
                              defaultMessage="Email to receive notifications"
                            />
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Stack
                          spacing={1}
                          direction="row"
                          justifyContent="flex-end"
                        >
                          {isActive ? (
                            <Button
                              disabled={!isValid}
                              type="submit"
                              variant="contained"
                              color="primary"
                            >
                              {isSwapWizard ? (
                                <FormattedMessage
                                  id="create.swap.app"
                                  defaultMessage="Create swap app"
                                />
                              ) : (
                                <FormattedMessage
                                  id="create.marketplace"
                                  defaultMessage="Create Marketplace"
                                />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              color="inherit"
                              onClick={() => connectWalletDialog.setOpen(true)}
                              startIcon={<Wallet />}
                              endIcon={<ChevronRightIcon />}
                            >
                              <FormattedMessage
                                id="connect.wallet"
                                defaultMessage="Connect Wallet"
                                description="Connect wallet button"
                              />
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Stack>
          </Grid>
          {!isMobile && (
            <Grid item xs={12} sm={8}>
              <ThemeProvider theme={selectedTheme ? selectedTheme : theme}>
                <Container>
                  <Stack spacing={2}>
                    {slug && (
                      <Typography variant="subtitle1">
                        <FormattedMessage
                          id="you.are.cloning"
                          defaultMessage="You are cloning site: <b>{site}</b>. Check it live <a>here</a> "
                          values={{
                            site: slug,
                            //@ts-ignore
                            b: (chunks) => <b>{chunks}</b>,
                            //@ts-ignore
                            a: (chunks: any): ReactNode => (
                              <a
                                className="external_link"
                                target="_blank"
                                href={
                                  IS_STAGING
                                    ? `https://${slug}.dev.dexkit.app`
                                    : `https://${slug}.dexkit.app`
                                }
                                rel="noreferrer"
                              >
                                {chunks}
                              </a>
                            ),
                          }}
                        />
                      </Typography>
                    )}
                    <PagePreviewPaper
                      sections={currentPage.sections}
                      name={currentPage.title || 'Home'}
                      hideButtons={currentPage?.key !== 'home'}
                    />
                  </Stack>
                </Container>
              </ThemeProvider>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}
