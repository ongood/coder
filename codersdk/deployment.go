package codersdk

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"golang.org/x/mod/semver"
	"golang.org/x/xerrors"

	"github.com/coreos/go-oidc/v3/oidc"

	"github.com/coder/coder/v2/buildinfo"
	"github.com/coder/coder/v2/coderd/agentmetrics"
	"github.com/coder/coder/v2/coderd/workspaceapps/appurl"
	"github.com/coder/serpent"
)

// Entitlement represents whether a feature is licensed.
type Entitlement string

const (
	EntitlementEntitled    Entitlement = "entitled"
	EntitlementGracePeriod Entitlement = "grace_period"
	EntitlementNotEntitled Entitlement = "not_entitled"
)

// FeatureName represents the internal name of a feature.
// To add a new feature, add it to this set of enums as well as the FeatureNames
// array below.
type FeatureName string

const (
	FeatureUserLimit                  FeatureName = "user_limit"
	FeatureAuditLog                   FeatureName = "audit_log"
	FeatureBrowserOnly                FeatureName = "browser_only"
	FeatureSCIM                       FeatureName = "scim"
	FeatureTemplateRBAC               FeatureName = "template_rbac"
	FeatureUserRoleManagement         FeatureName = "user_role_management"
	FeatureHighAvailability           FeatureName = "high_availability"
	FeatureMultipleExternalAuth       FeatureName = "multiple_external_auth"
	FeatureExternalProvisionerDaemons FeatureName = "external_provisioner_daemons"
	FeatureAppearance                 FeatureName = "appearance"
	FeatureAdvancedTemplateScheduling FeatureName = "advanced_template_scheduling"
	FeatureWorkspaceProxy             FeatureName = "workspace_proxy"
	FeatureExternalTokenEncryption    FeatureName = "external_token_encryption"
	FeatureWorkspaceBatchActions      FeatureName = "workspace_batch_actions"
	FeatureAccessControl              FeatureName = "access_control"
	FeatureOAuth2Provider             FeatureName = "oauth2_provider"
	FeatureControlSharedPorts         FeatureName = "control_shared_ports"
)

// FeatureNames must be kept in-sync with the Feature enum above.
var FeatureNames = []FeatureName{
	FeatureUserLimit,
	FeatureAuditLog,
	FeatureBrowserOnly,
	FeatureSCIM,
	FeatureTemplateRBAC,
	FeatureHighAvailability,
	FeatureMultipleExternalAuth,
	FeatureExternalProvisionerDaemons,
	FeatureAppearance,
	FeatureAdvancedTemplateScheduling,
	FeatureWorkspaceProxy,
	FeatureUserRoleManagement,
	FeatureExternalTokenEncryption,
	FeatureWorkspaceBatchActions,
	FeatureAccessControl,
	FeatureOAuth2Provider,
	FeatureControlSharedPorts,
}

// Humanize returns the feature name in a human-readable format.
func (n FeatureName) Humanize() string {
	switch n {
	case FeatureTemplateRBAC:
		return "Template RBAC"
	case FeatureSCIM:
		return "SCIM"
	case FeatureOAuth2Provider:
		return "OAuth Provider"
	default:
		return strings.Title(strings.ReplaceAll(string(n), "_", " "))
	}
}

// AlwaysEnable returns if the feature is always enabled if entitled.
// Warning: We don't know if we need this functionality.
// This method may disappear at any time.
func (n FeatureName) AlwaysEnable() bool {
	return map[FeatureName]bool{
		FeatureMultipleExternalAuth:       true,
		FeatureExternalProvisionerDaemons: true,
		FeatureAppearance:                 true,
		FeatureWorkspaceBatchActions:      true,
		FeatureHighAvailability:           true,
	}[n]
}

type Feature struct {
	Entitlement Entitlement `json:"entitlement"`
	Enabled     bool        `json:"enabled"`
	Limit       *int64      `json:"limit,omitempty"`
	Actual      *int64      `json:"actual,omitempty"`
}

type Entitlements struct {
	Features         map[FeatureName]Feature `json:"features"`
	Warnings         []string                `json:"warnings"`
	Errors           []string                `json:"errors"`
	HasLicense       bool                    `json:"has_license"`
	Trial            bool                    `json:"trial"`
	RequireTelemetry bool                    `json:"require_telemetry"`
	RefreshedAt      time.Time               `json:"refreshed_at" format:"date-time"`
}

