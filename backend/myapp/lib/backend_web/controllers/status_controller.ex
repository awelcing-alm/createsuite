defmodule BackendWeb.StatusController do
  use BackendWeb, :controller

  alias Backend.{Agents, Convoys, Tasks}
  alias BackendWeb.ResponseJSON

  def index(conn, _params) do
    json(
      conn,
      ResponseJSON.success(%{
        tasks: Tasks.count_tasks(),
        agents: Agents.count_agents(),
        convoys: Convoys.count_convoys()
      })
    )
  end
end
