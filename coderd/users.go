package coderd

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"golang.org/x/xerrors"

	"cdr.dev/slog"

	"github.com/coder/coder/v2/coderd/audit"
	"github.com/coder/coder/v2/coderd/database"
	"github.com/coder/coder/v2/coderd/database/db2sdk"
	"github.com/coder/coder/v2/coderd/database/dbauthz"
	"github.com/coder/coder/v2/coderd/database/dbtime"
	"github.com/coder/coder/v2/coderd/gitsshkey"
	"github.com/coder/coder/v2/coderd/httpapi"
	"github.com/coder/coder/v2/coderd/httpmw"
	"github.com/coder/coder/v2/coderd/notifications"
	"github.com/coder/coder/v2/coderd/rbac"
	"github.com/coder/coder/v2/coderd/rbac/policy"
	"github.com/coder/coder/v2/coderd/searchquery"
	"github.com/coder/coder/v2/coderd/telemetry"
	"github.com/coder/coder/v2/coderd/userpassword"
	"github.com/coder/coder/v2/coderd/util/slice"
	"github.com/coder/coder/v2/codersdk"
)

// userDebugOIDC returns the OIDC debug context for the user.
// Not going to expose this via swagger as the return payload is not guaranteed
// to be consistent between releases.
//
// @Summary Debug OIDC context for a user
// @ID debug-oidc-context-for-a-user
// @Security CoderSessionToken
// @Tags Agents
// @Success 200 "Success"
// @Param user path string true "User ID, name, or me"
// @Router /debug/{user}/debug-link [get]
// @x-apidocgen {"skip": true}
func (api *API) userDebugOIDC(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx  = r.Context()
		user = httpmw.UserParam(r)
	)

	if user.LoginType != database.LoginTypeOIDC {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "不是 OIDC 用户。",
		})
		return
	}

	link, err := api.Database.GetUserLinkByUserIDLoginType(ctx, database.GetUserLinkByUserIDLoginTypeParams{
		UserID:    user.ID,
		LoginType: database.LoginTypeOIDC,
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "无法获取用户链接。",
			Detail:  err.Error(),
		})
		return
	}

	// This will encode properly because it is a json.RawMessage.
	httpapi.Write(ctx, rw, http.StatusOK, link.DebugContext)
}

// Returns whether the initial user has been created or not.
//
// @Summary Check initial user created
// @ID check-initial-user-created
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Success 200 {object} codersdk.Response
// @Router /users/first [get]
func (api *API) firstUser(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// nolint:gocritic // Getting user count is a system function.
	userCount, err := api.Database.GetUserCount(dbauthz.AsSystemRestricted(ctx))
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户计数时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	if userCount == 0 {
		httpapi.Write(ctx, rw, http.StatusNotFound, codersdk.Response{
			Message: "初始用户尚未创建！",
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, codersdk.Response{
		Message: "初始用户已创建！",
	})
}

// Creates the initial user for a Coder deployment.
//
// @Summary Create initial user
// @ID create-initial-user
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags Users
// @Param request body codersdk.CreateFirstUserRequest true "First user request"
// @Success 201 {object} codersdk.CreateFirstUserResponse
// @Router /users/first [post]
func (api *API) postFirstUser(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var createUser codersdk.CreateFirstUserRequest
	if !httpapi.Read(ctx, rw, r, &createUser) {
		return
	}

	// This should only function for the first user.
	// nolint:gocritic // Getting user count is a system function.
	userCount, err := api.Database.GetUserCount(dbauthz.AsSystemRestricted(ctx))
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户数量时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	// If a user already exists, the initial admin user no longer can be created.
	if userCount != 0 {
		httpapi.Write(ctx, rw, http.StatusConflict, codersdk.Response{
			Message: "初始用户已经创建。",
		})
		return
	}

	err = userpassword.Validate(createUser.Password)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "密码强度不够！",
			Validations: []codersdk.ValidationError{{
				Field:  "password",
				Detail: err.Error(),
			}},
		})
		return
	}

	if createUser.Trial && api.TrialGenerator != nil {
		err = api.TrialGenerator(ctx, codersdk.LicensorTrialRequest{
			Email:       createUser.Email,
			FirstName:   createUser.TrialInfo.FirstName,
			LastName:    createUser.TrialInfo.LastName,
			PhoneNumber: createUser.TrialInfo.PhoneNumber,
			JobTitle:    createUser.TrialInfo.JobTitle,
			CompanyName: createUser.TrialInfo.CompanyName,
			Country:     createUser.TrialInfo.Country,
			Developers:  createUser.TrialInfo.Developers,
		})
		if err != nil {
			httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
				Message: "无法生成试用版",
				Detail:  err.Error(),
			})
			return
		}
	}

	//nolint:gocritic // needed to create first user
	defaultOrg, err := api.Database.GetDefaultOrganization(dbauthz.AsSystemRestricted(ctx))
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Internal error fetching default organization. If you are encountering this error, you will have to restart the Coder deployment.",
			Detail:  err.Error(),
		})
		return
	}

	//nolint:gocritic // needed to create first user
	user, err := api.CreateUser(dbauthz.AsSystemRestricted(ctx), api.Database, CreateUserRequest{
		CreateUserRequestWithOrgs: codersdk.CreateUserRequestWithOrgs{
			Email:           createUser.Email,
			Username:        createUser.Username,
			Name:            createUser.Name,
			Password:        createUser.Password,
			OrganizationIDs: []uuid.UUID{defaultOrg.ID},
		},
		LoginType: database.LoginTypePassword,
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "创建用户时出现内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	if api.RefreshEntitlements != nil {
		err = api.RefreshEntitlements(ctx)
		if err != nil {
			api.Logger.Error(ctx, "failed to refresh entitlements after generating trial license")
			return
		}
	} else {
		api.Logger.Debug(ctx, "entitlements will not be refreshed")
	}

	telemetryUser := telemetry.ConvertUser(user)
	// Send the initial users email address!
	telemetryUser.Email = &user.Email
	api.Telemetry.Report(&telemetry.Snapshot{
		Users: []telemetry.User{telemetryUser},
	})

	// TODO: @emyrk this currently happens outside the database tx used to create
	// 	the user. Maybe I add this ability to grant roles in the createUser api
	//	and add some rbac bypass when calling api functions this way??
	// Add the admin role to this first user.
	//nolint:gocritic // needed to create first user
	_, err = api.Database.UpdateUserRoles(dbauthz.AsSystemRestricted(ctx), database.UpdateUserRolesParams{
		GrantedRoles: []string{rbac.RoleOwner().String()},
		ID:           user.ID,
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "更新用户角色时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusCreated, codersdk.CreateFirstUserResponse{
		UserID:         user.ID,
		OrganizationID: defaultOrg.ID,
	})
}

