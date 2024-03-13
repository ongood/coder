import GroupAdd from "@mui/icons-material/GroupAddOutlined";
import PersonAdd from "@mui/icons-material/PersonAddOutlined";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { type FC, Suspense } from "react";
import {
  Link as RouterLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Loader } from "components/Loader/Loader";
import { Margins } from "components/Margins/Margins";
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader";
import { TAB_PADDING_Y, TabLink, Tabs, TabsList } from "components/Tabs/Tabs";
import { usePermissions } from "contexts/auth/usePermissions";
import { USERS_LINK } from "modules/dashboard/Navbar/NavbarView";
import { useFeatureVisibility } from "modules/dashboard/useFeatureVisibility";

export const UsersLayout: FC = () => {
  const { createUser: canCreateUser, createGroup: canCreateGroup } =
    usePermissions();
  const navigate = useNavigate();
  const { template_rbac: isTemplateRBACEnabled } = useFeatureVisibility();
  const location = useLocation();
  const activeTab = location.pathname.endsWith("groups") ? "groups" : "users";

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
                  <Button startIcon={<GroupAdd />}>创建组</Button>
                </Link>
              )}
            </>
          }
        >
          <PageHeaderTitle>用户</PageHeaderTitle>
        </PageHeader>
      </Margins>

      <Tabs
        css={{ marginBottom: 40, marginTop: -TAB_PADDING_Y }}
        active={activeTab}
      >
        <Margins>
          <TabsList>
            <TabLink to={USERS_LINK} value="users">
              用户
            </TabLink>
            <TabLink to="/groups" value="groups">
              组
            </TabLink>
          </TabsList>
        </Margins>
      </Tabs>

      <Margins>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </Margins>
    </>
  );
};
