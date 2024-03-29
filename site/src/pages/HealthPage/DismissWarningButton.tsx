import NotificationsOffOutlined from "@mui/icons-material/NotificationsOffOutlined";
import NotificationOutlined from "@mui/icons-material/NotificationsOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
import Skeleton from "@mui/material/Skeleton";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { healthSettings, updateHealthSettings } from "api/queries/debug";
import type { HealthSection } from "api/typesGenerated";
import { displaySuccess } from "components/GlobalSnackbar/utils";

export const DismissWarningButton = (props: { healthcheck: HealthSection }) => {
  const queryClient = useQueryClient();
  const healthSettingsQuery = useQuery(healthSettings());
  // They call the same mutation but are used in diff contexts so we don't want
  // to merge their states. Eg. You dismiss a warning and when it is done it
  // will show the enable button but since the mutation is still invalidating
  // other queries it will be in the loading state when it should be idle.
  const enableMutation = useMutation(updateHealthSettings(queryClient));
  const dismissMutation = useMutation(updateHealthSettings(queryClient));

  if (!healthSettingsQuery.data) {
    return (
      <Skeleton
        variant="rectangular"
        height={36}
        width={170}
        css={{ borderRadius: 8 }}
      />
    );
  }

  const { dismissed_healthchecks } = healthSettingsQuery.data;
  const isDismissed = dismissed_healthchecks.includes(props.healthcheck);

  if (isDismissed) {
    return (
      <LoadingButton
        disabled={healthSettingsQuery.isLoading}
        loading={enableMutation.isLoading}
        loadingPosition="start"
        startIcon={<NotificationsOffOutlined />}
        onClick={async () => {
          const updatedSettings = dismissed_healthchecks.filter(
            (dismissedHealthcheck) =>
              dismissedHealthcheck !== props.healthcheck,
          );
          await enableMutation.mutateAsync({
            dismissed_healthchecks: updatedSettings,
          });
          displaySuccess("警告已启用！");
        }}
      >
        允许警告
      </LoadingButton>
    );
  }

  return (
    <LoadingButton
      disabled={healthSettingsQuery.isLoading}
      loading={dismissMutation.isLoading}
      loadingPosition="start"
      startIcon={<NotificationOutlined />}
      onClick={async () => {
        const updatedSettings = [...dismissed_healthchecks, props.healthcheck];
        await dismissMutation.mutateAsync({
          dismissed_healthchecks: updatedSettings,
        });
        displaySuccess("警告已忽略！");
      }}
    >
      忽略警告
    </LoadingButton>
  );
};