// @Summary Get users
// @ID get-users
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param q query string false "Search query"
// @Param after_id query string false "After ID" format(uuid)
// @Param limit query int false "Page limit"
// @Param offset query int false "Page offset"
// @Success 200 {object} codersdk.GetUsersResponse
// @Router /users [get]
func (api *API) users(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	users, userCount, ok := api.GetUsers(rw, r)
	if !ok {
		return
	}

	userIDs := make([]uuid.UUID, 0, len(users))
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}
	organizationIDsByMemberIDsRows, err := api.Database.GetOrganizationIDsByMemberIDs(ctx, userIDs)
	if xerrors.Is(err, sql.ErrNoRows) {
		err = nil
	}
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户组织时出现内部错误。",
			Detail:  err.Error(),
		})
		return
	}
	organizationIDsByUserID := map[uuid.UUID][]uuid.UUID{}
	for _, organizationIDsByMemberIDsRow := range organizationIDsByMemberIDsRows {
		organizationIDsByUserID[organizationIDsByMemberIDsRow.UserID] = organizationIDsByMemberIDsRow.OrganizationIDs
	}

	render.Status(r, http.StatusOK)
	render.JSON(rw, r, codersdk.GetUsersResponse{
		Users: convertUsers(users, organizationIDsByUserID),
		Count: int(userCount),
	})
}

func (api *API) GetUsers(rw http.ResponseWriter, r *http.Request) ([]database.User, int64, bool) {
	ctx := r.Context()
	query := r.URL.Query().Get("q")
	params, errs := searchquery.Users(query)
	if len(errs) > 0 {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message:     "无效的用户搜索查询。",
			Validations: errs,
		})
		return nil, -1, false
	}

	paginationParams, ok := parsePagination(rw, r)
	if !ok {
		return nil, -1, false
	}

	userRows, err := api.Database.GetUsers(ctx, database.GetUsersParams{
		AfterID:        paginationParams.AfterID,
		Search:         params.Search,
		Status:         params.Status,
		RbacRole:       params.RbacRole,
		LastSeenBefore: params.LastSeenBefore,
		LastSeenAfter:  params.LastSeenAfter,
		OffsetOpt:      int32(paginationParams.Offset),
		LimitOpt:       int32(paginationParams.Limit),
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户时出现内部错误。",
			Detail:  err.Error(),
		})
		return nil, -1, false
	}

	// GetUsers does not return ErrNoRows because it uses a window function to get the count.
	// So we need to check if the userRows is empty and return an empty array if so.
	if len(userRows) == 0 {
		return []database.User{}, 0, true
	}

	users := database.ConvertUserRows(userRows)
	return users, userRows[0].Count, true
}