func (c *Client) Entitlements(ctx context.Context) (Entitlements, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/entitlements", nil)
	if err != nil {
		return Entitlements{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return Entitlements{}, ReadBodyAsError(res)
	}
	var ent Entitlements
	return ent, json.NewDecoder(res.Body).Decode(&ent)
}

type PostgresAuth string

const (
	PostgresAuthPassword  PostgresAuth = "password"
	PostgresAuthAWSIAMRDS PostgresAuth = "awsiamrds"
)

var PostgresAuthDrivers = []string{
	string(PostgresAuthPassword),
	string(PostgresAuthAWSIAMRDS),
}

// DeploymentValues is the central configuration values the coder server.
type DeploymentValues struct {
	Verbose             serpent.Bool   `json:"verbose,omitempty"`
	AccessURL           serpent.URL    `json:"access_url,omitempty"`
	WildcardAccessURL   serpent.String `json:"wildcard_access_url,omitempty"`
	DocsURL             serpent.URL    `json:"docs_url,omitempty"`
	RedirectToAccessURL serpent.Bool   `json:"redirect_to_access_url,omitempty"`
	// HTTPAddress is a string because it may be set to zero to disable.
	HTTPAddress                     serpent.String                       `json:"http_address,omitempty" typescript:",notnull"`
	AutobuildPollInterval           serpent.Duration                     `json:"autobuild_poll_interval,omitempty"`
	JobHangDetectorInterval         serpent.Duration                     `json:"job_hang_detector_interval,omitempty"`
	DERP                            DERP                                 `json:"derp,omitempty" typescript:",notnull"`
	Prometheus                      PrometheusConfig                     `json:"prometheus,omitempty" typescript:",notnull"`
	Pprof                           PprofConfig                          `json:"pprof,omitempty" typescript:",notnull"`
	ProxyTrustedHeaders             serpent.StringArray                  `json:"proxy_trusted_headers,omitempty" typescript:",notnull"`
	ProxyTrustedOrigins             serpent.StringArray                  `json:"proxy_trusted_origins,omitempty" typescript:",notnull"`
	CacheDir                        serpent.String                       `json:"cache_directory,omitempty" typescript:",notnull"`
	InMemoryDatabase                serpent.Bool                         `json:"in_memory_database,omitempty" typescript:",notnull"`
	PostgresURL                     serpent.String                       `json:"pg_connection_url,omitempty" typescript:",notnull"`
	PostgresAuth                    string                               `json:"pg_auth,omitempty" typescript:",notnull"`
	OAuth2                          OAuth2Config                         `json:"oauth2,omitempty" typescript:",notnull"`
	OIDC                            OIDCConfig                           `json:"oidc,omitempty" typescript:",notnull"`
	Telemetry                       TelemetryConfig                      `json:"telemetry,omitempty" typescript:",notnull"`
	TLS                             TLSConfig                            `json:"tls,omitempty" typescript:",notnull"`
	Trace                           TraceConfig                          `json:"trace,omitempty" typescript:",notnull"`
	SecureAuthCookie                serpent.Bool                         `json:"secure_auth_cookie,omitempty" typescript:",notnull"`
	StrictTransportSecurity         serpent.Int64                        `json:"strict_transport_security,omitempty" typescript:",notnull"`
	StrictTransportSecurityOptions  serpent.StringArray                  `json:"strict_transport_security_options,omitempty" typescript:",notnull"`
	SSHKeygenAlgorithm              serpent.String                       `json:"ssh_keygen_algorithm,omitempty" typescript:",notnull"`
	MetricsCacheRefreshInterval     serpent.Duration                     `json:"metrics_cache_refresh_interval,omitempty" typescript:",notnull"`
	AgentStatRefreshInterval        serpent.Duration                     `json:"agent_stat_refresh_interval,omitempty" typescript:",notnull"`
	AgentFallbackTroubleshootingURL serpent.URL                          `json:"agent_fallback_troubleshooting_url,omitempty" typescript:",notnull"`
	BrowserOnly                     serpent.Bool                         `json:"browser_only,omitempty" typescript:",notnull"`
	SCIMAPIKey                      serpent.String                       `json:"scim_api_key,omitempty" typescript:",notnull"`
	ExternalTokenEncryptionKeys     serpent.StringArray                  `json:"external_token_encryption_keys,omitempty" typescript:",notnull"`
	Provisioner                     ProvisionerConfig                    `json:"provisioner,omitempty" typescript:",notnull"`
	RateLimit                       RateLimitConfig                      `json:"rate_limit,omitempty" typescript:",notnull"`
	Experiments                     serpent.StringArray                  `json:"experiments,omitempty" typescript:",notnull"`
	UpdateCheck                     serpent.Bool                         `json:"update_check,omitempty" typescript:",notnull"`
	MaxTokenLifetime                serpent.Duration                     `json:"max_token_lifetime,omitempty" typescript:",notnull"`
	Swagger                         SwaggerConfig                        `json:"swagger,omitempty" typescript:",notnull"`
	Logging                         LoggingConfig                        `json:"logging,omitempty" typescript:",notnull"`
	Dangerous                       DangerousConfig                      `json:"dangerous,omitempty" typescript:",notnull"`
	DisablePathApps                 serpent.Bool                         `json:"disable_path_apps,omitempty" typescript:",notnull"`
	SessionDuration                 serpent.Duration                     `json:"max_session_expiry,omitempty" typescript:",notnull"`
	DisableSessionExpiryRefresh     serpent.Bool                         `json:"disable_session_expiry_refresh,omitempty" typescript:",notnull"`
	DisablePasswordAuth             serpent.Bool                         `json:"disable_password_auth,omitempty" typescript:",notnull"`
	Support                         SupportConfig                        `json:"support,omitempty" typescript:",notnull"`
	ExternalAuthConfigs             serpent.Struct[[]ExternalAuthConfig] `json:"external_auth,omitempty" typescript:",notnull"`
	SSHConfig                       SSHConfig                            `json:"config_ssh,omitempty" typescript:",notnull"`
	WgtunnelHost                    serpent.String                       `json:"wgtunnel_host,omitempty" typescript:",notnull"`
	DisableOwnerWorkspaceExec       serpent.Bool                         `json:"disable_owner_workspace_exec,omitempty" typescript:",notnull"`
	ProxyHealthStatusInterval       serpent.Duration                     `json:"proxy_health_status_interval,omitempty" typescript:",notnull"`
	EnableTerraformDebugMode        serpent.Bool                         `json:"enable_terraform_debug_mode,omitempty" typescript:",notnull"`
	UserQuietHoursSchedule          UserQuietHoursScheduleConfig         `json:"user_quiet_hours_schedule,omitempty" typescript:",notnull"`
	WebTerminalRenderer             serpent.String                       `json:"web_terminal_renderer,omitempty" typescript:",notnull"`
	AllowWorkspaceRenames           serpent.Bool                         `json:"allow_workspace_renames,omitempty" typescript:",notnull"`
	Healthcheck                     HealthcheckConfig                    `json:"healthcheck,omitempty" typescript:",notnull"`
	CLIUpgradeMessage               serpent.String                       `json:"cli_upgrade_message,omitempty" typescript:",notnull"`

	Config      serpent.YAMLConfigPath `json:"config,omitempty" typescript:",notnull"`
	WriteConfig serpent.Bool           `json:"write_config,omitempty" typescript:",notnull"`

	// DEPRECATED: Use HTTPAddress or TLS.Address instead.
	Address serpent.HostPort `json:"address,omitempty" typescript:",notnull"`
}

// SSHConfig is configuration the cli & vscode extension use for configuring
// ssh connections.
type SSHConfig struct {
	// DeploymentName is the config-ssh Hostname prefix
	DeploymentName serpent.String
	// SSHConfigOptions are additional options to add to the ssh config file.
	// This will override defaults.
	SSHConfigOptions serpent.StringArray
}

func (c SSHConfig) ParseOptions() (map[string]string, error) {
	m := make(map[string]string)
	for _, opt := range c.SSHConfigOptions {
		key, value, err := ParseSSHConfigOption(opt)
		if err != nil {
			return nil, err
		}
		m[key] = value
	}
	return m, nil
}

// ParseSSHConfigOption parses a single ssh config option into it's key/value pair.
func ParseSSHConfigOption(opt string) (key string, value string, err error) {
	// An equal sign or whitespace is the separator between the key and value.
	idx := strings.IndexFunc(opt, func(r rune) bool {
		return r == ' ' || r == '='
	})
	if idx == -1 {
		return "", "", xerrors.Errorf("invalid config-ssh option %q", opt)
	}
	return opt[:idx], opt[idx+1:], nil
}

type DERP struct {
	Server DERPServerConfig `json:"server" typescript:",notnull"`
	Config DERPConfig       `json:"config" typescript:",notnull"`
}

type DERPServerConfig struct {
	Enable        serpent.Bool        `json:"enable" typescript:",notnull"`
	RegionID      serpent.Int64       `json:"region_id" typescript:",notnull"`
	RegionCode    serpent.String      `json:"region_code" typescript:",notnull"`
	RegionName    serpent.String      `json:"region_name" typescript:",notnull"`
	STUNAddresses serpent.StringArray `json:"stun_addresses" typescript:",notnull"`
	RelayURL      serpent.URL         `json:"relay_url" typescript:",notnull"`
}

type DERPConfig struct {
	BlockDirect     serpent.Bool   `json:"block_direct" typescript:",notnull"`
	ForceWebSockets serpent.Bool   `json:"force_websockets" typescript:",notnull"`
	URL             serpent.String `json:"url" typescript:",notnull"`
	Path            serpent.String `json:"path" typescript:",notnull"`
}

type PrometheusConfig struct {
	Enable                serpent.Bool        `json:"enable" typescript:",notnull"`
	Address               serpent.HostPort    `json:"address" typescript:",notnull"`
	CollectAgentStats     serpent.Bool        `json:"collect_agent_stats" typescript:",notnull"`
	CollectDBMetrics      serpent.Bool        `json:"collect_db_metrics" typescript:",notnull"`
	AggregateAgentStatsBy serpent.StringArray `json:"aggregate_agent_stats_by" typescript:",notnull"`
}

type PprofConfig struct {
	Enable  serpent.Bool     `json:"enable" typescript:",notnull"`
	Address serpent.HostPort `json:"address" typescript:",notnull"`
}

type OAuth2Config struct {
	Github OAuth2GithubConfig `json:"github" typescript:",notnull"`
}

type OAuth2GithubConfig struct {
	ClientID          serpent.String      `json:"client_id" typescript:",notnull"`
	ClientSecret      serpent.String      `json:"client_secret" typescript:",notnull"`
	AllowedOrgs       serpent.StringArray `json:"allowed_orgs" typescript:",notnull"`
	AllowedTeams      serpent.StringArray `json:"allowed_teams" typescript:",notnull"`
	AllowSignups      serpent.Bool        `json:"allow_signups" typescript:",notnull"`
	AllowEveryone     serpent.Bool        `json:"allow_everyone" typescript:",notnull"`
	EnterpriseBaseURL serpent.String      `json:"enterprise_base_url" typescript:",notnull"`
}

type OIDCConfig struct {
	AllowSignups serpent.Bool   `json:"allow_signups" typescript:",notnull"`
	ClientID     serpent.String `json:"client_id" typescript:",notnull"`
	ClientSecret serpent.String `json:"client_secret" typescript:",notnull"`
	// ClientKeyFile & ClientCertFile are used in place of ClientSecret for PKI auth.
	ClientKeyFile       serpent.String                      `json:"client_key_file" typescript:",notnull"`
	ClientCertFile      serpent.String                      `json:"client_cert_file" typescript:",notnull"`
	EmailDomain         serpent.StringArray                 `json:"email_domain" typescript:",notnull"`
	IssuerURL           serpent.String                      `json:"issuer_url" typescript:",notnull"`
	Scopes              serpent.StringArray                 `json:"scopes" typescript:",notnull"`
	IgnoreEmailVerified serpent.Bool                        `json:"ignore_email_verified" typescript:",notnull"`
	UsernameField       serpent.String                      `json:"username_field" typescript:",notnull"`
	EmailField          serpent.String                      `json:"email_field" typescript:",notnull"`
	AuthURLParams       serpent.Struct[map[string]string]   `json:"auth_url_params" typescript:",notnull"`
	IgnoreUserInfo      serpent.Bool                        `json:"ignore_user_info" typescript:",notnull"`
	GroupAutoCreate     serpent.Bool                        `json:"group_auto_create" typescript:",notnull"`
	GroupRegexFilter    serpent.Regexp                      `json:"group_regex_filter" typescript:",notnull"`
	GroupAllowList      serpent.StringArray                 `json:"group_allow_list" typescript:",notnull"`
	GroupField          serpent.String                      `json:"groups_field" typescript:",notnull"`
	GroupMapping        serpent.Struct[map[string]string]   `json:"group_mapping" typescript:",notnull"`
	UserRoleField       serpent.String                      `json:"user_role_field" typescript:",notnull"`
	UserRoleMapping     serpent.Struct[map[string][]string] `json:"user_role_mapping" typescript:",notnull"`
	UserRolesDefault    serpent.StringArray                 `json:"user_roles_default" typescript:",notnull"`
	SignInText          serpent.String                      `json:"sign_in_text" typescript:",notnull"`
	IconURL             serpent.URL                         `json:"icon_url" typescript:",notnull"`
	SignupsDisabledText serpent.String                      `json:"signups_disabled_text" typescript:",notnull"`
}

type TelemetryConfig struct {
	Enable serpent.Bool `json:"enable" typescript:",notnull"`
	Trace  serpent.Bool `json:"trace" typescript:",notnull"`
	URL    serpent.URL  `json:"url" typescript:",notnull"`
}

type TLSConfig struct {
	Enable               serpent.Bool        `json:"enable" typescript:",notnull"`
	Address              serpent.HostPort    `json:"address" typescript:",notnull"`
	RedirectHTTP         serpent.Bool        `json:"redirect_http" typescript:",notnull"`
	CertFiles            serpent.StringArray `json:"cert_file" typescript:",notnull"`
	ClientAuth           serpent.String      `json:"client_auth" typescript:",notnull"`
	ClientCAFile         serpent.String      `json:"client_ca_file" typescript:",notnull"`
	KeyFiles             serpent.StringArray `json:"key_file" typescript:",notnull"`
	MinVersion           serpent.String      `json:"min_version" typescript:",notnull"`
	ClientCertFile       serpent.String      `json:"client_cert_file" typescript:",notnull"`
	ClientKeyFile        serpent.String      `json:"client_key_file" typescript:",notnull"`
	SupportedCiphers     serpent.StringArray `json:"supported_ciphers" typescript:",notnull"`
	AllowInsecureCiphers serpent.Bool        `json:"allow_insecure_ciphers" typescript:",notnull"`
}

type TraceConfig struct {
	Enable          serpent.Bool   `json:"enable" typescript:",notnull"`
	HoneycombAPIKey serpent.String `json:"honeycomb_api_key" typescript:",notnull"`
	CaptureLogs     serpent.Bool   `json:"capture_logs" typescript:",notnull"`
	DataDog         serpent.Bool   `json:"data_dog" typescript:",notnull"`
}

type ExternalAuthConfig struct {
	// Type is the type of external auth config.
	Type         string `json:"type" yaml:"type"`
	ClientID     string `json:"client_id" yaml:"client_id"`
	ClientSecret string `json:"-" yaml:"client_secret"`
	// ID is a unique identifier for the auth config.
	// It defaults to `type` when not provided.
	ID                  string   `json:"id" yaml:"id"`
	AuthURL             string   `json:"auth_url" yaml:"auth_url"`
	TokenURL            string   `json:"token_url" yaml:"token_url"`
	ValidateURL         string   `json:"validate_url" yaml:"validate_url"`
	AppInstallURL       string   `json:"app_install_url" yaml:"app_install_url"`
	AppInstallationsURL string   `json:"app_installations_url" yaml:"app_installations_url"`
	NoRefresh           bool     `json:"no_refresh" yaml:"no_refresh"`
	Scopes              []string `json:"scopes" yaml:"scopes"`
	ExtraTokenKeys      []string `json:"extra_token_keys" yaml:"extra_token_keys"`
	DeviceFlow          bool     `json:"device_flow" yaml:"device_flow"`
	DeviceCodeURL       string   `json:"device_code_url" yaml:"device_code_url"`
	// Regex allows API requesters to match an auth config by
	// a string (e.g. coder.com) instead of by it's type.
	//
	// Git clone makes use of this by parsing the URL from:
	// 'Username for "https://github.com":'
	// And sending it to the Coder server to match against the Regex.
	Regex string `json:"regex" yaml:"regex"`
	// DisplayName is shown in the UI to identify the auth config.
	DisplayName string `json:"display_name" yaml:"display_name"`
	// DisplayIcon is a URL to an icon to display in the UI.
	DisplayIcon string `json:"display_icon" yaml:"display_icon"`
}

type ProvisionerConfig struct {
	Daemons             serpent.Int64    `json:"daemons" typescript:",notnull"`
	DaemonsEcho         serpent.Bool     `json:"daemons_echo" typescript:",notnull"`
	DaemonPollInterval  serpent.Duration `json:"daemon_poll_interval" typescript:",notnull"`
	DaemonPollJitter    serpent.Duration `json:"daemon_poll_jitter" typescript:",notnull"`
	ForceCancelInterval serpent.Duration `json:"force_cancel_interval" typescript:",notnull"`
	DaemonPSK           serpent.String   `json:"daemon_psk" typescript:",notnull"`
}

type RateLimitConfig struct {
	DisableAll serpent.Bool  `json:"disable_all" typescript:",notnull"`
	API        serpent.Int64 `json:"api" typescript:",notnull"`
}

type SwaggerConfig struct {
	Enable serpent.Bool `json:"enable" typescript:",notnull"`
}

type LoggingConfig struct {
	Filter      serpent.StringArray `json:"log_filter" typescript:",notnull"`
	Human       serpent.String      `json:"human" typescript:",notnull"`
	JSON        serpent.String      `json:"json" typescript:",notnull"`
	Stackdriver serpent.String      `json:"stackdriver" typescript:",notnull"`
}

type DangerousConfig struct {
	AllowPathAppSharing         serpent.Bool `json:"allow_path_app_sharing" typescript:",notnull"`
	AllowPathAppSiteOwnerAccess serpent.Bool `json:"allow_path_app_site_owner_access" typescript:",notnull"`
	AllowAllCors                serpent.Bool `json:"allow_all_cors" typescript:",notnull"`
}

type UserQuietHoursScheduleConfig struct {
	DefaultSchedule serpent.String `json:"default_schedule" typescript:",notnull"`
	AllowUserCustom serpent.Bool   `json:"allow_user_custom" typescript:",notnull"`
	// TODO: add WindowDuration and the ability to postpone max_deadline by this
	// amount
	// WindowDuration  serpent.Duration `json:"window_duration" typescript:",notnull"`
}

// HealthcheckConfig contains configuration for healthchecks.
type HealthcheckConfig struct {
	Refresh           serpent.Duration `json:"refresh" typescript:",notnull"`
	ThresholdDatabase serpent.Duration `json:"threshold_database" typescript:",notnull"`
}

const (
	annotationFormatDuration = "format_duration"
	annotationEnterpriseKey  = "enterprise"
	annotationSecretKey      = "secret"
	// annotationExternalProxies is used to mark options that are used by workspace
	// proxies. This is used to filter out options that are not relevant.
	annotationExternalProxies = "external_workspace_proxies"
)

// IsWorkspaceProxies returns true if the cli option is used by workspace proxies.
func IsWorkspaceProxies(opt serpent.Option) bool {
	// If it is a bool, use the bool value.
	b, _ := strconv.ParseBool(opt.Annotations[annotationExternalProxies])
	return b
}

func IsSecretDeploymentOption(opt serpent.Option) bool {
	return opt.Annotations.IsSet(annotationSecretKey)
}

func DefaultCacheDir() string {
	defaultCacheDir, err := os.UserCacheDir()
	if err != nil {
		defaultCacheDir = os.TempDir()
	}
	if dir := os.Getenv("CACHE_DIRECTORY"); dir != "" {
		// For compatibility with systemd.
		defaultCacheDir = dir
	}
	if dir := os.Getenv("CLIDOCGEN_CACHE_DIRECTORY"); dir != "" {
		defaultCacheDir = dir
	}
	return filepath.Join(defaultCacheDir, "coder")
}

// DeploymentConfig contains both the deployment values and how they're set.
type DeploymentConfig struct {
	Values  *DeploymentValues `json:"config,omitempty"`
	Options serpent.OptionSet `json:"options,omitempty"`
}

func (c *DeploymentValues) Options() serpent.OptionSet {
	// The deploymentGroup variables are used to organize the myriad server options.
	var (
		deploymentGroupNetworking = serpent.Group{
			Name: "Networking",
			YAML: "networking",
		}
		deploymentGroupNetworkingTLS = serpent.Group{
			Parent: &deploymentGroupNetworking,
			Name:   "TLS",
			Description: "为您的 Coder 部署配置 TLS/HTTPS。如果您在 TLS 终止反向代理后运行 Coder，或者通过安全链接访问 Coder，您可以安全地忽略这些设置.",
			YAML: "tls",
		}
		deploymentGroupNetworkingHTTP = serpent.Group{
			Parent: &deploymentGroupNetworking,
			Name:   "HTTP",
			YAML:   "http",
		}
		deploymentGroupNetworkingDERP = serpent.Group{
			Parent: &deploymentGroupNetworking,
			Name:   "DERP",
			Description: "大多数 Coder 部署无需考虑 DERP，因为工作区和用户之间的所有连接都是点对点的。但是，当 Coder 无法建立点对点连接时，Coder 使用由 Tailscale 和 WireGuard 支持的分布式中继网络.",
			YAML: "derp",
		}
		deploymentGroupIntrospection = serpent.Group{
			Name:        "Introspection",
			Description: "配置日志记录、跟踪和指标导出.",
			YAML:        "introspection",
		}
		deploymentGroupIntrospectionPPROF = serpent.Group{
			Parent: &deploymentGroupIntrospection,
			Name:   "pprof",
			YAML:   "pprof",
		}
		deploymentGroupIntrospectionPrometheus = serpent.Group{
			Parent: &deploymentGroupIntrospection,
			Name:   "Prometheus",
			YAML:   "prometheus",
		}
		deploymentGroupIntrospectionTracing = serpent.Group{
			Parent: &deploymentGroupIntrospection,
			Name:   "Tracing",
			YAML:   "tracing",
		}
		deploymentGroupIntrospectionLogging = serpent.Group{
			Parent: &deploymentGroupIntrospection,
			Name:   "Logging",
			YAML:   "logging",
		}
		deploymentGroupIntrospectionHealthcheck = serpent.Group{
			Parent: &deploymentGroupIntrospection,
			Name:   "Health Check",
			YAML:   "healthcheck",
		}
		deploymentGroupOAuth2 = serpent.Group{
			Name:        "OAuth2",
			Description: "使用 OAuth2 配置 GitHub 登录和用户配置.",
			YAML:        "oauth2",
		}
		deploymentGroupOAuth2GitHub = serpent.Group{
			Parent: &deploymentGroupOAuth2,
			Name:   "GitHub",
			YAML:   "github",
		}
		deploymentGroupOIDC = serpent.Group{
			Name: "OIDC",
			YAML: "oidc",
		}
		deploymentGroupTelemetry = serpent.Group{
			Name: "Telemetry",
			YAML: "telemetry",
			Description: "反馈对于我们改进 Coder 的能力至关重要。在将数据发送到我们的服务器之前，我们会删除所有个人信息。请仅在您的组织安全策略要求时禁用反馈.",
		}
		deploymentGroupProvisioning = serpent.Group{
			Name:        "Provisioning",
			Description: "调整配置生成器的行为，生成器负责创建、更新和删除工作区资源。",
			YAML:        "provisioning",
		}
		deploymentGroupUserQuietHoursSchedule = serpent.Group{
			Name:        "User Quiet Hours Schedule",
			Description: "允许用户为工作区设置每天的安静时间安排，以避免工作区因模板安排而在白天停止。",
			YAML:        "userQuietHoursSchedule",
		}
		deploymentGroupDangerous = serpent.Group{
			Name: "⚠️ Dangerous",
			YAML: "dangerous",
		}
		deploymentGroupClient = serpent.Group{
			Name: "Client",
			Description: "这些选项更改客户端与 Coder 的交互方式。客户端包括 coder cli、vs code 扩展和 Web UI.",
			YAML: "client",
		}
		deploymentGroupConfig = serpent.Group{
			Name:        "Config",
			Description: "当服务器启动变得复杂时，可以使用 YAML 配置文件.",
		}
	)

	httpAddress := serpent.Option{
		Name:        "HTTP Address",
		Description: "服务器的HTTP绑定地址。将其设置为未设置以禁用HTTP端点.",
		Flag:        "http-address",
		Env:         "CODER_HTTP_ADDRESS",
		Default:     "127.0.0.1:3000",
		Value:       &c.HTTPAddress,
		Group:       &deploymentGroupNetworkingHTTP,
		YAML:        "httpAddress",
		Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
	}
	tlsBindAddress := serpent.Option{
		Name:        "TLS Address",
		Description: "服务器的 HTTPS 绑定地址.",
		Flag:        "tls-address",
		Env:         "CODER_TLS_ADDRESS",
		Default:     "127.0.0.1:3443",
		Value:       &c.TLS.Address,
		Group:       &deploymentGroupNetworkingTLS,
		YAML:        "address",
		Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
	}
	redirectToAccessURL := serpent.Option{
		Name:        "Redirect to Access URL",
		Description: "指定是否重定向未匹配访问URL主机的请求.",
		Flag:        "redirect-to-access-url",
		Env:         "CODER_REDIRECT_TO_ACCESS_URL",
		Value:       &c.RedirectToAccessURL,
		Group:       &deploymentGroupNetworking,
		YAML:        "redirectToAccessURL",
	}
	logFilter := serpent.Option{
		Name:          "Log Filter",
		Description:   "通过匹配给定的正则表达式来过滤调试日志。 使用 .* 匹配所有调试日志.",
		Flag:          "log-filter",
		FlagShorthand: "l",
		Env:           "CODER_LOG_FILTER",
		Value:         &c.Logging.Filter,
		Group:         &deploymentGroupIntrospectionLogging,
		YAML:          "filter",
	}
	opts := serpent.OptionSet{
		{
			Name:        "Access URL",
			Description: "用于访问 Coder 部署的URL.",
			Value:       &c.AccessURL,
			Flag:        "access-url",
			Env:         "CODER_ACCESS_URL",
			Group:       &deploymentGroupNetworking,
			YAML:        "accessURL",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Wildcard Access URL",
			Description: "指定工作区应用程序使用的通配符主机名，格式为\"*.example.com\".",
			Flag:        "wildcard-access-url",
			Env:         "CODER_WILDCARD_ACCESS_URL",
			// Do not use a serpent.URL here. We are intentionally omitting the
			// scheme part of the url (https://), so the standard url parsing
			// will yield unexpected results.
			//
			// We have a validation function to ensure the wildcard url is correct,
			// so use that instead.
			Value: serpent.Validate(&c.WildcardAccessURL, func(value *serpent.String) error {
				if value.Value() == "" {
					return nil
				}
				_, err := appurl.CompileHostnamePattern(value.Value())
				return err
			}),
			Group:       &deploymentGroupNetworking,
			YAML:        "wildcardAccessURL",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Docs URL",
			Description: "指定自定义文档 URL.",
			Value:       &c.DocsURL,
			Flag:        "docs-url",
			Env:         "CODER_DOCS_URL",
			Group:       &deploymentGroupNetworking,
			YAML:        "docsURL",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		redirectToAccessURL,
		{
			Name:        "Autobuild Poll Interval",
			Description: "定期轮询计划中的工作区构建的间隔时间.",
			Flag:        "autobuild-poll-interval",
			Env:         "CODER_AUTOBUILD_POLL_INTERVAL",
			Hidden:      true,
			Default:     time.Minute.String(),
			Value:       &c.AutobuildPollInterval,
			YAML:        "autobuildPollInterval",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Job Hang Detector Interval",
			Description: "轮询挂起作业并自动终止它们的时间间隔.",
			Flag:        "job-hang-detector-interval",
			Env:         "CODER_JOB_HANG_DETECTOR_INTERVAL",
			Hidden:      true,
			Default:     time.Minute.String(),
			Value:       &c.JobHangDetectorInterval,
			YAML:        "jobHangDetectorInterval",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		httpAddress,
		tlsBindAddress,
		{
			Name:          "Address",
			Description:   "服务器的绑定地址.",
			Flag:          "address",
			FlagShorthand: "a",
			Env:           "CODER_ADDRESS",
			Hidden:        true,
			Value:         &c.Address,
			UseInstead: serpent.OptionSet{
				httpAddress,
				tlsBindAddress,
			},
			Group:       &deploymentGroupNetworking,
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		// TLS settings
		{
			Name:        "TLS Enable",
			Description: "是否启用 TLS.",
			Flag:        "tls-enable",
			Env:         "CODER_TLS_ENABLE",
			Value:       &c.TLS.Enable,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "enable",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Redirect HTTP to HTTPS",
			Description: "是否将 HTTP 请求重定向到访问 URL（如果是 https URL 并且启用了 TLS）。不管此设置如何，对本地 IP 地址的请求都不会被重定向.",
			Flag:        "tls-redirect-http-to-https",
			Env:         "CODER_TLS_REDIRECT_HTTP_TO_HTTPS",
			Default:     "true",
			Hidden:      true,
			Value:       &c.TLS.RedirectHTTP,
			UseInstead:  serpent.OptionSet{redirectToAccessURL},
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "redirectHTTP",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Certificate Files",
			Description: "TLS 证书的路径。需要一个 PEM 编码的文件。要配置侦听器使用 CA 证书，请将主要证书和 CA 证书连接在一起。主要证书应该先出现在组合文件中.",
			Flag:        "tls-cert-file",
			Env:         "CODER_TLS_CERT_FILE",
			Value:       &c.TLS.CertFiles,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "certFiles",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Client CA Files",
			Description: "用于检查客户端真实性的 PEM 编码的证书颁发机构文件.",
			Flag:        "tls-client-ca-file",
			Env:         "CODER_TLS_CLIENT_CA_FILE",
			Value:       &c.TLS.ClientCAFile,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "clientCAFile",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Client Auth",
			Description: "TLS 客户端身份验证的服务器策略。接受的值为\"none\",\"request\",\"require-any\",\"verify-if-given\" 或 \"require-and-verify\".",
			Flag:        "tls-client-auth",
			Env:         "CODER_TLS_CLIENT_AUTH",
			Default:     "none",
			Value:       &c.TLS.ClientAuth,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "clientAuth",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Key Files",
			Description: "每个证书的私钥文件路径。需要使用 PEM 编码的文件.",
			Flag:        "tls-key-file",
			Env:         "CODER_TLS_KEY_FILE",
			Value:       &c.TLS.KeyFiles,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "keyFiles",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Minimum Version",
			Description: "TLS 的最低支持版本。可接受的值为 \"tls10\"、\"tls11\"、\"tls12\" 或 \"tls13\".",
			Flag:        "tls-min-version",
			Env:         "CODER_TLS_MIN_VERSION",
			Default:     "tls12",
			Value:       &c.TLS.MinVersion,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "minVersion",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Client Cert File",
			Description: "客户端 TLS 认证的证书路径。需要使用 PEM 编码的文件.",
			Flag:        "tls-client-cert-file",
			Env:         "CODER_TLS_CLIENT_CERT_FILE",
			Value:       &c.TLS.ClientCertFile,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "clientCertFile",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Client Key File",
			Description: "客户端 TLS 认证的密钥路径。需要使用 PEM 编码的文件.",
			Flag:        "tls-client-key-file",
			Env:         "CODER_TLS_CLIENT_KEY_FILE",
			Value:       &c.TLS.ClientKeyFile,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "clientKeyFile",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Ciphers",
			Description: "指定允许使用的特定 TLS 密码。请参阅 https://github.com/golang/go/blob/master/src/crypto/tls/cipher_suites.go#L53-L75.",
			Flag:        "tls-ciphers",
			Env:         "CODER_TLS_CIPHERS",
			Default:     "",
			Value:       &c.TLS.SupportedCiphers,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "tlsCiphers",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "TLS Allow Insecure Ciphers",
			Description: "默认情况下，只允许使用标记为“安全”的密码。请参阅 https://github.com/golang/go/blob/master/src/crypto/tls/cipher_suites.go#L82-L95.",
			Flag:        "tls-allow-insecure-ciphers",
			Env:         "CODER_TLS_ALLOW_INSECURE_CIPHERS",
			Default:     "false",
			Value:       &c.TLS.AllowInsecureCiphers,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "tlsAllowInsecureCiphers",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		// Derp settings
		{
			Name:        "DERP Server Enable",
			Description: "是否启用内嵌的 DERP 中继服务器.",
			Flag:        "derp-server-enable",
			Env:         "CODER_DERP_SERVER_ENABLE",
			Default:     "true",
			Value:       &c.DERP.Server.Enable,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "enable",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "DERP Server Region ID",
			Description: "用于内嵌 DERP 服务器的区域 ID.",
			Flag:        "derp-server-region-id",
			Env:         "CODER_DERP_SERVER_REGION_ID",
			Default:     "999",
			Value:       &c.DERP.Server.RegionID,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "regionID",
			Hidden:      true,
			// Does not apply to external proxies as this value is generated.
		},
		{
			Name:        "DERP Server Region Code",
			Description: "用于内嵌 DERP 服务器的区域代码.",
			Flag:        "derp-server-region-code",
			Env:         "CODER_DERP_SERVER_REGION_CODE",
			Default:     "coder",
			Value:       &c.DERP.Server.RegionCode,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "regionCode",
			Hidden:      true,
			// Does not apply to external proxies as we use the proxy name.
		},
		{
			Name:        "DERP Server Region Name",
			Description: "为嵌入式 DERP 服务器设置的区域名称.",
			Flag:        "derp-server-region-name",
			Env:         "CODER_DERP_SERVER_REGION_NAME",
			Default:     "Coder Embedded Relay",
			Value:       &c.DERP.Server.RegionName,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "regionName",
			// Does not apply to external proxies as we use the proxy name.
		},
		{
			Name:        "DERP Server STUN Addresses",
			Description: "STUN服务器的地址，用于建立P2P连接。建议至少有两个STUN服务器，以便为用户提供最佳的P2P连接工作区的机会。每个STUN服务器将拥有自己的DERP区域，区域ID从--derp-server-region-id + 1开始。使用值'disable'来完全关闭STUN.",
			Flag:        "derp-server-stun-addresses",
			Env:         "CODER_DERP_SERVER_STUN_ADDRESSES",
			Default:     "stun.l.google.com:19302,stun1.l.google.com:19302,stun2.l.google.com:19302,stun3.l.google.com:19302,stun4.l.google.com:19302",
			Value:       &c.DERP.Server.STUNAddresses,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "stunAddresses",
		},
		{
			Name:        "DERP Server Relay URL",
			Description: "其他副本可访问的 HTTP URL，用于中继 DERP 流量。在高可用性情况下需要.",
			Flag:        "derp-server-relay-url",
			Env:         "CODER_DERP_SERVER_RELAY_URL",
			Value:       &c.DERP.Server.RelayURL,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "relayURL",
			Annotations: serpent.Annotations{}.
				Mark(annotationEnterpriseKey, "true").
				Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Block Direct Connections",
			Description: "阻止点对点 (即直接) 工作区连接。启用后，来自 CLI 的所有工作区连接都将通过 Coder (或自定义配置的 DERP 服务器) 进行代理，并且永远不会是点对点。在此更改生效后，工作区仍然可以与 STUN 服务器联系以获取其地址，但新连接仍然会被代理.",
			// This cannot be called `disable-direct-connections` because that's
			// already a global CLI flag for CLI connections. This is a
			// deployment-wide flag.
			Flag:  "block-direct-connections",
			Env:   "CODER_BLOCK_DIRECT",
			Value: &c.DERP.Config.BlockDirect,
			Group: &deploymentGroupNetworkingDERP,
			YAML:  "blockDirect", Annotations: serpent.Annotations{}.
				Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "DERP Force WebSockets",
			Description: "强制客户端和代理始终使用 WebSocket 连接到 DERP 中继服务器。默认情况下，DERP 使用 Upgrade: derp，这可能会导致某些反向代理出现问题。如果客户端检测到 Upgrade: derp 存在问题，它们可能会自动回退到 WebSocket，但这并不适用于所有情况.",
			Flag:        "derp-force-websockets",
			Env:         "CODER_DERP_FORCE_WEBSOCKETS",
			Value:       &c.DERP.Config.ForceWebSockets,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "forceWebSockets",
		},
		{
			Name:        "DERP Config URL",
			Description: "启动时获取 DERP 映射的 URL。参考：https://tailscale.com/kb/1118/custom-derp-servers/.",
			Flag:        "derp-config-url",
			Env:         "CODER_DERP_CONFIG_URL",
			Value:       &c.DERP.Config.URL,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "url",
		},
		{
			Name:        "DERP Config Path",
			Description: "从中读取 DERP 映射的路径。参考：https://tailscale.com/kb/1118/custom-derp-servers/.",
			Flag:        "derp-config-path",
			Env:         "CODER_DERP_CONFIG_PATH",
			Value:       &c.DERP.Config.Path,
			Group:       &deploymentGroupNetworkingDERP,
			YAML:        "configPath",
		},
		// TODO: 支持 Git Auth 设置。
		// Prometheus 设置
		{
			Name:        "Prometheus Enable",
			Description: "在 prometheus address 定义的地址上提供 prometheus 指标服务.",
			Flag:        "prometheus-enable",
			Env:         "CODER_PROMETHEUS_ENABLE",
			Value:       &c.Prometheus.Enable,
			Group:       &deploymentGroupIntrospectionPrometheus,
			YAML:        "enable",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Prometheus Address",
			Description: "用于提供 prometheus 指标服务的绑定地址.",
			Flag:        "prometheus-address",
			Env:         "CODER_PROMETHEUS_ADDRESS",
			Default:     "127.0.0.1:2112",
			Value:       &c.Prometheus.Address,
			Group:       &deploymentGroupIntrospectionPrometheus,
			YAML:        "address",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Prometheus Collect Agent Stats",
			Description: "收集 agent 统计信息（可能增加指标存储的费用）.",
			Flag:        "prometheus-collect-agent-stats",
			Env:         "CODER_PROMETHEUS_COLLECT_AGENT_STATS",
			Value:       &c.Prometheus.CollectAgentStats,
			Group:       &deploymentGroupIntrospectionPrometheus,
			YAML:        "collect_agent_stats",
		},
		{
			Name:        "Prometheus Aggregate Agent Stats By",
			Description: fmt.Sprintf("When collecting agent stats, aggregate metrics by a given set of comma-separated labels to reduce cardinality. Accepted values are %s.", strings.Join(agentmetrics.LabelAll, ", ")),
			Flag:        "prometheus-aggregate-agent-stats-by",
			Env:         "CODER_PROMETHEUS_AGGREGATE_AGENT_STATS_BY",
			Value: serpent.Validate(&c.Prometheus.AggregateAgentStatsBy, func(value *serpent.StringArray) error {
				if value == nil {
					return nil
				}

				return agentmetrics.ValidateAggregationLabels(value.Value())
			}),
			Group:   &deploymentGroupIntrospectionPrometheus,
			YAML:    "aggregate_agent_stats_by",
			Default: strings.Join(agentmetrics.LabelAll, ","),
		},
		{
			Name:        "Prometheus Collect Database Metrics",
			Description: "收集数据库指标（可能会增加指标存储的费用）.",
			Flag:        "prometheus-collect-db-metrics",
			Env:         "CODER_PROMETHEUS_COLLECT_DB_METRICS",
			Value:       &c.Prometheus.CollectDBMetrics,
			Group:       &deploymentGroupIntrospectionPrometheus,
			YAML:        "collect_db_metrics",
			Default:     "false",
		},
		// Pprof settings
		{
			Name:        "pprof Enable",
			Description: "在 pprof 地址上提供性能分析指标.",
			Flag:        "pprof-enable",
			Env:         "CODER_PPROF_ENABLE",
			Value:       &c.Pprof.Enable,
			Group:       &deploymentGroupIntrospectionPPROF,
			YAML:        "enable",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "pprof Address",
			Description: "用于提供 pprof 的绑定地址.",
			Flag:        "pprof-address",
			Env:         "CODER_PPROF_ADDRESS",
			Default:     "127.0.0.1:6060",
			Value:       &c.Pprof.Address,
			Group:       &deploymentGroupIntrospectionPPROF,
			YAML:        "address",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		// oAuth settings
		{
			Name:        "OAuth2 GitHub Client ID",
			Description: "GitHub 登录所需的客户端 ID.",
			Flag:        "oauth2-github-client-id",
			Env:         "CODER_OAUTH2_GITHUB_CLIENT_ID",
			Value:       &c.OAuth2.Github.ClientID,
			Group:       &deploymentGroupOAuth2GitHub,
			YAML:        "clientID",
		},
		{
			Name:        "OAuth2 GitHub Client Secret",
			Description: "GitHub 登录所需的客户端密钥.",
			Flag:        "oauth2-github-client-secret",
			Env:         "CODER_OAUTH2_GITHUB_CLIENT_SECRET",
			Value:       &c.OAuth2.Github.ClientSecret,
			Annotations: serpent.Annotations{}.Mark(annotationSecretKey, "true"),
			Group:       &deploymentGroupOAuth2GitHub,
		},
		{
			Name:        "OAuth2 GitHub Allowed Orgs",
			Description: "要求用户是其中成员才能使用 GitHub 登录的组织.",
			Flag:        "oauth2-github-allowed-orgs",
			Env:         "CODER_OAUTH2_GITHUB_ALLOWED_ORGS",
			Value:       &c.OAuth2.Github.AllowedOrgs,
			Group:       &deploymentGroupOAuth2GitHub,
			YAML:        "allowedOrgs",
		},
		{
			Name:        "OAuth2 GitHub Allowed Teams",
			Description: "要求用户是其中成员才能使用 GitHub 登录的组织内团队。格式为：<组织名称>/<团队标识>.",
			Flag:        "oauth2-github-allowed-teams",
			Env:         "CODER_OAUTH2_GITHUB_ALLOWED_TEAMS",
			Value:       &c.OAuth2.Github.AllowedTeams,
			Group:       &deploymentGroupOAuth2GitHub,
			YAML:        "allowedTeams",
		},
		{
			Name:        "OAuth2 GitHub Allow Signups",
			Description: "是否允许新用户使用 GitHub 进行注册.",
			Flag:        "oauth2-github-allow-signups",
			Env:         "CODER_OAUTH2_GITHUB_ALLOW_SIGNUPS",
			Value:       &c.OAuth2.Github.AllowSignups,
			Group:       &deploymentGroupOAuth2GitHub,
			YAML:        "allowSignups",
		},
		{
			Name:        "OAuth2 GitHub Allow Everyone",
			Description: "允许所有登录，设置此选项意味着允许的组织和团队必须为空.",
			Flag:        "oauth2-github-allow-everyone",
			Env:         "CODER_OAUTH2_GITHUB_ALLOW_EVERYONE",
			Value:       &c.OAuth2.Github.AllowEveryone,
			Group:       &deploymentGroupOAuth2GitHub,
			YAML:        "allowEveryone",
		},
		{
			Name:        "OAuth2 GitHub Enterprise Base URL",
			Description: "用于登录 GitHub 的 GitHub Enterprise 部署的基本 URL.",
			Flag:        "oauth2-github-enterprise-base-url",
			Env:         "CODER_OAUTH2_GITHUB_ENTERPRISE_BASE_URL",
			Value:       &c.OAuth2.Github.EnterpriseBaseURL,
			Group:       &deploymentGroupOAuth2GitHub,
			YAML:        "enterpriseBaseURL",
		},
		// OIDC settings.
		{
			Name:        "OIDC Allow Signups",
			Description: "是否允许新用户使用 OIDC 进行注册.",
			Flag:        "oidc-allow-signups",
			Env:         "CODER_OIDC_ALLOW_SIGNUPS",
			Default:     "true",
			Value:       &c.OIDC.AllowSignups,
			Group:       &deploymentGroupOIDC,
			YAML:        "allowSignups",
		},
		{
			Name:        "OIDC Client ID",
			Description: "用于 OIDC 登录的客户端 ID.",
			Flag:        "oidc-client-id",
			Env:         "CODER_OIDC_CLIENT_ID",
			Value:       &c.OIDC.ClientID,
			Group:       &deploymentGroupOIDC,
			YAML:        "clientID",
		},
		{
			Name:        "OIDC Client Secret",
			Description: "用于 OIDC 登录的客户端密钥.",
			Flag:        "oidc-client-secret",
			Env:         "CODER_OIDC_CLIENT_SECRET",
			Annotations: serpent.Annotations{}.Mark(annotationSecretKey, "true"),
			Value:       &c.OIDC.ClientSecret,
			Group:       &deploymentGroupOIDC,
		},
		{
			Name: "OIDC Client Key File",
			Description: "用于 OAuth2 PKI/JWT 授权的 PEM 编码的 RSA 私钥.如果您的 IDP 支持，可以使用此密钥代替 oidc-client-secret.",
			Flag:  "oidc-client-key-file",
			Env:   "CODER_OIDC_CLIENT_KEY_FILE",
			YAML:  "oidcClientKeyFile",
			Value: &c.OIDC.ClientKeyFile,
			Group: &deploymentGroupOIDC,
		},
		{
			Name: "OIDC Client Cert File",
			Description: "用于 OAuth2 PKI/JWT 授权的 PEM 编码的证书文件。与 oidc-client-key-file 配套的公共证书。预期是标准的 x509 证书.",
			Flag:  "oidc-client-cert-file",
			Env:   "CODER_OIDC_CLIENT_CERT_FILE",
			YAML:  "oidcClientCertFile",
			Value: &c.OIDC.ClientCertFile,
			Group: &deploymentGroupOIDC,
		},
		{
			Name:        "OIDC Email Domain",
			Description: "使用 OIDC 登录的客户端必须匹配的电子邮件域.",
			Flag:        "oidc-email-domain",
			Env:         "CODER_OIDC_EMAIL_DOMAIN",
			Value:       &c.OIDC.EmailDomain,
			Group:       &deploymentGroupOIDC,
			YAML:        "emailDomain",
		},
		{
			Name:        "OIDC Issuer URL",
			Description: "用于 OIDC 登录的发行者 URL.",
			Flag:        "oidc-issuer-url",
			Env:         "CODER_OIDC_ISSUER_URL",
			Value:       &c.OIDC.IssuerURL,
			Group:       &deploymentGroupOIDC,
			YAML:        "issuerURL",
		},
		{
			Name:        "OIDC Scopes",
			Description: "在使用 OIDC 进行身份验证时授予的作用域.",
			Flag:        "oidc-scopes",
			Env:         "CODER_OIDC_SCOPES",
			Default:     strings.Join([]string{oidc.ScopeOpenID, "profile", "email"}, ","),
			Value:       &c.OIDC.Scopes,
			Group:       &deploymentGroupOIDC,
			YAML:        "scopes",
		},
		{
			Name:        "OIDC Ignore Email Verified",
			Description: "忽略上游提供者中的 email_verified 声明.",
			Flag:        "oidc-ignore-email-verified",
			Env:         "CODER_OIDC_IGNORE_EMAIL_VERIFIED",
			Value:       &c.OIDC.IgnoreEmailVerified,
			Group:       &deploymentGroupOIDC,
			YAML:        "ignoreEmailVerified",
		},
		{
			Name:        "OIDC Username Field",
			Description: "用作用户名的 OIDC 声明字段.",
			Flag:        "oidc-username-field",
			Env:         "CODER_OIDC_USERNAME_FIELD",
			Default:     "preferred_username",
			Value:       &c.OIDC.UsernameField,
			Group:       &deploymentGroupOIDC,
			YAML:        "usernameField",
		},
		{
			Name:        "OIDC Email Field",
			Description: "用作电子邮件的 OIDC 声明字段.",
			Flag:        "oidc-email-field",
			Env:         "CODER_OIDC_EMAIL_FIELD",
			Default:     "email",
			Value:       &c.OIDC.EmailField,
			Group:       &deploymentGroupOIDC,
			YAML:        "emailField",
		},
		{
			Name:        "OIDC Auth URL Parameters",
			Description: "要传递给上游提供者的 OIDC 认证 URL 参数.",
			Flag:        "oidc-auth-url-params",
			Env:         "CODER_OIDC_AUTH_URL_PARAMS",
			Default:     `{"access_type": "offline"}`,
			Value:       &c.OIDC.AuthURLParams,
			Group:       &deploymentGroupOIDC,
			YAML:        "authURLParams",
		},
		{
			Name:        "OIDC Ignore UserInfo",
			Description: "忽略 userinfo 端点，仅使用 ID 令牌获取用户信息.",
			Flag:        "oidc-ignore-userinfo",
			Env:         "CODER_OIDC_IGNORE_USERINFO",
			Default:     "false",
			Value:       &c.OIDC.IgnoreUserInfo,
			Group:       &deploymentGroupOIDC,
			YAML:        "ignoreUserInfo",
		},
		{
			Name:        "OIDC Group Field",
			Description: "如果使用组同步功能且范围名称不是'groups'，则必须设置此字段。设置为用于组的声明.",
			Flag:        "oidc-group-field",
			Env:         "CODER_OIDC_GROUP_FIELD",
			// This value is intentionally blank. If this is empty, then OIDC group
			// behavior is disabled. If 'oidc-scopes' contains 'groups', then the
			// default value will be 'groups'. If the user wants to use a different claim
			// such as 'memberOf', they can override the default 'groups' claim value
			// that comes from the oidc scopes.
			Default: "",
			Value:   &c.OIDC.GroupField,
			Group:   &deploymentGroupOIDC,
			YAML:    "groupField",
		},
		{
			Name:        "OIDC Group Mapping",
			Description: "OIDC组ID与应映射到Coder中的组之间的映射关系。这对于OIDC提供程序仅返回组ID时非常有用.",
			Flag:        "oidc-group-mapping",
			Env:         "CODER_OIDC_GROUP_MAPPING",
			Default:     "{}",
			Value:       &c.OIDC.GroupMapping,
			Group:       &deploymentGroupOIDC,
			YAML:        "groupMapping",
		},
		{
			Name:        "Enable OIDC Group Auto Create",
			Description: "自动创建用户组声明中缺失的组.",
			Flag:        "oidc-group-auto-create",
			Env:         "CODER_OIDC_GROUP_AUTO_CREATE",
			Default:     "false",
			Value:       &c.OIDC.GroupAutoCreate,
			Group:       &deploymentGroupOIDC,
			YAML:        "enableGroupAutoCreate",
		},
		{
			Name:        "OIDC Regex Group Filter",
			Description: "如果提供的任何组名与正则表达式不匹配，则会被忽略。这允许过滤掉不需要的组。此过滤器在组映射之后应用.",
			Flag:        "oidc-group-regex-filter",
			Env:         "CODER_OIDC_GROUP_REGEX_FILTER",
			Default:     ".*",
			Value:       &c.OIDC.GroupRegexFilter,
			Group:       &deploymentGroupOIDC,
			YAML:        "groupRegexFilter",
		},
		{
			Name:        "OIDC Allowed Groups",
			Description: "如果提供的任何组名不在列表中，将不允许进行身份验证。这允许限制对特定组的访问。此过滤器在组映射之后和正则表达式过滤器之前应用.",
			Flag:        "oidc-allowed-groups",
			Env:         "CODER_OIDC_ALLOWED_GROUPS",
			Default:     "",
			Value:       &c.OIDC.GroupAllowList,
			Group:       &deploymentGroupOIDC,
			YAML:        "groupAllowed",
		},
		{
			Name:        "OIDC User Role Field",
			Description: "如果使用用户角色同步功能，则必须设置此字段。将其设置为用于存储用户角色的声明名称。角色应作为字符串数组发送.",
			Flag:        "oidc-user-role-field",
			Env:         "CODER_OIDC_USER_ROLE_FIELD",
			// This value is intentionally blank. If this is empty, then OIDC user role
			// sync behavior is disabled.
			Default: "",
			Value:   &c.OIDC.UserRoleField,
			Group:   &deploymentGroupOIDC,
			YAML:    "userRoleField",
		},
		{
			Name:        "OIDC User Role Mapping",
			Description: "一个 OIDC 传递的用户角色与 Coder 中应映射到的组的映射表。如果映射到空字符串，则该角色将被忽略.",
			Flag:        "oidc-user-role-mapping",
			Env:         "CODER_OIDC_USER_ROLE_MAPPING",
			Default:     "{}",
			Value:       &c.OIDC.UserRoleMapping,
			Group:       &deploymentGroupOIDC,
			YAML:        "userRoleMapping",
		},
		{
			Name:        "OIDC User Role Default",
			Description: "如果用户角色同步已启用，这些角色将始终包含在所有经过身份验证的用户中。始终分配 'member' 角色.",
			Flag:        "oidc-user-role-default",
			Env:         "CODER_OIDC_USER_ROLE_DEFAULT",
			Default:     "",
			Value:       &c.OIDC.UserRolesDefault,
			Group:       &deploymentGroupOIDC,
			YAML:        "userRoleDefault",
		},
		{
			Name:        "OpenID Connect sign in text",
			Description: "在OpenID Connect登录按钮上显示的文本.",
			Flag:        "oidc-sign-in-text",
			Env:         "CODER_OIDC_SIGN_IN_TEXT",
			Default:     "OpenID Connect",
			Value:       &c.OIDC.SignInText,
			Group:       &deploymentGroupOIDC,
			YAML:        "signInText",
		},
		{
			Name:        "OpenID connect icon URL",
			Description: "指向在OpenID Connect登录按钮上使用的图标的URL.",
			Flag:        "oidc-icon-url",
			Env:         "CODER_OIDC_ICON_URL",
			Value:       &c.OIDC.IconURL,
			Group:       &deploymentGroupOIDC,
			YAML:        "iconURL",
		},
		{
			Name:        "Signups disabled text",
			Description: "自定义文本，显示在禁用 OIDC 注册的错误页面上。支持 Markdown 格式.",
			Flag:        "oidc-signups-disabled-text",
			Env:         "CODER_OIDC_SIGNUPS_DISABLED_TEXT",
			Value:       &c.OIDC.SignupsDisabledText,
			Group:       &deploymentGroupOIDC,
			YAML:        "signupsDisabledText",
		},
		// Telemetry settings
		{
			Name:        "Telemetry Enable",
			Description: "是否启用遥测。Coder收集匿名的使用数据以帮助改进我们的产品.",
			Flag:        "telemetry",
			Env:         "CODER_TELEMETRY_ENABLE",
			Default:     strconv.FormatBool(flag.Lookup("test.v") == nil),
			Value:       &c.Telemetry.Enable,
			Group:       &deploymentGroupTelemetry,
			YAML:        "enable",
		},
		{
			Name:        "Telemetry URL",
			Description: "用于发送遥测的URL.",
			Flag:        "telemetry-url",
			Env:         "CODER_TELEMETRY_URL",
			Hidden:      true,
			Default:     "https://telemetry.coder.com",
			Value:       &c.Telemetry.URL,
			Group:       &deploymentGroupTelemetry,
			YAML:        "url",
		},
		// Trace settings
		{
			Name:        "Trace Enable",
			Description: "是否收集应用程序跟踪数据。它会导出到由环境变量配置的后端。参考: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md.",
			Flag:        "trace",
			Env:         "CODER_TRACE_ENABLE",
			Value:       &c.Trace.Enable,
			Group:       &deploymentGroupIntrospectionTracing,
			YAML:        "enable",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Trace Honeycomb API Key",
			Description: "使用提供的API密钥将跟踪导出到Honeycomb.io.",
			Flag:        "trace-honeycomb-api-key",
			Env:         "CODER_TRACE_HONEYCOMB_API_KEY",
			Annotations: serpent.Annotations{}.Mark(annotationSecretKey, "true").Mark(annotationExternalProxies, "true"),
			Value:       &c.Trace.HoneycombAPIKey,
			Group:       &deploymentGroupIntrospectionTracing,
		},
		{
			Name:        "Capture Logs in Traces",
			Description: "启用将日志作为事件捕获到跟踪中。这对于调试很有用，但可能会导致发送到跟踪后端的事件数量非常大，这可能会产生显著的成本.",
			Flag:        "trace-logs",
			Env:         "CODER_TRACE_LOGS",
			Value:       &c.Trace.CaptureLogs,
			Group:       &deploymentGroupIntrospectionTracing,
			YAML:        "captureLogs",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Send Go runtime traces to DataDog",
			Description: "启用将 Go runtime 跟踪发送到本地 DataDog 代理.",
			Flag:        "trace-datadog",
			Env:         "CODER_TRACE_DATADOG",
			Value:       &c.Trace.DataDog,
			Group:       &deploymentGroupIntrospectionTracing,
			YAML:        "dataDog",
			// Hidden until an external user asks for it. For the time being,
			// it's used to detect leaks in dogfood.
			Hidden: true,
			// Default is false because datadog creates a bunch of goroutines that
			// don't get cleaned up and trip the leak detector.
			Default:     "false",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		// Provisioner settings
		{
			Name:        "Provisioner Daemons",
			Description: "启动时要创建的配置器守护程序数量。如果构建在排队状态下停滞很长时间，请考虑增加此值.",
			Flag:        "provisioner-daemons",
			Env:         "CODER_PROVISIONER_DAEMONS",
			Default:     "3",
			Value:       &c.Provisioner.Daemons,
			Group:       &deploymentGroupProvisioning,
			YAML:        "daemons",
		},
		{
			Name:        "Echo Provisioner",
			Description: "是否使用回声供应程序守护程序而不是 Terraform。这是为了端到端测试.",
			Flag:        "provisioner-daemons-echo",
			Env:         "CODER_PROVISIONER_DAEMONS_ECHO",
			Hidden:      true,
			Default:     "false",
			Value:       &c.Provisioner.DaemonsEcho,
			Group:       &deploymentGroupProvisioning,
			YAML:        "daemonsEcho",
		},
		{
			Name:        "Poll Interval",
			Description: "已弃用且被忽略.",
			Flag:        "provisioner-daemon-poll-interval",
			Env:         "CODER_PROVISIONER_DAEMON_POLL_INTERVAL",
			Default:     time.Second.String(),
			Value:       &c.Provisioner.DaemonPollInterval,
			Group:       &deploymentGroupProvisioning,
			YAML:        "daemonPollInterval",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Poll Jitter",
			Description: "已弃用且被忽略.",
			Flag:        "provisioner-daemon-poll-jitter",
			Env:         "CODER_PROVISIONER_DAEMON_POLL_JITTER",
			Default:     (100 * time.Millisecond).String(),
			Value:       &c.Provisioner.DaemonPollJitter,
			Group:       &deploymentGroupProvisioning,
			YAML:        "daemonPollJitter",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Force Cancel Interval",
			Description: "强制取消卡住的配置任务的时间.",
			Flag:        "provisioner-force-cancel-interval",
			Env:         "CODER_PROVISIONER_FORCE_CANCEL_INTERVAL",
			Default:     (10 * time.Minute).String(),
			Value:       &c.Provisioner.ForceCancelInterval,
			Group:       &deploymentGroupProvisioning,
			YAML:        "forceCancelInterval",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Provisioner Daemon Pre-shared Key (PSK)",
			Description: "用于将外部供应商守护进程验证到 Coder 服务器的预共享密钥.",
			Flag:        "provisioner-daemon-psk",
			Env:         "CODER_PROVISIONER_DAEMON_PSK",
			Value:       &c.Provisioner.DaemonPSK,
			Group:       &deploymentGroupProvisioning,
			Annotations: serpent.Annotations{}.Mark(annotationSecretKey, "true"),
		},
		// RateLimit settings
		{
			Name:        "Disable All Rate Limits",
			Description: "禁用所有速率限制。这在生产环境中不推荐使用.",
			Flag:        "dangerous-disable-rate-limits",
			Env:         "CODER_DANGEROUS_DISABLE_RATE_LIMITS",

			Value:       &c.RateLimit.DisableAll,
			Hidden:      true,
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "API Rate Limit",
			Description: "每个用户（或未经身份验证的用户的每个IP地址）允许的每分钟最大请求次数。负值表示没有速率限制。某些API端点具有独立的严格速率限制，无论此值如何，以防止拒绝服务或暴力攻击.",
			// Change the env from the auto-generated CODER_RATE_LIMIT_API to the
			// old value to avoid breaking existing deployments.
			Env:         "CODER_API_RATE_LIMIT",
			Flag:        "api-rate-limit",
			Default:     "512",
			Value:       &c.RateLimit.API,
			Hidden:      true,
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		// Logging settings
		{
			Name:          "Verbose",
			Description:   "输出调试级别的日志.",
			Flag:          "verbose",
			Env:           "CODER_VERBOSE",
			FlagShorthand: "v",
			Hidden:        true,
			UseInstead:    []serpent.Option{logFilter},
			Value:         &c.Verbose,
			Group:         &deploymentGroupIntrospectionLogging,
			YAML:          "verbose",
			Annotations:   serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		logFilter,
		{
			Name:        "Human Log Location",
			Description: "将可读的日志输出到给定的文件.",
			Flag:        "log-human",
			Env:         "CODER_LOGGING_HUMAN",
			Default:     "/dev/stderr",
			Value:       &c.Logging.Human,
			Group:       &deploymentGroupIntrospectionLogging,
			YAML:        "humanPath",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "JSON Log Location",
			Description: "将JSON日志输出到给定的文件.",
			Flag:        "log-json",
			Env:         "CODER_LOGGING_JSON",
			Default:     "",
			Value:       &c.Logging.JSON,
			Group:       &deploymentGroupIntrospectionLogging,
			YAML:        "jsonPath",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Stackdriver Log Location",
			Description: "将与Stackdriver兼容的日志输出到给定的文件.",
			Flag:        "log-stackdriver",
			Env:         "CODER_LOGGING_STACKDRIVER",
			Default:     "",
			Value:       &c.Logging.Stackdriver,
			Group:       &deploymentGroupIntrospectionLogging,
			YAML:        "stackdriverPath",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Enable Terraform debug mode",
			Description: "允许管理员启用 Terraform 调试输出.",
			Flag:        "enable-terraform-debug-mode",
			Env:         "CODER_ENABLE_TERRAFORM_DEBUG_MODE",
			Default:     "false",
			Value:       &c.EnableTerraformDebugMode,
			Group:       &deploymentGroupIntrospectionLogging,
			YAML:        "enableTerraformDebugMode",
		},
		// ☢️ Dangerous settings
		{
			Name:        "DANGEROUS: Allow all CORS requests",
			Description: "出于安全原因，除了由同一用户拥有的工作区应用之间的请求之外，CORS 请求会被阻止。如果需要外部请求，则将此设置为 true 将设置所有 CORS 标头为 '*'。这在生产环境中绝不应该使用.",
			Flag:        "dangerous-allow-cors-requests",
			Env:         "CODER_DANGEROUS_ALLOW_CORS_REQUESTS",
			Hidden:      true, // Hidden, should only be used by yarn dev server
			Value:       &c.Dangerous.AllowAllCors,
			Group:       &deploymentGroupDangerous,
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "DANGEROUS: Allow Path App Sharing",
			Description: "允许共享未从子域名提供的工作区应用程序。出于安全目的，默认情况下禁用基于路径的应用程序共享。基于路径的应用程序可以向Coder API发出请求，并在工作区提供恶意JavaScript时构成安全风险。可以使用--disable-path-apps完全禁用基于路径的应用程序以进一步增强安全性.",
			Flag:        "dangerous-allow-path-app-sharing",
			Env:         "CODER_DANGEROUS_ALLOW_PATH_APP_SHARING",

			Value: &c.Dangerous.AllowPathAppSharing,
			Group: &deploymentGroupDangerous,
		},
		{
			Name:        "DANGEROUS: Allow Site Owners to Access Path Apps",
			Description: "允许站点所有者访问他们不拥有的工作区应用程序。默认情况下，所有者无法访问他们不拥有的基于路径的应用程序。基于路径的应用程序可以向Coder API发出请求，并在工作区提供恶意JavaScript时构成安全风险。可以使用--disable-path-apps完全禁用基于路径的应用程序以进一步增强安全性.",
			Flag:        "dangerous-allow-path-app-site-owner-access",
			Env:         "CODER_DANGEROUS_ALLOW_PATH_APP_SITE_OWNER_ACCESS",

			Value: &c.Dangerous.AllowPathAppSiteOwnerAccess,
			Group: &deploymentGroupDangerous,
		},
		// Misc. settings
		{
			Name:        "Experiments",
			Description: "启用一个或多个实验。这些实验尚未准备好用于生产。使用逗号分隔多个实验，或输入“*”以选择所有可用实验.",
			Flag:        "experiments",
			Env:         "CODER_EXPERIMENTS",
			Value:       &c.Experiments,
			YAML:        "experiments",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Update Check",
			Description: "定期检查是否有Coder的新版本，并通知所有者。检查每天执行一次.",
			Flag:        "update-check",
			Env:         "CODER_UPDATE_CHECK",
			Default: strconv.FormatBool(
				flag.Lookup("test.v") == nil && !buildinfo.IsDev(),
			),
			Value: &c.UpdateCheck,
			YAML:  "updateCheck",
		},
		{
			Name:        "Max Token Lifetime",
			Description: "用户在创建API令牌时可以指定的最大生命周期持续时间.",
			Flag:        "max-token-lifetime",
			Env:         "CODER_MAX_TOKEN_LIFETIME",
			// The default value is essentially "forever", so just use 100 years.
			// We have to add in the 25 leap days for the frontend to show the
			// "100 years" correctly.
			Default:     ((100 * 365 * time.Hour * 24) + (25 * time.Hour * 24)).String(),
			Value:       &c.MaxTokenLifetime,
			Group:       &deploymentGroupNetworkingHTTP,
			YAML:        "maxTokenLifetime",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Enable swagger endpoint",
			Description: "通过/swagger公开Swagger端点.",
			Flag:        "swagger-enable",
			Env:         "CODER_SWAGGER_ENABLE",

			Value: &c.Swagger.Enable,
			YAML:  "enableSwagger",
		},
		{
			Name:        "Proxy Trusted Headers",
			Flag:        "proxy-trusted-headers",
			Env:         "CODER_PROXY_TRUSTED_HEADERS",
			Description: "用于转发IP地址的可信任标头。例如：Cf-Connecting-Ip、True-Client-Ip、X-Forwarded-For.",
			Value:       &c.ProxyTrustedHeaders,
			Group:       &deploymentGroupNetworking,
			YAML:        "proxyTrustedHeaders",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Proxy Trusted Origins",
			Flag:        "proxy-trusted-origins",
			Env:         "CODER_PROXY_TRUSTED_ORIGINS",
			Description: "与\"proxy-trusted-headers\"一起使用的源地址。例如：192.168.1.0/24.",
			Value:       &c.ProxyTrustedOrigins,
			Group:       &deploymentGroupNetworking,
			YAML:        "proxyTrustedOrigins",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Cache Directory",
			Description: "用于缓存临时文件的目录。如果未指定并且$CACHE_DIRECTORY已设置，将与systemd兼容.",
			Flag:        "cache-dir",
			Env:         "CODER_CACHE_DIRECTORY",
			Default:     DefaultCacheDir(),
			Value:       &c.CacheDir,
			YAML:        "cacheDir",
		},
		{
			Name:        "In Memory Database",
			Description: "控制是否将数据存储在内存数据库中.",
			Flag:        "in-memory",
			Env:         "CODER_IN_MEMORY",
			Hidden:      true,
			Value:       &c.InMemoryDatabase,
			YAML:        "inMemoryDatabase",
		},
		{
			Name:        "Postgres Connection URL",
			Description: "PostgreSQL数据库的URL。如果为空，将从Maven（https://repo1.maven.org/maven2）下载PostgreSQL二进制文件，并将所有数据存储在配置根目录中。通过\"coder server postgres-builtin-url\"访问内置数据库.",
			Flag:        "postgres-url",
			Env:         "CODER_PG_CONNECTION_URL",
			Annotations: serpent.Annotations{}.Mark(annotationSecretKey, "true"),
			Value:       &c.PostgresURL,
		},
		{
			Name:        "Postgres Auth",
			Description: "Type of auth to use when connecting to postgres.",
			Flag:        "postgres-auth",
			Env:         "CODER_PG_AUTH",
			Default:     "password",
			Value:       serpent.EnumOf(&c.PostgresAuth, PostgresAuthDrivers...),
			YAML:        "pgAuth",
		},
		{
			Name:        "Secure Auth Cookie",
			Description: "控制浏览器会话Cookie的\"Secure\"属性是否已设置.",
			Flag:        "secure-auth-cookie",
			Env:         "CODER_SECURE_AUTH_COOKIE",
			Value:       &c.SecureAuthCookie,
			Group:       &deploymentGroupNetworking,
			YAML:        "secureAuthCookie",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name: "Strict-Transport-Security",
			Description: "控制是否在所有静态文件响应中设置\"Strict-Transport-Security\"响应头。此响应头应仅在通过HTTPS访问服务器时设置。该值表示头的最大有效时间（以秒为单位）.",
			Default:     "0",
			Flag:        "strict-transport-security",
			Env:         "CODER_STRICT_TRANSPORT_SECURITY",
			Value:       &c.StrictTransportSecurity,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "strictTransportSecurity",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name: "Strict-Transport-Security Options",
			Description: "在Strict-Transport-Security响应头中可以设置两个可选字段：\"includeSubDomains\"和\"preload\"。必须将\"strict-transport-security\"标志设置为非零值才能使用这些选项.",
			Flag:        "strict-transport-security-options",
			Env:         "CODER_STRICT_TRANSPORT_SECURITY_OPTIONS",
			Value:       &c.StrictTransportSecurityOptions,
			Group:       &deploymentGroupNetworkingTLS,
			YAML:        "strictTransportSecurityOptions",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "SSH Keygen Algorithm",
			Description: "用于生成SSH密钥的算法。可接受的值为\"ed25519\"、\"ecdsa\"或\"rsa4096\".",
			Flag:        "ssh-keygen-algorithm",
			Env:         "CODER_SSH_KEYGEN_ALGORITHM",
			Default:     "ed25519",
			Value:       &c.SSHKeygenAlgorithm,
			YAML:        "sshKeygenAlgorithm",
		},
		{
			Name:        "Metrics Cache Refresh Interval",
			Description: "指标刷新的频率.",
			Flag:        "metrics-cache-refresh-interval",
			Env:         "CODER_METRICS_CACHE_REFRESH_INTERVAL",
			Hidden:      true,
			Default:     (4 * time.Hour).String(),
			Value:       &c.MetricsCacheRefreshInterval,
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Agent Stat Refresh Interval",
			Description: "代理统计信息记录的频率.",
			Flag:        "agent-stats-refresh-interval",
			Env:         "CODER_AGENT_STATS_REFRESH_INTERVAL",
			Hidden:      true,
			Default:     (30 * time.Second).String(),
			Value:       &c.AgentStatRefreshInterval,
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Agent Fallback Troubleshooting URL",
			Description: "用于在模板中未设置时进行代理故障排除的URL.",
			Flag:        "agent-fallback-troubleshooting-url",
			Env:         "CODER_AGENT_FALLBACK_TROUBLESHOOTING_URL",
			Hidden:      true,
			Default:     "https://coder.com/docs/v2/latest/templates/troubleshooting",
			Value:       &c.AgentFallbackTroubleshootingURL,
			YAML:        "agentFallbackTroubleshootingURL",
		},
		{
			Name:        "Browser Only",
			Description: "是否只允许通过浏览器连接工作区.",
			Flag:        "browser-only",
			Env:         "CODER_BROWSER_ONLY",
			Annotations: serpent.Annotations{}.Mark(annotationEnterpriseKey, "true"),
			Value:       &c.BrowserOnly,
			Group:       &deploymentGroupNetworking,
			YAML:        "browserOnly",
		},
		{
			Name:        "SCIM API Key",
			Description: "启用SCIM并设置内置SCIM服务器的身份验证头。新用户将自动使用OIDC身份验证进行创建.",
			Flag:        "scim-auth-header",
			Env:         "CODER_SCIM_AUTH_HEADER",
			Annotations: serpent.Annotations{}.Mark(annotationEnterpriseKey, "true").Mark(annotationSecretKey, "true"),
			Value:       &c.SCIMAPIKey,
		},
		{
			Name:        "External Token Encryption Keys",
			Description: "在数据库中使用 AES-256-GCM 加密 OIDC 和 Git 认证令牌。该值必须是一个以逗号分隔的 base64 编码密钥列表。每个密钥在进行 base64 解码时必须恰好为 32 字节长度。第一个密钥将用于加密新值。在解密时，后续的密钥将用作备用。在正常操作期间，建议只设置一个密钥，除非您正在使用 coder server dbcrypt rotate 命令进行密钥轮换.",
			Flag:        "external-token-encryption-keys",
			Env:         "CODER_EXTERNAL_TOKEN_ENCRYPTION_KEYS",
			Annotations: serpent.Annotations{}.Mark(annotationEnterpriseKey, "true").Mark(annotationSecretKey, "true"),
			Value:       &c.ExternalTokenEncryptionKeys,
		},
		{
			Name:        "Disable Path Apps",
			Description: "禁用非子域名服务的工作区应用程序。基于路径的应用程序可以向Coder API发送请求，并在工作区提供恶意JavaScript时构成安全风险。如果配置了--wildcard-access-url，出于安全目的建议使用此选项.",
			Flag:        "disable-path-apps",
			Env:         "CODER_DISABLE_PATH_APPS",

			Value:       &c.DisablePathApps,
			YAML:        "disablePathApps",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Disable Owner Workspace Access",
			Description: "移除\"owner\"角色对所有工作区的工作区执行权限。这将阻止\"owner\"角色基于其\"owner\"角色进行ssh、应用程序和终端访问。他们仍然可以使用用户权限访问自己的工作区.",
			Flag:        "disable-owner-workspace-access",
			Env:         "CODER_DISABLE_OWNER_WORKSPACE_ACCESS",

			Value:       &c.DisableOwnerWorkspaceExec,
			YAML:        "disableOwnerWorkspaceAccess",
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Session Duration",
			Description: "浏览器会话的令牌过期时间。如果会话正在主动发出请求，会话的持续时间可能会更长，但可以通过--disable-session-expiry-refresh选项禁用此功能.",
			Flag:        "session-duration",
			Env:         "CODER_SESSION_DURATION",
			Default:     (24 * time.Hour).String(),
			Value:       &c.SessionDuration,
			Group:       &deploymentGroupNetworkingHTTP,
			YAML:        "sessionDuration",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Disable Session Expiry Refresh",
			Description: "禁用由于活动而自动刷新会话过期。这将使所有会话在达到会话过期时间后失效.",
			Flag:        "disable-session-expiry-refresh",
			Env:         "CODER_DISABLE_SESSION_EXPIRY_REFRESH",

			Value: &c.DisableSessionExpiryRefresh,
			Group: &deploymentGroupNetworkingHTTP,
			YAML:  "disableSessionExpiryRefresh",
		},
		{
			Name:        "Disable Password Authentication",
			Description: "禁用密码身份验证。这在依赖身份提供者的生产部署中出于安全考虑是推荐的。无论此设置如何，具有owner角色的任何用户都可以使用密码登录，以避免潜在的锁定。如果您无法访问帐户，可以使用coder server create-admin命令直接在数据库中创建新的管理员用户.",
			Flag:        "disable-password-auth",
			Env:         "CODER_DISABLE_PASSWORD_AUTH",

			Value: &c.DisablePasswordAuth,
			Group: &deploymentGroupNetworkingHTTP,
			YAML:  "disablePasswordAuth",
		},
		{
			Name:          "Config Path",
			Description:   `指定要加载配置的YAML文件.`,
			Flag:          "config",
			Env:           "CODER_CONFIG_PATH",
			FlagShorthand: "c",
			Hidden:        false,
			Group:         &deploymentGroupConfig,
			Value:         &c.Config,
		},
		{
			Name:        "SSH Host Prefix",
			Description: "SSH部署前缀用于ssh配置的主机.",
			Flag:        "ssh-hostname-prefix",
			Env:         "CODER_SSH_HOSTNAME_PREFIX",
			YAML:        "sshHostnamePrefix",
			Group:       &deploymentGroupClient,
			Value:       &c.SSHConfig.DeploymentName,
			Hidden:      false,
			Default:     "coder.",
		},
		{
			Name: "SSH Config Options",
			Description: "这些SSH配置选项将覆盖默认的SSH配置选项。以\"key=value\"或\"key value\"的格式提供选项，用逗号分隔。不正确使用可能会导致SSH连接到部署的故障，请谨慎使用.",
			Flag:   "ssh-config-options",
			Env:    "CODER_SSH_CONFIG_OPTIONS",
			YAML:   "sshConfigOptions",
			Group:  &deploymentGroupClient,
			Value:  &c.SSHConfig.SSHConfigOptions,
			Hidden: false,
		},
		{
			Name:        "CLI Upgrade Message",
			Description: "检测到客户端/服务器不匹配时向用户显示的升级消息。默认情况下，它指示用户使用 'curl -L https://coder.com/install.sh | sh' 进行更新.",
			Flag:        "cli-upgrade-message",
			Env:         "CODER_CLI_UPGRADE_MESSAGE",
			YAML:        "cliUpgradeMessage",
			Group:       &deploymentGroupClient,
			Value:       &c.CLIUpgradeMessage,
			Hidden:      false,
		},
		{
			Name: "Write Config",
			Description: `将当前服务器配置以YAML格式输出到stdout.`,
			Flag:        "write-config",
			Group:       &deploymentGroupConfig,
			Hidden:      false,
			Value:       &c.WriteConfig,
			Annotations: serpent.Annotations{}.Mark(annotationExternalProxies, "true"),
		},
		{
			Name:        "Support Links",
			Description: "支持链接显示在右上角下拉菜单中.",
			Env:         "CODER_SUPPORT_LINKS",
			Flag:        "support-links",
			YAML:        "supportLinks",
			Value:       &c.Support.Links,
			Hidden:      false,
		},
		{
			// Env handling is done in cli.ReadGitAuthFromEnvironment
			Name:        "External Auth Providers",
			Description: "外部验证提供程序.",
			YAML:        "externalAuthProviders",
			Flag:        "external-auth-providers",
			Value:       &c.ExternalAuthConfigs,
			Hidden:      true,
		},
		{
			Name:        "Custom wgtunnel Host",
			Description: `运行https://github.com/coder/wgtunnel的HTTPS服务器的主机名。默认情况下，它将选择Coder托管的最佳可用wgtunnel服务器。例如:\"tunnel.example.com\".`,
			Flag:        "wg-tunnel-host",
			Env:         "WGTUNNEL_HOST",
			YAML:        "wgtunnelHost",
			Value:       &c.WgtunnelHost,
			Default:     "", // empty string means pick best server
			Hidden:      true,
		},
		{
			Name:        "Proxy Health Check Interval",
			Description: "检查工作区代理状态的间隔时间.",
			Flag:        "proxy-health-interval",
			Env:         "CODER_PROXY_HEALTH_INTERVAL",
			Default:     (time.Minute).String(),
			Value:       &c.ProxyHealthStatusInterval,
			Group:       &deploymentGroupNetworkingHTTP,
			YAML:        "proxyHealthInterval",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Default Quiet Hours Schedule",
			Description: "默认的每日定期任务计划适用于没有自定义静默时段计划的用户。静默时段计划确定了由于模板的自动停止要求而将工作区强制停止的时间，并将最大截止时间向上舍入为用户的静默时段窗口（或默认）。格式与标准的 cron 格式相同，但日期、月份和星期几必须是*。只能指定一个小时和分钟（不支持范围或逗号分隔的值）.",
			Flag:        "default-quiet-hours-schedule",
			Env:         "CODER_QUIET_HOURS_DEFAULT_SCHEDULE",
			Default:     "CRON_TZ=UTC 0 0 * * *",
			Value:       &c.UserQuietHoursSchedule.DefaultSchedule,
			Group:       &deploymentGroupUserQuietHoursSchedule,
			YAML:        "defaultQuietHoursSchedule",
		},
		{
			Name:        "Allow Custom Quiet Hours",
			Description: "允许用户设置自己的静默时段计划，以便停止工作区（根据模板自动停止要求设置）。如果设置为 false，则用户无法更改其静默时段计划，始终使用站点默认值.",
			Flag:        "allow-custom-quiet-hours",
			Env:         "CODER_ALLOW_CUSTOM_QUIET_HOURS",
			Default:     "true",
			Value:       &c.UserQuietHoursSchedule.AllowUserCustom,
			Group:       &deploymentGroupUserQuietHoursSchedule,
			YAML:        "allowCustomQuietHours",
		},
		{
			Name:        "Web Terminal Renderer",
			Description: "打开Web终端时要使用的渲染器。有效值为'canvas'、'webgl'或'dom'.",
			Flag:        "web-terminal-renderer",
			Env:         "CODER_WEB_TERMINAL_RENDERER",
			Default:     "canvas",
			Value:       &c.WebTerminalRenderer,
			Group:       &deploymentGroupClient,
			YAML:        "webTerminalRenderer",
		},
		{
			Name:        "Allow Workspace Renames",
			Description: "已弃用：允许用户重命名其工作区。仅用于临时兼容性原因，此功能将在将来的版本中移除.",
			Flag:        "allow-workspace-renames",
			Env:         "CODER_ALLOW_WORKSPACE_RENAMES",
			Default:     "false",
			Value:       &c.AllowWorkspaceRenames,
			YAML:        "allowWorkspaceRenames",
		},
		// Healthcheck Options
		{
			Name:        "Health Check Refresh",
			Description: "健康检查的刷新间隔.",
			Flag:        "health-check-refresh",
			Env:         "CODER_HEALTH_CHECK_REFRESH",
			Default:     (10 * time.Minute).String(),
			Value:       &c.Healthcheck.Refresh,
			Group:       &deploymentGroupIntrospectionHealthcheck,
			YAML:        "refresh",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
		{
			Name:        "Health Check Threshold: Database",
			Description: "数据库健康检查的阈值。如果数据库的中位延迟在5次尝试中超过此阈值，则认为数据库不健康。默认值为15毫秒.",
			Flag:        "health-check-threshold-database",
			Env:         "CODER_HEALTH_CHECK_THRESHOLD_DATABASE",
			Default:     (15 * time.Millisecond).String(),
			Value:       &c.Healthcheck.ThresholdDatabase,
			Group:       &deploymentGroupIntrospectionHealthcheck,
			YAML:        "thresholdDatabase",
			Annotations: serpent.Annotations{}.Mark(annotationFormatDuration, "true"),
		},
	}

	return opts
}

type SupportConfig struct {
	Links serpent.Struct[[]LinkConfig] `json:"links" typescript:",notnull"`
}

type LinkConfig struct {
	Name   string `json:"name" yaml:"name"`
	Target string `json:"target" yaml:"target"`
	Icon   string `json:"icon" yaml:"icon" enums:"bug,chat,docs"`
}

// DeploymentOptionsWithoutSecrets returns a copy of the OptionSet with secret values omitted.
func DeploymentOptionsWithoutSecrets(set serpent.OptionSet) serpent.OptionSet {
	cpy := make(serpent.OptionSet, 0, len(set))
	for _, opt := range set {
		cpyOpt := opt
		if IsSecretDeploymentOption(cpyOpt) {
			cpyOpt.Value = nil
		}
		cpy = append(cpy, cpyOpt)
	}
	return cpy
}

// WithoutSecrets returns a copy of the config without secret values.
func (c *DeploymentValues) WithoutSecrets() (*DeploymentValues, error) {
	var ff DeploymentValues

	// Create copy via JSON.
	byt, err := json.Marshal(c)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(byt, &ff)
	if err != nil {
		return nil, err
	}

	for _, opt := range ff.Options() {
		if !IsSecretDeploymentOption(opt) {
			continue
		}

		// This only works with string values for now.
		switch v := opt.Value.(type) {
		case *serpent.String, *serpent.StringArray:
			err := v.Set("")
			if err != nil {
				panic(err)
			}
		default:
			return nil, xerrors.Errorf("unsupported type %T", v)
		}
	}

	return &ff, nil
}

// DeploymentConfig returns the deployment config for the coder server.
func (c *Client) DeploymentConfig(ctx context.Context) (*DeploymentConfig, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/deployment/config", nil)
	if err != nil {
		return nil, xerrors.Errorf("execute request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, ReadBodyAsError(res)
	}

	conf := &DeploymentValues{}
	resp := &DeploymentConfig{
		Values:  conf,
		Options: conf.Options(),
	}
	return resp, json.NewDecoder(res.Body).Decode(resp)
}

func (c *Client) DeploymentStats(ctx context.Context) (DeploymentStats, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/deployment/stats", nil)
	if err != nil {
		return DeploymentStats{}, xerrors.Errorf("execute request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return DeploymentStats{}, ReadBodyAsError(res)
	}

	var df DeploymentStats
	return df, json.NewDecoder(res.Body).Decode(&df)
}

type AppearanceConfig struct {
	ApplicationName string              `json:"application_name"`
	LogoURL         string              `json:"logo_url"`
	ServiceBanner   ServiceBannerConfig `json:"service_banner"`
	SupportLinks    []LinkConfig        `json:"support_links,omitempty"`
}

type UpdateAppearanceConfig struct {
	ApplicationName string              `json:"application_name"`
	LogoURL         string              `json:"logo_url"`
	ServiceBanner   ServiceBannerConfig `json:"service_banner"`
}

type ServiceBannerConfig struct {
	Enabled         bool   `json:"enabled"`
	Message         string `json:"message,omitempty"`
	BackgroundColor string `json:"background_color,omitempty"`
}

// Appearance returns the configuration that modifies the visual
// display of the dashboard.
func (c *Client) Appearance(ctx context.Context) (AppearanceConfig, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/appearance", nil)
	if err != nil {
		return AppearanceConfig{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return AppearanceConfig{}, ReadBodyAsError(res)
	}
	var cfg AppearanceConfig
	return cfg, json.NewDecoder(res.Body).Decode(&cfg)
}

func (c *Client) UpdateAppearance(ctx context.Context, appearance UpdateAppearanceConfig) error {
	res, err := c.Request(ctx, http.MethodPut, "/api/v2/appearance", appearance)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return ReadBodyAsError(res)
	}
	return nil
}

// BuildInfoResponse contains build information for this instance of Coder.
type BuildInfoResponse struct {
	// ExternalURL references the current Coder version.
	// For production builds, this will link directly to a release. For development builds, this will link to a commit.
	ExternalURL string `json:"external_url"`
	// Version returns the semantic version of the build.
	Version string `json:"version"`

	// DashboardURL is the URL to hit the deployment's dashboard.
	// For external workspace proxies, this is the coderd they are connected
	// to.
	DashboardURL string `json:"dashboard_url"`

	WorkspaceProxy bool `json:"workspace_proxy"`

	// AgentAPIVersion is the current version of the Agent API (back versions
	// MAY still be supported).
	AgentAPIVersion string `json:"agent_api_version"`

	// UpgradeMessage is the message displayed to users when an outdated client
	// is detected.
	UpgradeMessage string `json:"upgrade_message"`
}

type WorkspaceProxyBuildInfo struct {
	// TODO: @emyrk what should we include here?
	WorkspaceProxy bool `json:"workspace_proxy"`
	// DashboardURL is the URL of the coderd this proxy is connected to.
	DashboardURL string `json:"dashboard_url"`
}

// CanonicalVersion trims build information from the version.
// E.g. 'v0.7.4-devel+11573034' -> 'v0.7.4'.
func (b BuildInfoResponse) CanonicalVersion() string {
	// We do a little hack here to massage the string into a form
	// that works well with semver.
	trimmed := strings.ReplaceAll(b.Version, "-devel+", "+devel-")
	return semver.Canonical(trimmed)
}

// BuildInfo returns build information for this instance of Coder.
func (c *Client) BuildInfo(ctx context.Context) (BuildInfoResponse, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/buildinfo", nil)
	if err != nil {
		return BuildInfoResponse{}, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK || ExpectJSONMime(res) != nil {
		return BuildInfoResponse{}, ReadBodyAsError(res)
	}

	var buildInfo BuildInfoResponse
	return buildInfo, json.NewDecoder(res.Body).Decode(&buildInfo)
}

type Experiment string

const (
	// Add new experiments here!
	ExperimentExample            Experiment = "example" // This isn't used for anything.
	ExperimentSharedPorts        Experiment = "shared-ports"
	ExperimentAutoFillParameters Experiment = "auto-fill-parameters" // This should not be taken out of experiments until we have redesigned the feature.
)

// ExperimentsAll should include all experiments that are safe for
// users to opt-in to via --experimental='*'.
// Experiments that are not ready for consumption by all users should
// not be included here and will be essentially hidden.
var ExperimentsAll = Experiments{
	ExperimentSharedPorts,
}

// Experiments is a list of experiments.
// Multiple experiments may be enabled at the same time.
// Experiments are not safe for production use, and are not guaranteed to
// be backwards compatible. They may be removed or renamed at any time.
type Experiments []Experiment

// Returns a list of experiments that are enabled for the deployment.
func (e Experiments) Enabled(ex Experiment) bool {
	for _, v := range e {
		if v == ex {
			return true
		}
	}
	return false
}

func (c *Client) Experiments(ctx context.Context) (Experiments, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/experiments", nil)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, ReadBodyAsError(res)
	}
	var exp []Experiment
	return exp, json.NewDecoder(res.Body).Decode(&exp)
}

// AvailableExperiments is an expandable type that returns all safe experiments
// available to be used with a deployment.
type AvailableExperiments struct {
	Safe []Experiment `json:"safe"`
}

func (c *Client) SafeExperiments(ctx context.Context) (AvailableExperiments, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/experiments/available", nil)
	if err != nil {
		return AvailableExperiments{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return AvailableExperiments{}, ReadBodyAsError(res)
	}
	var exp AvailableExperiments
	return exp, json.NewDecoder(res.Body).Decode(&exp)
}

type DAUsResponse struct {
	Entries      []DAUEntry `json:"entries"`
	TZHourOffset int        `json:"tz_hour_offset"`
}

type DAUEntry struct {
	// Date is a string formatted as 2024-01-31.
	// Timezone and time information is not included.
	Date   string `json:"date"`
	Amount int    `json:"amount"`
}

type DAURequest struct {
	TZHourOffset int
}

func (d DAURequest) asRequestOption() RequestOption {
	return func(r *http.Request) {
		q := r.URL.Query()
		q.Set("tz_offset", strconv.Itoa(d.TZHourOffset))
		r.URL.RawQuery = q.Encode()
	}
}

// TimezoneOffsetHourWithTime is implemented to match the javascript 'getTimezoneOffset()' function.
// This is the amount of time between this date evaluated in UTC and evaluated in the 'loc'
// The trivial case of times being on the same day is:
// 'time.Now().UTC().Hour() - time.Now().In(loc).Hour()'
func TimezoneOffsetHourWithTime(now time.Time, loc *time.Location) int {
	if loc == nil {
		// Default to UTC time to be consistent across all callers.
		loc = time.UTC
	}
	_, offsetSec := now.In(loc).Zone()
	// Convert to hours and flip the sign
	return -1 * offsetSec / 60 / 60
}

func TimezoneOffsetHour(loc *time.Location) int {
	return TimezoneOffsetHourWithTime(time.Now(), loc)
}

func (c *Client) DeploymentDAUsLocalTZ(ctx context.Context) (*DAUsResponse, error) {
	return c.DeploymentDAUs(ctx, TimezoneOffsetHour(time.Local))
}

// DeploymentDAUs requires a tzOffset in hours. Use 0 for UTC, and TimezoneOffsetHour(time.Local) for the
// local timezone.
func (c *Client) DeploymentDAUs(ctx context.Context, tzOffset int) (*DAUsResponse, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/insights/daus", nil, DAURequest{
		TZHourOffset: tzOffset,
	}.asRequestOption())
	if err != nil {
		return nil, xerrors.Errorf("execute request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, ReadBodyAsError(res)
	}

	var resp DAUsResponse
	return &resp, json.NewDecoder(res.Body).Decode(&resp)
}

type AppHostResponse struct {
	// Host is the externally accessible URL for the Coder instance.
	Host string `json:"host"`
}

// AppHost returns the site-wide application wildcard hostname
// e.g. "*--apps.coder.com". Apps are accessible at:
// "<app-name>--<agent-name>--<workspace-name>--<username><app-host>", e.g.
// "my-app--agent--workspace--username--apps.coder.com".
//
// If the app host is not set, the response will contain an empty string.
func (c *Client) AppHost(ctx context.Context) (AppHostResponse, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/applications/host", nil)
	if err != nil {
		return AppHostResponse{}, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return AppHostResponse{}, ReadBodyAsError(res)
	}

	var host AppHostResponse
	return host, json.NewDecoder(res.Body).Decode(&host)
}

type WorkspaceConnectionLatencyMS struct {
	P50 float64
	P95 float64
}

type WorkspaceDeploymentStats struct {
	Pending  int64 `json:"pending"`
	Building int64 `json:"building"`
	Running  int64 `json:"running"`
	Failed   int64 `json:"failed"`
	Stopped  int64 `json:"stopped"`

	ConnectionLatencyMS WorkspaceConnectionLatencyMS `json:"connection_latency_ms"`
	RxBytes             int64                        `json:"rx_bytes"`
	TxBytes             int64                        `json:"tx_bytes"`
}

type SessionCountDeploymentStats struct {
	VSCode          int64 `json:"vscode"`
	SSH             int64 `json:"ssh"`
	JetBrains       int64 `json:"jetbrains"`
	ReconnectingPTY int64 `json:"reconnecting_pty"`
}

type DeploymentStats struct {
	// AggregatedFrom is the time in which stats are aggregated from.
	// This might be back in time a specific duration or interval.
	AggregatedFrom time.Time `json:"aggregated_from" format:"date-time"`
	// CollectedAt is the time in which stats are collected at.
	CollectedAt time.Time `json:"collected_at" format:"date-time"`
	// NextUpdateAt is the time when the next batch of stats will
	// be updated.
	NextUpdateAt time.Time `json:"next_update_at" format:"date-time"`

	Workspaces   WorkspaceDeploymentStats    `json:"workspaces"`
	SessionCount SessionCountDeploymentStats `json:"session_count"`
}

type SSHConfigResponse struct {
	HostnamePrefix   string            `json:"hostname_prefix"`
	SSHConfigOptions map[string]string `json:"ssh_config_options"`
}

// SSHConfiguration returns information about the SSH configuration for the
// Coder instance.
func (c *Client) SSHConfiguration(ctx context.Context) (SSHConfigResponse, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/deployment/ssh", nil)
	if err != nil {
		return SSHConfigResponse{}, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return SSHConfigResponse{}, ReadBodyAsError(res)
	}

	var sshConfig SSHConfigResponse
	return sshConfig, json.NewDecoder(res.Body).Decode(&sshConfig)
}
