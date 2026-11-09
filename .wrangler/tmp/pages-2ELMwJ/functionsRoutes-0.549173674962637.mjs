import { onRequestPost as __api_orders_create_ts_onRequestPost } from "E:\\the last of Dl\\workspace-files\\outputs\\var-net\\functions\\api\\orders\\create.ts"
import { onRequest as __api_user_me_ts_onRequest } from "E:\\the last of Dl\\workspace-files\\outputs\\var-net\\functions\\api\\user\\me.ts"
import { onRequestGet as __api_products_ts_onRequestGet } from "E:\\the last of Dl\\workspace-files\\outputs\\var-net\\functions\\api\\products.ts"
import { onRequest as __api_health_ts_onRequest } from "E:\\the last of Dl\\workspace-files\\outputs\\var-net\\functions\\api\\health.ts"

export const routes = [
    {
      routePath: "/api/orders/create",
      mountPath: "/api/orders",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_create_ts_onRequestPost],
    },
  {
      routePath: "/api/user/me",
      mountPath: "/api/user",
      method: "",
      middlewares: [],
      modules: [__api_user_me_ts_onRequest],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_products_ts_onRequestGet],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_health_ts_onRequest],
    },
  ]