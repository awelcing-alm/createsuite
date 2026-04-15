defmodule Backend.Convoys do
  import Ecto.Query, warn: false

  alias Backend.Convoys.Convoy
  alias Backend.PubSub.Topics
  alias Backend.Repo
  alias Backend.Tasks.Task

  def list_convoys do
    Convoy
    |> order_by([c], desc: c.inserted_at)
    |> Repo.all()
    |> Repo.preload(:tasks)
    |> Enum.map(&with_progress/1)
  end

  def count_convoys, do: Repo.aggregate(Convoy, :count, :id)

  def get_convoy(id) do
    case fetch_convoy(id) do
      nil -> {:error, :not_found}
      convoy -> {:ok, convoy |> Repo.preload(:tasks) |> with_progress()}
    end
  end

  def create_convoy(attrs) do
    attrs = attrs |> normalize_attrs() |> Map.put_new("cs_id", generate_cs_id())
    task_ids = Map.get(attrs, "task_ids", Map.get(attrs, :task_ids, []))

    %Convoy{}
    |> Convoy.changeset(Map.drop(attrs, ["task_ids", :task_ids]))
    |> Repo.insert()
    |> case do
      {:ok, convoy} ->
        {:ok, convoy_with_progress} = add_tasks(convoy, task_ids)
        broadcast(Topics.convoys(), {:convoy_created, convoy_with_progress})
        {:ok, convoy_with_progress}

      error ->
        error
    end
  end

  def add_tasks(id_or_convoy, task_ids) do
    with {:ok, convoy} <- get_convoy_record(id_or_convoy) do
      from(t in Task, where: t.id in ^task_ids)
      |> Repo.update_all(set: [convoy_id: convoy.id])

      {:ok, convoy_with_progress} = get_convoy(convoy.cs_id)
      broadcast(Topics.convoys(), {:tasks_added, convoy_with_progress})
      {:ok, convoy_with_progress}
    end
  end

  def delete_convoy(id) when is_binary(id) do
    with {:ok, convoy} <- get_convoy_record(id) do
      delete_convoy(convoy)
    end
  end

  def delete_convoy(%Convoy{} = convoy) do
    from(t in Task, where: t.convoy_id == ^convoy.id)
    |> Repo.update_all(set: [convoy_id: nil])

    with {:ok, deleted_convoy} <- Repo.delete(convoy) do
      broadcast(Topics.convoys(), {:convoy_deleted, deleted_convoy.cs_id})
      {:ok, deleted_convoy}
    end
  end

  defp get_convoy_record(%Convoy{} = convoy), do: {:ok, convoy}

  defp get_convoy_record(id) do
    case fetch_convoy(id) do
      nil -> {:error, :not_found}
      convoy -> {:ok, convoy}
    end
  end

  defp fetch_convoy(id) do
    cond do
      String.starts_with?(id, "cs-cv-") -> Repo.get_by(Convoy, cs_id: id)
      match?({:ok, _}, Ecto.UUID.cast(id)) -> Repo.get(Convoy, id)
      true -> Repo.get_by(Convoy, cs_id: id)
    end
  end

  defp with_progress(%Convoy{} = convoy) do
    tasks = convoy.tasks || []
    total = length(tasks)
    completed = Enum.count(tasks, &(&1.status == "completed"))

    %{
      convoy: convoy,
      tasks: tasks,
      progress: %{
        total: total,
        completed: completed,
        percentage: if(total == 0, do: 0, else: round(completed * 100 / total))
      }
    }
  end

  defp generate_cs_id do
    "cs-cv-" <>
      (:crypto.strong_rand_bytes(5)
       |> Base.encode32(padding: false)
       |> String.downcase()
       |> binary_part(0, 5))
  end

  defp normalize_attrs(%{} = attrs) do
    Map.new(attrs, fn {key, value} -> {to_string(key), value} end)
  end

  defp broadcast(topic, event), do: Phoenix.PubSub.broadcast(Backend.PubSub, topic, event)
end
