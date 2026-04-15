defmodule Backend.Agents do
  import Ecto.Query, warn: false

  alias Backend.Agents.Agent
  alias Backend.PubSub.Topics
  alias Backend.Repo
  alias Backend.Tasks

  def list_agents do
    Agent
    |> order_by([a], desc: a.inserted_at)
    |> Repo.all()
  end

  def list_working_agents do
    Agent
    |> where([a], a.status == "working")
    |> Repo.all()
  end

  def count_agents, do: Repo.aggregate(Agent, :count, :id)

  def get_agent(id) do
    case Repo.get(Agent, id) do
      nil -> {:error, :not_found}
      agent -> {:ok, agent}
    end
  end

  def get_agent!(id), do: Repo.get!(Agent, id)

  def create_agent(attrs) do
    %Agent{}
    |> Agent.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, agent} ->
        :ok = ensure_runtime_for(agent)
        broadcast(Topics.agents(), {:agent_created, agent})
        {:ok, agent}

      error ->
        error
    end
  end

  def update_agent(id, attrs) when is_binary(id) do
    with {:ok, agent} <- get_agent(id) do
      update_agent(agent, attrs)
    end
  end

  def update_agent(%Agent{} = agent, attrs) do
    agent
    |> Agent.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, updated_agent} ->
        sync_runtime(updated_agent)
        broadcast(Topics.agents(), {:agent_updated, updated_agent})
        {:ok, updated_agent}

      error ->
        error
    end
  end

  def delete_agent(id) when is_binary(id) do
    with {:ok, agent} <- get_agent(id) do
      delete_agent(agent)
    end
  end

  def delete_agent(%Agent{} = agent) do
    with {:ok, deleted_agent} <- Repo.delete(agent) do
      Backend.Runtime.AgentRuntimeSupervisor.stop_agent(deleted_agent.id)
      broadcast(Topics.agents(), {:agent_deleted, deleted_agent.id})
      {:ok, deleted_agent}
    end
  end

  def update_agent_status(agent_id, status) when is_binary(status) do
    update_agent(agent_id, %{status: status})
  end

  def set_working(agent_id, task_id), do: set_working(agent_id, task_id, task_id)

  def set_working(agent_id, task_id, runtime_task_id) do
    with {:ok, agent} <- get_agent(agent_id),
         {:ok, updated_agent} <-
           update_agent(agent, %{status: "working", current_task_id: task_id}) do
      _ = Backend.Runtime.AgentRuntimeSupervisor.ensure_started(updated_agent)
      _ = Backend.Runtime.AgentRuntime.assign_task(agent_id, runtime_task_id)
      {:ok, updated_agent}
    end
  end

  def set_idle(agent_id), do: set_idle(agent_id, nil, nil)
  def set_idle(agent_id, task_id), do: set_idle(agent_id, task_id, task_id)

  def set_idle(agent_id, _task_id, runtime_task_id) do
    with {:ok, agent} <- get_agent(agent_id),
         {:ok, updated_agent} <- update_agent(agent, %{status: "idle", current_task_id: nil}) do
      if runtime_alive?(agent_id) do
        _ = Backend.Runtime.AgentRuntime.complete_task(agent_id, runtime_task_id)
      end

      {:ok, updated_agent}
    end
  end

  def runtime_alive?(agent_id) do
    Registry.lookup(Backend.Runtime.AgentRegistry, agent_id) != []
  end

  defp sync_runtime(%Agent{id: id, status: status, current_task_id: task_id} = agent) do
    case status do
      "working" ->
        _ = Backend.Runtime.AgentRuntimeSupervisor.ensure_started(agent)

        if task_id do
          runtime_task_id =
            case Tasks.get_task(task_id) do
              {:ok, task} -> task.cs_id
              _other -> task_id
            end

          _ = Backend.Runtime.AgentRuntime.assign_task(id, runtime_task_id)
        end

        :ok

      "offline" ->
        Backend.Runtime.AgentRuntimeSupervisor.stop_agent(id)

      _other ->
        ensure_runtime_for(agent)
    end
  end

  defp ensure_runtime_for(%Agent{} = agent) do
    case Backend.Runtime.AgentRuntimeSupervisor.ensure_started(agent) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
      :ignore -> :ok
      _other -> :ok
    end
  end

  defp broadcast(topic, event), do: Phoenix.PubSub.broadcast(Backend.PubSub, topic, event)
end
