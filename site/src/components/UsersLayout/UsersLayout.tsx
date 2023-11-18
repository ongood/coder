import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import GroupAdd from "@mui/icons-material/GroupAddOutlined";
import PersonAdd from "@mui/icons-material/PersonAddOutlined";
import { USERS_LINK } from "components/Dashboard/Navbar/NavbarView";
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader";
import { useFeatureVisibility } from "hooks/useFeatureVisibility";
import { usePermissions } from "hooks/usePermissions";
import { FC, Suspense } from "react";
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import { Margins } from "components/Margins/Margins";
import { TabLink, Tabs } from "components/Tabs/Tabs";
import { Loader } from "components/Loader/Loader";

export const UsersLayout: FC = () => {
  const { createUser: canCreateUser, createGroup: canCreateGroup } =
    usePermissions();
  const navigate = useNavigate();
  const { template_rbac: isTemplateRBACEnabled } = useFeatureVisibility();

  return (
    <>
      <Margins>
        <PageHeader
          actions={
            <>
              {canCreateUser && (
                <Button
                  onClick={() => {
                    navigate("/users/create");
                  }}
                  startIcon={<PersonAdd />}
                >
                  创建用户
                </Button>
              )}
              {canCreateGroup && isTemplateRBACEnabled && (
                <Link component={RouterLink} to="/groups/create">
                  <Button startIcon={<GroupAdd />}>创建用户组</Button>
                </Link>
              )}
            </>
          }
        >
          <PageHeaderTitle>用户</PageHeaderTitle>
        </PageHeader>
      </Margins>

      <Tabs>
        <TabLink to={USERS_LINK}>Users</TabLink>
        <TabLink to="/groups">Groups</TabLink>
      </Tabs>

      <Margins>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </Margins>
    </>
  );
};
