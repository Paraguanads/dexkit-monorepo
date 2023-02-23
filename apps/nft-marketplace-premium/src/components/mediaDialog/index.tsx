import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Divider,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { AppDialogTitle } from '../AppDialogTitle';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useDeleteAccountFile,
  useEditAccountFile,
  useGetAccountFiles,
  useUploadAccountFile,
} from '../../hooks/file';
import { AccountFile } from '../../types/file';
import AppConfirmDialog from '../AppConfirmDialog';
import DeleteImageDialog from './DeleteImageDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import { useWeb3React } from '@web3-react/core';
import { useConnectWalletDialog } from '../../hooks/app';
import { MAX_ACCOUNT_FILE_UPLOAD_SIZE } from '../../constants';
import EditIcon from '@mui/icons-material/Edit';
import { truncateText } from 'src/utils/text';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

interface Props {
  dialogProps: DialogProps;
  onConfirmSelectFile: (file: AccountFile) => void;
}

const CustomImage = styled('img')(({ theme }) => ({
  height: theme.spacing(20),
  width: theme.spacing(20),
}));

const CustomButton = styled(ButtonBase)(({ theme }) => ({
  height: theme.spacing(20),
  width: theme.spacing(20),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignCOntent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.20)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
  },
  '&:hover .btn': {},
}));

