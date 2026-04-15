defmodule BackendWeb.ConvoyController do
  use BackendWeb, :controller

  alias Backend.Convoys
  alias BackendWeb.{ConvoyJSON, ResponseJSON}

  action_fallback(BackendWeb.FallbackController)

  def index(conn, _params) do
    json(conn, ResponseJSON.success(ConvoyJSON.index(%{convoys: Convoys.list_convoys()})))
  end

  def create(conn, params) do
    with {:ok, convoy} <- Convoys.create_convoy(params) do
      conn
      |> put_status(:created)
      |> json(ResponseJSON.success(ConvoyJSON.show(%{convoy: convoy})))
    end
  end

  def show(conn, %{"id" => id}) do
    with {:ok, convoy} <- Convoys.get_convoy(id) do
      json(conn, ResponseJSON.success(ConvoyJSON.show(%{convoy: convoy})))
    end
  end

  def add_tasks(conn, %{"id" => id} = params) do
    task_ids = Map.get(params, "taskIds", Map.get(params, "task_ids", []))

    with {:ok, convoy} <- Convoys.add_tasks(id, task_ids) do
      json(conn, ResponseJSON.success(ConvoyJSON.show(%{convoy: convoy})))
    end
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, _convoy} <- Convoys.delete_convoy(id) do
      json(conn, ResponseJSON.success(%{deleted: true}))
    end
  end
end
