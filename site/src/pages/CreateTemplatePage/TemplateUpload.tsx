import Link from "@mui/material/Link";
import type { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import { FileUpload } from "components/FileUpload/FileUpload";

export interface TemplateUploadProps {
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  file?: File;
}

export const TemplateUpload: FC<TemplateUploadProps> = ({
  isUploading,
  onUpload,
  onRemove,
  file,
}) => {
  const description = (
    <>
      模板必须是 .tar 文件。您也可以使用我们的{" "}
      <Link
        component={RouterLink}
        to="/starter-templates"
        // Prevent trigger the upload
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        入门模板
      </Link>{" "}
      来开始使用 Coder。
    </>
  );

  return (
    <FileUpload
      isUploading={isUploading}
      onUpload={onUpload}
      onRemove={onRemove}
      file={file}
      removeLabel="Remove file"
      title="上传模板"
      description={description}
      extensions={["tar", "zip"]}
    />
  );
};
