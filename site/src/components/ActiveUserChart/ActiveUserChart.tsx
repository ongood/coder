import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  defaults,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  PointElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import {
  HelpTooltip,
  HelpTooltipTitle,
  HelpTooltipText,
  HelpTooltipContent,
  HelpTooltipTrigger,
} from "components/HelpTooltip/HelpTooltip";
import dayjs from "dayjs";
import { useTheme } from "@emotion/react";
import { type FC } from "react";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

const USER_LIMIT_DISPLAY_THRESHOLD = 60;

export interface ActiveUserChartProps {
  data: Array<{ date: string; amount: number }>;
  interval: "day" | "week";
  userLimit: number | undefined;
}

export const ActiveUserChart: FC<ActiveUserChartProps> = ({
  data,
  interval,
  userLimit,
}) => {
  const theme = useTheme();

  const labels = data.map((val) => dayjs(val.date).format("YYYY-MM-DD"));
  const chartData = data.map((val) => val.amount);

  defaults.font.family = theme.typography.fontFamily as string;
  defaults.color = theme.palette.text.secondary;

  const options: ChartOptions<"line"> = {
    responsive: true,
    animation: false,
    plugins: {
      annotation: {
        annotations: [
          {
            type: "line",
            scaleID: "y",
            display: shouldDisplayUserLimit(userLimit, chartData),
            value: userLimit,
            borderColor: theme.palette.secondary.contrastText,
            borderWidth: 5,
            label: {
              content: "User limit",
              color: theme.palette.primary.contrastText,
              display: true,
              font: { weight: "normal" },
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString();
          },
        },
      },
    },
    scales: {
      y: {
        grid: { color: theme.palette.divider },
        suggestedMin: 0,
        ticks: {
          precision: 0,
        },
      },

      x: {
        grid: { color: theme.palette.divider },
        ticks: {
          stepSize: data.length > 10 ? 2 : undefined,
        },
        type: "time",
        time: {
          unit: interval,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Line
      data-chromatic="ignore"
      data={{
        labels: labels,
        datasets: [
          {
            label: `${interval === "day" ? "Daily" : "Weekly"} Active Users`,
            data: chartData,
            pointBackgroundColor: theme.roles.active.outline,
            pointBorderColor: theme.roles.active.outline,
            borderColor: theme.roles.active.outline,
          },
        ],
      }}
      options={options}
    />
  );
};

export const ActiveUsersTitle: FC = () => {
  return (
    <div css={{ display: "flex", alignItems: "center", gap: 8 }}>
      活跃用户
      <HelpTooltip>
        <HelpTooltipTrigger size="small" />
        <HelpTooltipContent>
          <HelpTooltipTitle>我们如何计算活跃用户呢？</HelpTooltipTitle>
          <HelpTooltipText>
            当连接到用户的工作区时，他们被视为活跃用户。例如，应用程序、Web 终端、SSH。
          </HelpTooltipText>
        </HelpTooltipContent>
      </HelpTooltip>
    </div>
  );
};

function shouldDisplayUserLimit(
  userLimit: number | undefined,
  activeUsers: number[],
): boolean {
  if (!userLimit || activeUsers.length === 0) {
    return false;
  }
  return (
    Math.max(...activeUsers) >= (userLimit * USER_LIMIT_DISPLAY_THRESHOLD) / 100
  );
}
