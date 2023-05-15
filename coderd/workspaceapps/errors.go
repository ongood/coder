package workspaceapps

import (
	"net/http"
	"net/url"

	"cdr.dev/slog"
	"github.com/coder/coder/site"
)

// WriteWorkspaceApp404 writes a HTML 404 error page for a workspace app. If
// appReq is not nil, it will be used to log the request details at debug level.
func WriteWorkspaceApp404(log slog.Logger, accessURL *url.URL, rw http.ResponseWriter, r *http.Request, appReq *Request, msg string) {
	if appReq != nil {
		slog.Helper()
		log.Debug(r.Context(),
			"workspace app 404: "+msg,
			slog.F("username_or_id", appReq.UsernameOrID),
			slog.F("workspace_and_agent", appReq.WorkspaceAndAgent),
			slog.F("workspace_name_or_id", appReq.WorkspaceNameOrID),
			slog.F("agent_name_or_id", appReq.AgentNameOrID),
			slog.F("app_slug_or_port", appReq.AppSlugOrPort),
		)
	}

	site.RenderStaticErrorPage(rw, r, site.ErrorPageData{
		Status:       http.StatusNotFound,
		Title:        "应用程序未找到",
		Description:  "您尝试访问的应用程序或工作区不存在，或者您没有权限访问它。",
		RetryEnabled: false,
		DashboardURL: accessURL.String(),
	})
}

// WriteWorkspaceApp500 writes a HTML 500 error page for a workspace app. If
// appReq is not nil, it's fields will be added to the logged error message.
func WriteWorkspaceApp500(log slog.Logger, accessURL *url.URL, rw http.ResponseWriter, r *http.Request, appReq *Request, err error, msg string) {
	ctx := r.Context()
	if appReq != nil {
		slog.Helper()
		ctx = slog.With(ctx,
			slog.F("username_or_id", appReq.UsernameOrID),
			slog.F("workspace_and_agent", appReq.WorkspaceAndAgent),
			slog.F("workspace_name_or_id", appReq.WorkspaceNameOrID),
			slog.F("agent_name_or_id", appReq.AgentNameOrID),
			slog.F("app_name_or_port", appReq.AppSlugOrPort),
		)
	}
	log.Warn(ctx,
		"工作区应用程序认证服务器错误: "+msg,
		slog.Error(err),
	)

	site.RenderStaticErrorPage(rw, r, site.ErrorPageData{
		Status:       http.StatusInternalServerError,
		Title:        "内部服务器错误",
		Description:  "发生了内部服务器错误。",
		RetryEnabled: false,
		DashboardURL: accessURL.String(),
	})
}

// WriteWorkspaceAppOffline writes a HTML 502 error page for a workspace app. If
// appReq is not nil, it will be used to log the request details at debug level.
func WriteWorkspaceAppOffline(log slog.Logger, accessURL *url.URL, rw http.ResponseWriter, r *http.Request, appReq *Request, msg string) {
	if appReq != nil {
		slog.Helper()
		log.Debug(r.Context(),
			"工作区应用程序不可用: "+msg,
			slog.F("username_or_id", appReq.UsernameOrID),
			slog.F("workspace_and_agent", appReq.WorkspaceAndAgent),
			slog.F("workspace_name_or_id", appReq.WorkspaceNameOrID),
			slog.F("agent_name_or_id", appReq.AgentNameOrID),
			slog.F("app_slug_or_port", appReq.AppSlugOrPort),
		)
	}

	site.RenderStaticErrorPage(rw, r, site.ErrorPageData{
		Status:       http.StatusBadGateway,
		Title:        "应用程序不可用",
		Description:  msg,
		RetryEnabled: true,
		DashboardURL: accessURL.String(),
	})
}