// Creates a new user.
//
// @Summary Create new user
// @ID create-new-user
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags Users
// @Param request body codersdk.CreateUserRequestWithOrgs true "Create user request"
// @Success 201 {object} codersdk.User
// @Router /users [post]
func (api *API) postUser(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	auditor := *api.Auditor.Load()
	aReq, commitAudit := audit.InitRequest[database.User](rw, &audit.RequestParams{
		Audit:   auditor,
		Log:     api.Logger,
		Request: r,
		Action:  database.AuditActionCreate,
	})
	defer commitAudit()

	var req codersdk.CreateUserRequestWithOrgs
	if !httpapi.Read(ctx, rw, r, &req) {
		return
	}

	if req.UserLoginType == "" {
		// Default to password auth
		req.UserLoginType = codersdk.LoginTypePassword
	}

	if req.UserLoginType != codersdk.LoginTypePassword && req.Password != "" {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: fmt.Sprintf("不能为非密码（%q）认证设置密码。", req.UserLoginType),
		})
		return
	}

	// If password auth is disabled, don't allow new users to be
	// created with a password!
	if api.DeploymentValues.DisablePasswordAuth && req.UserLoginType == codersdk.LoginTypePassword {
		httpapi.Write(ctx, rw, http.StatusForbidden, codersdk.Response{
			Message: "基于密码的认证已禁用！无法为新用户提供密码认证。",
		})
		return
	}

	if len(req.OrganizationIDs) == 0 {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "No organization specified to place the user as a member of. It is required to specify at least one organization id to place the user in.",
			Detail:  "required at least 1 value for the array 'organization_ids'",
			Validations: []codersdk.ValidationError{
				{
					Field:  "organization_ids",
					Detail: "Missing values, this cannot be empty",
				},
			},
		})
		return
	}

	// TODO: @emyrk Authorize the organization create if the createUser will do that.

	_, err := api.Database.GetUserByEmailOrUsername(ctx, database.GetUserByEmailOrUsernameParams{
		Username: req.Username,
		Email:    req.Email,
	})
	if err == nil {
		httpapi.Write(ctx, rw, http.StatusConflict, codersdk.Response{
			Message: "用户已存在。",
		})
		return
	}
	if !errors.Is(err, sql.ErrNoRows) {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户时出现内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	// If an organization was provided, make sure it exists.
	for i, orgID := range req.OrganizationIDs {
		var orgErr error
		if orgID != uuid.Nil {
			_, orgErr = api.Database.GetOrganizationByID(ctx, orgID)
		} else {
			var defaultOrg database.Organization
			defaultOrg, orgErr = api.Database.GetDefaultOrganization(ctx)
			if orgErr == nil {
				// converts uuid.Nil --> default org.ID
				req.OrganizationIDs[i] = defaultOrg.ID
			}
		}
		if orgErr != nil {
			if httpapi.Is404Error(orgErr) {
				httpapi.Write(ctx, rw, http.StatusNotFound, codersdk.Response{
					Message: fmt.Sprintf("Organization does not exist with the provided id %q.", orgID),
				})
				return
			}

			httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
				Message: "获取组织时出现内部错误。",
				Detail:  orgErr.Error(),
			})
			return
		}
	}

	var loginType database.LoginType
	switch req.UserLoginType {
	case codersdk.LoginTypeNone:
		loginType = database.LoginTypeNone
	case codersdk.LoginTypePassword:
		err = userpassword.Validate(req.Password)
		if err != nil {
			httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
				Message: "密码强度不够！",
				Validations: []codersdk.ValidationError{{
					Field:  "password",
					Detail: err.Error(),
				}},
			})
			return
		}
		loginType = database.LoginTypePassword
	case codersdk.LoginTypeOIDC:
		if api.OIDCConfig == nil {
			httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
				Message: "You must configure OIDC before creating OIDC users.",
			})
			return
		}
		loginType = database.LoginTypeOIDC
	case codersdk.LoginTypeGithub:
		loginType = database.LoginTypeGithub
	default:
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: fmt.Sprintf("手动创建新用户时不支持登录类型 %q。", req.UserLoginType),
		})
		return
	}

	user, err := api.CreateUser(ctx, api.Database, CreateUserRequest{
		CreateUserRequestWithOrgs: req,
		LoginType:                 loginType,
	})
	if dbauthz.IsNotAuthorizedError(err) {
		httpapi.Write(ctx, rw, http.StatusForbidden, codersdk.Response{
			Message: "您无权创建用户。",
		})
		return
	}
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "创建用户时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	aReq.New = user

	// Report when users are added!
	api.Telemetry.Report(&telemetry.Snapshot{
		Users: []telemetry.User{telemetry.ConvertUser(user)},
	})

	httpapi.Write(ctx, rw, http.StatusCreated, db2sdk.User(user, req.OrganizationIDs))
}

