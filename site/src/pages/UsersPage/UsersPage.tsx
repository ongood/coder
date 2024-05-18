import { type FC, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getErrorMessage } from "api/errors";
import { deploymentConfig } from "api/queries/deployment";
import { groupsByUserId } from "api/queries/groups";
import { roles } from "api/queries/roles";
import {
  paginatedUsers,
  suspendUser,
  activateUser,
  deleteUser,
  updatePassword,
  updateRoles,
  authMethods,
} from "api/queries/users";
import type { User } from "api/typesGenerated";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { DeleteDialog } from "components/Dialogs/DeleteDialog/DeleteDialog";
import { useFilter } from "components/Filter/filter";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { isNonInitialPage } from "components/PaginationWidget/utils";
import { useAuthenticated } from "contexts/auth/RequireAuth";
import { usePaginatedQuery } from "hooks/usePaginatedQuery";
import { useDashboard } from "modules/dashboard/useDashboard";
import { pageTitle } from "utils/page";
import { generateRandomString } from "utils/random";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { useStatusFilterMenu } from "./UsersFilter";
import { UsersPageView } from "./UsersPageView";

export const UsersPage: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const searchParamsResult = useSearchParams();
  const { entitlements, organizationId } = useDashboard();
  const [searchParams] = searchParamsResult;

  const groupsByUserIdQuery = useQuery(groupsByUserId(organizationId));
  const authMethodsQuery = useQuery(authMethods());

  const { permissions, user: me } = useAuthenticated();
  const { updateUsers: canEditUsers, viewDeploymentValues } = permissions;
  const rolesQuery = useQuery(roles());
  const { data: deploymentValues } = useQuery({
    ...deploymentConfig(),
    enabled: viewDeploymentValues,
  });

  const usersQuery = usePaginatedQuery(paginatedUsers(searchParamsResult[0]));
  const useFilterResult = useFilter({
    searchParamsResult,
    onUpdate: usersQuery.goToFirstPage,
  });

  const statusMenu = useStatusFilterMenu({
    value: useFilterResult.values.status,
    onChange: (option) =>
      useFilterResult.update({
        ...useFilterResult.values,
        status: option?.value,
      }),
  });

  const [userToSuspend, setUserToSuspend] = useState<User>();
  const suspendUserMutation = useMutation(suspendUser(queryClient));

  const [userToActivate, setUserToActivate] = useState<User>();
  const activateUserMutation = useMutation(activateUser(queryClient));

  const [userToDelete, setUserToDelete] = useState<User>();
  const deleteUserMutation = useMutation(deleteUser(queryClient));

  const [confirmResetPassword, setConfirmResetPassword] = useState<{
    user: User;
    newPassword: string;
  }>();

  const updatePasswordMutation = useMutation(updatePassword());
  const updateRolesMutation = useMutation(updateRoles(queryClient));

  // Indicates if oidc roles are synced from the oidc idp.
  // Assign 'false' if unknown.
  const oidcRoleSyncEnabled =
    viewDeploymentValues &&
    deploymentValues?.config.oidc?.user_role_field !== "";

  const isLoading =
    usersQuery.isLoading ||
    rolesQuery.isLoading ||
    authMethodsQuery.isLoading ||
    groupsByUserIdQuery.isLoading;

  return (
    <>
      <Helmet>
        <title>{pageTitle("Users")}</title>
      </Helmet>

      <UsersPageView
        oidcRoleSyncEnabled={oidcRoleSyncEnabled}
        roles={rolesQuery.data}
        users={usersQuery.data?.users}
        groupsByUserId={groupsByUserIdQuery.data}
        authMethods={authMethodsQuery.data}
        onListWorkspaces={(user) => {
          navigate(
            "/workspaces?filter=" +
              encodeURIComponent(`owner:${user.username}`),
          );
        }}
        onViewActivity={(user) => {
          navigate(
            "/audit?filter=" + encodeURIComponent(`username:${user.username}`),
          );
        }}
        onDeleteUser={setUserToDelete}
        onSuspendUser={setUserToSuspend}
        onActivateUser={setUserToActivate}
        onResetUserPassword={(user) => {
          setConfirmResetPassword({
            user,
            newPassword: generateRandomString(12),
          });
        }}
        onUpdateUserRoles={async (user, roles) => {
          try {
            await updateRolesMutation.mutateAsync({
              userId: user.id,
              roles,
            });
            displaySuccess("成功更新了用户的角色。");
          } catch (e) {
            displayError(
              getErrorMessage(e, "更新用户角色出错。"),
            );
          }
        }}
        isUpdatingUserRoles={updateRolesMutation.isLoading}
        isLoading={isLoading}
        canEditUsers={canEditUsers}
        canViewActivity={entitlements.features.audit_log.enabled}
        isNonInitialPage={isNonInitialPage(searchParams)}
        actorID={me.id}
        filterProps={{
          filter: useFilterResult,
          error: usersQuery.error,
          menus: { status: statusMenu },
        }}
        usersQuery={usersQuery}
      />

      <DeleteDialog
        key={userToDelete?.username}
        isOpen={userToDelete !== undefined}
        confirmLoading={deleteUserMutation.isLoading}
        name={userToDelete?.username ?? ""}
        entity="用户"
        onCancel={() => setUserToDelete(undefined)}
        onConfirm={async () => {
          try {
            await deleteUserMutation.mutateAsync(userToDelete!.id);
            setUserToDelete(undefined);
            displaySuccess("成功删除用户。");
          } catch (e) {
            displayError(getErrorMessage(e, "删除用户出错。"));
          }
        }}
      />

      <ConfirmDialog
        type="delete"
        hideCancel={false}
        open={userToSuspend !== undefined}
        confirmLoading={suspendUserMutation.isLoading}
        title="暂停用户"
        confirmText="暂停"
        onClose={() => setUserToSuspend(undefined)}
        onConfirm={async () => {
          try {
            await suspendUserMutation.mutateAsync(userToSuspend!.id);
            setUserToSuspend(undefined);
            displaySuccess("成功暂停用户。");
          } catch (e) {
            displayError(getErrorMessage(e, "暂停用户时出错。"));
          }
        }}
        description={
          <>
            是否要暂停用户{" "}
            <strong>{userToSuspend?.username ?? ""}</strong>?
          </>
        }
      />

      <ConfirmDialog
        type="success"
        hideCancel={false}
        open={userToActivate !== undefined}
        confirmLoading={activateUserMutation.isLoading}
        title="激活用户"
        confirmText="激活"
        onClose={() => setUserToActivate(undefined)}
        onConfirm={async () => {
          try {
            await activateUserMutation.mutateAsync(userToActivate!.id);
            setUserToActivate(undefined);
            displaySuccess("成功激活用户。");
          } catch (e) {
            displayError(getErrorMessage(e, "激活用户出错。"));
          }
        }}
        description={
          <>
            是否要激活用户{" "}
            <strong>{userToActivate?.username ?? ""}</strong>?
          </>
        }
      />

      <ResetPasswordDialog
        key={confirmResetPassword?.user.username}
        open={confirmResetPassword !== undefined}
        loading={updatePasswordMutation.isLoading}
        user={confirmResetPassword?.user}
        newPassword={confirmResetPassword?.newPassword}
        onClose={() => {
          setConfirmResetPassword(undefined);
        }}
        onConfirm={async () => {
          try {
            await updatePasswordMutation.mutateAsync({
              userId: confirmResetPassword!.user.id,
              password: confirmResetPassword!.newPassword,
              old_password: "",
            });
            setConfirmResetPassword(undefined);
            displaySuccess("成功更新用户密码。");
          } catch (e) {
            displayError(
              getErrorMessage(e, "重置用户密码出错。"),
            );
          }
        }}
      />
    </>
  );
};

export default UsersPage;
