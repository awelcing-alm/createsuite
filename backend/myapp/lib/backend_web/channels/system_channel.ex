defmodule BackendWeb.SystemChannel do
  use Phoenix.Channel

  alias Backend.PubSub.Topics

  @impl true
  def join("system", _payload, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    Phoenix.PubSub.subscribe(Backend.PubSub, Topics.agents())
    Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
    Phoenix.PubSub.subscribe(Backend.PubSub, Topics.convoys())
    Phoenix.PubSub.subscribe(Backend.PubSub, Topics.system())

    {:noreply, socket}
  end

  # Agent events
  def handle_info({:agent_created, agent}, socket) do
    push(socket, "agent_created", serialize_agent(agent))
    {:noreply, socket}
  end

  def handle_info({:agent_updated, agent}, socket) do
    push(socket, "agent_updated", serialize_agent(agent))
    {:noreply, socket}
  end

  def handle_info({:agent_deleted, agent_id}, socket) do
    push(socket, "agent_deleted", %{"id" => agent_id})
    {:noreply, socket}
  end

  # Task events
  def handle_info({:task_created, task}, socket) do
    push(socket, "task_created", serialize_task(task))
    {:noreply, socket}
  end

  def handle_info({:task_updated, task}, socket) do
    push(socket, "task_updated", serialize_task(task))
    {:noreply, socket}
  end

  def handle_info({:task_assigned, task}, socket) do
    push(socket, "task_assigned", serialize_task(task))
    {:noreply, socket}
  end

  def handle_info({:task_completed, task}, socket) do
    push(socket, "task_completed", serialize_task(task))
    {:noreply, socket}
  end

  def handle_info({:task_deleted, task_id}, socket) do
    push(socket, "task_deleted", %{"id" => task_id})
    {:noreply, socket}
  end

  # Convoy events
  def handle_info({:convoy_created, convoy}, socket) do
    push(socket, "convoy_created", serialize_convoy(convoy))
    {:noreply, socket}
  end

  def handle_info({:convoy_deleted, convoy_id}, socket) do
    push(socket, "convoy_deleted", %{"id" => convoy_id})
    {:noreply, socket}
  end

  def handle_info({:tasks_added, convoy}, socket) do
    push(socket, "convoy_updated", serialize_convoy(convoy))
    {:noreply, socket}
  end

  # System events
  def handle_info({:health_changed, status}, socket) do
    push(socket, "health_changed", %{"status" => status})
    {:noreply, socket}
  end

  # Catch-all for unhandled events
  def handle_info(_msg, socket) do
    {:noreply, socket}
  end

  # --- Serialization helpers (matches JSON view shapes) ---

  defp serialize_agent(agent) do
    %{
      "id" => agent.id,
      "name" => agent.name,
      "status" => agent.status,
      "capabilities" => agent.capabilities,
      "currentTaskId" => agent.current_task_id,
      "createdAt" => agent.inserted_at,
      "updatedAt" => agent.updated_at
    }
  end

  defp serialize_task(task) do
    task = maybe_preload_task(task)

    %{
      "id" => task.cs_id,
      "uuid" => task.id,
      "title" => task.title,
      "description" => task.description,
      "status" => task.status,
      "priority" => task.priority,
      "tags" => task.tags,
      "assignedAgent" => task.assigned_agent_id,
      "convoyId" => convoy_id(task),
      "completedAt" => task.completed_at,
      "createdAt" => task.inserted_at,
      "updatedAt" => task.updated_at
    }
  end

  defp maybe_preload_task(task) do
    case task do
      %{convoy: %Ecto.Association.NotLoaded{}} ->
        try do
          Backend.Repo.preload(task, [:assigned_agent, :convoy])
        rescue
          Ecto.Query.CastError -> task
        end

      _ ->
        task
    end
  end

  defp serialize_convoy(convoy) do
    %{
      "id" => convoy.cs_id,
      "name" => convoy.name,
      "description" => convoy.description
    }
  end

  defp convoy_id(task) do
    case Map.get(task, :convoy) do
      %{cs_id: cs_id} -> cs_id
      _other -> nil
    end
  end
end
