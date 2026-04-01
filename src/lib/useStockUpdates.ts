import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

interface StockUpdate {
  weight_id: string;
  stock_quantity: number;
}

export function useStockUpdates(product_id: string | undefined) {
  const [stocks, setStocks] = useState<Record<string, number>>({});

  // Subscribe to real-time stock updates for this product
  useEffect(() => {
    if (!product_id) return;

    const channel = supabase
      .channel(`stock:${product_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_weights",
          filter: `product_id=eq.${product_id}`,
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const record = payload.new as any;
          setStocks((prev) => ({
            ...prev,
            [record.id]: record.stock_quantity ?? 0,
          }));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Fetch initial stock values
          supabase
            .from("product_weights")
            .select("id, stock_quantity")
            .eq("product_id", product_id)
            .then(({ data }) => {
              if (data) {
                const stockMap: Record<string, number> = {};
                data.forEach((w: { id: string; stock_quantity: number }) => {
                  stockMap[w.id] = w.stock_quantity ?? 0;
                });
                setStocks(stockMap);
              }
            });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product_id]);

  return stocks;
}
