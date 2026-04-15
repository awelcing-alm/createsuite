defmodule BackendWeb.TaskLive.Show do
  use BackendWeb, :live_view

  alias Backend.PubSub.Topics
  alias Backend.Tasks

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.task(id))
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
    end

    {:ok, load_task(socket, id)}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, load_task(socket, socket.assigns.task_id)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        {@task.title}
        <:subtitle>{@task.cs_id}</:subtitle>
        <:actions>
          <.button navigate={~p"/dashboard/tasks"}>Back to tasks</.button>
        </:actions>
      </.header>

      <div class="space-y-3">
        <div class="card bg-base-200 p-4">
          <p><strong>Status:</strong> {@task.status}</p>
          <p><strong>Priority:</strong> {@task.priority}</p>
          <p><strong>Assigned agent:</strong> {assigned_agent_name(@task)}</p>
        </div>

        <div class="card bg-base-200 p-4">
          <p class="font-semibold">Description</p>
          <p class="whitespace-pre-wrap">{@task.description || "No description"}</p>
        </div>
      </div>
    </Layouts.app>
    """
  end

  defp load_task(socket, id) do
    case Tasks.get_task(id) do
      {:ok, task} ->
        assign(socket, page_title: task.title, task: task, task_id: id)

      {:error, :not_found} ->
        push_navigate(put_flash(socket, :error, "Task not found"), to: ~p"/dashboard/tasks")
    end
  end

  defp assigned_agent_name(%{assigned_agent: %{name: name}}), do: name
  defp assigned_agent_name(_task), do: "Unassigned"
end
