defmodule BackendWeb.TaskJSON do
  def index(%{tasks: tasks}) do
    %{tasks: Enum.map(tasks, &task/1)}
  end

  def show(%{task: task}) do
    %{task: task(task)}
  end

  def task(task) do
    %{
      id: task.cs_id,
      uuid: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      tags: task.tags,
      assignedAgent: task.assigned_agent_id,
      convoyId: convoy_id(task),
      completedAt: task.completed_at,
      createdAt: task.inserted_at,
      updatedAt: task.updated_at
    }
  end

  defp convoy_id(task) do
    case Map.get(task, :convoy) do
      %{cs_id: cs_id} -> cs_id
      _other -> nil
    end
  end
end