// @Summary Delete user
// @ID delete-user
// @Security CoderSessionToken
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Success 200
// @Router /users/{user} [delete]
func (api *API) deleteUser(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	auditor := *api.Auditor.Load()
	user := httpmw.UserParam(r)
	auth := httpmw.UserAuthorization(r)
	aReq, commitAudit := audit.InitRequest[database.User](rw, &audit.RequestParams{
		Audit:   auditor,
		Log:     api.Logger,
		Request: r,
		Action:  database.AuditActionDelete,
	})
	aReq.Old = user
	defer commitAudit()

	if auth.ID == user.ID.String() {
		httpapi.Write(ctx, rw, http.StatusForbidden, codersdk.Response{
			Message: "你不能删除自己！",
		})
		return
	}

	workspaces, err := api.Database.GetWorkspaces(ctx, database.GetWorkspacesParams{
		OwnerID: user.ID,
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取工作区时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}
	if len(workspaces) > 0 {
		httpapi.Write(ctx, rw, http.StatusExpectationFailed, codersdk.Response{
			Message: "您无法删除拥有工作区的用户。删除他们的工作区并重试！",
		})
		return
	}

	err = api.Database.UpdateUserDeletedByID(ctx, user.ID)
	if dbauthz.IsNotAuthorizedError(err) {
		httpapi.Forbidden(rw)
		return
	}
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "删除用户时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}
	user.Deleted = true
	aReq.New = user

	userAdmins, err := findUserAdmins(ctx, api.Database)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "Internal error fetching user admins.",
			Detail:  err.Error(),
		})
		return
	}

	for _, u := range userAdmins {
		if _, err := api.NotificationsEnqueuer.Enqueue(ctx, u.ID, notifications.TemplateUserAccountDeleted,
			map[string]string{
				"deleted_account_name": user.Username,
			}, "api-users-delete",
			user.ID,
		); err != nil {
			api.Logger.Warn(ctx, "unable to notify about deleted user", slog.F("deleted_user", user.Username), slog.Error(err))
		}
	}

	httpapi.Write(ctx, rw, http.StatusOK, codersdk.Response{
		Message: "User has been deleted!",
	})
}

// Returns the parameterized user requested. All validation
// is completed in the middleware for this route.
//
// @Summary Get user by name
// @ID get-user-by-name
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, username, or me"
// @Success 200 {object} codersdk.User
// @Router /users/{user} [get]
func (api *API) userByName(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user := httpmw.UserParam(r)
	organizationIDs, err := userOrganizationIDs(ctx, api, user)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户组织时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, db2sdk.User(user, organizationIDs))
}

