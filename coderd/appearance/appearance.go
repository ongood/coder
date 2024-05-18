package appearance

import (
	"context"

	"github.com/coder/coder/v2/codersdk"
)

type Fetcher interface {
	Fetch(ctx context.Context) (codersdk.AppearanceConfig, error)
}

var DefaultSupportLinks = []codersdk.LinkConfig{
	{
		Name:   "文档",
		Target: "https://coder.com/docs/coder-oss",
		Icon:   "docs",
	},
	{
		Name:   "报告 BUG",
		Target: "https://github.com/coder/coder/issues/new?labels=needs+grooming&body={CODER_BUILD_INFO}",
		Icon:   "bug",
	},
	{
		Name:   "加入讨论组",
		Target: "https://coder.com/chat?utm_source=coder&utm_medium=coder&utm_campaign=server-footer",
		Icon:   "chat",
	},
}

type AGPLFetcher struct{}

func (AGPLFetcher) Fetch(context.Context) (codersdk.AppearanceConfig, error) {
	return codersdk.AppearanceConfig{
		NotificationBanners: []codersdk.BannerConfig{},
		SupportLinks:        DefaultSupportLinks,
	}, nil
}

var DefaultFetcher Fetcher = AGPLFetcher{}
