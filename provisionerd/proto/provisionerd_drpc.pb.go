// Code generated by protoc-gen-go-drpc. DO NOT EDIT.
// protoc-gen-go-drpc version: v0.0.33
// source: provisionerd/proto/provisionerd.proto

package proto

import (
	context "context"
	errors "errors"
	protojson "google.golang.org/protobuf/encoding/protojson"
	proto "google.golang.org/protobuf/proto"
	drpc "storj.io/drpc"
	drpcerr "storj.io/drpc/drpcerr"
)

type drpcEncoding_File_provisionerd_proto_provisionerd_proto struct{}

func (drpcEncoding_File_provisionerd_proto_provisionerd_proto) Marshal(msg drpc.Message) ([]byte, error) {
	return proto.Marshal(msg.(proto.Message))
}

func (drpcEncoding_File_provisionerd_proto_provisionerd_proto) MarshalAppend(buf []byte, msg drpc.Message) ([]byte, error) {
	return proto.MarshalOptions{}.MarshalAppend(buf, msg.(proto.Message))
}

func (drpcEncoding_File_provisionerd_proto_provisionerd_proto) Unmarshal(buf []byte, msg drpc.Message) error {
	return proto.Unmarshal(buf, msg.(proto.Message))
}

func (drpcEncoding_File_provisionerd_proto_provisionerd_proto) JSONMarshal(msg drpc.Message) ([]byte, error) {
	return protojson.Marshal(msg.(proto.Message))
}

func (drpcEncoding_File_provisionerd_proto_provisionerd_proto) JSONUnmarshal(buf []byte, msg drpc.Message) error {
	return protojson.Unmarshal(buf, msg.(proto.Message))
}

type DRPCProvisionerDaemonClient interface {
	DRPCConn() drpc.Conn

	AcquireJob(ctx context.Context, in *Empty) (*AcquiredJob, error)
	CommitQuota(ctx context.Context, in *CommitQuotaRequest) (*CommitQuotaResponse, error)
	UpdateJob(ctx context.Context, in *UpdateJobRequest) (*UpdateJobResponse, error)
	FailJob(ctx context.Context, in *FailedJob) (*Empty, error)
	CompleteJob(ctx context.Context, in *CompletedJob) (*Empty, error)
}

type drpcProvisionerDaemonClient struct {
	cc drpc.Conn
}

func NewDRPCProvisionerDaemonClient(cc drpc.Conn) DRPCProvisionerDaemonClient {
	return &drpcProvisionerDaemonClient{cc}
}

func (c *drpcProvisionerDaemonClient) DRPCConn() drpc.Conn { return c.cc }

