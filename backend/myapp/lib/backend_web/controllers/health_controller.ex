defmodule BackendWeb.HealthController do
  use BackendWeb, :controller

  alias Backend.PubSub.Topics
  alias Backend.Repo
  alias BackendWeb.ResponseJSON

  def index(conn, _params) do
    db_status = if healthy_db?(), do: "ok", else: "error"
    system_status = if db_status == "ok", do: "ok", else: "degraded"
    broadcast_health_change(system_status)

    json(
      conn,
      ResponseJSON.success(%{
        status: system_status,
        app: "ok",
        database: db_status
      })
    )
  end

  defp healthy_db? do
    match?({:ok, _result}, Ecto.Adapters.SQL.query(Repo, "SELECT 1", []))
  end

  defp broadcast_health_change(status) do
    key = {__MODULE__, :status}
    previous = :persistent_term.get(key, nil)

    if previous != status do
      Phoenix.PubSub.broadcast(Backend.PubSub, Topics.system(), {:health_changed, status})
      :persistent_term.put(key, status)
    end
  end
end
