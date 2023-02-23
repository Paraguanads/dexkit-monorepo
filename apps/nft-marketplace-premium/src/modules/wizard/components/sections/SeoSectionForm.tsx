import Check from '@mui/icons-material/Check';
import {
  Button,
  Divider,
  Grid,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { Field, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import * as Yup from 'yup';
import MediaDialog from '../../../../components/mediaDialog';
import { SeoForm } from '../../types';

const FormSchema: Yup.SchemaOf<SeoForm> = Yup.object().shape({
  title: Yup.string().required(),
  description: Yup.string().required(),
  shareImageUrl: Yup.string().url().required(),
});

const CustomImage = styled('img')(({ theme }) => ({
  height: theme.spacing(20),
  width: theme.spacing(40),
}));

interface Props {
  initialValues: SeoForm;
  onSubmit: (form: SeoForm) => void;
}

export default function SeoSectionForm({ initialValues, onSubmit }: Props) {
  const [openMediaDialog, setOpenMediaDialog] = useState(false);
  const [mediaFieldToEdit, setMediaFieldToEdit] = useState<string>();
  const handleSubmit = useCallback(
    (values: SeoForm, helpers: FormikHelpers<SeoForm>) => {
      onSubmit(values);
      helpers.setSubmitting(false);
    },
    [onSubmit]
  );

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={FormSchema}
    >
      {({ submitForm, isValid, values, setFieldValue }) => (
        <>
          <MediaDialog
            dialogProps={{
              open: openMediaDialog,
              maxWidth: 'lg',
              fullWidth: true,
              onClose: () => {
                setOpenMediaDialog(false);
                setMediaFieldToEdit(undefined);
              },
            }}
            onConfirmSelectFile={(file) => {
              if (mediaFieldToEdit && file) {
                setFieldValue(mediaFieldToEdit, file.url);
              }
              setMediaFieldToEdit(undefined);
              setOpenMediaDialog(false);
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Field
                component={TextField}
                type="text"
                label={<FormattedMessage id="title" defaultMessage="Title" />}
                name="title"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                component={TextField}
                type="text"
                label={
                  <FormattedMessage
                    id="description"
                    defaultMessage="Description"
                  />
                }
                name="description"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                <FormattedMessage
                  id="share.image"
                  defaultMessage="Share image"
                />
              </Typography>
              <Button
                onClick={() => {
                  setOpenMediaDialog(true);
                  setMediaFieldToEdit('shareImageUrl');
                }}
              >
                <CustomImage src={values.shareImageUrl} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1} direction="row" justifyContent="flex-end">
                <Button
                  startIcon={<Check />}
                  disabled={!isValid}
                  onClick={submitForm}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  <FormattedMessage id="save" defaultMessage="Save" />
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Formik>
  );
}
