defmodule BackendWeb.TaskLive.Index do
  use BackendWeb, :live_view

  alias Backend.PubSub.Topics
  alias Backend.Tasks

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
    end

    {:ok,
     socket
     |> assign(page_title: "Tasks")
     |> stream(:tasks, Tasks.list_tasks())}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, stream(socket, :tasks, Tasks.list_tasks(), reset: true)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        Tasks
        <:subtitle>Live task inventory.</:subtitle>
      </.header>

      <div id="tasks" phx-update="stream" class="space-y-3">
        <div :for={{dom_id, task} <- @streams.tasks} id={dom_id} class="card bg-base-200 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <.link navigate={~p"/dashboard/tasks/#{task.cs_id}"} class="font-semibold underline">
                {task.title}
              </.link>
              <p class="text-sm opacity-70">{task.cs_id}</p>
            </div>
            <div class="text-right text-sm">
              <p class="capitalize">{task.status}</p>
              <p class="opacity-70">{task.priority}</p>
            </div>
          </div>
        </div>
      </div>
    </Layouts.app>
    """
  end
end
