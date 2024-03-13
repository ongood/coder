import type { FC } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { authMethods, createUser } from "api/queries/users";
import { displaySuccess } from "components/GlobalSnackbar/utils";
import { Margins } from "components/Margins/Margins";
import { useOrganizationId } from "contexts/auth/useOrganizationId";
import { pageTitle } from "utils/page";
import { CreateUserForm } from "./CreateUserForm";

export const Language = {
  unknownError: "糟糕，发生未知错误。",
}

export const CreateUserPage: FC = () => {
  const myOrgId = useOrganizationId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createUserMutation = useMutation(createUser(queryClient));
  const authMethodsQuery = useQuery(authMethods());

  return (
    <Margins>
      <Helmet>
        <title>{pageTitle("创建用户")}</title>
      </Helmet>

      <CreateUserForm
        error={createUserMutation.error}
        authMethods={authMethodsQuery.data}
        onSubmit={async (user) => {
          await createUserMutation.mutateAsync(user);
          displaySuccess("Successfully created user.");
          navigate("/users");
        }}
        onCancel={() => {
          navigate("/users");
        }}
        isLoading={createUserMutation.isLoading}
        myOrgId={myOrgId}
      />
    </Margins>
  );
};

export default CreateUserPage;