export default function MediaDialog({
  dialogProps,
  onConfirmSelectFile,
}: Props) {
  const { onClose } = dialogProps;
  const { isActive } = useWeb3React();
  const { setOpen } = useConnectWalletDialog();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState<string>();
  const filesQuery = useGetAccountFiles({ skip: page * 20, search });

  const [file, setFile] = useState<File>();

  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [editFileName, setEditFileName] = useState<number | undefined>();
  const [newFileName, setNewFileName] = useState<string | undefined>();
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AccountFile>();
  const { fileUploadMutation, fileUploadProgress } = useUploadAccountFile();
  const deleteFileMutation = useDeleteAccountFile();
  const editFileMutation = useEditAccountFile();

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (file) {
      if (imgRef.current) {
        imgRef.current.src = URL.createObjectURL(file);
      }
    }
  }, [file]);

  const handleClose = () => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
    setSelectedFile(undefined);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null && e.target.files.length > 0) {
      let file = e.target.files[0];

      setFile(file);
    } else {
    }
  }, []);

  const handleClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    inputRef.current?.click();
  }, [inputRef]);

  const handleConnectWallet = () => {
    setOpen(true);
  };

  const onUploadFile = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      fileUploadMutation.mutate(formData, {
        onSuccess: () => {
          fileUploadMutation.reset();
          setFile(undefined);
          filesQuery.refetch();
        },
      });
    }
  };
  const handleDeleteFile = () => {
    if (selectedFile) {
      setShowDeleteImageDialog(true);
      setShowConfirmRemove(false);
      deleteFileMutation.mutate(selectedFile.id, {
        onSuccess: () => filesQuery.refetch(),
      });
    }
  };

  const handleEditFile = async () => {
    if (selectedFile && newFileName) {
      setShowConfirmEdit(false);
      await editFileMutation.mutateAsync(
        { id: selectedFile.id, newFileName: newFileName },
        {
          onSuccess: () => filesQuery.refetch(),
        }
      );
      setNewFileName(undefined);
      setEditFileName(undefined);
    }
  };

  const handleCloseDeleteFile = () => {
    setShowDeleteImageDialog(false);
  };

  const handleShowConfirmRemoveClose = () => {
    setShowConfirmRemove(false);
  };

  const handleShowConfirmEditClose = () => {
    setShowConfirmEdit(false);
  };

  const handleConfirmSelectedFile = () => {
    if (selectedFile) {
      onConfirmSelectFile(selectedFile), handleClose();
    }
  };

  return (
    <>
      <AppConfirmDialog
        dialogProps={{
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleShowConfirmRemoveClose,
          open: showConfirmRemove,
        }}
        onConfirm={handleDeleteFile}
        title={
          <FormattedMessage id="remove.image" defaultMessage="Remove Image" />
        }
      >
        <FormattedMessage
          id="do.you.really.want.to.delete.this.image"
          defaultMessage="Do you really want to delete this image?"
        />
      </AppConfirmDialog>
      <AppConfirmDialog
        dialogProps={{
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleShowConfirmEditClose,
          open: showConfirmEdit,
        }}
        onConfirm={handleEditFile}
        title={
          <FormattedMessage
            id="edit.image.name"
            defaultMessage="Edit image name"
          />
        }
      >
        <FormattedMessage
          id="do.you.really.want.to.edit.this.image"
          defaultMessage="Do you really want to edit this image?"
        />
      </AppConfirmDialog>
      <DeleteImageDialog
        dialogProps={{
          open: showDeleteImageDialog,
          maxWidth: 'xs',
          fullWidth: true,
          onClose: handleCloseDeleteFile,
        }}
        isLoading={deleteFileMutation.isLoading}
        isSuccess={deleteFileMutation.isSuccess}
        error={deleteFileMutation.error}
      />

      <Dialog {...dialogProps} onClose={handleClose}>
        <AppDialogTitle
          icon={<BrowseGalleryIcon />}
          title={<FormattedMessage id="gallery" defaultMessage="Gallery" />}
          onClose={handleClose}
        />
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid container item xs={12} justifyContent={'flex-end'}>
              <Box sx={{ pr: 2 }}>
                <input
                  onChange={handleChange}
                  type="file"
                  hidden
                  ref={inputRef}
                  accept="image/*, audio/*"
                />
                {isActive ? (
                  <Button variant="contained" onClick={handleClick}>
                    <FormattedMessage
                      id="add.image"
                      defaultMessage="Add Image"
                    />
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleConnectWallet}>
                    <FormattedMessage
                      id="connect.wallet"
                      defaultMessage="Connect wallet"
                    />
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            {file && (
              <Grid item xs={12} container justifyContent={'center'}>
                <Stack
                  spacing={2}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <CustomImage alt="" ref={imgRef} />
                  <Stack spacing={2} direction={'row'}>
                    <Button
                      color="primary"
                      variant="contained"
                      disabled={
                        fileUploadMutation.isLoading ||
                        fileUploadMutation.isSuccess ||
                        file?.size > MAX_ACCOUNT_FILE_UPLOAD_SIZE
                      }
                      onClick={onUploadFile}
                      startIcon={
                        fileUploadMutation.isLoading && (
                          <CircularProgress color="inherit" />
                        )
                      }
                    >
                      {fileUploadMutation.isLoading && (
                        <>
                          <FormattedMessage
                            id="uploading"
                            defaultMessage="Uploading"
                          />{' '}
                          {fileUploadProgress} %
                        </>
                      )}

                      {fileUploadMutation.isSuccess && (
                        <>
                          <FormattedMessage
                            id="uploaded"
                            defaultMessage="Uploaded"
                          />{' '}
                          {fileUploadProgress} %
                        </>
                      )}

                      {fileUploadMutation.isError && (
                        <>
                          <FormattedMessage
                            id="error.try.again"
                            defaultMessage="Error. Try again?"
                          />
                        </>
                      )}

                      {fileUploadMutation.isIdle && (
                        <FormattedMessage id="upload" defaultMessage="Upload" />
                      )}
                    </Button>

                    <Button
                      color="warning"
                      variant="contained"
                      onClick={() => {
                        setFile(undefined);
                        fileUploadMutation.reset();
                      }}
                    >
                      <FormattedMessage id="cancel" defaultMessage="Cancel" />
                    </Button>
                  </Stack>
                  <Box>
                    <Typography
                      variant={'body1'}
                      sx={{
                        color:
                          file?.size > MAX_ACCOUNT_FILE_UPLOAD_SIZE
                            ? 'error.main'
                            : undefined,
                      }}
                    >
                      <FormattedMessage
                        id="max.image.size"
                        defaultMessage="Max image size: 2 Mb"
                      />
                    </Typography>
                  </Box>

                  {fileUploadMutation.isError && (
                    <Box sx={{ p: 2 }}>
                      <FormattedMessage id="reason" defaultMessage="Reason" />:{' '}
                      {`${
                        (fileUploadMutation.error as any)?.response?.data
                          ?.message
                      }`}
                    </Box>
                  )}
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} container justifyContent={'flex-end'}>
              <TextField
                label={<FormattedMessage id="search" defaultMessage="Search" />}
                onChange={(ev) => setSearch(ev.currentTarget.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />
            </Grid>
            {!file && (
              <Grid item xs={12} container justifyContent={'center'}>
                {filesQuery.isSuccess && filesQuery.data?.total === 0 && (
                  <Stack
                    spacing={2}
                    justifyContent={'center'}
                    alignContent={'center'}
                    alignItems={'center'}
                  >
                    <CustomButton onClick={handleClick}>
                      <FormattedMessage
                        id="add.image"
                        defaultMessage="Add image"
                      />
                    </CustomButton>
                    {!search ? (
                      <>
                        <Typography>
                          <FormattedMessage
                            id="empty.gallery.start.adding.images"
                            defaultMessage="Empty gallery. Start adding images."
                          />
                        </Typography>
                        <Typography variant={'body1'}>
                          <FormattedMessage
                            id="max.image.size"
                            defaultMessage="Max image size: 1 Mb"
                          />
                        </Typography>
                      </>
                    ) : (
                      <Typography>
                        <FormattedMessage
                          id="no.images.found.with.that.name"
                          defaultMessage="No images found with that name."
                        />
                      </Typography>
                    )}
                  </Stack>
                )}
              </Grid>
            )}
            {!isActive && (
              <Grid item xs={12} container justifyContent={'center'}>
                <Stack
                  spacing={2}
                  justifyContent={'center'}
                  alignContent={'center'}
                  alignItems={'center'}
                >
                  <CustomButton onClick={handleConnectWallet}>
                    <FormattedMessage
                      id="connect.wallet"
                      defaultMessage="Connect wallet"
                    />
                  </CustomButton>
                  <Typography>
                    <FormattedMessage
                      id="connect.wallet.to.see.or.upload.images"
                      defaultMessage="Connect wallet to see or upload images."
                    />
                  </Typography>
                </Stack>
              </Grid>
            )}

            {filesQuery.isLoading && (
              <Grid item xs={12} container>
                <>
                  <Grid item xs={3}>
                    <Skeleton>
                      <CustomImage alt={''} src={''} />
                    </Skeleton>
                  </Grid>
                  <Grid item xs={3}>
                    <Skeleton>
                      <CustomImage alt={''} src={''} />
                    </Skeleton>
                  </Grid>
                  <Grid item xs={3}>
                    <Skeleton>
                      <CustomImage alt={''} src={''} />
                    </Skeleton>
                  </Grid>
                  <Grid item xs={3}>
                    <Skeleton>
                      <CustomImage alt={''} src={''} />
                    </Skeleton>
                  </Grid>
                </>
              </Grid>
            )}

            {filesQuery.data?.files?.map((f, key) => (
              <Grid item xs={3} key={key}>
                <Stack spacing={2}>
                  <Button
                    variant={selectedFile?.id === f.id ? 'contained' : 'text'}
                    onClick={() =>
                      selectedFile
                        ? selectedFile.id === f.id
                          ? setSelectedFile(undefined)
                          : setSelectedFile(f)
                        : setSelectedFile(f)
                    }
                  >
                    <CustomImage alt={f?.name || ''} src={f?.url || ''} />
                  </Button>
                  <Stack
                    spacing={1}
                    direction={'row'}
                    justifyContent={'space-around'}
                    alignContent={'center'}
                    alignItems={'center'}
                  >
                    <Box>
                      {editFileName === f.id ? (
                        <>
                          <TextField
                            defaultValue={f?.name}
                            onChange={(event) =>
                              setNewFileName(event.currentTarget.value)
                            }
                          />
                          <Box>
                            <IconButton
                              aria-label="edit"
                              onClick={() => setShowConfirmEdit(true)}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              aria-label="clear"
                              onClick={() => setEditFileName(undefined)}
                            >
                              <ClearIcon />
                            </IconButton>
                          </Box>
                        </>
                      ) : f?.name.length > 50 ? (
                        <Typography>{truncateText(f?.name, 10)}</Typography>
                      ) : (
                        <Typography
                          style={{
                            overflowWrap: 'break-word',
                            maxWidth: '160px',
                          }}
                        >
                          {f?.name}
                        </Typography>
                      )}
                    </Box>
                    {selectedFile?.id === f.id && (
                      <Box>
                        <IconButton
                          aria-label="delete"
                          onClick={() => setShowConfirmRemove(true)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          aria-label="edit"
                          onClick={() => setEditFileName(f.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Grid>
            ))}

            <Grid item xs={12} container justifyContent={'flex-end'}>
              {filesQuery.isSuccess &&
                filesQuery?.data &&
                filesQuery?.data?.total > 0 && (
                  <Pagination
                    page={page + 1}
                    onChange={(_ev, _page) => setPage(_page - 1)}
                    count={
                      Math.floor(
                        filesQuery?.data?.total / filesQuery?.data?.take
                      ) + 1
                    }
                  />
                )}
            </Grid>
          </Grid>
          {/*selectedFile && (
              <Grid item xs={3}>
                <Typography>
                  <FormattedMessage id="name" defaultMessage="Name" />
                </Typography>
                <Typography>{selectedFile?.name}</Typography>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => setShowConfirmRemove(true)}
                >
                  <FormattedMessage id="delete" defaultMessage="Delete" />
                </Button>
              </Grid>
            )*/}
        </DialogContent>
        <DialogActions>
          {selectedFile && (
            <Box sx={{ pr: 1 }}>
              <Typography>{selectedFile?.name}</Typography>
            </Box>
          )}

          <Button
            color="primary"
            variant="contained"
            onClick={handleConfirmSelectedFile}
            disabled={!selectedFile}
          >
            <FormattedMessage id="select.image" defaultMessage="Select Image" />
          </Button>
          <Button onClick={handleClose}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