// Returns recent build parameters for the signed-in user.
//
// @Summary Get autofill build parameters for user
// @ID get-autofill-build-parameters-for-user
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, username, or me"
// @Param template_id query string true "Template ID"
// @Success 200 {array} codersdk.UserParameter
// @Router /users/{user}/autofill-parameters [get]
func (api *API) userAutofillParameters(rw http.ResponseWriter, r *http.Request) {
	user := httpmw.UserParam(r)

	p := httpapi.NewQueryParamParser().RequiredNotEmpty("template_id")
	templateID := p.UUID(r.URL.Query(), uuid.UUID{}, "template_id")
	p.ErrorExcessParams(r.URL.Query())
	if len(p.Errors) > 0 {
		httpapi.Write(r.Context(), rw, http.StatusBadRequest, codersdk.Response{
			Message:     "查询参数无效。",
			Validations: p.Errors,
		})
		return
	}

	params, err := api.Database.GetUserWorkspaceBuildParameters(
		r.Context(),
		database.GetUserWorkspaceBuildParametersParams{
			OwnerID:    user.ID,
			TemplateID: templateID,
		},
	)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		httpapi.Write(r.Context(), rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户参数时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	sdkParams := []codersdk.UserParameter{}
	for _, param := range params {
		sdkParams = append(sdkParams, codersdk.UserParameter{
			Name:  param.Name,
			Value: param.Value,
		})
	}

	httpapi.Write(r.Context(), rw, http.StatusOK, sdkParams)
}

// Returns the user's login type. This only works if the api key for authorization
// and the requested user match. Eg: 'me'
//
// @Summary Get user login type
// @ID get-user-login-type
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Success 200 {object} codersdk.UserLoginType
// @Router /users/{user}/login-type [get]
func (*API) userLoginType(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx  = r.Context()
		user = httpmw.UserParam(r)
		key  = httpmw.APIKey(r)
	)

	if key.UserID != user.ID {
		// Currently this is only valid for querying yourself.
		httpapi.Write(ctx, rw, http.StatusForbidden, codersdk.Response{
			Message: "您无权查看此用户的登录类型。",
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, codersdk.UserLoginType{
		LoginType: codersdk.LoginType(user.LoginType),
	})
}

// @Summary Update user profile
// @ID update-user-profile
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Param request body codersdk.UpdateUserProfileRequest true "Updated profile"
// @Success 200 {object} codersdk.User
// @Router /users/{user}/profile [put]
func (api *API) putUserProfile(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx               = r.Context()
		user              = httpmw.UserParam(r)
		auditor           = *api.Auditor.Load()
		aReq, commitAudit = audit.InitRequest[database.User](rw, &audit.RequestParams{
			Audit:   auditor,
			Log:     api.Logger,
			Request: r,
			Action:  database.AuditActionWrite,
		})
	)
	defer commitAudit()
	aReq.Old = user

	var params codersdk.UpdateUserProfileRequest
	if !httpapi.Read(ctx, rw, r, &params) {
		return
	}
	existentUser, err := api.Database.GetUserByEmailOrUsername(ctx, database.GetUserByEmailOrUsernameParams{
		Username: params.Username,
	})
	isDifferentUser := existentUser.ID != user.ID

	if err == nil && isDifferentUser {
		responseErrors := []codersdk.ValidationError{{
			Field:  "username",
			Detail: "该用户名已被使用。",
		}}
		httpapi.Write(ctx, rw, http.StatusConflict, codersdk.Response{
			Message:     "具有此用户名的用户已存在。",
			Validations: responseErrors,
		})
		return
	}
	if !errors.Is(err, sql.ErrNoRows) && isDifferentUser {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	updatedUserProfile, err := api.Database.UpdateUserProfile(ctx, database.UpdateUserProfileParams{
		ID:        user.ID,
		Email:     user.Email,
		Name:      params.Name,
		AvatarURL: user.AvatarURL,
		Username:  params.Username,
		UpdatedAt: dbtime.Now(),
	})
	aReq.New = updatedUserProfile

	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "更新用户时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	organizationIDs, err := userOrganizationIDs(ctx, api, user)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户组织时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, db2sdk.User(updatedUserProfile, organizationIDs))
}

// @Summary Suspend user account
// @ID suspend-user-account
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Success 200 {object} codersdk.User
// @Router /users/{user}/status/suspend [put]
func (api *API) putSuspendUserAccount() func(rw http.ResponseWriter, r *http.Request) {
	return api.putUserStatus(database.UserStatusSuspended)
}

// @Summary Activate user account
// @ID activate-user-account
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Success 200 {object} codersdk.User
// @Router /users/{user}/status/activate [put]
func (api *API) putActivateUserAccount() func(rw http.ResponseWriter, r *http.Request) {
	return api.putUserStatus(database.UserStatusActive)
}

func (api *API) putUserStatus(status database.UserStatus) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		var (
			ctx               = r.Context()
			user              = httpmw.UserParam(r)
			apiKey            = httpmw.APIKey(r)
			auditor           = *api.Auditor.Load()
			aReq, commitAudit = audit.InitRequest[database.User](rw, &audit.RequestParams{
				Audit:   auditor,
				Log:     api.Logger,
				Request: r,
				Action:  database.AuditActionWrite,
			})
		)
		defer commitAudit()
		aReq.Old = user

		if status == database.UserStatusSuspended {
			// There are some manual protections when suspending a user to
			// prevent certain situations.
			switch {
			case user.ID == apiKey.UserID:
				// Suspending yourself is not allowed, as you can lock yourself
				// out of the system.
				httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
					Message: "你不能暂停自己。",
				})
				return
			case slice.Contains(user.RBACRoles, rbac.RoleOwner().String()):
				// You may not suspend an owner
				httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
					Message: fmt.Sprintf("您无法暂停具有 %q 角色的用户。您必须先删除该角色。", rbac.RoleOwner()),
				})
				return
			}
		}

		targetUser, err := api.Database.UpdateUserStatus(ctx, database.UpdateUserStatusParams{
			ID:        user.ID,
			Status:    status,
			UpdatedAt: dbtime.Now(),
		})
		if err != nil {
			httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
				Message: fmt.Sprintf("将用户的状态更新为 %q 时发生内部错误。", status),
				Detail:  err.Error(),
			})
			return
		}
		aReq.New = targetUser

		err = api.notifyUserStatusChanged(ctx, user, status)
		if err != nil {
			api.Logger.Warn(ctx, "unable to notify about changed user's status", slog.F("affected_user", user.Username), slog.Error(err))
		}

		organizations, err := userOrganizationIDs(ctx, api, user)
		if err != nil {
			httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
				Message: "获取用户的组织时发生内部错误。",
				Detail:  err.Error(),
			})
			return
		}
		httpapi.Write(ctx, rw, http.StatusOK, db2sdk.User(targetUser, organizations))
	}
}

func (api *API) notifyUserStatusChanged(ctx context.Context, user database.User, status database.UserStatus) error {
	var key string
	var adminTemplateID, personalTemplateID uuid.UUID
	switch status {
	case database.UserStatusSuspended:
		key = "suspended_account_name"
		adminTemplateID = notifications.TemplateUserAccountSuspended
		personalTemplateID = notifications.TemplateYourAccountSuspended
	case database.UserStatusActive:
		key = "activated_account_name"
		adminTemplateID = notifications.TemplateUserAccountActivated
		personalTemplateID = notifications.TemplateYourAccountActivated
	default:
		api.Logger.Error(ctx, "user status is not supported", slog.F("username", user.Username), slog.F("user_status", string(status)))
		return xerrors.Errorf("unable to notify admins as the user's status is unsupported")
	}

	userAdmins, err := findUserAdmins(ctx, api.Database)
	if err != nil {
		api.Logger.Error(ctx, "unable to find user admins", slog.Error(err))
	}

	// Send notifications to user admins and affected user
	for _, u := range userAdmins {
		if _, err := api.NotificationsEnqueuer.Enqueue(ctx, u.ID, adminTemplateID,
			map[string]string{
				key: user.Username,
			}, "api-put-user-status",
			user.ID,
		); err != nil {
			api.Logger.Warn(ctx, "unable to notify about changed user's status", slog.F("affected_user", user.Username), slog.Error(err))
		}
	}
	if _, err := api.NotificationsEnqueuer.Enqueue(ctx, user.ID, personalTemplateID,
		map[string]string{
			key: user.Username,
		}, "api-put-user-status",
		user.ID,
	); err != nil {
		api.Logger.Warn(ctx, "unable to notify user about status change of their account", slog.F("affected_user", user.Username), slog.Error(err))
	}
	return nil
}

