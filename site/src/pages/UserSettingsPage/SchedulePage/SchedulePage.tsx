import type { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  updateUserQuietHoursSchedule,
  userQuietHoursSchedule,
} from "api/queries/settings";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { displaySuccess } from "components/GlobalSnackbar/utils";
import { Loader } from "components/Loader/Loader";
import { useAuthenticated } from "contexts/auth/RequireAuth";
import { Section } from "../Section";
import { ScheduleForm } from "./ScheduleForm";

export const SchedulePage: FC = () => {
  const { user: me } = useAuthenticated();
  const queryClient = useQueryClient();

  const {
    data: quietHoursSchedule,
    error,
    isLoading,
    isError,
  } = useQuery(userQuietHoursSchedule(me.id));

  const {
    mutate: onSubmit,
    error: submitError,
    isLoading: mutationLoading,
  } = useMutation(updateUserQuietHoursSchedule(me.id, queryClient));

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }

  return (
    <Section
      title="静默时间"
      layout="fluid"
      description="工作区可能会在您的静默时间内自动更新，由管理员配置。"
    >
      <ScheduleForm
        isLoading={mutationLoading}
        initialValues={quietHoursSchedule}
        submitError={submitError}
        onSubmit={(values) => {
          onSubmit(values, {
            onSuccess: () => {
              displaySuccess("日程已成功更新");
            },
          });
        }}
      />
    </Section>
  );
};

export default SchedulePage;
