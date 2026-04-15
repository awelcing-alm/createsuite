defmodule Backend.Tasks do
  import Ecto.Query, warn: false

  alias Backend.Agents
  alias Backend.PubSub.Topics
  alias Backend.Repo
  alias Backend.Tasks.Task

  def list_tasks(filters \\ %{}) do
    Task
    |> maybe_filter_status(filters)
    |> order_by([t], desc: t.inserted_at)
    |> Repo.all()
    |> Repo.preload([:assigned_agent, :convoy])
  end

  def count_tasks, do: Repo.aggregate(Task, :count, :id)

  def get_task(id) do
    case fetch_task(id) do
      nil -> {:error, :not_found}
      task -> {:ok, Repo.preload(task, [:assigned_agent, :convoy])}
    end
  end

  def get_task!(id) do
    id
    |> fetch_task!()
    |> Repo.preload([:assigned_agent, :convoy])
  end

  def create_task(attrs) do
    attrs = normalize_attrs(attrs) |> Map.put_new("cs_id", generate_cs_id())

    %Task{}
    |> Task.create_changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, task} ->
        task = Repo.preload(task, [:assigned_agent, :convoy])
        broadcast_task({:task_created, task}, task)
        {:ok, task}

      error ->
        error
    end
  end

  def update_task(id, attrs) when is_binary(id) do
    with {:ok, task} <- get_task(id) do
      update_task(task, attrs)
    end
  end

  def update_task(%Task{} = task, attrs) do
    task
    |> Task.update_changeset(normalize_attrs(attrs))
    |> Repo.update()
    |> case do
      {:ok, updated_task} ->
        updated_task = Repo.preload(updated_task, [:assigned_agent, :convoy])
        broadcast_task({:task_updated, updated_task}, updated_task)
        {:ok, updated_task}

      error ->
        error
    end
  end

  def assign_task(task_id, agent_id) do
    assign_task_to_agent(task_id, agent_id)
  end

  def assign_task_to_agent(task_id, agent_id) do
    with {:ok, task} <- get_task(task_id),
         {:ok, _agent} <- Agents.get_agent(agent_id),
         {:ok, updated_task} <-
           update_task(task, %{assigned_agent_id: agent_id, status: "in_progress"}),
         {:ok, _updated_agent} <-
           Agents.set_working(agent_id, updated_task.id, updated_task.cs_id) do
      broadcast_task({:task_assigned, updated_task}, updated_task)
      {:ok, updated_task}
    end
  end

  def complete_task(task_id) do
    with {:ok, task} <- get_task(task_id),
         {:ok, updated_task} <-
           update_task(task, %{status: "completed", completed_at: DateTime.utc_now()}) do
      maybe_set_agent_idle(updated_task)
      broadcast_task({:task_completed, updated_task}, updated_task)
      {:ok, updated_task}
    end
  end

  def delete_task(id) when is_binary(id) do
    with {:ok, task} <- get_task(id) do
      delete_task(task)
    end
  end

  def delete_task(%Task{} = task) do
    maybe_set_agent_idle(task)

    with {:ok, deleted_task} <- Repo.delete(task) do
      broadcast(Topics.tasks(), {:task_deleted, deleted_task.cs_id})

      Phoenix.PubSub.broadcast(
        Backend.PubSub,
        Topics.task(deleted_task.cs_id),
        {:task_deleted, deleted_task.cs_id}
      )

      {:ok, deleted_task}
    end
  end

  defp maybe_filter_status(query, %{"status" => status}) when is_binary(status),
    do: where(query, [t], t.status == ^status)

  defp maybe_filter_status(query, %{status: status}) when is_binary(status),
    do: where(query, [t], t.status == ^status)

  defp maybe_filter_status(query, _filters), do: query

  defp maybe_set_agent_idle(%Task{assigned_agent_id: nil}), do: :ok

  defp maybe_set_agent_idle(%Task{assigned_agent_id: agent_id, id: task_id, cs_id: cs_id}),
    do: Agents.set_idle(agent_id, task_id, cs_id)

  defp fetch_task(id) do
    cond do
      String.starts_with?(id, "cs-") -> Repo.get_by(Task, cs_id: id)
      match?({:ok, _}, Ecto.UUID.cast(id)) -> Repo.get(Task, id)
      true -> Repo.get_by(Task, cs_id: id)
    end
  end

  defp fetch_task!(id) do
    case fetch_task(id) do
      nil -> raise Ecto.NoResultsError, queryable: Task
      task -> task
    end
  end

  defp generate_cs_id do
    "cs-" <>
      (:crypto.strong_rand_bytes(5)
       |> Base.encode32(padding: false)
       |> String.downcase()
       |> binary_part(0, 5))
  end

  defp normalize_attrs(%{} = attrs) do
    Map.new(attrs, fn {key, value} -> {to_string(key), value} end)
  end

  defp broadcast_task(event, task) do
    broadcast(Topics.tasks(), event)
    Phoenix.PubSub.broadcast(Backend.PubSub, Topics.task(task.cs_id), {:task_updated, task})
  end

  defp broadcast(topic, event), do: Phoenix.PubSub.broadcast(Backend.PubSub, topic, event)
end