// @Summary Update user appearance settings
// @ID update-user-appearance-settings
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Param request body codersdk.UpdateUserAppearanceSettingsRequest true "New appearance settings"
// @Success 200 {object} codersdk.User
// @Router /users/{user}/appearance [put]
func (api *API) putUserAppearanceSettings(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx  = r.Context()
		user = httpmw.UserParam(r)
	)

	var params codersdk.UpdateUserAppearanceSettingsRequest
	if !httpapi.Read(ctx, rw, r, &params) {
		return
	}

	updatedUser, err := api.Database.UpdateUserAppearanceSettings(ctx, database.UpdateUserAppearanceSettingsParams{
		ID:              user.ID,
		ThemePreference: params.ThemePreference,
		UpdatedAt:       dbtime.Now(),
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "更新用户时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	organizationIDs, err := userOrganizationIDs(ctx, api, user)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户的组织时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, db2sdk.User(updatedUser, organizationIDs))
}

// @Summary Update user password
// @ID update-user-password
// @Security CoderSessionToken
// @Accept json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Param request body codersdk.UpdateUserPasswordRequest true "Update password request"
// @Success 204
// @Router /users/{user}/password [put]
func (api *API) putUserPassword(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx               = r.Context()
		user              = httpmw.UserParam(r)
		params            codersdk.UpdateUserPasswordRequest
		auditor           = *api.Auditor.Load()
		aReq, commitAudit = audit.InitRequest[database.User](rw, &audit.RequestParams{
			Audit:   auditor,
			Log:     api.Logger,
			Request: r,
			Action:  database.AuditActionWrite,
		})
	)
	defer commitAudit()
	aReq.Old = user

	if !api.Authorize(r, policy.ActionUpdatePersonal, user) {
		httpapi.ResourceNotFound(rw)
		return
	}

	if !httpapi.Read(ctx, rw, r, &params) {
		return
	}

	if user.LoginType != database.LoginTypePassword {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "没有密码登录类型的用户无法更改他们的密码。",
		})
		return
	}

	err := userpassword.Validate(params.Password)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "密码无效。",
			Validations: []codersdk.ValidationError{
				{
					Field:  "password",
					Detail: err.Error(),
				},
			},
		})
		return
	}

	// admins can change passwords without sending old_password
	if params.OldPassword != "" {
		// if they send something let's validate it
		ok, err := userpassword.Compare(string(user.HashedPassword), params.OldPassword)
		if err != nil {
			httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
				Message: "密码发生内部错误。",
				Detail:  err.Error(),
			})
			return
		}
		if !ok {
			httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
				Message: "旧密码不正确。",
				Validations: []codersdk.ValidationError{
					{
						Field:  "old_password",
						Detail: "旧密码不正确。",
					},
				},
			})
			return
		}
	}

	// Prevent users reusing their old password.
	if match, _ := userpassword.Compare(string(user.HashedPassword), params.Password); match {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "新密码不能与旧密码匹配。",
		})
		return
	}

	hashedPassword, err := userpassword.Hash(params.Password)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "散列新密码时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	err = api.Database.InTx(func(tx database.Store) error {
		err = tx.UpdateUserHashedPassword(ctx, database.UpdateUserHashedPasswordParams{
			ID:             user.ID,
			HashedPassword: []byte(hashedPassword),
		})
		if err != nil {
			return xerrors.Errorf("更新用户散列密码时出错：%w", err)
		}

		err = tx.DeleteAPIKeysByUserID(ctx, user.ID)
		if err != nil {
			return xerrors.Errorf("按用户ID删除API密钥时出错：%w", err)
		}

		return nil
	}, nil)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "更新用户密码时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	newUser := user
	newUser.HashedPassword = []byte(hashedPassword)
	aReq.New = newUser

	rw.WriteHeader(http.StatusNoContent)
}

// @Summary Get user roles
// @ID get-user-roles
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Success 200 {object} codersdk.User
// @Router /users/{user}/roles [get]
func (api *API) userRoles(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user := httpmw.UserParam(r)

	if !api.Authorize(r, policy.ActionReadPersonal, user) {
		httpapi.ResourceNotFound(rw)
		return
	}

	// TODO: Replace this with "GetAuthorizationUserRoles"
	resp := codersdk.UserRoles{
		Roles:             user.RBACRoles,
		OrganizationRoles: make(map[uuid.UUID][]string),
	}

	memberships, err := api.Database.OrganizationMembers(ctx, database.OrganizationMembersParams{
		UserID:         user.ID,
		OrganizationID: uuid.Nil,
	})
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户组织成员身份时出现内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	for _, mem := range memberships {
		resp.OrganizationRoles[mem.OrganizationMember.OrganizationID] = mem.OrganizationMember.Roles
	}

	httpapi.Write(ctx, rw, http.StatusOK, resp)
}

