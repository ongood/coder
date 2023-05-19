package apikey_test

import (
	"crypto/sha256"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/coder/coder/cli/clibase"
	"github.com/coder/coder/coderd/apikey"
	"github.com/coder/coder/coderd/database"
	"github.com/coder/coder/codersdk"
)

func TestGenerate(t *testing.T) {
	t.Parallel()

	type testcase struct {
		name   string
		params apikey.CreateParams
		fail   bool
	}

	cases := []testcase{
		{
			name: "OK",
			params: apikey.CreateParams{
				UserID:           uuid.New(),
				LoginType:        database.LoginTypeOIDC,
				DeploymentValues: &codersdk.DeploymentValues{},
				ExpiresAt:        time.Now().Add(time.Hour),
				LifetimeSeconds:  int64(time.Hour.Seconds()),
				TokenName:        "hello",
				RemoteAddr:       "1.2.3.4",
				Scope:            database.APIKeyScopeApplicationConnect,
			},
		},
		{
			name: "InvalidScope",
			params: apikey.CreateParams{
				UserID:           uuid.New(),
				LoginType:        database.LoginTypeOIDC,
				DeploymentValues: &codersdk.DeploymentValues{},
				ExpiresAt:        time.Now().Add(time.Hour),
				LifetimeSeconds:  int64(time.Hour.Seconds()),
				TokenName:        "hello",
				RemoteAddr:       "1.2.3.4",
				Scope:            database.APIKeyScope("test"),
			},
			fail: true,
		},
		{
			name: "DeploymentSessionDuration",
			params: apikey.CreateParams{
				UserID:    uuid.New(),
				LoginType: database.LoginTypeOIDC,
				DeploymentValues: &codersdk.DeploymentValues{
					SessionDuration: clibase.Duration(time.Hour),
				},
				LifetimeSeconds: 0,
				ExpiresAt:       time.Time{},
				TokenName:       "hello",
				RemoteAddr:      "1.2.3.4",
				Scope:           database.APIKeyScopeApplicationConnect,
			},
		},
		{
			name: "DefaultIP",
			params: apikey.CreateParams{
				UserID:           uuid.New(),
				LoginType:        database.LoginTypeOIDC,
				DeploymentValues: &codersdk.DeploymentValues{},
				ExpiresAt:        time.Now().Add(time.Hour),
				LifetimeSeconds:  int64(time.Hour.Seconds()),
				TokenName:        "hello",
				RemoteAddr:       "",
				Scope:            database.APIKeyScopeApplicationConnect,
			},
		},
		{
			name: "DefaultScope",
			params: apikey.CreateParams{
				UserID:           uuid.New(),
				LoginType:        database.LoginTypeOIDC,
				DeploymentValues: &codersdk.DeploymentValues{},
				ExpiresAt:        time.Now().Add(time.Hour),
				LifetimeSeconds:  int64(time.Hour.Seconds()),
				TokenName:        "hello",
				RemoteAddr:       "1.2.3.4",
				Scope:            "",
			},
		},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			key, keystr, err := apikey.Generate(tc.params)
			if tc.fail {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			require.NotEmpty(t, keystr)
			require.NotEmpty(t, key.ID)
			require.NotEmpty(t, key.HashedSecret)

			// Assert the string secret is formatted correctly
			keytokens := strings.Split(keystr, "-")
			require.Len(t, keytokens, 2)
			require.Equal(t, key.ID, keytokens[0])

			// Assert that the hashed secret is correct.
			hashed := sha256.Sum256([]byte(keytokens[1]))
			assert.ElementsMatch(t, hashed, key.HashedSecret[:])

			assert.Equal(t, tc.params.UserID, key.UserID)
			assert.WithinDuration(t, database.Now(), key.CreatedAt, time.Second*5)
			assert.WithinDuration(t, database.Now(), key.UpdatedAt, time.Second*5)

			if tc.params.LifetimeSeconds > 0 {
				assert.Equal(t, tc.params.LifetimeSeconds, key.LifetimeSeconds)
			} else if !tc.params.ExpiresAt.IsZero() {
				// Should not be a delta greater than 5 seconds.
				assert.InDelta(t, time.Until(tc.params.ExpiresAt).Seconds(), key.LifetimeSeconds, 5)
			} else {
				assert.Equal(t, int64(tc.params.DeploymentValues.SessionDuration.Value().Seconds()), key.LifetimeSeconds)
			}

			if !tc.params.ExpiresAt.IsZero() {
				assert.Equal(t, tc.params.ExpiresAt.UTC(), key.ExpiresAt)
			} else if tc.params.LifetimeSeconds > 0 {
				assert.WithinDuration(t, database.Now().Add(time.Duration(tc.params.LifetimeSeconds)), key.ExpiresAt, time.Second*5)
			} else {
				assert.WithinDuration(t, database.Now().Add(tc.params.DeploymentValues.SessionDuration.Value()), key.ExpiresAt, time.Second*5)
			}

			if tc.params.RemoteAddr != "" {
				assert.Equal(t, tc.params.RemoteAddr, key.IPAddress.IPNet.IP.String())
			} else {
				assert.Equal(t, "0.0.0.0", key.IPAddress.IPNet.IP.String())
			}

			if tc.params.Scope != "" {
				assert.Equal(t, tc.params.Scope, key.Scope)
			} else {
				assert.Equal(t, database.APIKeyScopeAll, key.Scope)
			}

			if tc.params.TokenName != "" {
				assert.Equal(t, tc.params.TokenName, key.TokenName)
			}
			if tc.params.LoginType != "" {
				assert.Equal(t, tc.params.LoginType, key.LoginType)
			}
		})
	}
}
