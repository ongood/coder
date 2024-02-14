const hours = (h: number) => (h === 1 ? "hour" : "hours");
const days = (d: number) => (d === 1 ? "day" : "days");

export const DefaultTTLHelperText = (props: { ttl?: number }) => {
  const { ttl = 0 } = props;

  // Error will show once field is considered touched
  if (ttl < 0) {
    return null;
  }

  if (ttl === 0) {
    return <span>工作空间将一直运行，直到手动停止。</span>;
  }

  return (
    <span>
      工作空间将在启动后默认在{ttl}小时后停止。
    </span>
  );
};

export const ActivityBumpHelperText = (props: { bump?: number }) => {
  const { bump = 0 } = props;

  // Error will show once field is considered touched
  if (bump < 0) {
    return null;
  }

  if (bump === 0) {
    return (
      <span>
        工作区不会根据用户活动自动延长其停止时间。用户仍然可以手动延迟停止时间。
      </span>
    );
  }

  return (
    <span>
      当检测到用户活动时，工作区将自动被推迟{bump}小时
    </span>
  );
};

export const MaxTTLHelperText = (props: { ttl?: number }) => {
  const { ttl = 0 } = props;

  // Error will show once field is considered touched
  if (ttl < 0) {
    return null;
  }

  if (ttl === 0) {
    return <span>工作区可能会无限期运行。</span>;
  }

  return (
    <span>
      无论是否有活动连接，工作区必须在启动后的{ttl}小时内停止。
    </span>
  );
};

export const FailureTTLHelperText = (props: { ttl?: number }) => {
  const { ttl = 0 } = props;

  // Error will show once field is considered touched
  if (ttl < 0) {
    return null;
  }

  if (ttl === 0) {
    return <span>Coder 不会自动停止失败的工作区。</span>;
  }

  return (
    <span>
      Coder 将在{ttl}天之后尝试停止失败的工作区。
    </span>
  );
};

export const DormancyTTLHelperText = (props: { ttl?: number }) => {
  const { ttl = 0 } = props;

  // Error will show once field is considered touched
  if (ttl < 0) {
    return null;
  }

  if (ttl === 0) {
    return <span>Coder 不会将工作区标记为休眠。</span>;
  }

  return (
    <span>
      在没有用户连接的情况下，Coder 将在{ttl}天后将工作区标记为休眠。
    </span>
  );
};

export const DormancyAutoDeletionTTLHelperText = (props: { ttl?: number }) => {
  const { ttl = 0 } = props;

  // Error will show once field is considered touched
  if (ttl < 0) {
    return null;
  }

  if (ttl === 0) {
    return <span>Coder 不会自动删除休眠工作区。</span>;
  }

  return (
    <span>
      Coder 将在{ttl}天后自动删除休眠工作区。
    </span>
  );
};
