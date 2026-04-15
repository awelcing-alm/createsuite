defmodule BackendWeb.TaskController do
  use BackendWeb, :controller

  alias Backend.Tasks
  alias BackendWeb.{ResponseJSON, TaskJSON}

  action_fallback(BackendWeb.FallbackController)

  def index(conn, params) do
    tasks = Tasks.list_tasks(params)
    json(conn, ResponseJSON.success(TaskJSON.index(%{tasks: tasks})))
  end

  def create(conn, params) do
    with {:ok, task} <- Tasks.create_task(params) do
      conn
      |> put_status(:created)
      |> json(ResponseJSON.success(TaskJSON.show(%{task: task})))
    end
  end

  def show(conn, %{"id" => id}) do
    with {:ok, task} <- Tasks.get_task(id) do
      json(conn, ResponseJSON.success(TaskJSON.show(%{task: task})))
    end
  end

  def update(conn, %{"id" => id} = params) do
    with {:ok, task} <- Tasks.update_task(id, Map.delete(params, "id")) do
      json(conn, ResponseJSON.success(TaskJSON.show(%{task: task})))
    end
  end

  def assign(conn, %{"id" => id} = params) do
    agent_id = Map.get(params, "agent_id") || Map.get(params, "agentId")

    with {:ok, task} <- Tasks.assign_task(id, agent_id) do
      json(conn, ResponseJSON.success(TaskJSON.show(%{task: task})))
    end
  end

  def complete(conn, %{"id" => id}) do
    with {:ok, task} <- Tasks.complete_task(id) do
      json(conn, ResponseJSON.success(TaskJSON.show(%{task: task})))
    end
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, _task} <- Tasks.delete_task(id) do
      json(conn, ResponseJSON.success(%{deleted: true}))
    end
  end
end
