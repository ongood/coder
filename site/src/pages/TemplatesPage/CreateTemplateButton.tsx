import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/AddOutlined";
import {
  MoreMenu,
  MoreMenuContent,
  MoreMenuItem,
  MoreMenuTrigger,
} from "components/MoreMenu/MoreMenu";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import UploadOutlined from "@mui/icons-material/UploadOutlined";
import Inventory2 from "@mui/icons-material/Inventory2";
import { FC } from "react";

type CreateTemplateButtonProps = {
  onNavigate: (path: string) => void;
};

export const CreateTemplateButton: FC<CreateTemplateButtonProps> = ({
  onNavigate,
}) => {
  return (
    <MoreMenu>
      <MoreMenuTrigger>
        <Button startIcon={<AddIcon />} variant="contained">
          创建模板
        </Button>
      </MoreMenuTrigger>
      <MoreMenuContent>
        <MoreMenuItem
          onClick={() => {
            onNavigate(`/templates/new?exampleId=scratch`);
          }}
        >
          <NoteAddOutlined />
           从头开始
        </MoreMenuItem>
        <MoreMenuItem
          onClick={() => {
            onNavigate("/templates/new");
          }}
        >
          <UploadOutlined />
           上传模板
        </MoreMenuItem>
        <MoreMenuItem
          onClick={() => {
            onNavigate("/starter-templates");
          }}
        >
          <Inventory2 />
            选择一个入门模板
        </MoreMenuItem>
      </MoreMenuContent>
    </MoreMenu>
  );
};
