defmodule BackendWeb.AgentController do
  use BackendWeb, :controller

  alias Backend.Agents
  alias BackendWeb.{AgentJSON, ResponseJSON}

  action_fallback(BackendWeb.FallbackController)

  def index(conn, _params) do
    json(conn, ResponseJSON.success(AgentJSON.index(%{agents: Agents.list_agents()})))
  end

  def create(conn, params) do
    with {:ok, agent} <- Agents.create_agent(params) do
      conn
      |> put_status(:created)
      |> json(ResponseJSON.success(AgentJSON.show(%{agent: agent})))
    end
  end

  def show(conn, %{"id" => id}) do
    with {:ok, agent} <- Agents.get_agent(id) do
      json(conn, ResponseJSON.success(AgentJSON.show(%{agent: agent})))
    end
  end

  def update(conn, %{"id" => id} = params) do
    with {:ok, agent} <- Agents.update_agent(id, Map.delete(params, "id")) do
      json(conn, ResponseJSON.success(AgentJSON.show(%{agent: agent})))
    end
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, _agent} <- Agents.delete_agent(id) do
      json(conn, ResponseJSON.success(%{deleted: true}))
    end
  end
end
