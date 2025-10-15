import OrderTrackingClient from "./OrderTrackingClient";

export function generateStaticParams() {
  return [{ code: "demo-001" }, { code: "demo-002" }];
}

export default function OrderTrackingPage({
  params,
}: {
  params: { code: string };
}) {
  return <OrderTrackingClient code={decodeURIComponent(params.code)} />;
}
