import TextField from "@mui/material/TextField";
import { type ChangeEvent, type FC, useState } from "react";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { Stack } from "components/Stack/Stack";
import { type FileTree, isFolder, validatePath } from "utils/filetree";

interface CreateFileDialogProps {
  onClose: () => void;
  checkExists: (path: string) => boolean;
  onConfirm: (path: string) => void;
  open: boolean;
  fileTree: FileTree;
}

export const CreateFileDialog: FC<CreateFileDialogProps> = ({
  checkExists,
  onClose,
  onConfirm,
  open,
  fileTree,
}) => {
  const [pathValue, setPathValue] = useState("");
  const [error, setError] = useState<string>();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPathValue(event.target.value);
  };
  const handleConfirm = () => {
    if (pathValue === "") {
      setError("您必须输入路径！");
      return
    }
    if (checkExists(pathValue)) {
      setError("文件已存在");
      return
    }
    const pathError = validatePath(pathValue, fileTree);
    if (pathError) {
      setError(pathError);
      return;
    }
    onConfirm(pathValue);
    setError(undefined);
    setPathValue("");
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        onClose();
        setError(undefined);
        setPathValue("");
      }}
      onConfirm={handleConfirm}
      hideCancel={false}
      type="success"
      cancelText="取消"
      confirmText="创建"
      title="创建文件"
      description={
        <Stack spacing={4}>
          <p>
            指定要创建的文件路径。该路径也可以包含斜杠。
          </p>
          <TextField
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleConfirm();
              }
            }}
            error={Boolean(error)}
            helperText={error}
            name="file-path"
            autoComplete="off"
            id="file-path"
            placeholder="example.tf"
            value={pathValue}
            onChange={handleChange}
            label="文件路径"
          />
        </Stack>
      }
    />
  );
};

interface DeleteFileDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  filename: string;
}

export const DeleteFileDialog: FC<DeleteFileDialogProps> = ({
  onClose,
  onConfirm,
  open,
  filename,
}) => {
  return (
    <ConfirmDialog
      type="delete"
      onClose={onClose}
      open={open}
      onConfirm={onConfirm}
      title="删除文件"
      description={
        <>
          您确定要删除<strong>{filename}</strong>吗？它将被永久删除。
        </>
      }
    />
  );
};

interface RenameFileDialogProps {
  onClose: () => void;
  onConfirm: (filename: string) => void;
  checkExists: (path: string) => boolean;
  open: boolean;
  filename: string;
  fileTree: FileTree;
}

export const RenameFileDialog: FC<RenameFileDialogProps> = ({
  checkExists,
  onClose,
  onConfirm,
  open,
  filename,
  fileTree,
}) => {
  const [pathValue, setPathValue] = useState(filename);
  const [error, setError] = useState<string>();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPathValue(event.target.value);
  };
  const handleConfirm = () => {
    if (pathValue === "") {
      setError("您必须输入路径！");
      return
    }
    if (checkExists(pathValue)) {
      setError("文件已存在");
      return
    }
    //Check if a folder is renamed to a file
    const [_, extension] = pathValue.split(".");
    if (isFolder(filename, fileTree) && extension) {
      setError(`文件夹不能重命名为文件。`);
      return
    }
    const pathError = validatePath(pathValue, fileTree);
    if (pathError) {
      setError(pathError);
      return;
    }
    onConfirm(pathValue);
    setError(undefined);
    setPathValue("");
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        onClose();
        setError(undefined);
        setPathValue("");
      }}
      onConfirm={handleConfirm}
      hideCancel={false}
      type="success"
      cancelText="取消"
      confirmText="重命名"
      title="文件重命名"
      description={
        <Stack>
          <p>
            将<strong>{filename}</strong>重命名为其他名称。此路径也可以包含斜杠！
          </p>
          <TextField
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleConfirm();
              }
            }}
            error={Boolean(error)}
            helperText={error}
            name="file-path"
            autoComplete="off"
            id="file-path"
            placeholder={filename}
            value={pathValue}
            onChange={handleChange}
            label="文件路径"
          />
        </Stack>
      }
    />
  );
};