func (c *drpcProvisionerDaemonClient) AcquireJob(ctx context.Context, in *Empty) (*AcquiredJob, error) {
	out := new(AcquiredJob)
	err := c.cc.Invoke(ctx, "/provisionerd.ProvisionerDaemon/AcquireJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{}, in, out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *drpcProvisionerDaemonClient) CommitQuota(ctx context.Context, in *CommitQuotaRequest) (*CommitQuotaResponse, error) {
	out := new(CommitQuotaResponse)
	err := c.cc.Invoke(ctx, "/provisionerd.ProvisionerDaemon/CommitQuota", drpcEncoding_File_provisionerd_proto_provisionerd_proto{}, in, out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *drpcProvisionerDaemonClient) UpdateJob(ctx context.Context, in *UpdateJobRequest) (*UpdateJobResponse, error) {
	out := new(UpdateJobResponse)
	err := c.cc.Invoke(ctx, "/provisionerd.ProvisionerDaemon/UpdateJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{}, in, out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *drpcProvisionerDaemonClient) FailJob(ctx context.Context, in *FailedJob) (*Empty, error) {
	out := new(Empty)
	err := c.cc.Invoke(ctx, "/provisionerd.ProvisionerDaemon/FailJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{}, in, out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *drpcProvisionerDaemonClient) CompleteJob(ctx context.Context, in *CompletedJob) (*Empty, error) {
	out := new(Empty)
	err := c.cc.Invoke(ctx, "/provisionerd.ProvisionerDaemon/CompleteJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{}, in, out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

type DRPCProvisionerDaemonServer interface {
	AcquireJob(context.Context, *Empty) (*AcquiredJob, error)
	CommitQuota(context.Context, *CommitQuotaRequest) (*CommitQuotaResponse, error)
	UpdateJob(context.Context, *UpdateJobRequest) (*UpdateJobResponse, error)
	FailJob(context.Context, *FailedJob) (*Empty, error)
	CompleteJob(context.Context, *CompletedJob) (*Empty, error)
}

type DRPCProvisionerDaemonUnimplementedServer struct{}

func (s *DRPCProvisionerDaemonUnimplementedServer) AcquireJob(context.Context, *Empty) (*AcquiredJob, error) {
	return nil, drpcerr.WithCode(errors.New("Unimplemented"), drpcerr.Unimplemented)
}

func (s *DRPCProvisionerDaemonUnimplementedServer) CommitQuota(context.Context, *CommitQuotaRequest) (*CommitQuotaResponse, error) {
	return nil, drpcerr.WithCode(errors.New("Unimplemented"), drpcerr.Unimplemented)
}

func (s *DRPCProvisionerDaemonUnimplementedServer) UpdateJob(context.Context, *UpdateJobRequest) (*UpdateJobResponse, error) {
	return nil, drpcerr.WithCode(errors.New("Unimplemented"), drpcerr.Unimplemented)
}

func (s *DRPCProvisionerDaemonUnimplementedServer) FailJob(context.Context, *FailedJob) (*Empty, error) {
	return nil, drpcerr.WithCode(errors.New("Unimplemented"), drpcerr.Unimplemented)
}

func (s *DRPCProvisionerDaemonUnimplementedServer) CompleteJob(context.Context, *CompletedJob) (*Empty, error) {
	return nil, drpcerr.WithCode(errors.New("Unimplemented"), drpcerr.Unimplemented)
}

type DRPCProvisionerDaemonDescription struct{}

func (DRPCProvisionerDaemonDescription) NumMethods() int { return 5 }

func (DRPCProvisionerDaemonDescription) Method(n int) (string, drpc.Encoding, drpc.Receiver, interface{}, bool) {
	switch n {
	case 0:
		return "/provisionerd.ProvisionerDaemon/AcquireJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{},
			func(srv interface{}, ctx context.Context, in1, in2 interface{}) (drpc.Message, error) {
				return srv.(DRPCProvisionerDaemonServer).
					AcquireJob(
						ctx,
						in1.(*Empty),
					)
			}, DRPCProvisionerDaemonServer.AcquireJob, true
	case 1:
		return "/provisionerd.ProvisionerDaemon/CommitQuota", drpcEncoding_File_provisionerd_proto_provisionerd_proto{},
			func(srv interface{}, ctx context.Context, in1, in2 interface{}) (drpc.Message, error) {
				return srv.(DRPCProvisionerDaemonServer).
					CommitQuota(
						ctx,
						in1.(*CommitQuotaRequest),
					)
			}, DRPCProvisionerDaemonServer.CommitQuota, true
	case 2:
		return "/provisionerd.ProvisionerDaemon/UpdateJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{},
			func(srv interface{}, ctx context.Context, in1, in2 interface{}) (drpc.Message, error) {
				return srv.(DRPCProvisionerDaemonServer).
					UpdateJob(
						ctx,
						in1.(*UpdateJobRequest),
					)
			}, DRPCProvisionerDaemonServer.UpdateJob, true
	case 3:
		return "/provisionerd.ProvisionerDaemon/FailJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{},
			func(srv interface{}, ctx context.Context, in1, in2 interface{}) (drpc.Message, error) {
				return srv.(DRPCProvisionerDaemonServer).
					FailJob(
						ctx,
						in1.(*FailedJob),
					)
			}, DRPCProvisionerDaemonServer.FailJob, true
	case 4:
		return "/provisionerd.ProvisionerDaemon/CompleteJob", drpcEncoding_File_provisionerd_proto_provisionerd_proto{},
			func(srv interface{}, ctx context.Context, in1, in2 interface{}) (drpc.Message, error) {
				return srv.(DRPCProvisionerDaemonServer).
					CompleteJob(
						ctx,
						in1.(*CompletedJob),
					)
			}, DRPCProvisionerDaemonServer.CompleteJob, true
	default:
		return "", nil, nil, nil, false
	}
}

func DRPCRegisterProvisionerDaemon(mux drpc.Mux, impl DRPCProvisionerDaemonServer) error {
	return mux.Register(impl, DRPCProvisionerDaemonDescription{})
}

type DRPCProvisionerDaemon_AcquireJobStream interface {
	drpc.Stream
	SendAndClose(*AcquiredJob) error
}

type drpcProvisionerDaemon_AcquireJobStream struct {
	drpc.Stream
}

func (x *drpcProvisionerDaemon_AcquireJobStream) SendAndClose(m *AcquiredJob) error {
	if err := x.MsgSend(m, drpcEncoding_File_provisionerd_proto_provisionerd_proto{}); err != nil {
		return err
	}
	return x.CloseSend()
}

type DRPCProvisionerDaemon_CommitQuotaStream interface {
	drpc.Stream
	SendAndClose(*CommitQuotaResponse) error
}

type drpcProvisionerDaemon_CommitQuotaStream struct {
	drpc.Stream
}

func (x *drpcProvisionerDaemon_CommitQuotaStream) SendAndClose(m *CommitQuotaResponse) error {
	if err := x.MsgSend(m, drpcEncoding_File_provisionerd_proto_provisionerd_proto{}); err != nil {
		return err
	}
	return x.CloseSend()
}

type DRPCProvisionerDaemon_UpdateJobStream interface {
	drpc.Stream
	SendAndClose(*UpdateJobResponse) error
}

type drpcProvisionerDaemon_UpdateJobStream struct {
	drpc.Stream
}

func (x *drpcProvisionerDaemon_UpdateJobStream) SendAndClose(m *UpdateJobResponse) error {
	if err := x.MsgSend(m, drpcEncoding_File_provisionerd_proto_provisionerd_proto{}); err != nil {
		return err
	}
	return x.CloseSend()
}

type DRPCProvisionerDaemon_FailJobStream interface {
	drpc.Stream
	SendAndClose(*Empty) error
}

type drpcProvisionerDaemon_FailJobStream struct {
	drpc.Stream
}

func (x *drpcProvisionerDaemon_FailJobStream) SendAndClose(m *Empty) error {
	if err := x.MsgSend(m, drpcEncoding_File_provisionerd_proto_provisionerd_proto{}); err != nil {
		return err
	}
	return x.CloseSend()
}

type DRPCProvisionerDaemon_CompleteJobStream interface {
	drpc.Stream
	SendAndClose(*Empty) error
}

type drpcProvisionerDaemon_CompleteJobStream struct {
	drpc.Stream
}

func (x *drpcProvisionerDaemon_CompleteJobStream) SendAndClose(m *Empty) error {
	if err := x.MsgSend(m, drpcEncoding_File_provisionerd_proto_provisionerd_proto{}); err != nil {
		return err
	}
	return x.CloseSend()
}
