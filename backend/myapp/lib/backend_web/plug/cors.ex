defmodule BackendWeb.Plug.CORS do
  @moduledoc false
  use Plug.Builder

  plug(:set_headers)

  defp set_headers(conn, _opts) do
    conn
    |> put_resp_header("access-control-allow-origin", "*")
    |> put_resp_header("access-control-allow-methods", "GET, POST, PATCH, DELETE, OPTIONS")
    |> put_resp_header("access-control-allow-headers", "Content-Type, Authorization")
    |> put_resp_header("access-control-max-age", "86400")
  end
end