// @Summary Assign role to user
// @ID assign-role-to-user
// @Security CoderSessionToken
// @Accept json
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Param request body codersdk.UpdateRoles true "Update roles request"
// @Success 200 {object} codersdk.User
// @Router /users/{user}/roles [put]
func (api *API) putUserRoles(rw http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
		// User is the user to modify.
		user              = httpmw.UserParam(r)
		apiKey            = httpmw.APIKey(r)
		auditor           = *api.Auditor.Load()
		aReq, commitAudit = audit.InitRequest[database.User](rw, &audit.RequestParams{
			Audit:   auditor,
			Log:     api.Logger,
			Request: r,
			Action:  database.AuditActionWrite,
		})
	)
	defer commitAudit()
	aReq.Old = user

	if user.LoginType == database.LoginTypeOIDC && api.IDPSync.SiteRoleSyncEnabled() {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "当角色同步已启用时，无法修改 OIDC 用户的角色。",
			Detail:  "在 OIDC 配置中设置了 'User Role Field'。所有角色更改必须来自 OIDC 身份提供者。",
		})
		return
	}

	if apiKey.UserID == user.ID {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: "您无法更改自己的角色。",
		})
		return
	}

	var params codersdk.UpdateRoles
	if !httpapi.Read(ctx, rw, r, &params) {
		return
	}

	updatedUser, err := api.Database.UpdateUserRoles(ctx, database.UpdateUserRolesParams{
		GrantedRoles: params.Roles,
		ID:           user.ID,
	})
	if dbauthz.IsNotAuthorizedError(err) {
		httpapi.Forbidden(rw)
		return
	}
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusBadRequest, codersdk.Response{
			Message: err.Error(),
		})
		return
	}
	aReq.New = updatedUser

	organizationIDs, err := userOrganizationIDs(ctx, api, user)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户组织时出现内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, db2sdk.User(updatedUser, organizationIDs))
}

// Returns organizations the parameterized user has access to.
//
// @Summary Get organizations by user
// @ID get-organizations-by-user
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Success 200 {array} codersdk.Organization
// @Router /users/{user}/organizations [get]
func (api *API) organizationsByUser(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user := httpmw.UserParam(r)

	organizations, err := api.Database.GetOrganizationsByUserID(ctx, user.ID)
	if errors.Is(err, sql.ErrNoRows) {
		err = nil
		organizations = []database.Organization{}
	}
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取用户的组织时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	// Only return orgs the user can read.
	organizations, err = AuthorizeFilter(api.HTTPAuth, r, policy.ActionRead, organizations)
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取组织时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, db2sdk.List(organizations, db2sdk.Organization))
}

// @Summary Get organization by user and organization name
// @ID get-organization-by-user-and-organization-name
// @Security CoderSessionToken
// @Produce json
// @Tags Users
// @Param user path string true "User ID, name, or me"
// @Param organizationname path string true "Organization name"
// @Success 200 {object} codersdk.Organization
// @Router /users/{user}/organizations/{organizationname} [get]
func (api *API) organizationByUserAndName(rw http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	organizationName := chi.URLParam(r, "organizationname")
	organization, err := api.Database.GetOrganizationByName(ctx, organizationName)
	if httpapi.Is404Error(err) {
		httpapi.ResourceNotFound(rw)
		return
	}
	if err != nil {
		httpapi.Write(ctx, rw, http.StatusInternalServerError, codersdk.Response{
			Message: "获取组织时发生内部错误。",
			Detail:  err.Error(),
		})
		return
	}

	httpapi.Write(ctx, rw, http.StatusOK, db2sdk.Organization(organization))
}

type CreateUserRequest struct {
	codersdk.CreateUserRequestWithOrgs
	LoginType         database.LoginType
	SkipNotifications bool
}

