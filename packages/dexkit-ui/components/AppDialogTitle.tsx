import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";

export interface AppDialogTitleProps {
  title?: string | React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode | React.ReactNode[];
  onClose?: () => void;
  disableClose?: boolean;
}

export function AppDialogTitle({
  title,
  icon,
  onClose,
  disableClose,
}: AppDialogTitleProps) {
  return (
    <DialogTitle
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: "flex",
        justifyContent: "space-between",
        p: 2,
        alignItems: "center",
        alignContent: "center",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        alignContent="center"
      >
        {icon}
        <Typography variant="inherit">{title}</Typography>
      </Stack>
      {onClose && (
        <IconButton disabled={disableClose} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      )}
    </DialogTitle>
  );
}
