import { Suspense } from "react";
import OrderConfirmation from "@/views/OrderConfirmation";

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmation />
    </Suspense>
  );
}