func (api *API) CreateUser(ctx context.Context, store database.Store, req CreateUserRequest) (database.User, error) {
	// Ensure the username is valid. It's the caller's responsibility to ensure
	// the username is valid and unique.
	if usernameValid := codersdk.NameValid(req.Username); usernameValid != nil {
		return database.User{}, xerrors.Errorf("无效的用户名 %q: %w", req.Username, usernameValid)
	}

	var user database.User
	err := store.InTx(func(tx database.Store) error {
		orgRoles := make([]string, 0)

		params := database.InsertUserParams{
			ID:             uuid.New(),
			Email:          req.Email,
			Username:       req.Username,
			Name:           codersdk.NormalizeRealUsername(req.Name),
			CreatedAt:      dbtime.Now(),
			UpdatedAt:      dbtime.Now(),
			HashedPassword: []byte{},
			// All new users are defaulted to members of the site.
			RBACRoles: []string{},
			LoginType: req.LoginType,
		}
		// If a user signs up with OAuth, they can have no password!
		if req.Password != "" {
			hashedPassword, err := userpassword.Hash(req.Password)
			if err != nil {
				return xerrors.Errorf("散列密码: %w", err)
			}
			params.HashedPassword = []byte(hashedPassword)
		}

		var err error
		user, err = tx.InsertUser(ctx, params)
		if err != nil {
			return xerrors.Errorf("创建用户: %w", err)
		}

		privateKey, publicKey, err := gitsshkey.Generate(api.SSHKeygenAlgorithm)
		if err != nil {
			return xerrors.Errorf("生成用户的 gitsshkey: %w", err)
		}
		_, err = tx.InsertGitSSHKey(ctx, database.InsertGitSSHKeyParams{
			UserID:     user.ID,
			CreatedAt:  dbtime.Now(),
			UpdatedAt:  dbtime.Now(),
			PrivateKey: privateKey,
			PublicKey:  publicKey,
		})
		if err != nil {
			return xerrors.Errorf("插入用户的 gitsshkey: %w", err)
		}

		for _, orgID := range req.OrganizationIDs {
			_, err = tx.InsertOrganizationMember(ctx, database.InsertOrganizationMemberParams{
				OrganizationID: orgID,
				UserID:         user.ID,
				CreatedAt:      dbtime.Now(),
				UpdatedAt:      dbtime.Now(),
				// By default give them membership to the organization.
				Roles: orgRoles,
			})
			if err != nil {
				return xerrors.Errorf("create organization member for %q: %w", orgID.String(), err)
			}
		}

		return nil
	}, nil)
	if err != nil || req.SkipNotifications {
		return user, err
	}

	userAdmins, err := findUserAdmins(ctx, store)
	if err != nil {
		return user, xerrors.Errorf("find user admins: %w", err)
	}

	for _, u := range userAdmins {
		if _, err := api.NotificationsEnqueuer.Enqueue(ctx, u.ID, notifications.TemplateUserAccountCreated,
			map[string]string{
				"created_account_name": user.Username,
			}, "api-users-create",
			user.ID,
		); err != nil {
			api.Logger.Warn(ctx, "unable to notify about created user", slog.F("created_user", user.Username), slog.Error(err))
		}
	}
	return user, err
}

// findUserAdmins fetches all users with user admin permission including owners.
func findUserAdmins(ctx context.Context, store database.Store) ([]database.GetUsersRow, error) {
	// Notice: we can't scrape the user information in parallel as pq
	// fails with: unexpected describe rows response: 'D'
	owners, err := store.GetUsers(ctx, database.GetUsersParams{
		RbacRole: []string{codersdk.RoleOwner},
	})
	if err != nil {
		return nil, xerrors.Errorf("get owners: %w", err)
	}
	userAdmins, err := store.GetUsers(ctx, database.GetUsersParams{
		RbacRole: []string{codersdk.RoleUserAdmin},
	})
	if err != nil {
		return nil, xerrors.Errorf("get user admins: %w", err)
	}
	return append(owners, userAdmins...), nil
}

func convertUsers(users []database.User, organizationIDsByUserID map[uuid.UUID][]uuid.UUID) []codersdk.User {
	converted := make([]codersdk.User, 0, len(users))
	for _, u := range users {
		userOrganizationIDs := organizationIDsByUserID[u.ID]
		converted = append(converted, db2sdk.User(u, userOrganizationIDs))
	}
	return converted
}

func userOrganizationIDs(ctx context.Context, api *API, user database.User) ([]uuid.UUID, error) {
	organizationIDsByMemberIDsRows, err := api.Database.GetOrganizationIDsByMemberIDs(ctx, []uuid.UUID{user.ID})
	if err != nil {
		return []uuid.UUID{}, err
	}

	// If you are in no orgs, then return an empty list.
	if len(organizationIDsByMemberIDsRows) == 0 {
		return []uuid.UUID{}, nil
	}

	member := organizationIDsByMemberIDsRows[0]
	return member.OrganizationIDs, nil
}

func userByID(id uuid.UUID, users []database.User) (database.User, bool) {
	for _, user := range users {
		if id == user.ID {
			return user, true
		}
	}
	return database.User{}, false
}

func convertAPIKey(k database.APIKey) codersdk.APIKey {
	return codersdk.APIKey{
		ID:              k.ID,
		UserID:          k.UserID,
		LastUsed:        k.LastUsed,
		ExpiresAt:       k.ExpiresAt,
		CreatedAt:       k.CreatedAt,
		UpdatedAt:       k.UpdatedAt,
		LoginType:       codersdk.LoginType(k.LoginType),
		Scope:           codersdk.APIKeyScope(k.Scope),
		LifetimeSeconds: k.LifetimeSeconds,
		TokenName:       k.TokenName,
	}
}
