package codersdk

import (
	"context"
	"encoding/json"
	"net/http"
	"net/netip"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ResourceType string

const (
	ResourceTypeTemplate              ResourceType = "template"
	ResourceTypeTemplateVersion       ResourceType = "template_version"
	ResourceTypeUser                  ResourceType = "user"
	ResourceTypeWorkspace             ResourceType = "workspace"
	ResourceTypeWorkspaceBuild        ResourceType = "workspace_build"
	ResourceTypeGitSSHKey             ResourceType = "git_ssh_key"
	ResourceTypeAPIKey                ResourceType = "api_key"
	ResourceTypeGroup                 ResourceType = "group"
	ResourceTypeLicense               ResourceType = "license"
	ResourceTypeConvertLogin          ResourceType = "convert_login"
	ResourceTypeHealthSettings        ResourceType = "health_settings"
	ResourceTypeNotificationsSettings ResourceType = "notifications_settings"
	ResourceTypeWorkspaceProxy        ResourceType = "workspace_proxy"
	ResourceTypeOrganization          ResourceType = "organization"
	ResourceTypeOAuth2ProviderApp     ResourceType = "oauth2_provider_app"
	// nolint:gosec // This is not a secret.
	ResourceTypeOAuth2ProviderAppSecret ResourceType = "oauth2_provider_app_secret"
	ResourceTypeCustomRole              ResourceType = "custom_role"
	ResourceTypeOrganizationMember                   = "organization_member"
	ResourceTypeNotificationTemplate                 = "notification_template"
)

func (r ResourceType) FriendlyString() string {
	switch r {
	case ResourceTypeTemplate:
		return "模板"
	case ResourceTypeTemplateVersion:
		return "模板 version"
	case ResourceTypeUser:
		return "用户"
	case ResourceTypeWorkspace:
		return "工作区"
	case ResourceTypeWorkspaceBuild:
		// workspace builds have a unique friendly string
		// see coderd/audit.go:298 for explanation
		return "工作区"
	case ResourceTypeGitSSHKey:
		return "git ssh 密钥"
	case ResourceTypeAPIKey:
		return "令牌"
	case ResourceTypeGroup:
		return "用户组"
	case ResourceTypeLicense:
		return "license"
	case ResourceTypeConvertLogin:
		return "login type conversion"
	case ResourceTypeWorkspaceProxy:
		return "workspace proxy"
	case ResourceTypeOrganization:
		return "organization"
	case ResourceTypeHealthSettings:
		return "health_settings"
	case ResourceTypeNotificationsSettings:
		return "notifications_settings"
	case ResourceTypeOAuth2ProviderApp:
		return "oauth2 app"
	case ResourceTypeOAuth2ProviderAppSecret:
		return "oauth2 app secret"
	case ResourceTypeCustomRole:
		return "custom role"
	case ResourceTypeOrganizationMember:
		return "organization member"
	case ResourceTypeNotificationTemplate:
		return "notification template"
	default:
		return "未知"
	}
}

type AuditAction string

const (
	AuditActionCreate               AuditAction = "create"
	AuditActionWrite                AuditAction = "write"
	AuditActionDelete               AuditAction = "delete"
	AuditActionStart                AuditAction = "start"
	AuditActionStop                 AuditAction = "stop"
	AuditActionLogin                AuditAction = "login"
	AuditActionLogout               AuditAction = "logout"
	AuditActionRegister             AuditAction = "register"
	AuditActionRequestPasswordReset AuditAction = "request_password_reset"
)

func (a AuditAction) Friendly() string {
	switch a {
	case AuditActionCreate:
		return "创建了"
	case AuditActionWrite:
		return "更新了"
	case AuditActionDelete:
		return "删除了"
	case AuditActionStart:
		return "启动了"
	case AuditActionStop:
		return "停止了"
	case AuditActionLogin:
		return "登录了"
	case AuditActionLogout:
		return "退出了"
	case AuditActionRegister:
		return "registered"
	case AuditActionRequestPasswordReset:
		return "password reset requested"
	default:
		return "未知"
	}
}

type AuditDiff map[string]AuditDiffField

type AuditDiffField struct {
	Old    any  `json:"old,omitempty"`
	New    any  `json:"new,omitempty"`
	Secret bool `json:"secret"`
}

type AuditLog struct {
	ID           uuid.UUID    `json:"id" format:"uuid"`
	RequestID    uuid.UUID    `json:"request_id" format:"uuid"`
	Time         time.Time    `json:"time" format:"date-time"`
	IP           netip.Addr   `json:"ip"`
	UserAgent    string       `json:"user_agent"`
	ResourceType ResourceType `json:"resource_type"`
	ResourceID   uuid.UUID    `json:"resource_id" format:"uuid"`
	// ResourceTarget is the name of the resource.
	ResourceTarget   string          `json:"resource_target"`
	ResourceIcon     string          `json:"resource_icon"`
	Action           AuditAction     `json:"action"`
	Diff             AuditDiff       `json:"diff"`
	StatusCode       int32           `json:"status_code"`
	AdditionalFields json.RawMessage `json:"additional_fields"`
	Description      string          `json:"description"`
	ResourceLink     string          `json:"resource_link"`
	IsDeleted        bool            `json:"is_deleted"`

	// Deprecated: Use 'organization.id' instead.
	OrganizationID uuid.UUID `json:"organization_id" format:"uuid"`

	Organization *MinimalOrganization `json:"organization,omitempty"`

	User *User `json:"user"`
}

type AuditLogsRequest struct {
	SearchQuery string `json:"q,omitempty"`
	Pagination
}

type AuditLogResponse struct {
	AuditLogs []AuditLog `json:"audit_logs"`
	Count     int64      `json:"count"`
}

type CreateTestAuditLogRequest struct {
	Action           AuditAction     `json:"action,omitempty" enums:"create,write,delete,start,stop"`
	ResourceType     ResourceType    `json:"resource_type,omitempty" enums:"template,template_version,user,workspace,workspace_build,git_ssh_key,auditable_group"`
	ResourceID       uuid.UUID       `json:"resource_id,omitempty" format:"uuid"`
	AdditionalFields json.RawMessage `json:"additional_fields,omitempty"`
	Time             time.Time       `json:"time,omitempty" format:"date-time"`
	BuildReason      BuildReason     `json:"build_reason,omitempty" enums:"autostart,autostop,initiator"`
	OrganizationID   uuid.UUID       `json:"organization_id,omitempty" format:"uuid"`
}

// AuditLogs retrieves audit logs from the given page.
func (c *Client) AuditLogs(ctx context.Context, req AuditLogsRequest) (AuditLogResponse, error) {
	res, err := c.Request(ctx, http.MethodGet, "/api/v2/audit", nil, req.Pagination.asRequestOption(), func(r *http.Request) {
		q := r.URL.Query()
		var params []string
		if req.SearchQuery != "" {
			params = append(params, req.SearchQuery)
		}
		q.Set("q", strings.Join(params, " "))
		r.URL.RawQuery = q.Encode()
	})
	if err != nil {
		return AuditLogResponse{}, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return AuditLogResponse{}, ReadBodyAsError(res)
	}

	var logRes AuditLogResponse
	err = json.NewDecoder(res.Body).Decode(&logRes)
	if err != nil {
		return AuditLogResponse{}, err
	}

	return logRes, nil
}

// CreateTestAuditLog creates a fake audit log. Only owners of the organization
// can perform this action. It's used for testing purposes.
func (c *Client) CreateTestAuditLog(ctx context.Context, req CreateTestAuditLogRequest) error {
	res, err := c.Request(ctx, http.MethodPost, "/api/v2/audit/testgenerate", req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusNoContent {
		return err
	}

	return nil
}
