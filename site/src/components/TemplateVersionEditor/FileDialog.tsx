import TextField from "@mui/material/TextField"
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog"
import { Stack } from "components/Stack/Stack"
import { ChangeEvent, FC, useState } from "react"
import Typography from "@mui/material/Typography"
import { allowedExtensions, isAllowedFile } from "utils/templateVersion"
import { FileTree, isFolder, validatePath } from "utils/filetree"

export const CreateFileDialog: FC<{
  onClose: () => void
  checkExists: (path: string) => boolean
  onConfirm: (path: string) => void
  open: boolean
  fileTree: FileTree
}> = ({ checkExists, onClose, onConfirm, open, fileTree }) => {
  const [pathValue, setPathValue] = useState("")
  const [error, setError] = useState<string>()
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPathValue(event.target.value)
  }
  const handleConfirm = () => {
    if (pathValue === "") {
      setError("您必须输入路径！")
      return
    }
    if (checkExists(pathValue)) {
      setError("文件已存在")
      return
    }
    if (!isAllowedFile(pathValue)) {
      const extensions = allowedExtensions.join(", ")
      setError(
        `不允许使用此扩展名。您只能创建具有以下扩展名的文件：${extensions}。`,
      )
      return
    }
    const pathError = validatePath(pathValue, fileTree)
    if (pathError) {
      setError(pathError)
      return
    }
    onConfirm(pathValue)
    setError(undefined)
    setPathValue("")
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        onClose()
        setError(undefined)
        setPathValue("")
      }}
      onConfirm={handleConfirm}
      hideCancel={false}
      type="success"
      cancelText="取消"
      confirmText="创建"
      title="创建文件"
      description={
        <Stack>
          <Typography>
            指定要创建的文件的路径，该路径可以包含斜杠。
          </Typography>
          <TextField
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleConfirm()
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
  )
}

export const DeleteFileDialog: FC<{
  onClose: () => void
  onConfirm: () => void
  open: boolean
  filename: string
}> = ({ onClose, onConfirm, open, filename }) => {
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
  )
}

export const RenameFileDialog: FC<{
  onClose: () => void
  onConfirm: (filename: string) => void
  checkExists: (path: string) => boolean
  open: boolean
  filename: string
  fileTree: FileTree
}> = ({ checkExists, onClose, onConfirm, open, filename, fileTree }) => {
  const [pathValue, setPathValue] = useState(filename)
  const [error, setError] = useState<string>()
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPathValue(event.target.value)
  }
  const handleConfirm = () => {
    if (pathValue === "") {
      setError("您必须输入路径！")
      return
    }
    if (checkExists(pathValue)) {
      setError("文件已存在")
      return
    }
    if (!isAllowedFile(pathValue)) {
      const extensions = allowedExtensions.join(", ")
      setError(
        `不允许使用此扩展名。您只能使用以下扩展名重命名文件：${extensions}。`,
      )
      return
    }
    //Check if a folder is renamed to a file
    const [_, extension] = pathValue.split(".")
    if (isFolder(filename, fileTree) && extension) {
      setError(`文件夹不能重命名为文件。`)
      return
    }
    const pathError = validatePath(pathValue, fileTree)
    if (pathError) {
      setError(pathError)
      return
    }
    onConfirm(pathValue)
    setError(undefined)
    setPathValue("")
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        onClose()
        setError(undefined)
        setPathValue("")
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
                handleConfirm()
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
  )
}
